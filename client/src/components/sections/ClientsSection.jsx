import { useEffect, useMemo, useState } from "react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { buildImageUrl, getImagesApiBase } from "../../lib/imageApi";

const SUPPORTED_IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
const CACHE_TTL_MS = 30 * 60 * 1000;
const PRELOAD_COUNT = 6;

function normalizePrefix(prefix) {
  if (!prefix) return "";
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

function getCacheKey(prefix) {
  return `dpi-client-logo-objects:v1:${prefix}`;
}

function readLogoCache(cacheKey) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const timestamp = Number(parsed.timestamp);
    const objects = Array.isArray(parsed.objects) ? parsed.objects : [];

    if (!Number.isFinite(timestamp) || !objects.length) return null;

    return {
      timestamp,
      objects,
      isFresh: Date.now() - timestamp < CACHE_TTL_MS,
    };
  } catch {
    return null;
  }
}

function writeLogoCache(cacheKey, objects) {
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), objects }),
    );
  } catch {
    // non-fatal
  }
}

function normalizeLogoObjects(raw, prefix) {
  const names = raw
    .map((x) => (typeof x === "string" ? x : x?.name))
    .map((name) => (typeof name === "string" ? name.trim() : ""))
    .filter(Boolean)
    .filter((name) => name.startsWith(prefix))
    .filter((name) => !name.endsWith("/"))
    .filter((name) => SUPPORTED_IMAGE_EXT_RE.test(name));

  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export default function ClientsSection({
  accentColor = "#C0392B",
  folderPrefix = "LOGOS DE CLIENTES/",
  speedSecondsDesktop = 40,
  speedSecondsMobile = 50,
  imageWidthMobile = 220,
  imageWidthDesktop = 260,
  imageQuality = 85,
}) {
  const IMG_API = getImagesApiBase();
  const [logoObjects, setLogoObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const prefix = useMemo(() => normalizePrefix(folderPrefix), [folderPrefix]);
  const cacheKey = useMemo(() => getCacheKey(prefix), [prefix]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function fetchLogos() {
      const url = `${IMG_API}/api/images/list?prefix=${encodeURIComponent(prefix)}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`List failed (${res.status})`);

      const data = await res.json();
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.objects)
          ? data.objects
          : Array.isArray(data?.items)
            ? data.items
            : [];

      return normalizeLogoObjects(raw, prefix);
    }

    async function load() {
      setErrorMsg("");

      if (!IMG_API) {
        setLogoObjects([]);
        setLoading(false);
        setErrorMsg("Configura VITE_IMAGES_API_BASE para cargar logos de clientes.");
        return;
      }

      const cached = readLogoCache(cacheKey);
      if (cached?.objects?.length && alive) {
        setLogoObjects(cached.objects);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const shouldFetch = !cached?.isFresh;
      if (!shouldFetch) return;

      try {
        const names = await fetchLogos();
        if (!alive) return;

        setLogoObjects(names);
        setLoading(false);
        writeLogoCache(cacheKey, names);
      } catch (e) {
        if (!alive) return;

        setLoading(false);
        if (!cached?.objects?.length) {
          setLogoObjects([]);
          setErrorMsg(`No se pudieron cargar logos desde ${prefix}.`);
        } else {
          // eslint-disable-next-line no-console
          console.warn("ClientsSection: using stale logo cache after fetch failure", e);
        }
      }
    }

    load();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [IMG_API, prefix, cacheKey]);

  const displayLogos = useMemo(() => {
    if (!logoObjects.length) return [];
    const minItems = 10;
    const reps = Math.max(1, Math.ceil(minItems / logoObjects.length));
    return Array.from({ length: reps }, () => logoObjects).flat();
  }, [logoObjects]);

  const buildSrc = (objectName, isMobile) =>
    buildImageUrl(objectName, {
      width: isMobile ? imageWidthMobile : imageWidthDesktop,
      quality: imageQuality,
    });

  useEffect(() => {
    if (!logoObjects.length) return;
    const firstVisible = logoObjects.slice(0, PRELOAD_COUNT);
    firstVisible.forEach((obj) => {
      const preloader = new Image();
      preloader.decoding = "async";
      preloader.src = buildSrc(obj, false);
    });
  }, [logoObjects]);

  return (
    <section
      id="clients"
      className="py-12 md:py-16 bg-gray-50 dark:bg-[#0B0C10] transition-colors duration-300"
    >
      <style>{`
        @keyframes dpi-marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        .dpi-marquee-track {
          animation: dpi-marquee-right var(--dpi-speed-mobile) linear infinite;
          will-change: transform;
        }
        @media (min-width: 768px) {
          .dpi-marquee-track {
            animation-duration: var(--dpi-speed-desktop);
          }
        }
        @media (hover: hover) and (pointer: fine) {
          .dpi-marquee-wrap:hover .dpi-marquee-track {
            animation-play-state: paused;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Clientes
          </h2>
          <div
            className="w-14 h-1 mx-auto mt-3 rounded"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div
          className={[
            "dpi-marquee-wrap",
            "rounded-2xl border shadow-sm overflow-hidden",
            "bg-white/70 dark:bg-[#101114]/70",
            "border-gray-200 dark:border-white/10",
          ].join(" ")}
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%)",
          }}
        >
          <div className="px-4 sm:px-6 py-5">
            {errorMsg ? (
              <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">{errorMsg}</div>
            ) : loading && !displayLogos.length ? (
              <SkeletonLogos />
            ) : !displayLogos.length ? (
              <div className="text-sm text-gray-600 dark:text-white/60">
                No se encontraron imágenes en: <span className="font-medium">{prefix}</span>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div
                  className="dpi-marquee-track flex items-center gap-5 sm:gap-6 w-max"
                  style={{
                    ["--dpi-speed-desktop"]: `${speedSecondsDesktop}s`,
                    ["--dpi-speed-mobile"]: `${speedSecondsMobile}s`,
                  }}
                >
                  <MarqueeGroup logos={displayLogos} buildSrc={buildSrc} accentColor={accentColor} />
                  <MarqueeGroup logos={displayLogos} buildSrc={buildSrc} accentColor={accentColor} ariaHidden />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function humanizeLogoName(objectName = "") {
  const base = objectName.split("/").pop() || "Cliente";
  return base.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() || "Cliente";
}

function SkeletonLogos() {
  return (
    <div className="flex items-center gap-5 sm:gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          className={[
            idx >= 3 ? "hidden sm:flex" : "flex",
            "items-center justify-center",
            "h-20 min-w-[200px] sm:min-w-[240px]",
            "px-5 sm:px-8 rounded-xl",
            "border border-gray-200/70 dark:border-white/10",
            "bg-white/60 dark:bg-white/5",
            "animate-pulse",
          ].join(" ")}
        >
          <div className="h-10 w-[145px] sm:w-[195px] rounded bg-gray-200/80 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function MarqueeGroup({ logos, buildSrc, accentColor, ariaHidden = false }) {
  return (
    <div className="flex items-center gap-5 sm:gap-6" aria-hidden={ariaHidden ? "true" : undefined}>
      {logos.map((obj, idx) => {
        const isPriority = idx < 4;
        return (
          <div
            key={`${ariaHidden ? "clone" : "base"}-${obj}-${idx}`}
            className="
              flex items-center justify-center
              h-20
              min-w-[200px] sm:min-w-[240px]
              px-5 sm:px-8
              rounded-xl
              border border-gray-200/70 dark:border-white/10
              bg-white/60 dark:bg-white/5
              transition
            "
            style={{
              boxShadow: `0 0 0 1px ${accentColor}14 inset`,
            }}
            title={humanizeLogoName(obj)}
          >
            <ImageWithFallback
              src={buildSrc(obj, true)}
              srcSet={`${buildSrc(obj, true)} 220w, ${buildSrc(obj, false)} 260w`}
              sizes="(max-width: 640px) 220px, 260px"
              alt={`Logo ${humanizeLogoName(obj)}`}
              loading={isPriority && !ariaHidden ? "eager" : "lazy"}
              decoding="async"
              showSkeleton={false}
              className="
                flex items-center justify-center
                w-full h-full
              "
              imgClassName="
                max-h-10 sm:max-h-12
                max-w-[145px] sm:max-w-[195px]
                w-auto h-auto
                object-contain
                grayscale opacity-85
                hover:grayscale-0 hover:opacity-100
                transition-all duration-300
              "
            />
          </div>
        );
      })}
    </div>
  );
}
