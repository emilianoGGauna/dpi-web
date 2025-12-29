import "dotenv/config";
import fs from "node:fs";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8080"; // <- ipv4 default
const API_KEY = process.env.IMAGE_API_KEY || "";
const object = process.env.TEST_OBJECT || "LOGO DPI.jpg";

const w = process.env.TEST_W || "600";
const q = process.env.TEST_Q || "80";
const format = process.env.TEST_FORMAT || "jpeg";
const timeoutMs = Number(process.env.TEST_TIMEOUT_MS || 15000);

const url = new URL(`${API_BASE}/api/images`);
url.searchParams.set("object", object);
url.searchParams.set("w", w);
url.searchParams.set("q", q);
url.searchParams.set("format", format);

const controller = new AbortController();
const t = setTimeout(() => controller.abort(), timeoutMs);

const headers = {};
if (API_KEY) headers["x-api-key"] = API_KEY;

function errDetails(e) {
  const cause = e?.cause;
  const extra =
    cause?.code ? `${cause.code}: ${cause.message}` :
    cause?.message ? cause.message :
    "";
  return `${e.message}${extra ? " | " + extra : ""}`;
}

console.log("➡️ API_BASE:", API_BASE);

try {
  // ping health first
  const health = await fetch(`${API_BASE}/health`, { signal: controller.signal });
  if (!health.ok) throw new Error(`Health check failed: HTTP ${health.status}`);
} catch (e) {
  clearTimeout(t);
  throw new Error(`Cannot reach API at ${API_BASE}. ${errDetails(e)}`);
}

console.log("➡️ Request:", url.toString());

let res;
try {
  res = await fetch(url, { headers, signal: controller.signal });
} catch (e) {
  clearTimeout(t);
  throw new Error(`Image request failed. ${errDetails(e)}`);
}
clearTimeout(t);

// Save headers for debugging
const headerDump = [];
for (const [k, v] of res.headers.entries()) headerDump.push(`${k}: ${v}`);
fs.writeFileSync("last_response_headers.txt", headerDump.join("\n"));

const ct = res.headers.get("content-type") || "";
const buf = Buffer.from(await res.arrayBuffer());

if (!res.ok) {
  const snippet = buf.toString("utf8").slice(0, 300);
  throw new Error(`HTTP ${res.status}\nContent-Type: ${ct}\nBody: ${snippet}`);
}

if (!ct.startsWith("image/")) {
  const snippet = buf.toString("utf8").slice(0, 300);
  throw new Error(`Expected image/* but got ${ct}. Body: ${snippet}`);
}

let ext = "bin";
if (ct.includes("webp")) ext = "webp";
else if (ct.includes("jpeg")) ext = "jpg";
else if (ct.includes("png")) ext = "png";

const outPath = `downloaded_${w}w_q${q}.${ext}`;
fs.writeFileSync(outPath, buf);

console.log("✅ Saved:", outPath);
console.log("ℹ️ Headers saved to last_response_headers.txt");
