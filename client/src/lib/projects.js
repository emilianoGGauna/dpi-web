import { buildImageUrl, getImagesApiBase } from "./imageApi";

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}


function resolveImageUrl(imageUrl, object, options = {}) {
  const raw = String(imageUrl || "").trim();
  const apiBase = getImagesApiBase();

  if (/^https?:\/\//i.test(raw)) return raw;

  if (raw.startsWith("/api/images")) {
    return apiBase ? `${apiBase}${raw}` : raw;
  }

  if (object) return buildImageUrl(object, options);
  return "";
}

function normalizeImage(image, idx) {
  const object = String(image?.object || "").trim();
  if (!object) return null;

  return {
    id: image?.id || toSlug(object) || `image-${idx + 1}`,
    object,
    url: resolveImageUrl(image?.url, object, { width: 1200, quality: 80 }),
  };
}

export function normalizeProject(project, index) {
  const images = Array.isArray(project?.images)
    ? project.images.map(normalizeImage).filter((img) => img?.url)
    : [];

  const folderPath = String(project?.folderPath || "").trim();
  const title = String(project?.title || `Proyecto ${index + 1}`).trim();
  const category = String(project?.category || title).trim();

  return {
    id: project?.id || toSlug(folderPath || title) || `project-${index + 1}`,
    title,
    category,
    folderPath,
    images,
    coverImageUrl: images[0]?.url || "",
  };
}

export function normalizeProjects(rawProjects = []) {
  return rawProjects
    .filter(Boolean)
    .map(normalizeProject)
    .filter((project) => project.images.length);
}

export async function fetchProjects(apiBase, { signal } = {}) {
  const base = String(apiBase || "").replace(/\/$/, "");
  if (!base) throw new Error("Falta VITE_IMAGES_API_BASE para cargar proyectos.");

  const res = await fetch(`${base}/api/projects`, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error("Se esperaba un arreglo de proyectos.");
  return normalizeProjects(raw);
}

export { toSlug };
