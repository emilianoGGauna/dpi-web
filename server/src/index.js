// server/src/index.js
import "dotenv/config";
import express from "express";
import imagesRouter from "./routes/images.js";
import imagesListRouter from "./routes/imagesList.js"; // ✅ NEW
import homeSlides from "./routes/homeSlides.js";

const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");

// ✅ CORS (no dependency)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowlist = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  if (origin && allowlist.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "100kb" }));

// logging
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

// header size check
app.use((req, res, next) => {
  const headerBytes = JSON.stringify(req.headers || {}).length;
  if (headerBytes > 16_000) return res.status(431).send("Request headers too large");
  next();
});

app.get("/", (req, res) =>
  res.type("text/plain").send("DPI API OK. Use /health or /api/images")
);

app.get("/health", (req, res) => {
  const ok = Boolean(process.env.GCS_ORIGINAL_BUCKET);
  res.status(ok ? 200 : 500).json({
    ok,
    service: "dpi-api",
    env: {
      hasBucket: Boolean(process.env.GCS_ORIGINAL_BUCKET),
      cacheBucket: process.env.GCS_CACHE_BUCKET || null,
      ttl: Number(process.env.CACHE_TTL_SECONDS || 86400),
    },
  });
});

// ✅ Mount routes
app.use("/api", homeSlides);

// ✅ /api/images/list?prefix=LOGOS%20DE%20CLIENTES/
app.use("/api/images", imagesListRouter);

// ✅ existing image endpoint(s), e.g. /api/images?object=...
app.use("/api/images", imagesRouter);

// error handler final
app.use((err, req, res, next) => {
  console.error("UNHANDLED_EXPRESS_ERROR", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED_REJECTION", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION", err);
  process.exit(1);
});
