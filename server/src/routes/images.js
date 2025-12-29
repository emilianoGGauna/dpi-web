// server/src/routes/images.js
import { Router } from "express";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import { z } from "zod";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

const router = Router();
const storage = new Storage();

const schema = z.object({
  object: z.string().min(1),
  w: z.coerce.number().int().min(50).max(2400).default(1200),
  q: z.coerce.number().int().min(40).max(95).default(80),
  format: z.enum(["avif", "webp", "jpeg", "png"]).optional(),
});

function safeObjectName(object) {
  if (!object) return null;
  if (object.includes("..")) return null;
  if (object.startsWith("/")) return null;
  if (object.includes("\\")) return null;

  const cleaned = object.trim();
  if (!cleaned || cleaned.length > 500) return null;

  // evita caracteres de control raros
  for (const ch of cleaned) {
    if (ch.charCodeAt(0) < 32) return null;
  }
  return cleaned;
}

function pickFormat(req, requestedFormat) {
  if (requestedFormat) return requestedFormat;

  const accept = (req.get("accept") || "").toLowerCase();
  if (accept.includes("image/avif")) return "avif";
  if (accept.includes("image/webp")) return "webp";
  return "jpeg";
}

function contentType(format) {
  if (format === "avif") return "image/avif";
  if (format === "webp") return "image/webp";
  if (format === "png") return "image/png";
  return "image/jpeg";
}

function buildTransformer({ w, q, format }) {
  // seguridad contra “image bombs”
  const base = sharp({ limitInputPixels: 80_000_000 }).resize({
    width: w,
    withoutEnlargement: true,
  });

  if (format === "avif") return base.avif({ quality: q, effort: 4 });
  if (format === "webp") return base.webp({ quality: q, effort: 4 });
  if (format === "png") return base.png({ compressionLevel: 9, adaptiveFiltering: true });
  return base.jpeg({ quality: q, mozjpeg: true, progressive: true });
}

function makeCacheKey({ object, generation, w, q, format }) {
  // clave estable + invalida si cambia el original (generation)
  const raw = JSON.stringify({ object, generation, w, q, format });
  const h = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
  return `cache/${format}/w${w}/q${q}/${h}`;
}

function setCommonHeaders(res, { ttlSeconds, format }) {
  res.setHeader("Content-Type", contentType(format));
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}, stale-while-revalidate=600`);
  res.setHeader("Vary", "Accept");
  // opcional (no estorba en <img>)
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function handleConditionalGet(req, res, { etag, lastModified }) {
  if (etag) {
    res.setHeader("ETag", etag);
    if (req.headers["if-none-match"] === etag) {
      res.status(304).end();
      return true;
    }
  }
  if (lastModified) {
    res.setHeader("Last-Modified", lastModified);
    const ims = req.headers["if-modified-since"];
    if (ims && new Date(ims).getTime() >= new Date(lastModified).getTime()) {
      res.status(304).end();
      return true;
    }
  }
  return false;
}

router.get("/", async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

  const bucketOriginal = process.env.GCS_ORIGINAL_BUCKET;
  if (!bucketOriginal) return res.status(500).json({ error: "Missing GCS_ORIGINAL_BUCKET" });

  const bucketCache = (process.env.GCS_CACHE_BUCKET || "").trim() || null;
  const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 86400);

  const object = safeObjectName(parsed.data.object);
  if (!object) return res.status(400).json({ error: "Invalid object path" });

  const w = parsed.data.w;
  const q = parsed.data.q;
  const format = pickFormat(req, parsed.data.format);

  const originalFile = storage.bucket(bucketOriginal).file(object);

  // abort control
  let aborted = false;
  req.on("aborted", () => (aborted = true));
  res.on("close", () => {
    if (!res.writableEnded) aborted = true;
  });

  try {
    // ⚠️ Para cache correcto necesitamos generation del original
    const [origMeta] = await originalFile.getMetadata();
    const generation = origMeta.generation || "0";

    // Si hay cache bucket -> intenta servir cache primero
    if (bucketCache) {
      const cacheKey = makeCacheKey({ object, generation, w, q, format });
      const cacheFile = storage.bucket(bucketCache).file(cacheKey);

      try {
        const [cacheMeta] = await cacheFile.getMetadata(); // si no existe -> throw 404
        const etag = cacheMeta.md5Hash ? `"${cacheMeta.md5Hash}"` : `"${cacheKey}"`;
        const lastModified = cacheMeta.updated;

        setCommonHeaders(res, { ttlSeconds, format });

        if (handleConditionalGet(req, res, { etag, lastModified })) return;

        return await pipeline(cacheFile.createReadStream(), res);
      } catch (e) {
        // cache miss: continúa al procesamiento
      }
    }

    // Cache miss o no hay cache bucket: procesar desde original
    setCommonHeaders(res, { ttlSeconds, format });

    // ETag “débil” útil incluso antes de subir cache (reduce refetches)
    // incluye generation, así que se invalida si cambias la imagen.
    const weakEtag = `W/"${crypto
      .createHash("sha1")
      .update(`${object}:${origMeta.generation}:${w}:${q}:${format}`)
      .digest("hex")
      .slice(0, 16)}"`;
    if (handleConditionalGet(req, res, { etag: weakEtag, lastModified: origMeta.updated })) return;

    const readStream = originalFile.createReadStream();
    const transformer = buildTransformer({ w, q, format });

    // si NO hay cache bucket -> directo
    if (!bucketCache) {
      // corta si el cliente se va
      readStream.on("error", () => {});
      transformer.on("error", () => {});
      return await pipeline(readStream, transformer, res);
    }

    // si HAY cache bucket -> 1 solo transform, pipe a res + cache
    const cacheKey = makeCacheKey({ object, generation: origMeta.generation || "0", w, q, format });
    const cacheFile = storage.bucket(bucketCache).file(cacheKey);
    const writeStream = cacheFile.createWriteStream({
      resumable: false,
      metadata: {
        contentType: contentType(format),
        cacheControl: `public, max-age=${ttlSeconds}, stale-while-revalidate=600`,
        metadata: {
          object,
          generation: String(origMeta.generation || ""),
          w: String(w),
          q: String(q),
          format,
        },
      },
    });

    // pipe doble desde el MISMO transformer (ok)
    transformer.pipe(res);
    transformer.pipe(writeStream);

    // si el cliente aborta, mata todo
    const kill = () => {
      try { readStream.destroy(); } catch {}
      try { transformer.destroy(); } catch {}
      try { writeStream.destroy(); } catch {}
    };

    const abortInterval = setInterval(() => {
      if (aborted) {
        clearInterval(abortInterval);
        kill();
      }
    }, 250).unref();

    await pipeline(readStream, transformer);

    // espera a que cache termine de escribir (si no abortaron)
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      res.on("close", resolve);
      res.on("error", reject);
    });

    return;
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("No such object") || msg.includes("404")) {
      return res.status(404).json({ error: "Image not found" });
    }
    if (msg.includes("403") || msg.includes("AccessDenied") || msg.includes("Forbidden")) {
      return res.status(403).json({ error: "Access denied to bucket/object" });
    }
    console.error("IMAGE_ROUTE_ERROR", e);
    return res.status(500).json({ error: "Image processing failed" });
  }
});

export default router;
