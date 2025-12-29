import "dotenv/config";
import express from "express";
import imagesRouter from "./routes/images.js";
import contactRouter from "./routes/contact.js";

const app = express();

// Cloud Run / proxies
app.set("trust proxy", true);

// Basic hardening
app.disable("x-powered-by");
app.use((req, res, next) => {
  // Small request log (Cloud Logging friendly)
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

// Optional: limit header size-ish (Express doesn't directly cap like nginx, but this helps)
app.use((req, res, next) => {
  const headerBytes = JSON.stringify(req.headers || {}).length;
  if (headerBytes > 16_000) return res.status(431).send("Request headers too large");
  next();
});

app.get("/", (req, res) => {
  res.type("text/plain").send("DPI API OK. Use /health or /api/images");
});

// Health endpoint (Cloud Run uses this style)
app.get("/health", (req, res) => {
  const ok =
    Boolean(process.env.GCS_ORIGINAL_BUCKET) &&
    Boolean(process.env.PORT || "8080");

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

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

// Graceful shutdown for Cloud Run
function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


console.log("SERVER IMAGE_API_KEY length:", (process.env.IMAGE_API_KEY || "").length);

app.use(express.json({ limit: "100kb" }));

app.use("/api/contact", contactRouter);
