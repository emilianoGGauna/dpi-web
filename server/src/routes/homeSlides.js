import express from "express";
import { Storage } from "@google-cloud/storage";

const router = express.Router();

const storage = new Storage();

// Usa tu env si existe; si no, cae a dpi-info
const BUCKET = process.env.GCS_ORIGINAL_BUCKET || "dpi-info";
const OBJECT = process.env.HOME_SLIDES_OBJECT || "project-list.json";

router.get("/home-slides", async (req, res) => {
  try {
    const [buf] = await storage.bucket(BUCKET).file(OBJECT).download();

    // Dev: sin cache para que veas cambios inmediato
    res.setHeader("Cache-Control", "no-store");
    res.type("application/json").send(buf);
  } catch (e) {
    console.error("HOME_SLIDES_ERROR", e);
    res.status(500).json({ error: "Cannot load home-slides.json from GCS" });
  }
});

export default router;
