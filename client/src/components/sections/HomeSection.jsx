import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { fetchProjects } from "../../lib/projects";

export default function HomeSection({
  headline = "Transformamos ideas en proyectos rentables mediante planeación urbana",
  subtitle = "Acompañamos a inmobiliarias, constructoras y propietarios desde la planeación y el diseño hasta la gestión urbana del proyecto.",
  ctaText = "Contáctanos",
  accentColor = "#D4B06A",
}) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setProjects(data.slice(0, 8));
        setStatus("ready");
      })
      .catch(() => {
        setProjects([]);
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  const featured = useMemo(() => projects.find((item) => item.featured) || projects[0], [projects]);

  return (
    <section id="home" className="relative bg-[#090b10] pt-24 md:pt-28 pb-14 md:pb-20 scroll-mt-[96px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,rgba(212,176,106,0.14),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(212,176,106,0.08),transparent_35%)]" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4b06a]">DPI · Diseño y Planeación Integral</p>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight text-white">{headline}</h1>
            <p className="mt-4 text-white/78 text-base md:text-lg">{subtitle}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4b06a] px-5 py-3 font-semibold text-[#1a1a1a] hover:bg-[#dfbf7e] transition">
                <Briefcase size={18} /> Servicios
              </a>
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 transition">
                {ctaText} <ArrowRight size={17} />
              </a>
            </div>

            <a href="/proyectos" className="mt-5 inline-flex items-center gap-2 text-sm text-white/80 hover:text-[#d4b06a] transition">
              Ver portafolio completo <ArrowRight size={16} />
            </a>
          </div>

          <article className="lg:col-span-7 overflow-hidden rounded-3xl border border-white/10 bg-[#0f141d] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="relative">
              <ImageWithFallback
                src={featured?.imageUrl}
                alt={featured?.title || "Proyecto destacado"}
                className="min-h-[280px] md:min-h-[440px]"
                loading="eager"
                sizes="(min-width: 1024px) 58vw, 100vw"
                fallbackLabel="Proyecto destacado sin imagen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4b06a]">Proyecto destacado</p>
                <h2 className="mt-2 text-2xl md:text-4xl font-semibold text-white">{featured?.title || "Cargando proyecto"}</h2>
                <p className="mt-3 max-w-2xl text-white/80">{featured?.descriptor || "Planeación urbana estratégica para desarrollos de alto impacto."}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/80">
                  <Building2 size={13} color={accentColor} /> {featured?.location || "Cobertura nacional"}
                </div>
              </div>
            </div>

            {status === "loading" && <div className="p-4 text-sm text-white/70">Cargando proyectos destacados...</div>}
            {status === "error" && <div className="p-4 text-sm text-white/70">No fue posible cargar el carrusel, pero el sitio sigue operativo.</div>}
          </article>
        </div>
      </div>
    </section>
  );
}
