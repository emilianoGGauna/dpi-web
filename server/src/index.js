import "dotenv/config";
import express from "express";
import imagesRouter from "./routes/images.js";
import contactRouter from "./routes/contact.js";

const app = express();

// Cloud Run / proxies
app.set("trust proxy", true);

// Body parser ANTES de rutas
app.use(express.json({ limit: "100kb" }));

// Basic hardening
app.disable("x-powered-by");

// Small request log (Cloud Logging friendly)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      JSON.stringify({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms,
        ip: req.ip,
        ua: req.get("user-agent"),
      })
    );
  });
  next();
});

// Optional header size check
app.use((req, res, next) => {
  const headerBytes = JSON.stringify(req.headers || {}).length;
  if (headerBytes > 16_000) return res.status(431).send("Request headers too large");
  next();
});

app.get("/", (req, res) => {
  res.type("text/plain").send("DPI API OK. Use /health or /api/images");
});

app.get("/health", (req, res) => {
  const ok = Boolean(process.env.GCS_ORIGINAL_BUCKET) && Boolean(process.env.PORT || "8080");

  res.status(ok ? 200 : 500).json({
    ok,
    service: "dpi-api",
    env: {
      hasBucket: Boolean(process.env.GCS_ORIGINAL_BUCKET),
      hasApiKey: Boolean(process.env.IMAGE_API_KEY),
      cacheBucket: process.env.GCS_CACHE_BUCKET || null,
    },
  });
});

// Routes
app.use("/api/images", imagesRouter);
app.use("/api/contact", contactRouter);

console.log("SERVER IMAGE_API_KEY length:", (process.env.IMAGE_API_KEY || "").length);

// Start server (bind explícito para Cloud Run)
const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Log fatal errors (si crashea antes de escuchar, aquí lo verás en logs)
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED_REJECTION", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION", err);
  process.exit(1);
});
