import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { fetchProjects } from "../../lib/projects";
import { buildServiceCollections, SERVICE_DEFINITIONS } from "../../lib/services";

export default function ServicesSection() {
  const [status, setStatus] = useState("loading");
  const [activeService, setActiveService] = useState(SERVICE_DEFINITIONS[0].id);
  const [projectsByService, setProjectsByService] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setProjectsByService(buildServiceCollections(data));
        setStatus("ready");
      })
      .catch(() => {
        setProjectsByService({});
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const service = SERVICE_DEFINITIONS.find((item) => item.id === activeService) || SERVICE_DEFINITIONS[0];
  const items = useMemo(() => projectsByService[service.id] || [], [projectsByService, service.id]);

  return (
    <section id="services" className="py-16 md:py-24 bg-[#080b11] scroll-mt-[96px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#d4b06a]/90">Servicios</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mt-2">Especialidades DPI</h2>
            <p className="mt-2 text-white/65 max-w-2xl">Cada servicio integra proyectos reales para facilitar navegación y descubrimiento.</p>
          </div>
          <a href="/servicios" className="inline-flex items-center gap-2 rounded-xl border border-[#d4b06a]/40 bg-[#d4b06a]/10 px-4 py-2 text-sm text-[#efdbaf] hover:bg-[#d4b06a]/20">
            Ver todos los servicios <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {SERVICE_DEFINITIONS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setActiveService(entry.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${entry.id === service.id ? "border-[#d4b06a] bg-[#d4b06a]/20 text-[#f1ddb5]" : "border-white/15 bg-white/[0.03] text-white/70 hover:text-white"}`}
            >
              {entry.title}
            </button>
          ))}
        </div>

        <article className="mt-6 rounded-3xl border border-white/10 bg-[#101722] p-5 md:p-7">
          <h3 className="text-2xl font-semibold text-white">{service.title}</h3>
          <p className="mt-2 text-white/70">{service.overview}</p>

          {status === "loading" && <p className="mt-6 text-white/70">Cargando casos vinculados…</p>}
          {status === "error" && <p className="mt-6 text-white/70">No se pudieron cargar proyectos para este servicio.</p>}

          {status === "ready" && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {items.slice(0, 3).map((project) => (
                <a key={project.id} href={`/servicios/${service.id}`} className="group rounded-2xl overflow-hidden border border-white/10 bg-[#0c1119] hover:border-[#d4b06a]/60 transition">
                  <ImageWithFallback src={project.imageUrl} alt={project.title} className="h-48" fallbackLabel="Imagen pendiente" />
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#d4b06a]/90">Caso relacionado</p>
                    <p className="mt-2 text-white font-medium">{project.title}</p>
                  </div>
                </a>
              ))}

              {!items.length && (
                <div className="md:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-white/70">
                  Este servicio aún no tiene casos visuales asignados.
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
