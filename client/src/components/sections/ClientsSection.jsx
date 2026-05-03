import { useEffect, useMemo, useState } from "react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { buildImageUrl, getImagesApiBase } from "../../lib/imageApi";

const isImageFile = (name = "") => /\.(png|jpe?g|webp)$/i.test(name);

function normalizePrefix(prefix) {
  if (!prefix) return "";
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

export default function ClientsSection({
  accentColor = "#C0392B",
  // 👇 folder in your bucket (as in your screenshot)
  folderPrefix = "LOGOS DE CLIENTES/",
  // seconds for a full loop
  speedSeconds = 28,
  // image params
  imageWidth = 260,
  imageQuality = 85,
  }) {
  const IMG_API = getImagesApiBase();
  const [logoObjects, setLogoObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const prefix = useMemo(() => normalizePrefix(folderPrefix), [folderPrefix]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg("");
      if (!IMG_API) {
        setLogoObjects([]);
        setLoading(false);
        setErrorMsg("Configura VITE_IMAGES_API_BASE para cargar logos de clientes.");
        return;
      }
      try {
        /**
         * ✅ You need (or likely already have) an endpoint that LISTS objects in a folder/prefix.
         * Expected response examples (any of these will work):
         *  - { objects: ["LOGOS DE CLIENTES/AXXIS.png", ...] }
         *  - { items: [{ name: "LOGOS DE CLIENTES/AXXIS.png" }, ...] }
         *  - ["LOGOS DE CLIENTES/AXXIS.png", ...]
         */
        const url = `${IMG_API}/api/images/list?prefix=${encodeURIComponent(prefix)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`List failed (${res.status})`);
        const data = await res.json();

        const raw =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.objects)
            ? data.objects
            : Array.isArray(data?.items)
            ? data.items
            : [];

        const names = raw
          .map((x) => (typeof x === "string" ? x : x?.name))
          .filter(Boolean)
          .filter((n) => n.startsWith(prefix))
          .filter(isImageFile);

        if (alive) setLogoObjects(names);
      } catch (e) {
        if (alive) {
          setLogoObjects([]);
          setErrorMsg(`No se pudieron cargar logos desde ${prefix}.`);
        }
        // eslint-disable-next-line no-console
        console.warn("ClientsSection: could not load folder logos:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [IMG_API, prefix]);

  const logos = useMemo(() => {
    // Make sure we have enough items to look continuous even with few logos
    if (!logoObjects.length) return [];
    const min = 10;
    const reps = Math.max(1, Math.ceil(min / logoObjects.length));
    const expanded = Array.from({ length: reps }, () => logoObjects).flat();
    return expanded;
  }, [logoObjects]);

  const buildSrc = (objectName) =>
    buildImageUrl(objectName, { width: imageWidth, quality: imageQuality });

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
          animation: dpi-marquee-right var(--dpi-speed) linear infinite;
          will-change: transform;
        }
        .dpi-marquee-wrap:hover .dpi-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Smaller title */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
            Clientes
          </h2>
          <div
            className="w-14 h-1 mx-auto mt-3 rounded"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Band / infinite marquee */}
        <div
          className={[
            "dpi-marquee-wrap",
            "rounded-2xl border shadow-sm overflow-hidden",
            "bg-white/70 dark:bg-[#101114]/70",
            "border-gray-200 dark:border-white/10",
          ].join(" ")}
          style={{
            // subtle fade on edges
            maskImage:
              "linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 7%, black 93%, transparent 100%)",
          }}
        >
          <div className="px-4 sm:px-6 py-5">
            {errorMsg ? (
              <div className="text-sm text-amber-700 dark:text-amber-300">{errorMsg}</div>
            ) : loading && !logos.length ? (
              <div className="text-sm text-gray-600 dark:text-white/60">
                Cargando clientes…
              </div>
            ) : !logos.length ? (
              <div className="text-sm text-gray-600 dark:text-white/60">
                No se encontraron imágenes en: <span className="font-medium">{prefix}</span>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                {/* Track: 2 identical groups for seamless loop */}
                <div
                  className="dpi-marquee-track flex items-center gap-6 w-max"
                  style={{ ["--dpi-speed"]: `${speedSeconds}s` }}
                >
                  <MarqueeGroup
                    logos={logos}
                    buildSrc={buildSrc}
                    accentColor={accentColor}
                  />
                  <MarqueeGroup
                    logos={logos}
                    buildSrc={buildSrc}
                    accentColor={accentColor}
                    ariaHidden
                  />
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

function MarqueeGroup({ logos, buildSrc, accentColor, ariaHidden = false }) {
  return (
    <div className="flex items-center gap-6" aria-hidden={ariaHidden ? "true" : undefined}>
      {logos.map((obj, idx) => (
        <div
          key={`${obj}-${idx}`}
          className="
            flex items-center justify-center
            h-16 sm:h-20
            px-6 sm:px-8
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
            src={buildSrc(obj)}
            alt={`Logo ${humanizeLogoName(obj)}`}
            className="
              h-8 sm:h-10 w-auto object-contain
              grayscale opacity-80
              hover:grayscale-0 hover:opacity-100
              transition-all duration-300
            "
          />
        </div>
      ))}
    </div>
  );
}
