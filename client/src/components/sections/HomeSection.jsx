import { useEffect, useMemo, useRef, useState } from "react";
import { Headset, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { fetchProjects } from "../../lib/projects";

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

const HOME_ORDER_KEY = "dpi-home-project-order:v3";
const HOME_MAX_PROJECTS = 5;

function shuffleCopy(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function preloadImage(src, timeoutMs = 2500) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);

    const img = new Image();
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    img.onload = () => {
      window.clearTimeout(timer);
      finish(true);
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      finish(false);
    };

    img.decoding = "async";
    img.fetchPriority = "high";
    img.src = src;
  });
}


/* Swipe (sin preventDefault / sin warning passive) */
function useSwipe({ onLeft, onRight, disabled }) {
  const ref = useRef({ down: false, x0: 0, y0: 0, dx: 0, dy: 0, t0: 0 });

  const onPointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    ref.current = {
      down: true,
      x0: e.clientX,
      y0: e.clientY,
      dx: 0,
      dy: 0,
      t0: performance.now(),
    };
  };

  const onPointerMove = (e) => {
    if (disabled) return;
    if (!ref.current.down) return;
    ref.current.dx = e.clientX - ref.current.x0;
    ref.current.dy = e.clientY - ref.current.y0;
  };

  const onPointerUp = () => {
    if (disabled) return;
    const s = ref.current;
    ref.current.down = false;

    const absX = Math.abs(s.dx);
    const absY = Math.abs(s.dy);
    const dt = Math.max(1, performance.now() - s.t0);

    const fastEnough = dt < 600;
    const farEnough = absX > 55;
    const mostlyHorizontal = absX > absY * 1.2;

    if (mostlyHorizontal && (farEnough || (fastEnough && absX > 35))) {
      if (s.dx < 0) onLeft?.();
      else onRight?.();
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}

/* -------------------- component -------------------- */
export default function HomeSection({
  headline = "Transformamos ideas en proyectos rentables mediante planeación urbana",
  subtitle = "Acompañamos a inmobiliarias, constructoras y propietarios desde la planeación y el diseño hasta la gestión urbana del proyecto.",
  ctaText = "Contáctanos",
  accentColor = "#C0392B",
  maxProjects = 5,
  autoplayMs = 5000,
}) {
  const IMG_API = (import.meta.env.VITE_IMAGES_API_BASE || "").replace(/\/$/, "");

  const reducedMotion = usePrefersReducedMotion();

  const [projects, setProjects] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [isActiveImageLoaded, setIsActiveImageLoaded] = useState(false);
  const loadedImageUrlsRef = useRef(new Set());

  // 🔧 Pausa SOLO por interacción real (NO por hover en todo el section)
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef(null);

  const intervalRef = useRef(null);

  const accentRgba85 = useMemo(() => {
    const rgb = hexToRgb(accentColor);
    if (!rgb) return accentColor;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
  }, [accentColor]);

  const pauseFor = (ms = 1500) => {
    setPaused(true);
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), ms);
  };

  const getProjectHeroUrl = (project) =>
    project?.images?.[0]?.heroUrl || project?.coverImageUrl || project?.images?.[0]?.url || "";

  const getProjectThumbUrl = (project) =>
    project?.images?.[0]?.thumbnailUrl || project?.coverImageUrl || project?.images?.[0]?.url || "";

  /* -------------------- Load JSON -------------------- */
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      if (!IMG_API) {
        setStatus("error");
        setErrorMsg("Falta VITE_IMAGES_API_BASE.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const normalized = await fetchProjects(IMG_API, { signal: controller.signal });
        if (!normalized.length) throw new Error("No hay proyectos válidos (sin images).");

        const max = Math.min(HOME_MAX_PROJECTS, Math.max(1, Number(maxProjects) || HOME_MAX_PROJECTS));
        const allProjects = normalized;

        let selected = [];
        try {
          const rawOrder = window.sessionStorage.getItem(HOME_ORDER_KEY);
          if (rawOrder) {
            const orderIds = JSON.parse(rawOrder);
            if (Array.isArray(orderIds) && orderIds.length) {
              const byId = new Map(allProjects.map((project) => [project.id, project]));
              const ordered = orderIds.map((id) => byId.get(id)).filter(Boolean);
              const missing = allProjects.filter((project) => !orderIds.includes(project.id));
              selected = [...ordered, ...missing].slice(0, max);
            }
          }
          if (!selected.length) {
            selected = shuffleCopy(allProjects).slice(0, max);
            window.sessionStorage.setItem(HOME_ORDER_KEY, JSON.stringify(selected.map((p) => p.id)));
          }
        } catch {
          selected = shuffleCopy(allProjects).slice(0, max);
        }

        const firstProject = selected[0];
        const firstHeroUrl = getProjectHeroUrl(firstProject);
        const firstLoaded = await preloadImage(firstHeroUrl, 2500);
        if (firstLoaded && firstHeroUrl) {
          loadedImageUrlsRef.current.add(firstHeroUrl);
        }

        setProjects(selected);
        setActiveIdx(0);
        setIsActiveImageLoaded(firstLoaded || !firstHeroUrl);
        setStatus("ready");
      } catch (err) {
        if (err?.name === "AbortError") return;
        setProjects([]);
        setStatus("error");
        setErrorMsg(`No se pudo cargar proyectos. (${err?.message || "error"})`);
      }
    };

    load();
    return () => controller.abort();
  }, [IMG_API, maxProjects]);

  const activeProject = projects[activeIdx] || null;
  const activeUrl = getProjectHeroUrl(activeProject);

  useEffect(() => {
    setIsActiveImageLoaded(loadedImageUrlsRef.current.has(activeUrl));
  }, [activeUrl]);

  const next = () => {
    if (!projects.length) return;
    setActiveIdx((i) => (i + 1) % projects.length);
  };

  const prev = () => {
    if (!projects.length) return;
    setActiveIdx((i) => (i - 1 + projects.length) % projects.length);
  };

  const onDotClick = (i) => {
    setActiveIdx(i);
    pauseFor(Math.max(1500, autoplayMs + 600));
  };

  /* -------------------- Autoplay (SIEMPRE) -------------------- */
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (reducedMotion) return;
    if (status !== "ready" || projects.length < 2) return;
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % projects.length);
    }, autoplayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [status, projects.length, paused, reducedMotion, autoplayMs]);

  /* -------------------- Preload key images -------------------- */
  useEffect(() => {
    if (status !== "ready" || !projects.length) return;

    for (let offset = 1; offset <= 2 && offset < projects.length; offset += 1) {
      const url = getProjectHeroUrl(projects[(activeIdx + offset) % projects.length]);
      preloadImage(url, 2000).then((ok) => {
        if (ok && url) loadedImageUrlsRef.current.add(url);
      });
    }

    projects.slice(0, 4).forEach((project) => {
      const url = getProjectThumbUrl(project);
      preloadImage(url, 2000).then((ok) => {
        if (ok && url) loadedImageUrlsRef.current.add(url);
      });
    });
  }, [activeIdx, projects, status]);

  /* -------------------- Fade between images -------------------- */
  const [currUrl, setCurrUrl] = useState("");
  const [prevUrl, setPrevUrl] = useState("");
  const [entered, setEntered] = useState(true);
  const currUrlRef = useRef("");

  useEffect(() => {
    if (!activeUrl) return;
    if (currUrlRef.current === activeUrl) return;

    const old = currUrlRef.current;
    setPrevUrl(old);
    setCurrUrl(activeUrl);
    currUrlRef.current = activeUrl;

    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    const t = window.setTimeout(() => setPrevUrl(""), 900);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [activeUrl]);

  /* -------------------- Swipe (featured) -------------------- */
  const swipe = useSwipe({
    onLeft: () => {
      pauseFor(1200);
      next();
    },
    onRight: () => {
      pauseFor(1200);
      prev();
    },
    disabled: status !== "ready" || projects.length < 2,
  });

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      pauseFor(1200);
      prev();
    }
    if (e.key === "ArrowRight") {
      pauseFor(1200);
      next();
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <section
      id="home"
      className="
        relative overflow-hidden transition-colors duration-300
        bg-white dark:bg-[#121212]
        pt-20 md:pt-24 pb-12 md:pb-14
        min-h-[calc(100svh-5rem)] md:min-h-[calc(100svh-6rem)]
        scroll-mt-[96px] md:scroll-mt-[112px]
      "
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {status === "ready" && (currUrl || prevUrl) ? (
          <div className="absolute inset-0">
            {prevUrl ? <ImageWithFallback src={prevUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-100" /> : null}
            {currUrl ? (
              <ImageWithFallback
                src={currUrl}
                alt={activeProject?.title || "Proyecto"}
                className={[
                  "absolute inset-0 w-full h-full object-cover",
                  reducedMotion ? "opacity-100" : entered ? "opacity-100" : "opacity-0",
                  reducedMotion ? "" : "transition-opacity duration-700",
                ].join(" ")}
              />
            ) : null}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/65 dark:bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
      </div>

      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Featured */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div
              className="
                rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden
                select-none
              "
              tabIndex={0}
              onKeyDown={onKeyDown}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
              onPointerDown={(e) => {
                pauseFor(1500);
                swipe.onPointerDown(e);
              }}
              onPointerMove={swipe.onPointerMove}
              onPointerUp={swipe.onPointerUp}
              onPointerCancel={swipe.onPointerUp}
              style={{ touchAction: "pan-y" }}
              aria-label="Carrusel de proyectos (desliza izquierda o derecha)"
            >
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-black/25">
                {status === "ready" && activeUrl ? (
                  <>
                    {!isActiveImageLoaded && <div className="absolute inset-0 animate-pulse bg-black/40" />}
                    <ImageWithFallback
                      key={activeUrl}
                      src={activeUrl}
                      alt={activeProject?.title || "Proyecto"}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onLoad={() => {
                        loadedImageUrlsRef.current.add(activeUrl);
                        setIsActiveImageLoaded(true);
                      }}
                      onError={() => setIsActiveImageLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/40" />
                )}

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {status === "ready" && activeProject?.title && (
                  <div className="absolute left-4 bottom-4 right-4">
                    <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-black/35 border border-white/10 backdrop-blur-md">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span className="text-white font-semibold text-sm sm:text-base">{activeProject.title}</span>
                    </div>
                  </div>
                )}

                {/* Arrows */}
                {status === "ready" && projects.length > 1 && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        pauseFor(1500);
                        prev();
                      }}
                      className="
                        inline-flex items-center justify-center
                        w-10 h-10 rounded-full
                        bg-black/35 border border-white/15
                        text-white/90 hover:bg-black/50 transition
                        backdrop-blur-md
                      "
                      aria-label="Anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        pauseFor(1500);
                        next();
                      }}
                      className="
                        inline-flex items-center justify-center
                        w-10 h-10 rounded-full
                        bg-black/35 border border-white/15
                        text-white/90 hover:bg-black/50 transition
                        backdrop-blur-md
                      "
                      aria-label="Siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Dots */}
              {status === "ready" && projects.length > 1 && (
                <div className="px-4 sm:px-5 pb-4 pt-3 flex items-center justify-center gap-2">
                  {projects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onDotClick(i)}
                      aria-label={`Ver proyecto ${i + 1}`}
                      className={[
                        "h-2.5 rounded-full transition-all",
                        i === activeIdx ? "w-9 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}
            </div>
            {status === "ready" && projects.length > 0 && (
              <div className="mt-5 hidden lg:block">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white/85 font-semibold">Proyectos</div>
                  <div className="text-white/60 text-xs sm:text-sm">Click para cambiar</div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {projects.slice(0, 4).map((p, i) => {
                    const thumbUrl = getProjectThumbUrl(p);
                    const isActive = i === activeIdx;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setActiveIdx(i);
                          pauseFor(Math.max(1500, autoplayMs + 600));
                        }}
                        aria-pressed={isActive}
                        className={[
                          "rounded-2xl overflow-hidden border transition shadow-lg",
                          isActive ? "border-white/30 ring-2 ring-white/20" : "border-white/10 hover:border-white/20",
                          "bg-white/5 backdrop-blur-md",
                        ].join(" ")}
                      >
                        <div className="relative w-full aspect-[4/3]">
                          <ImageWithFallback
                            src={thumbUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="text-left text-white font-semibold text-sm leading-snug">
                              {p.title}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Text */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl p-6 sm:p-8">
              {status !== "ready" && (
                <div className="text-sm sm:text-base text-white/80">
                  {status === "loading" ? "Cargando proyectos..." : null}
                  {status === "error" && (
                    <>
                      <div className="font-semibold">Error</div>
                      <div className="mt-1 text-white/70">{errorMsg}</div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <span className="h-1 w-14 rounded-full" style={{ backgroundColor: accentColor }} />
                {status === "ready" && activeProject?.title && (
                  <span className="text-xs sm:text-sm text-white/80">
                    Proyecto destacado:{" "}
                    <span className="text-white font-semibold">{activeProject.title}</span>
                  </span>
                )}
              </div>

              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                {headline}
              </h1>

              <p className="mt-4 text-base sm:text-lg md:text-xl text-white/85 leading-relaxed">
                {subtitle}
              </p>

              <div className="mt-5 space-y-3 text-sm sm:text-base text-white/80 leading-relaxed">
                <p className="font-semibold text-white/90">
                  EMPRESAS INMOBILIARIAS, CONSTRUCTORAS Y PROPIETARIOS DE TERRENOS
                </p>
                <p>
                  Integramos estudios, proyecto, planeación y gestión urbana para llevar tu desarrollo de inicio a fin.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:gap-4">
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
                  Servicios
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
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 pointer-events-none" style={{ backgroundColor: accentColor }} />
    </section>
  );
}
