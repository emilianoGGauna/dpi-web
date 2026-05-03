import { buildImageUrl, getImagesApiBase } from "./imageApi";

const PROJECTS_CACHE_KEY = "dpi-projects:v1";
const PROJECTS_CACHE_TTL_MS = 5 * 60 * 1000;

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function readProjectsCache() {
  try {
    const raw = window.sessionStorage.getItem(PROJECTS_CACHE_KEY) || window.localStorage.getItem(PROJECTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.data) || !Number.isFinite(parsed?.timestamp)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeProjectsCache(data) {
  const payload = JSON.stringify({ timestamp: Date.now(), data });
  try {
    window.sessionStorage.setItem(PROJECTS_CACHE_KEY, payload);
  } catch {
    // noop
  }
  try {
    window.localStorage.setItem(PROJECTS_CACHE_KEY, payload);
  } catch {
    // noop
  }
}

function resolveImageUrl(imageUrl, object, options = {}) {
  const raw = String(imageUrl || "").trim();
  const apiBase = getImagesApiBase();

  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/api/images")) return apiBase ? `${apiBase}${raw}` : raw;
  if (object) return buildImageUrl(object, options);
  return "";
}

function normalizeImage(image, idx) {
  const object = String(image?.object || "").trim();
  if (!object) return null;

  const thumbnailUrl = buildImageUrl(object, { width: 360, quality: 75 });
  const cardUrl = buildImageUrl(object, { width: 1000, quality: 80 });
  const heroUrl = buildImageUrl(object, { width: 1600, quality: 82 });

  return {
    id: image?.id || toSlug(object) || `image-${idx + 1}`,
    object,
    url: resolveImageUrl(image?.url, object, { width: 1000, quality: 80 }) || cardUrl,
    thumbnailUrl,
    cardUrl,
    heroUrl,
  };
}

export function normalizeProject(project, index) {
  const images = Array.isArray(project?.images) ? project.images.map(normalizeImage).filter((img) => img?.url) : [];
  const folderPath = String(project?.folderPath || "").trim();
  const title = String(project?.title || `Proyecto ${index + 1}`).trim();
  const category = String(project?.category || title).trim();

  return {
    id: project?.id || toSlug(folderPath || title) || `project-${index + 1}`,
    title,
    category,
    folderPath,
    images,
    coverImageUrl: images[0]?.cardUrl || images[0]?.url || "",
  };
}

export function normalizeProjects(rawProjects = []) {
  return rawProjects.filter(Boolean).map(normalizeProject).filter((project) => project.images.length);
}

async function fetchProjectsFromNetwork(base, signal) {
  const res = await fetch(`${base}/api/projects`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error("Se esperaba un arreglo de proyectos.");
  const normalized = normalizeProjects(raw);
  writeProjectsCache(normalized);
  return normalized;
}

export async function fetchProjects(apiBase, { signal } = {}) {
  const base = String(apiBase || "").replace(/\/$/, "");
  if (!base) throw new Error("Falta VITE_IMAGES_API_BASE para cargar proyectos.");

  const cached = readProjectsCache();
  const hasCache = Array.isArray(cached?.data);
  const isFresh = hasCache && Date.now() - cached.timestamp < PROJECTS_CACHE_TTL_MS;

  if (isFresh) return cached.data;

  try {
    return await fetchProjectsFromNetwork(base, signal);
  } catch (error) {
    if (hasCache) return cached.data;
    throw error;
  }
}

export { toSlug };
