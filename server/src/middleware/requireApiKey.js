// server/src/middleware/requireApiKey.js
let devKey = null;

function getExpectedKey() {
  // 1) Si existe env var, úsala
  if (process.env.IMAGE_API_KEY && process.env.IMAGE_API_KEY.trim()) {
    return process.env.IMAGE_API_KEY.trim();
  }

  // 2) Si no existe, genera una SOLO UNA VEZ (dev)
  if (!devKey) {
    devKey = cryptoRandomKey();
    console.log("\n🔑 DEV IMAGE_API_KEY generated:", devKey, "\n");
  }
  return devKey;
}

function cryptoRandomKey() {
  // sin dependencias extra
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function requireApiKey() {
  return (req, res, next) => {
    const expected = getExpectedKey();

    const headerKey = req.header("x-api-key");
    if (headerKey === expected) return next();

    return res.status(401).json({ error: "Missing/invalid API key" });
  };
}
