import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ChevronDown, Filter, X } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { getImagesApiBase } from "../../lib/imageApi";
import { normalizeProjects } from "../../lib/projects";

/* ---------------- helpers ---------------- */

function normalizeType(type = "") {
  // para agrupar por "Uso mixto / Oficinas" => "Uso mixto"
  return String(type).split("/")[0].trim();
}

export default function ProjectsSection({ accentColor = "#C0392B" }) {
  const IMG_API = getImagesApiBase();
  const PROJECTS_URL = `${IMG_API}/api/home-slides`;

  const [allProjects, setAllProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  // ✅ Load from JSON (GCS via backend)
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!IMG_API) {
        setStatus("error");
        setErrorMsg("Falta VITE_IMAGES_API_BASE para consumir el endpoint.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch(PROJECTS_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const j = await res.json();
            if (j?.error) msg = `${msg} — ${j.error}`;
          } catch (parseErr) {
            void parseErr;
          }
          throw new Error(msg);
        }

        const raw = await res.json();
        if (!Array.isArray(raw)) {
          throw new Error("home-slides.json (o project-list.json) debe ser un arreglo JSON (array).");
        }

        const mapped = normalizeProjects(raw).map((p) => ({
          id: p.id,
          title: p.title,
          type: p.category,
          location: p.location,
          role: p.descriptor,
          img: p.imageUrl,
          status: p.status,
        }));

        if (!mapped.length) {
          throw new Error("El JSON se cargó, pero no hay proyectos válidos.");
        }

        setAllProjects(mapped);
        setStatus("ready");
      } catch (e) {
        setAllProjects([]);
        setStatus("error");
        setErrorMsg(`No se pudo cargar proyectos desde /api/home-slides. (${e?.message || "error"})`);
      }
    }

    load();
    return () => controller.abort();
  }, [IMG_API, PROJECTS_URL]);

  // ✅ derived filters
  const projectTypes = useMemo(() => {
    return [...new Set(allProjects.map((p) => normalizeType(p.type)).filter(Boolean))].sort();
  }, [allProjects]);

  const projectLocations = useMemo(() => {
    return [...new Set(allProjects.map((p) => p.location).filter(Boolean))].sort();
  }, [allProjects]);

  // ✅ filtered projects
  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return allProjects.filter((p) => {
      const matchesSearch =
        !q ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.type || "").toLowerCase().includes(q) ||
        (p.role || "").toLowerCase().includes(q) ||
        (p.status || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q);

      const matchesType = !typeFilter || normalizeType(p.type) === typeFilter;
      const matchesLocation = !locationFilter || p.location === locationFilter;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [allProjects, searchTerm, typeFilter, locationFilter]);

  // ✅ reset "load more" when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm, typeFilter, locationFilter]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, filteredProjects.length));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setLocationFilter("");
  };

  const hasActiveFilters = Boolean(searchTerm || typeFilter || locationFilter);

  return (
    <section
      id="projects"
      className="
        py-16 md:py-24
        bg-[#F4F5F7] dark:bg-[#0B0C10]
        transition-colors duration-300
        scroll-mt-[96px] md:scroll-mt-[112px]
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Proyectos
          </h2>
          <div className="w-20 h-1.5 mx-auto mt-5 rounded" style={{ backgroundColor: accentColor }} />
          <p className="mt-4 text-gray-600 dark:text-white/65 max-w-3xl mx-auto">
            Explora proyectos por tipo, ubicación o palabra clave.
          </p>
        </div>

        {/* FILTER BOX */}
        <div
          className="
            bg-white/90 dark:bg-[#101114]/85
            rounded-2xl shadow-sm p-4 sm:p-5 mb-8
            border border-gray-200 dark:border-white/10
            backdrop-blur
            transition-colors duration-300
          "
        >
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* SEARCH */}
            <div className="flex-grow lg:max-w-md relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/35"
              />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5 rounded-xl
                  border border-gray-200 dark:border-white/10
                  bg-white dark:bg-white/5
                  text-gray-900 dark:text-white
                  placeholder:text-gray-400 dark:placeholder:text-white/35
                  focus:outline-none focus:ring-2
                  transition
                "
                style={{ outlineColor: accentColor }}
              />
            </div>

            {/* TYPE FILTER */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="
                px-4 py-2.5 rounded-xl
                bg-white dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                transition-colors duration-300
              "
            >
              <option value="">Todos los tipos</option>
              {projectTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* LOCATION FILTER */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="
                px-4 py-2.5 rounded-xl
                bg-white dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                transition-colors duration-300
              "
            >
              <option value="">Todas las ubicaciones</option>
              {projectLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* CLEAR */}
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={[
                "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
                "border transition",
                hasActiveFilters
                  ? "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                  : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              <X size={16} className="opacity-80" />
              Limpiar
            </button>
          </div>

          {/* SUMMARY */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 text-sm">
            <div className="text-gray-600 dark:text-white/60 flex items-center">
              <Filter size={16} className="mr-2 opacity-80" />
              {status === "ready" ? (
                <>
                  Mostrando <span className="mx-1 font-semibold text-gray-900 dark:text-white">{visibleProjects.length}</span>
                  de <span className="ml-1 font-semibold text-gray-900 dark:text-white">{filteredProjects.length}</span> proyectos
                </>
              ) : (
                "Cargando…"
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {typeFilter && (
                  <span className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 bg-white dark:bg-white/5">
                    Tipo: {typeFilter}
                  </span>
                )}
                {locationFilter && (
                  <span className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 bg-white dark:bg-white/5">
                    Ubicación: {locationFilter}
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs px-2 py-1 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 bg-white dark:bg-white/5">
                    Buscar: “{searchTerm}”
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STATES */}
        {status === "error" && (
          <div className="rounded-2xl border border-red-200/60 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5 text-red-800 dark:text-red-200">
            <div className="font-semibold">Error cargando proyectos</div>
            <div className="mt-1 text-sm opacity-90">{errorMsg}</div>
          </div>
        )}

        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101114] animate-pulse"
              >
                <div className="h-52 bg-gray-200 dark:bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-2/3 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GRID */}
        {status === "ready" && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-white/60 py-10">
                No hay proyectos que coincidan con tus filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleProjects.map((p) => (
                  <article
                    key={p.id}
                    id={`project-${p.id}`} // ✅ IMPORTANTE para HomeSection scroll
                    className="
                      group rounded-2xl overflow-hidden
                      border border-gray-200 dark:border-white/10
                      bg-white dark:bg-[#101114]
                      shadow-sm hover:shadow-lg
                      transition-all duration-300
                      hover:-translate-y-0.5
                    "
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <ImageWithFallback
                        src={p.img}
                        alt={p.title}
                        className={[
                          "w-full h-full object-cover",
                          "transition-transform duration-500 ease-out",
                          "group-hover:scale-[1.04]",
                          p.fx || "",
                        ].join(" ")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div
                          className="h-1 w-14 rounded-full mb-3"
                          style={{ backgroundColor: accentColor }}
                        />
                        <h3 className="text-white text-lg font-semibold leading-snug">
                          {p.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {p.type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-white/5 dark:text-white/70 dark:border-white/10">
                            {p.type}
                          </span>
                        )}
                        {p.role && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-white/5 dark:text-white/70 dark:border-white/10">
                            {p.role}
                          </span>
                        )}
                      </div>

                      {p.location && (
                        <div className="text-sm text-gray-600 dark:text-white/60 flex items-center">
                          <MapPin size={14} className="mr-2 opacity-80" />
                          {p.location}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* LOAD MORE */}
            {filteredProjects.length > visibleCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="
                    inline-flex items-center px-6 py-3 rounded-xl border
                    bg-white dark:bg-white/5
                    border-gray-200 dark:border-white/10
                    text-gray-900 dark:text-white
                    hover:bg-gray-50 dark:hover:bg-white/10
                    transition
                  "
                >
                  Cargar más proyectos
                  <ChevronDown size={16} className="ml-2 opacity-80" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
