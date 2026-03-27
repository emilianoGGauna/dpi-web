import { buildImageUrl, extractObjectFromImageUrl } from "./imageApi";

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function pickImageObject(project) {
  const direct =
    project.imageObject ||
    project.imgObject ||
    project.imageKey ||
    project.gcsObject ||
    project.image?.object ||
    "";

  if (direct) return String(direct).trim();

  const imgValue = String(project.img || project.image || "").trim();
  if (imgValue && !/^https?:\/\//i.test(imgValue)) return imgValue;

  const fromUrl = extractObjectFromImageUrl(imgValue);
  if (fromUrl) return fromUrl;

  if (Array.isArray(project.images)) {
    for (const item of project.images) {
      const candidate =
        item?.imageObject ||
        item?.imgObject ||
        item?.imageKey ||
        item?.gcsObject ||
        item?.object ||
        extractObjectFromImageUrl(item?.url || "");

      if (candidate) return String(candidate).trim();
    }
  }

  return "";
}

export function normalizeProject(project, index) {
  const imageObject = pickImageObject(project);
  const tags = normalizeArray(project.tags || project.tag || project.keywords);
  const serviceHints = normalizeArray(project.serviceIds || project.services || project.service);
  const category = project.category || project.type || "Caso";

  return {
    id: project.id ?? `project-${index + 1}`,
    title: project.title || project.name || `Proyecto ${index + 1}`,
    category,
    status: project.status || project.caseType || project.stage || "",
    descriptor: project.descriptor || project.summary || project.role || "",
    location: project.location || "",
    tags,
    serviceHints: serviceHints.map(toSlug),
    imageObject,
    imageUrl: imageObject ? buildImageUrl(imageObject, { width: 1600 }) : "",
  };
}

export function normalizeProjects(rawProjects = []) {
  return rawProjects.filter(Boolean).map(normalizeProject);
}

export { toSlug };
