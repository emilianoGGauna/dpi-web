import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { fetchProjects } from "../lib/projects";

export default function ProjectDetailPage({ slug }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => controller.abort();
  }, []);

  const project = useMemo(() => projects.find((item) => item.slug === slug), [projects, slug]);

  if (status === "loading") return <div className="pt-32 text-center text-white/75">Cargando proyecto...</div>;
  if (!project) return <div className="pt-32 text-center text-white/75">Proyecto no encontrado.</div>;

  return (
    <main className="pt-24 md:pt-28 pb-16 bg-[#080c12] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <a href="/proyectos" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#e9cd8f]"><ArrowLeft size={16} /> Volver a proyectos</a>
        <h1 className="mt-4 text-3xl md:text-4xl text-white font-semibold">{project.title}</h1>
        <p className="mt-2 text-white/70">{project.location || project.category}</p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#101722]">
          <ImageWithFallback src={project.imageUrl} alt={project.title} className="min-h-[320px] md:min-h-[520px]" loading="eager" fallbackLabel="Imagen del proyecto no disponible" />
        </div>

        <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="text-lg font-medium text-white">Descripción</h2>
          <p className="mt-2 text-white/75">{project.description || project.descriptor || "Contenido en preparación. Esta vista ya está lista para agregar texto extendido sin rediseño."}</p>
        </section>
      </div>
    </main>
  );
}
