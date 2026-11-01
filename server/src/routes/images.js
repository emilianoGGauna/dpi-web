// server/src/routes/images.js
import { Router } from "express";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import { z } from "zod";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { VARIANT_WIDTHS, variantKey } from "../lib/variants.js";

const router = Router();
const storage = new Storage();

const LOGOS_PREFIX = "LOGOS DE CLIENTES/";
let cacheBucketUnavailable = false;
let cacheBucketWarned = false;

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

  for (const ch of cleaned) {
    if (ch.charCodeAt(0) < 32) return null;
  }
  return cleaned;
}

function pickFormat(req, requestedFormat) {
  if (requestedFormat) return requestedFormat;
  const accept = (req.get("accept") || "").toLowerCase();
  // AVIF is only used when explicitly requested: encoding it on Cloud Run (1 vCPU)
  // takes 5-20s per image, while WebP takes ~0.5s and is usually smaller.
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
  const raw = JSON.stringify({ object, generation, w, q, format });
  const h = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32);
  return `cache/${format}/w${w}/q${q}/${h}`;
}

function getStaleSeconds() {
  return Number(process.env.CACHE_STALE_WHILE_REVALIDATE_SECONDS || 2592000);
}

function setCommonHeaders(res, { ttlSeconds, format }) {
  res.setHeader("Content-Type", contentType(format));
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}, stale-while-revalidate=${getStaleSeconds()}`);
  res.setHeader("Vary", "Accept");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function setOriginalHeaders(res, { ttlSeconds, metadata }) {
  res.setHeader("Content-Type", metadata?.contentType || "application/octet-stream");
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}, stale-while-revalidate=${getStaleSeconds()}`);
  res.setHeader("Vary", "Accept");
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

function classifyAndRespondError(res, e, ctx = "IMAGE_ROUTE_ERROR") {
  const msg = String(e?.message || "");
  if (msg.includes("No such object") || msg.includes("404")) {
    return res.status(404).json({ error: "Image not found" });
  }
  if (msg.includes("403") || msg.includes("AccessDenied") || msg.includes("Forbidden")) {
    return res.status(403).json({ error: "Access denied to bucket/object" });
  }
  console.error(ctx, e?.stack || e);
  return res.status(500).json({ error: "Image processing failed" });
}

async function streamOriginalToResponse({ originalFile, res, req, ttlSeconds, origMeta, object }) {
  setOriginalHeaders(res, { ttlSeconds, metadata: origMeta });
  const weakEtag = `W/"${crypto.createHash("sha1").update(`${object}:${origMeta?.generation || "0"}:orig`).digest("hex").slice(0, 16)}"`;
  if (handleConditionalGet(req, res, { etag: weakEtag, lastModified: origMeta?.updated })) return;

  const rs = originalFile.createReadStream();
  rs.on("error", (err) => console.error("IMAGE_READSTREAM_ORIGINAL_ERROR", err?.stack || err));
  await pipeline(rs, res);
}


async function getCacheBucketName() {
  const bucketName = (process.env.GCS_CACHE_BUCKET || "").trim();
  if (!bucketName || cacheBucketUnavailable) return null;

  try {
    await storage.bucket(bucketName).getMetadata();
    return bucketName;
  } catch (err) {
    cacheBucketUnavailable = true;
    if (!cacheBucketWarned) {
      cacheBucketWarned = true;
      console.warn("IMAGE_CACHE_BUCKET_DISABLED", { bucket: bucketName, error: err?.message || String(err) });
    }
    return null;
  }
}

router.get("/", async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });

  const bucketOriginal = process.env.GCS_ORIGINAL_BUCKET;
  if (!bucketOriginal) return res.status(500).json({ error: "Missing GCS_ORIGINAL_BUCKET" });

  const bucketCache = await getCacheBucketName();
  const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 604800);

  const object = safeObjectName(parsed.data.object);
  if (!object) return res.status(400).json({ error: "Invalid object path" });

  const w = parsed.data.w;
  const q = parsed.data.q;
  const format = pickFormat(req, parsed.data.format);
  const originalFile = storage.bucket(bucketOriginal).file(object);

  // Pre-generated WebP (npm run variants) is looked up alongside the original's metadata
  const variantFile =
    format === "webp" && VARIANT_WIDTHS.includes(w)
      ? storage.bucket(bucketOriginal).file(variantKey(object, w))
      : null;
  const variantMetaPromise = variantFile
    ? variantFile.getMetadata().then(([meta]) => meta, () => null)
    : Promise.resolve(null);

  try {
    let origMeta;
    try {
      [origMeta] = await originalFile.getMetadata();
    } catch (metaErr) {
      console.error("IMAGE_GET_METADATA_ERROR", { object, error: metaErr?.stack || metaErr });
      return classifyAndRespondError(res, metaErr, "IMAGE_GET_METADATA_ERROR");
    }

    const generation = origMeta?.generation || "0";

    const variantMeta = await variantMetaPromise;
    if (variantMeta && variantMeta.metadata?.sourceGeneration === String(generation)) {
      const etag = variantMeta.md5Hash ? `"${variantMeta.md5Hash}"` : undefined;
      if (handleConditionalGet(req, res, { etag, lastModified: variantMeta.updated })) return;
      setCommonHeaders(res, { ttlSeconds, format });
      res.setHeader("X-DPI-Variant", "hit");
      return await pipeline(variantFile.createReadStream(), res);
    }

    if (bucketCache) {
      const cacheKey = makeCacheKey({ object, generation, w, q, format });
      const cacheFile = storage.bucket(bucketCache).file(cacheKey);
      try {
        const [cacheMeta] = await cacheFile.getMetadata();
        const etag = cacheMeta.md5Hash ? `"${cacheMeta.md5Hash}"` : `"${cacheKey}"`;
        if (handleConditionalGet(req, res, { etag, lastModified: cacheMeta.updated })) return;
        setCommonHeaders(res, { ttlSeconds, format });
        return await pipeline(cacheFile.createReadStream(), res);
      } catch (cacheReadErr) {
        if (!String(cacheReadErr?.message || "").includes("No such object")) {
          console.debug("IMAGE_CACHE_READ_MISS_OR_ERROR", { object, cacheKey, error: cacheReadErr?.message || String(cacheReadErr) });
        }
      }
    }

    const isLogo = object.startsWith(LOGOS_PREFIX);
    if (isLogo) {
      return await streamOriginalToResponse({ originalFile, res, req, ttlSeconds, origMeta, object });
    }

    setCommonHeaders(res, { ttlSeconds, format });
    const weakEtag = `W/"${crypto.createHash("sha1").update(`${object}:${generation}:${w}:${q}:${format}`).digest("hex").slice(0, 16)}"`;
    if (handleConditionalGet(req, res, { etag: weakEtag, lastModified: origMeta.updated })) return;

    const readStream = originalFile.createReadStream();
    const transformer = buildTransformer({ w, q, format });

    readStream.on("error", (err) => console.error("IMAGE_READSTREAM_ERROR", { object, error: err?.stack || err }));
    transformer.on("error", (err) => console.error("IMAGE_SHARP_TRANSFORM_ERROR", { object, format, w, q, error: err?.stack || err }));

    if (!bucketCache) {
      try {
        return await pipeline(readStream, transformer, res);
      } catch (transformErr) {
        console.warn("IMAGE_TRANSFORM_FALLBACK_TO_ORIGINAL", { object, error: transformErr?.message || String(transformErr) });
        if (!res.headersSent) {
          return await streamOriginalToResponse({ originalFile, res, req, ttlSeconds, origMeta, object });
        }
        throw transformErr;
      }
    }

    const cacheKey = makeCacheKey({ object, generation, w, q, format });
    const cacheFile = storage.bucket(bucketCache).file(cacheKey);
    const writeStream = cacheFile.createWriteStream({
      resumable: false,
      metadata: {
        contentType: contentType(format),
        cacheControl: `public, max-age=${ttlSeconds}, stale-while-revalidate=${getStaleSeconds()}`,
      },
    });

    writeStream.on("error", (err) => {
      console.warn("IMAGE_CACHE_WRITE_ERROR", { object, cacheKey, error: err?.stack || err });
    });

    transformer.pipe(res);
    transformer.pipe(writeStream);

    try {
      await pipeline(readStream, transformer);
    } catch (transformErr) {
      console.warn("IMAGE_TRANSFORM_WITH_CACHE_FAILED", { object, error: transformErr?.message || String(transformErr) });
      if (!res.headersSent) {
        return await streamOriginalToResponse({ originalFile, res, req, ttlSeconds, origMeta, object });
      }
      throw transformErr;
    }

    await new Promise((resolve) => {
      writeStream.on("finish", resolve);
      writeStream.on("close", resolve);
      writeStream.on("error", resolve);
      res.on("close", resolve);
      res.on("error", resolve);
    });
    return;
  } catch (e) {
    return classifyAndRespondError(res, e);
  }
});

export default router;
