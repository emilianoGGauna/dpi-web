import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Headset, Briefcase } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";

/* -------------------- helpers -------------------- */
function hexToRgb(hex) {
  const h = (hex || "").replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const bigint = parseInt(h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(Boolean(mq.matches));
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return reduced;
}

function shuffleCopy(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomUnique(arr, n) {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= n) return [...arr];
  return shuffleCopy(arr).slice(0, n);
}

/* -------------------- component -------------------- */
export default function HomeSection({
  headline = "Transformamos ideas en proyectos rentables mediante planeación urbana",
  subtitle = "Acompañamos a inmobiliarias, constructoras y propietarios desde la planeación y el diseño hasta la gestión urbana del proyecto.",
  ctaText = "Contáctanos",
  accentColor = "#C0392B",
}) {
  const IMG_API = (import.meta.env.VITE_IMAGES_API_BASE || "").replace(/\/$/, "");
  // ✅ NUEVO endpoint
  const SLIDES_URL = `${IMG_API}/api/home-slides`;

  const buildImageUrlFromObject = (objectName) =>
    `${IMG_API}/api/images?object=${encodeURIComponent(objectName)}&w=2200&q=85&format=jpeg`;

  const reducedMotion = usePrefersReducedMotion();

  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [paused, setPaused] = useState(false);

  const intervalRef = useRef(null);

  const accentRgba85 = useMemo(() => {
    const rgb = hexToRgb(accentColor);
    if (!rgb) return accentColor;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
  }, [accentColor]);

  // ✅ Load projects list (20) and pick 5 random
  useEffect(() => {
    const controller = new AbortController();

    const loadProjects = async () => {
      if (!IMG_API) {
        setStatus("error");
        setErrorMsg("Falta VITE_IMAGES_API_BASE para consumir el endpoint.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch(SLIDES_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if (j?.error) msg = `${msg} — ${j.error}`;
          } catch {}
          throw new Error(msg);
        }

        const all = await res.json();
        if (!Array.isArray(all)) {
          throw new Error("project-list.json debe ser un arreglo JSON (array).");
        }

        // ✅ toma 5 aleatorios (cada refresh)
        const selected = pickRandomUnique(all.filter(Boolean), 5);

        const mapped = selected
          .map((p, idx) => {
            const imgObject = p.imgObject || p.img;
            if (!imgObject) return null;

            const img = /^https?:\/\//i.test(imgObject)
              ? imgObject
              : buildImageUrlFromObject(imgObject);

            const meta = [p.type, p.location].filter(Boolean).join(" · ");

            return {
              id: p.id ?? idx + 1,
              title: p.title ?? `Proyecto ${idx + 1}`,
              meta,
              fx: p.fx ?? "",
              img,
              // extra opcional (si lo quieres usar después)
              role: p.role ?? "",
              type: p.type ?? "",
              location: p.location ?? "",
            };
          })
          .filter(Boolean);

        if (!mapped.length) {
          throw new Error("No hay proyectos válidos (falta imgObject/img).");
        }

        setSlides(mapped);
        setActive(0);
        setStatus("ready");
      } catch (err) {
        setSlides([]);
        setStatus("error");
        setErrorMsg(
          `No se pudo cargar project-list.json desde GCS. (${err?.message || "error"})`
        );
      }
    };

    loadProjects();
    return () => controller.abort();
  }, [IMG_API, SLIDES_URL]);

  // ✅ Keep index valid if slides changes
  useEffect(() => {
    if (!slides.length) return;
    setActive((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  // ✅ Preload next image
  useEffect(() => {
    if (status !== "ready" || !slides.length) return;
    const nextIdx = (active + 1) % slides.length;
    const src = slides[nextIdx]?.img;
    if (!src) return;
    const img = new Image();
    img.src = src;
  }, [active, slides, status]);

  // ✅ Autoplay
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (reducedMotion) return;
    if (status !== "ready" || slides.length < 2) return;
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 6500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [status, slides.length, paused, reducedMotion]);

  const activeSlide = slides[active];

  const goToActiveProject = () => {
    if (!activeSlide) return;

    const card = document.getElementById(`project-${activeSlide.id}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const section = document.getElementById("projects");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = "#projects";
  };

  const onDotClick = (i) => {
    setActive(i);
    setPaused(true);
    window.setTimeout(() => setPaused(false), 7000);
  };

  return (
    <section
      id="home"
      className="
        relative overflow-hidden transition-colors duration-300
        bg-white dark:bg-[#121212]
        flex items-start
        scroll-mt-[96px] md:scroll-mt-[112px]
        pt-20 md:pt-24
        pb-12 md:pb-14
        min-h-[calc(100svh-5rem)] md:min-h-[calc(100svh-6rem)]
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {status === "ready" ? (
          slides.map((s, idx) => {
            const isActive = idx === active;
            return (
              <div
                key={s.id}
                className={[
                  "absolute inset-0 transition-opacity duration-1000",
                  isActive ? "opacity-100" : "opacity-0",
                ].join(" ")}
                aria-hidden={!isActive}
              >
                <ImageWithFallback
                  src={s.img}
                  alt={s.title}
                  className={[
                    "w-full h-full object-cover",
                    reducedMotion ? "" : "transition-transform duration-[6500ms] ease-out",
                    isActive && !reducedMotion ? "scale-[1.08]" : "scale-100",
                    s.fx,
                  ].join(" ")}
                />
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}

        <div className="absolute inset-0 bg-black/65 dark:bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />

        {status === "ready" && (
          <button
            type="button"
            onClick={goToActiveProject}
            className="
              absolute z-20
              right-4 sm:right-6
              bottom-10 sm:bottom-12
              inline-flex items-center gap-2
              rounded-full px-3 py-2
              text-xs sm:text-sm font-semibold
              backdrop-blur-md shadow-lg
              transition hover:scale-[1.02] active:scale-[0.98]
              bg-white/90 text-gray-900 border border-gray-200/80 hover:bg-white
              dark:bg-black/45 dark:text-white dark:border-white/20 dark:hover:bg-black/60
            "
            aria-label={`Ver proyecto: ${activeSlide?.title}`}
            title="Ver proyecto"
          >
            Ver proyecto
            <ArrowUpRight size={16} className="opacity-90" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl p-6 sm:p-8 md:p-10">
            {status !== "ready" && (
              <div className="mb-6 text-sm sm:text-base text-white/80">
                {status === "loading" ? "Cargando proyectos..." : null}
                {status === "error" ? (
                  <>
                    <div className="font-semibold">Error cargando proyectos</div>
                    <div className="mt-1 text-white/70">{errorMsg}</div>
                  </>
                ) : null}
              </div>
            )}

            {status === "ready" && (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="h-1 w-14 rounded-full" style={{ backgroundColor: accentColor }} />

                <button
                  type="button"
                  onClick={goToActiveProject}
                  className="
                    inline-flex items-center gap-2
                    rounded-full px-3 py-1.5
                    bg-white/5 hover:bg-white/10
                    border border-white/10
                    text-xs sm:text-sm
                    text-white/80 hover:text-white
                    transition
                  "
                >
                  <span className="text-white/70">Proyecto destacado:</span>
                  <span className="text-white font-semibold">{activeSlide?.title}</span>
                  <ArrowUpRight size={14} className="opacity-80" />
                </button>

                <span className="text-xs sm:text-sm text-white/60">{activeSlide?.meta}</span>
              </div>
            )}

            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {headline}
            </h1>

            <p className="mt-4 text-base sm:text-lg md:text-xl text-white/85 leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-6 space-y-3 text-sm sm:text-base text-white/80 leading-relaxed">
              <p className="font-semibold text-white/90">
                EMPRESAS INMOBILIARIAS, CONSTRUCTORAS Y PROPIETARIOS DE TERRENOS
              </p>
              <p>
                Integramos estudios, proyecto, planeación y gestión urbana para llevar tu desarrollo de inicio a fin.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:gap-4">
              <a
                href="#services"
                className="
                  group inline-flex items-center justify-center gap-2
                  px-7 py-4 text-base sm:text-lg font-semibold rounded-xl
                  border border-white/50 text-white
                  bg-white/12 hover:bg-white/18
                  backdrop-blur-md shadow-lg
                  transition-all
                "
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 group-hover:bg-white/20 transition">
                  <Briefcase size={18} className="opacity-95" />
                </span>
                Conoce nuestros servicios
                <ArrowUpRight size={18} className="opacity-90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </a>

              <a
                href="#contact"
                className="
                  inline-flex items-center justify-center gap-2
                  px-7 py-4 text-base sm:text-lg font-semibold
                  rounded-xl text-white shadow-lg
                  transition-all hover:brightness-110
                "
                style={{ backgroundColor: accentRgba85 }}
              >
                <Headset size={18} className="opacity-95" />
                {ctaText}
              </a>
            </div>

            {status === "ready" && (
              <div className="mt-6 flex items-center gap-2 overflow-x-auto py-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onDotClick(i)}
                    aria-label={`Ver proyecto ${i + 1}`}
                    className={[
                      "h-2.5 rounded-full transition-all flex-none",
                      i === active ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-2 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
    </section>
  );
}
