import { Router } from "express";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import { z } from "zod";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { requireApiKey } from "../middleware/requireApiKey.js";

const router = Router();
const storage = new Storage();

/**
 * Query:
 *  - object: required (path en bucket)
 *  - w: width (50-2400)
 *  - q: quality (40-95)
 *  - format: webp|jpeg|png (optional)
 */
const schema = z.object({
  object: z.string().min(1),
  w: z.coerce.number().int().min(50).max(2400).default(1200),
  q: z.coerce.number().int().min(40).max(95).default(80),
  format: z.enum(["webp", "jpeg", "png"]).optional(),
});

function safeObjectName(object) {
  // Bloqueo traversal / paths raros
  if (!object) return null;
  if (object.includes("..")) return null;
  if (object.startsWith("/")) return null;
  if (object.includes("\\")) return null;

  // Normaliza espacios raros
  const cleaned = object.trim();

  // Evita cosas extrañas
  if (cleaned.length > 500) return null;

  return cleaned;
}

function pickFormat(req, requestedFormat) {
  // Si el usuario manda format, respétalo
  if (requestedFormat) return requestedFormat;

  // Si no, usa Accept header para preferir webp
  const accept = req.header("accept") || "";
  if (accept.includes("image/webp")) return "webp";

  // default
  return "jpeg";
}

function contentType(format) {
  if (format === "webp") return "image/webp";
  if (format === "png") return "image/png";
  return "image/jpeg";
}

function makeCacheKey({ object, w, q, format }) {
  // Hash para evitar paths larguísimos y caracteres raros
  const raw = JSON.stringify({ object, w, q, format });
  const h = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
  return `cache/${format}/w${w}/q${q}/${h}`;
}

async function fileExists(file) {
  const [exists] = await file.exists();
  return exists;
}

router.get("/", async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

  const bucketOriginal = process.env.GCS_ORIGINAL_BUCKET;
  if (!bucketOriginal) return res.status(500).json({ error: "Missing GCS_ORIGINAL_BUCKET" });

  const bucketCache = process.env.GCS_CACHE_BUCKET; // optional
  const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 86400);

  const object = safeObjectName(parsed.data.object);
  if (!object) return res.status(400).json({ error: "Invalid object path" });

  const w = parsed.data.w;
  const q = parsed.data.q;
  const format = pickFormat(req, parsed.data.format);

  // Cache headers para browser/CDN
  res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);

  // Si tienes cache bucket, primero intenta servir cache
  if (bucketCache) {
    const cacheKey = makeCacheKey({ object, w, q, format });
    const cacheFile = storage.bucket(bucketCache).file(cacheKey);

    try {
      if (await fileExists(cacheFile)) {
        // ETag basado en el cacheKey (suficiente para client caching)
        const etag = `"${cacheKey}"`;
        res.setHeader("ETag", etag);
        if (req.header("if-none-match") === etag) return res.status(304).end();

        res.type(contentType(format));
        res.setHeader("Content-Disposition", "inline");
        return cacheFile.createReadStream().pipe(res);
      }
    } catch {
      // si falla cache, continúa al original
    }
  }

  // Si no hay cache (o no existe), procesa desde originales
  const originalFile = storage.bucket(bucketOriginal).file(object);

  try {
    // stream original
    const readStream = originalFile.createReadStream();

    // sharp transform
    let transformer = sharp().resize({ width: w, withoutEnlargement: true });

    if (format === "webp") transformer = transformer.webp({ quality: q });
    else if (format === "png") transformer = transformer.png({ quality: q });
    else transformer = transformer.jpeg({ quality: q, mozjpeg: true });

    res.type(contentType(format));
    res.setHeader("Content-Disposition", "inline");

    // Si hay bucket de cache, escribe al mismo tiempo (tee)
    if (process.env.GCS_CACHE_BUCKET) {
      const cacheKey = makeCacheKey({ object, w, q, format });
      const cacheFile = storage.bucket(process.env.GCS_CACHE_BUCKET).file(cacheKey);

      const writeStream = cacheFile.createWriteStream({
        resumable: false,
        metadata: {
          contentType: contentType(format),
          cacheControl: `public, max-age=${ttlSeconds}`,
        },
      });

      // Pipe: original -> sharp -> (respuesta + cache)
      // Truco: sharp es un stream; lo duplicamos enviando a cache y al res
      // usando .clone()
      const sharpStream = sharp().resize({ width: w, withoutEnlargement: true });
      const sharpOut =
        format === "webp"
          ? sharpStream.webp({ quality: q })
          : format === "png"
            ? sharpStream.png({ quality: q })
            : sharpStream.jpeg({ quality: q, mozjpeg: true });

      // clonar para mandar a 2 destinos
      const cloneForCache = sharpOut.clone();

      // cache
      pipeline(readStream, cloneForCache, writeStream).catch(() => {});

      // response
      return await pipeline(readStream, sharpOut, res);
    }

    // Sin cache bucket: directo a respuesta
    return await pipeline(readStream, transformer, res);
  } catch (e) {
    // Diferenciar errores comunes de GCS
    const msg = String(e?.message || "");
    if (msg.includes("No such object") || msg.includes("404")) {
      return res.status(404).json({ error: "Image not found" });
    }
    if (msg.includes("403") || msg.includes("AccessDenied") || msg.includes("Forbidden")) {
      return res.status(403).json({ error: "Access denied to bucket/object" });
    }
    return res.status(500).json({ error: "Image processing failed" });
  }
});

export default router;
