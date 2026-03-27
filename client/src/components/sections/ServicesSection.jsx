import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { getImagesApiBase } from "../../lib/imageApi";
import { normalizeProjects, toSlug } from "../../lib/projects";

const SERVICE_DEFINITIONS = [
  {
    id: "planeacion-urbana",
    title: "Planeación urbana",
    overview:
      "Planes maestros y estrategias para estructurar crecimiento, conectividad y valor urbano sostenible.",
    keywords: ["planeacion urbana", "gestion urbana", "urbanizacion"],
  },
  {
    id: "estudios-viabilidad",
    title: "Estudios de viabilidad",
    overview:
      "Evaluación de potencial normativo, comercial y financiero para decisiones de inversión con menor riesgo.",
    keywords: ["viabilidad", "desarrollo inmobiliario"],
  },
  {
    id: "estudios-movilidad",
    title: "Estudios de movilidad",
    overview:
      "Diagnóstico de tránsito, accesibilidad y desempeño vial para proyectos urbanos de alto impacto.",
    keywords: ["movilidad", "integracion urbana"],
  },
  {
    id: "uso-suelo-normatividad",
    title: "Uso de suelo y normatividad",
    overview:
      "Lectura regulatoria integral para alinear uso permitido, densidades y estrategia de permisos.",
    keywords: ["uso de suelo", "normatividad", "gestion urbana"],
  },
  {
    id: "desarrollo-llave-mano",
    title: "Desarrollo inmobiliario y proyectos llave en mano",
    overview:
      "Coordinación de planeación, gestión y ejecución para proyectos completos con control técnico y operativo.",
    keywords: ["desarrollo inmobiliario", "llave en mano", "viabilidad"],
  },
  {
    id: "integracion-urbana",
    title: "Proyecto de integración urbana",
    overview:
      "Intervenciones que vinculan nuevos desarrollos con tejido existente, equipamientos y contexto local.",
    keywords: ["integracion urbana", "planeacion urbana", "movilidad"],
  },
  {
    id: "urbanizacion-definitivo",
    title: "Proyecto definitivo de urbanización",
    overview:
      "Desarrollo técnico integral para infraestructura, imagen urbana y funcionalidad operativa del proyecto.",
    keywords: ["urbanizacion", "uso de suelo"],
  },
  {
    id: "gestion-urbana",
    title: "Gestión urbana",
    overview:
      "Acompañamiento institucional para autorizaciones y trámites ante instancias federales, estatales y municipales.",
    keywords: ["gestion urbana", "uso de suelo"],
  },
  {
    id: "riesgo",
    title: "Riesgo",
    overview:
      "Estudios técnicos para prevención de riesgo y definición de medidas de mitigación en desarrollo urbano.",
    keywords: ["riesgo", "viabilidad", "ambiental"],
  },
  {
    id: "ambiental",
    title: "Ambiental",
    overview:
      "Análisis ambiental y rutas de cumplimiento para garantizar viabilidad y continuidad regulatoria del proyecto.",
    keywords: ["ambiental", "viabilidad"],
  },
];

function normalizeTag(tag = "") {
  return String(tag)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function inferService(project, services) {
  if (project.serviceHints.length) {
    const byHint = services.find((s) => project.serviceHints.includes(s.id));
    if (byHint) return byHint.id;
  }

  const searchPool = [project.category, project.status, ...project.tags]
    .map(normalizeTag)
    .join(" ");

  const matched = services.find((srv) =>
    srv.keywords.some((keyword) => searchPool.includes(normalizeTag(keyword)))
  );

  return matched?.id || services[0]?.id;
}

export default function ServicesSection({ accentColor = "#7E1F2A" }) {
  const [activeServiceId, setActiveServiceId] = useState(SERVICE_DEFINITIONS[0].id);
  const [activeTag, setActiveTag] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeStatus, setActiveStatus] = useState("Todos");

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [projectsByService, setProjectsByService] = useState({});

  const IMG_API = getImagesApiBase();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      if (!IMG_API) {
        setStatus("error");
        setErrorMsg("Falta VITE_IMAGES_API_BASE para cargar proyectos desde el backend.");
        return;
      }

      setStatus("loading");

      try {
        const res = await fetch(`${IMG_API}/api/home-slides`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const raw = await res.json();
        if (!Array.isArray(raw)) throw new Error("Se esperaba un arreglo de proyectos.");

        const normalized = normalizeProjects(raw).map((project) => ({
          ...project,
          serviceId: inferService(project, SERVICE_DEFINITIONS),
          tags: project.tags.length
            ? project.tags
            : [toSlug(project.category).replaceAll("-", " ")],
        }));

        const grouped = SERVICE_DEFINITIONS.reduce((acc, service) => {
          acc[service.id] = normalized.filter((project) => project.serviceId === service.id);
          return acc;
        }, {});

        setProjectsByService(grouped);
        setStatus("ready");
      } catch (err) {
        if (err?.name === "AbortError") return;
        setStatus("error");
        setErrorMsg(`No se pudo cargar /api/home-slides (${err?.message || "error"}).`);
      }
    };

    load();
    return () => controller.abort();
  }, [IMG_API]);

  const activeService =
    SERVICE_DEFINITIONS.find((service) => service.id === activeServiceId) || SERVICE_DEFINITIONS[0];

  const serviceProjects = useMemo(
    () => projectsByService[activeService.id] || [],
    [projectsByService, activeService.id]
  );

  const availableTags = useMemo(() => {
    const set = new Set();
    serviceProjects.forEach((project) => project.tags.forEach((tag) => set.add(tag)));
    return ["Todos", ...Array.from(set).slice(0, 10)];
  }, [serviceProjects]);

  const availableCategories = useMemo(() => {
    const values = new Set(serviceProjects.map((project) => project.category).filter(Boolean));
    return ["Todos", ...Array.from(values)];
  }, [serviceProjects]);

  const availableStatuses = useMemo(() => {
    const values = new Set(serviceProjects.map((project) => project.status).filter(Boolean));
    return ["Todos", ...Array.from(values)];
  }, [serviceProjects]);

  useEffect(() => {
    setActiveTag("Todos");
    setActiveCategory("Todos");
    setActiveStatus("Todos");
  }, [activeService.id]);

  const filteredProjects = useMemo(() => {
    return serviceProjects.filter((project) => {
      const matchesTag = activeTag === "Todos" || project.tags.includes(activeTag);
      const matchesCategory = activeCategory === "Todos" || project.category === activeCategory;
      const matchesStatus = activeStatus === "Todos" || project.status === activeStatus;
      return matchesTag && matchesCategory && matchesStatus;
    });
  }, [serviceProjects, activeTag, activeCategory, activeStatus]);

  const featuredProject = filteredProjects[0] || serviceProjects[0] || null;
  const supportProjects = filteredProjects.slice(featuredProject ? 1 : 0, 7);

  return (
    <section id="services" className="py-16 md:py-24 bg-[#090A0D] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-white/55">Servicios + Proyectos</p>
          <h2 className="text-3xl md:text-5xl font-semibold mt-3">Portafolio por especialidad</h2>
          <div className="w-24 h-1 mx-auto mt-4 rounded" style={{ backgroundColor: accentColor }} />
          <p className="text-white/70 mt-5 max-w-3xl mx-auto">
            Explora cada servicio con casos relacionados, imágenes servidas por el pipeline de Google Cloud y filtros editoriales.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {SERVICE_DEFINITIONS.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setActiveServiceId(service.id)}
              className={[
                "whitespace-nowrap px-4 py-2.5 rounded-full border text-sm transition",
                activeService.id === service.id
                  ? "border-transparent text-white"
                  : "border-white/15 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.08]",
              ].join(" ")}
              style={activeService.id === service.id ? { backgroundColor: accentColor } : undefined}
            >
              {service.title}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#101218] p-5 md:p-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold">{activeService.title}</h3>
              <p className="text-white/70 mt-2 max-w-3xl">{activeService.overview}</p>
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/55">
              <Filter size={14} />
              <span>{filteredProjects.length} proyectos visibles</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 mb-6">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-[#0A0C11] border border-white/15 rounded-xl px-3 py-2.5 text-sm"
            >
              {availableCategories.map((item) => (
                <option key={item} value={item}>
                  Categoría: {item}
                </option>
              ))}
            </select>

            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="bg-[#0A0C11] border border-white/15 rounded-xl px-3 py-2.5 text-sm"
            >
              {availableStatuses.map((item) => (
                <option key={item} value={item}>
                  Estatus: {item}
                </option>
              ))}
            </select>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={[
                    "px-3 py-2 rounded-full border text-xs whitespace-nowrap transition",
                    tag === activeTag
                      ? "text-white border-transparent"
                      : "text-white/70 border-white/15 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                  style={tag === activeTag ? { backgroundColor: accentColor } : undefined}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {status === "loading" && (
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 animate-pulse">
              <div className="h-[320px] rounded-2xl bg-white/10" />
              <div className="grid gap-4">
                <div className="h-[152px] rounded-2xl bg-white/10" />
                <div className="h-[152px] rounded-2xl bg-white/10" />
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-[#7E1F2A]/40 bg-[#7E1F2A]/10 p-5 text-white/90">
              {errorMsg}
            </div>
          )}

          {status === "ready" && (
            <>
              {featuredProject ? (
                <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5">
                  <article className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0C10]">
                    <div className="aspect-[16/9] relative">
                      <ImageWithFallback
                        src={featuredProject.imageUrl}
                        alt={featuredProject.title}
                        fallbackLabel="Imagen principal no disponible"
                        className="absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Proyecto destacado</p>
                        <h4 className="text-2xl md:text-3xl font-semibold mt-2">{featuredProject.title}</h4>
                        <p className="mt-2 text-white/80 max-w-2xl">{featuredProject.descriptor || activeService.overview}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
                          {featuredProject.category && (
                            <span className="px-2.5 py-1 rounded-full border border-white/20 bg-black/20">
                              {featuredProject.category}
                            </span>
                          )}
                          {featuredProject.status && (
                            <span className="px-2.5 py-1 rounded-full border border-white/20 bg-black/20">
                              {featuredProject.status}
                            </span>
                          )}
                          {featuredProject.location && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-white/20 bg-black/20">
                              <MapPin size={12} className="mr-1" />
                              {featuredProject.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {supportProjects.map((project) => (
                      <article
                        key={project.id}
                        className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0C10] hover:border-white/25 transition"
                      >
                        <div className="aspect-[4/3]">
                          <ImageWithFallback
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-full"
                            fallbackLabel="Imagen de proyecto no disponible"
                          />
                        </div>
                        <div className="p-4">
                          <h5 className="font-medium text-white">{project.title}</h5>
                          <p className="mt-1 text-sm text-white/65">{project.descriptor || project.category}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                            {project.category && (
                              <span className="px-2 py-1 rounded-full border border-white/15">{project.category}</span>
                            )}
                            {project.status && (
                              <span className="px-2 py-1 rounded-full border border-white/15">{project.status}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0A0C11] p-8 text-center text-white/70">
                  No hay proyectos para los filtros seleccionados.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
