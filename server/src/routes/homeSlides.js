import express from "express";
import { Storage } from "@google-cloud/storage";

const router = express.Router();
const storage = new Storage();

const BUCKET = process.env.GCS_ORIGINAL_BUCKET || "dpi-info";
const PROJECTS_PREFIX = "Proyectos/";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const PROJECTS_CACHE_TTL_MS = Number(process.env.PROJECTS_CACHE_TTL_MS || 5 * 60 * 1000);
const PROJECTS_RESPONSE_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300";

let projectsCache = {
  timestamp: 0,
  data: null,
  pending: null,
};

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isImageObject(name = "") {
  const lower = name.toLowerCase();
  return [...IMAGE_EXTENSIONS].some((ext) => lower.endsWith(ext));
}

function normalizeProjectGroups(objects = []) {
  const groups = new Map();

  for (const objectPath of objects) {
    if (!objectPath.startsWith(PROJECTS_PREFIX)) continue;
    if (!isImageObject(objectPath)) continue;

    const segments = objectPath.split("/").filter(Boolean);
    if (segments.length < 2) continue;

    const category = segments[1] || "Proyecto";
    const title = segments[segments.length - 2] || category;
    const folderPath = `${segments.slice(0, -1).join("/")}/`;

    if (!groups.has(folderPath)) {
      const idBase = `${category}-${title}-${folderPath}`;
      groups.set(folderPath, {
        id: toSlug(idBase),
        title,
        category,
        folderPath,
        images: [],
      });
    }

    groups.get(folderPath).images.push({
      id: toSlug(objectPath),
      object: objectPath,
      url: `/api/images?object=${encodeURIComponent(objectPath)}&w=1200&q=80`,
    });
  }

  return [...groups.values()]
    .map((project) => ({
      ...project,
      images: project.images.sort((a, b) => a.object.localeCompare(b.object)),
    }))
    .sort((a, b) => {
      const byCategory = a.category.localeCompare(b.category, "es", { sensitivity: "base" });
      if (byCategory !== 0) return byCategory;
      return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
    });
}

async function loadProjectsFromGcs() {
  const [files] = await storage.bucket(BUCKET).getFiles({ prefix: PROJECTS_PREFIX, autoPaginate: true });
  const objectNames = files.map((file) => file.name).filter(Boolean);
  return normalizeProjectGroups(objectNames);
}

function isFreshCache() {
  return Array.isArray(projectsCache.data) && Date.now() - projectsCache.timestamp < PROJECTS_CACHE_TTL_MS;
}

async function getProjectsCached() {
  if (isFreshCache()) {
    return { data: projectsCache.data, state: "hit" };
  }

  if (!projectsCache.pending) {
    projectsCache.pending = loadProjectsFromGcs()
      .then((data) => {
        projectsCache.data = data;
        projectsCache.timestamp = Date.now();
        return data;
      })
      .finally(() => {
        projectsCache.pending = null;
      });
  }

  try {
    const data = await projectsCache.pending;
    return { data, state: projectsCache.timestamp ? "miss" : "miss" };
  } catch (error) {
    if (Array.isArray(projectsCache.data)) {
      return { data: projectsCache.data, state: "stale", error };
    }
    throw error;
  }
}

async function respondWithProjects(req, res, errorContext) {
  try {
    const { data, state, error } = await getProjectsCached();
    if (error && state === "stale") {
      console.warn(`${errorContext}_STALE_CACHE`, error);
    }
    res.setHeader("Cache-Control", PROJECTS_RESPONSE_CACHE_CONTROL);
    res.setHeader("X-DPI-Cache", state);
    res.json(data);
  } catch (e) {
    console.error(errorContext, e);
    res.status(500).json({ error: "Cannot load projects from GCS" });
  }
}

router.get("/projects", async (req, res) => respondWithProjects(req, res, "PROJECTS_LOAD_ERROR"));

router.get("/home-slides", async (req, res) => respondWithProjects(req, res, "HOME_SLIDES_ERROR"));

export default router;
