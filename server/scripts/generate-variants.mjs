// server/scripts/generate-variants.mjs
// Creates the pre-optimized WebP versions of every bucket image so the API can
// serve them as-is instead of converting on each request.
// Run again after uploading new images:  npm run variants  (--force to rebuild all)
import "dotenv/config";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import {
  VARIANT_WIDTHS,
  VARIANT_SKIP_PREFIXES,
  variantKey,
  variantQuality,
} from "../src/lib/variants.js";

const BUCKET = process.env.GCS_ORIGINAL_BUCKET || "dpi-info";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=2592000";
const force = process.argv.includes("--force");

const bucket = new Storage().bucket(BUCKET);

function isSourceImage(name) {
  const lower = name.toLowerCase();
  if (VARIANT_SKIP_PREFIXES.some((p) => name.startsWith(p))) return false;
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function existingGeneration(key) {
  try {
    const [meta] = await bucket.file(key).getMetadata();
    return meta?.metadata?.sourceGeneration || null;
  } catch {
    return null;
  }
}

const [files] = await bucket.getFiles({ autoPaginate: true });
const sources = files.filter((f) => isSourceImage(f.name));
console.log(`Bucket ${BUCKET}: ${sources.length} imagenes`);

let created = 0;
let skipped = 0;
for (const file of sources) {
  const generation = String(file.metadata.generation);
  const pending = [];
  for (const w of VARIANT_WIDTHS) {
    const key = variantKey(file.name, w);
    if (!force && (await existingGeneration(key)) === generation) {
      skipped++;
      continue;
    }
    pending.push({ w, key });
  }
  if (!pending.length) continue;

  const [input] = await file.download();
  for (const { w, key } of pending) {
    const output = await sharp(input, { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: variantQuality(w), effort: 6 })
      .toBuffer();

    await bucket.file(key).save(output, {
      resumable: false,
      contentType: "image/webp",
      metadata: {
        cacheControl: CACHE_CONTROL,
        metadata: { sourceObject: file.name, sourceGeneration: generation },
      },
    });
    created++;
    console.log(`  ${String(Math.round(output.length / 1024)).padStart(5)} KB  ${key}`);
  }
}

console.log(`Listo: ${created} creadas, ${skipped} ya estaban al dia.`);
