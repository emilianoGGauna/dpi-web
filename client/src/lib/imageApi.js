const DEFAULTS = {
  width: 1400,
  quality: 82,
};

export function getImagesApiBase() {
  return (import.meta.env.VITE_IMAGES_API_BASE || "").replace(/\/$/, "");
}

export function buildImageUrl(objectName, options = {}) {
  const object = String(objectName || "").trim();
  const apiBase = getImagesApiBase();

  if (!object || !apiBase) return "";

  const {
    width = DEFAULTS.width,
    quality = DEFAULTS.quality,
    format,
  } = options;

  const url = new URL(`${apiBase}/api/images`);
  url.searchParams.set("object", object);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  if (format) url.searchParams.set("format", String(format));
  return url.toString();
}

export function extractObjectFromImageUrl(urlValue) {
  const raw = String(urlValue || "").trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);
    return u.searchParams.get("object") || "";
  } catch {
    return "";
  }
}
