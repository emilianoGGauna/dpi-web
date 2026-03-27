import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { fetchProjects } from "../lib/projects";
import { buildServiceCollections, SERVICE_DEFINITIONS } from "../lib/services";

export default function ServiceDetailPage({ slug }) {
  const [status, setStatus] = useState("loading");
  const [collections, setCollections] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setCollections(buildServiceCollections(data));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    return () => controller.abort();
  }, []);

  const service = SERVICE_DEFINITIONS.find((item) => item.id === slug);
  const firstProject = useMemo(() => collections[slug]?.[0], [collections, slug]);

  if (status === "loading") return <div className="pt-32 text-center text-white/75">Cargando servicio...</div>;
  if (!service) return <div className="pt-32 text-center text-white/75">Servicio no encontrado.</div>;

  return (
    <main className="pt-24 md:pt-28 pb-16 bg-[#080c12] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <a href="/servicios" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#e9cd8f]"><ArrowLeft size={16} /> Volver a servicios</a>
        <h1 className="mt-4 text-3xl md:text-4xl text-white font-semibold">{service.title}</h1>
        <p className="mt-2 text-white/75">{service.overview}</p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#101722]">
          <ImageWithFallback src={firstProject?.imageUrl} alt={service.title} className="min-h-[320px] md:min-h-[520px]" loading="eager" fallbackLabel="Servicio sin imagen de referencia" />
        </div>

        <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 text-white/75">
          Esta página ya está estructurada para recibir descripción extendida, entregables y casos por servicio.
        </section>
      </div>
    </main>
  );
}
