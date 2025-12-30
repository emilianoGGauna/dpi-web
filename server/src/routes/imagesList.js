// server/src/routes/imagesList.js
import express from "express";
import { Storage } from "@google-cloud/storage";

const router = express.Router();
const storage = new Storage();

const BUCKET = process.env.GCS_ORIGINAL_BUCKET || "dpi-info";

router.get("/list", async (req, res) => {
  try {
    const prefix = String(req.query.prefix || "");
    if (!prefix) return res.status(400).json({ error: "Missing prefix" });

    const [files] = await storage.bucket(BUCKET).getFiles({
      prefix,
      autoPaginate: true,
    });

    res.setHeader("Cache-Control", "no-store");
    return res.json({ objects: files.map((f) => f.name) });
  } catch (e) {
    console.error("IMAGES_LIST_ERROR", e);
    return res.status(500).json({ error: "Cannot list images" });
  }
});

export default router;
