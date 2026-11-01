// server/src/lib/variants.js
// Pre-generated WebP versions of the bucket images, stored in the same bucket.
// They live outside "Proyectos/" so the projects listing never picks them up.
// Generate/refresh them with: npm run variants

export const VARIANT_PREFIX = "_optimizado/";

// Widths requested by the client (thumbnail, card, server default, hero)
export const VARIANT_WIDTHS = [360, 1000, 1200, 1600];

export const VARIANT_SKIP_PREFIXES = ["LOGOS DE CLIENTES/", VARIANT_PREFIX];

export function variantKey(object, w) {
  return `${VARIANT_PREFIX}w${w}/${object}.webp`;
}

export function variantQuality(w) {
  return w <= 400 ? 75 : 80;
}
