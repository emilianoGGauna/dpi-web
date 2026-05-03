import express from "express";
import { Storage } from "@google-cloud/storage";

const router = express.Router();
const storage = new Storage();

const BUCKET = process.env.GCS_ORIGINAL_BUCKET || "dpi-info";
const PROJECTS_PREFIX = "Proyectos/";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

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

router.get("/projects", async (req, res) => {
  try {
    const projects = await loadProjectsFromGcs();
    res.setHeader("Cache-Control", "no-store");
    res.json(projects);
  } catch (e) {
    console.error("PROJECTS_LOAD_ERROR", e);
    res.status(500).json({ error: "Cannot load projects from GCS" });
  }
});

router.get("/home-slides", async (req, res) => {
  try {
    const projects = await loadProjectsFromGcs();
    res.setHeader("Cache-Control", "no-store");
    res.json(projects);
  } catch (e) {
    console.error("HOME_SLIDES_ERROR", e);
    res.status(500).json({ error: "Cannot load home slides from GCS" });
  }
});

export default router;
