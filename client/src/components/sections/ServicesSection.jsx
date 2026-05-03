import { Compass, Building2, FileCheck2, Route, ShieldCheck, Leaf } from "lucide-react";

const SERVICES = [
  {
    id: "planeacion",
    title: "Planeación urbana",
    description:
      "Planes maestros y estrategias para estructurar crecimiento, conectividad y valor urbano sostenible.",
    icon: Compass,
  },
  {
    id: "viabilidad",
    title: "Estudios de viabilidad",
    description:
      "Evaluación normativa, comercial y financiera para tomar decisiones de inversión con menor riesgo.",
    icon: FileCheck2,
  },
  {
    id: "movilidad",
    title: "Estudios de movilidad",
    description:
      "Diagnóstico de tránsito y accesibilidad para proyectos urbanos de alto impacto.",
    icon: Route,
  },
  {
    id: "uso-suelo",
    title: "Uso de suelo y normatividad",
    description:
      "Análisis regulatorio integral para alinear usos permitidos, densidades y estrategia de permisos.",
    icon: Building2,
  },
  {
    id: "gestion",
    title: "Gestión urbana",
    description:
      "Acompañamiento institucional para autorizaciones y trámites ante instancias federales, estatales y municipales.",
    icon: ShieldCheck,
  },
  {
    id: "ambiental",
    title: "Ambiental y riesgo",
    description:
      "Estudios técnicos y ambientales para garantizar viabilidad y continuidad regulatoria del proyecto.",
    icon: Leaf,
  },
];

export default function ServicesSection({ accentColor = "#C0392B" }) {
  return (
    <section id="services" className="py-16 md:py-24 bg-white dark:bg-[#0B0C10] transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Servicios</h2>
          <div className="w-20 h-1.5 mx-auto mt-5 rounded" style={{ backgroundColor: accentColor }} />
          <p className="mt-4 text-gray-600 dark:text-white/65 max-w-3xl mx-auto">
            Diseñamos estrategias urbanas y gestionamos proyectos de inicio a fin para inmobiliarias, constructoras y propietarios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-[#F8F9FB] dark:bg-[#101114] p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 text-white" style={{ backgroundColor: accentColor }}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-white/65 leading-relaxed">{service.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
