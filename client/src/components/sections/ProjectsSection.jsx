import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { fetchProjects } from "../../lib/projects";

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => {
        setProjects([]);
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["Todos", ...new Set(projects.map((item) => item.category).filter(Boolean))],
    [projects]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = category === "Todos" || project.category === category;
      const matchesQuery =
        !q ||
        [project.title, project.category, project.location, project.descriptor, project.status]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [projects, query, category]);

  return (
    <section id="projects" className="bg-[#0b0f15] py-16 md:py-24 scroll-mt-[96px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d4b06a]/90">Proyectos</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-white">Portafolio urbano</h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/65">Consulta proyectos por tipología y ubicación. Cada ficha abre un detalle preparado para extender descripción y contenidos.</p>
        </div>

        <div className="mb-7 grid gap-3 rounded-2xl border border-white/10 bg-[#121722] p-4 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, categoría o ubicación"
              className="w-full rounded-xl border border-white/10 bg-[#090d14] pl-10 pr-4 py-2.5 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#d4b06a]/50"
            />
          </label>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090d14] px-3 py-2.5 text-white"
            aria-label="Filtrar por categoría"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {status === "loading" && <div className="text-white/70">Cargando proyectos…</div>}
        {status === "error" && <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/75">No se pudo cargar el listado de proyectos.</div>}

        {status === "ready" && filtered.length === 0 && (
          <div className="rounded-xl border border-white/15 bg-white/5 p-7 text-center text-white/70">No hay proyectos para estos filtros.</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <a
              key={project.id}
              href={`/proyectos/${project.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10151f] transition hover:-translate-y-1 hover:border-[#d4b06a]/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#d4b06a]/70"
            >
              <div className="relative">
                <ImageWithFallback
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-56"
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 48vw, 100vw"
                  fallbackLabel="Proyecto sin imagen disponible"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-[#d4b06a]/50 bg-black/55 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-[#e9cd8f]">{project.category}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#e9cd8f]">{project.title}</h3>
                <p className="mt-2 text-sm text-white/65">{project.descriptor || "Detalle en construcción."}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/70"><MapPin size={13} />{project.location || "Ubicación no especificada"}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
