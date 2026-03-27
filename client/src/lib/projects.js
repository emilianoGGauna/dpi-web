import { buildImageUrl, extractObjectFromImageUrl } from "./imageApi";

export function toSlug(value = "") {
  const base = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "item";
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => firstString(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function pickImageObject(record = {}) {
  const direct = firstString(
    record.imageObject,
    record.imgObject,
    record.imageKey,
    record.gcsObject,
    record.object,
    record.coverObject,
    record.heroObject,
    record.image?.object,
    record.cover?.object,
    record.thumbnail?.object
  );
  if (direct) return direct;

  const directUrl = firstString(
    record.imageUrl,
    record.image_url,
    record.coverImage,
    record.cover_image,
    record.thumbnail,
    record.heroImage,
    record.hero_image,
    record.image,
    record.img,
    record.cover,
    record.url
  );

  if (directUrl && !/^https?:\/\//i.test(directUrl)) return directUrl;
  const fromUrl = extractObjectFromImageUrl(directUrl);
  if (fromUrl) return fromUrl;

  const imageCollections = [record.gallery, record.images, record.media].flatMap(toArray);
  for (const imageItem of imageCollections) {
    if (!imageItem) continue;

    if (typeof imageItem === "string") {
      if (!/^https?:\/\//i.test(imageItem)) return imageItem;
      const obj = extractObjectFromImageUrl(imageItem);
      if (obj) return obj;
      continue;
    }

    const nested = firstString(
      imageItem.object,
      imageItem.imageObject,
      imageItem.imageKey,
      imageItem.gcsObject
    );
    if (nested) return nested;

    const nestedUrl = firstString(imageItem.url, imageItem.imageUrl, imageItem.image_url);
    if (nestedUrl && !/^https?:\/\//i.test(nestedUrl)) return nestedUrl;
    const nestedFromUrl = extractObjectFromImageUrl(nestedUrl);
    if (nestedFromUrl) return nestedFromUrl;
  }

  return "";
}

function normalizeRecord(record = {}, index = 0) {
  const title = firstString(record.title, record.name, record.projectName, `Proyecto ${index + 1}`);
  const id = firstString(record.id, record._id, record.uuid, record.code, `project-${index + 1}`);
  const slugSource = firstString(record.slug, record.path, title, id);
  const imageObject = pickImageObject(record);

  return {
    id,
    slug: toSlug(slugSource),
    title,
    category: firstString(record.category, record.type, record.segment, "Proyecto"),
    status: firstString(record.status, record.stage, record.caseType),
    descriptor: firstString(record.descriptor, record.summary, record.subtitle, record.role),
    location: firstString(record.location, record.city, record.municipality),
    description: firstString(record.description, record.body, record.overview),
    featured: Boolean(record.featured ?? record.isFeatured ?? record.destacado),
    order: Number(record.order ?? record.priority ?? index + 1),
    tags: normalizeTags(record.tags || record.tag || record.keywords),
    serviceHints: normalizeTags(record.serviceIds || record.service || record.services).map(toSlug),
    imageObject,
    imageUrl: imageObject ? buildImageUrl(imageObject, { width: 1600, format: "webp" }) : "",
  };
}

export function normalizeProjects(rawProjects = []) {
  const array = Array.isArray(rawProjects) ? rawProjects : toArray(rawProjects);
  return array
    .filter(Boolean)
    .map((item, index) => normalizeRecord(item, index))
    .sort((a, b) => a.order - b.order);
}

export async function fetchProjects(signal) {
  const apiBase = (import.meta.env.VITE_IMAGES_API_BASE || "").replace(/\/$/, "");
  if (!apiBase) throw new Error("Falta VITE_IMAGES_API_BASE.");

  const res = await fetch(`${apiBase}/api/home-slides`, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  const normalized = normalizeProjects(raw);
  if (!normalized.length) throw new Error("No hay proyectos válidos.");
  return normalized;
}
