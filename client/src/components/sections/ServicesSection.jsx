import { useMemo, useState } from "react";
import {
  Compass,
  LineChart,
  Scale,
  Building2,
  BadgeCheck,
  Layers,
  FileCheck2,
  DraftingCompass,
  FileText,
  ChevronDown,
} from "lucide-react";

export default function ServicesSection({ accentColor = "#C0392B" }) {
  const [openId, setOpenId] = useState(null);

  const services = useMemo(
    () => [
      {
        id: "planeacion",
        title: "Planeación urbana",
        desc: "Planes maestros y estrategias para un crecimiento ordenado y viable.",
        icon: Compass,
        details: [
          "Diseñamos y coordinamos planes maestros, lineamientos y criterios de ordenamiento territorial para alinear usos, etapas, movilidad y equipamientos.",
          "Aterrizamos la visión del proyecto en reglas claras para su implantación y evolución en el tiempo.",
        ],
      },
      {
        id: "viabilidad",
        title: "Estudios de viabilidad",
        desc: "Evaluación financiera y de mercado para medir el potencial del proyecto.",
        icon: LineChart,
        details: [
          "Analizamos demanda, escenarios, sensibilidad, costos e ingresos para validar la factibilidad y mejorar la toma de decisiones.",
          "Entregables típicos: supuestos, escenarios, riesgos y recomendaciones de optimización.",
        ],
      },
      {
        id: "usosuelo",
        title: "Uso de suelo y normatividad",
        desc: "Análisis regulatorio para cumplir y maximizar la viabilidad del predio.",
        icon: Scale,
        details: [
          "Revisamos instrumentos urbanos aplicables, compatibilidades, restricciones, densidades, coeficientes y condicionantes.",
          "Identificamos rutas de cumplimiento y oportunidades para viabilizar el proyecto con certeza.",
        ],
      },
      {
        id: "desarrollo",
        title: "Desarrollo inmobiliario",
        desc: "Gestión integral desde la concepción hasta la ejecución del proyecto.",
        icon: Building2,
        details: [
          "Coordinamos disciplinas y entregables clave (técnicos, urbanos y de gestión) para mantener alineados alcance, tiempos y riesgos.",
          "Enfoque en continuidad: del diagnóstico a la implementación con control de hitos.",
        ],
      },
      {
        id: "llave",
        title: "Proyectos llave en mano",
        desc: "Soluciones completas que reducen riesgos y optimizan tiempos del inversionista.",
        icon: BadgeCheck,
        details: [
          "Integramos planeación, gestión y coordinación para ejecutar con mayor certidumbre en tiempos, costos y cumplimiento.",
          "Ideal cuando se busca un solo equipo responsable de coordinar el proceso completo.",
        ],
      },
      {
        id: "integracion",
        title: "Proyectos de integración urbana",
        desc: "Nuevos desarrollos que se conectan con lo existente sin perder el contexto.",
        icon: Layers,
        details: [
          "Realizamos proyectos que incorporan un nuevo desarrollo a la ciudad existente o transforman lo existente para responder a nuevas exigencias, manteniendo coherencia con su entorno consolidado.",
          "La integración se conceptualiza de forma compatible con los contenidos funcionales existentes, conforme a lo establecido en los planes de desarrollo urbano.",
        ],
      },
      {
        id: "gestion",
        title: "Gestión urbana",
        desc: "Gestoría y coordinación de trámites para ejecutar usos del suelo con certeza legal.",
        icon: FileCheck2,
        details: [
          "Llevamos a la práctica la ejecución de determinaciones de uso de suelo, planeación urbana y ordenamiento territorial mediante la gestión ante instancias federales, estatales y/o municipales.",
          "Acompañamos el emplazamiento de usos comerciales, industriales, de servicios y construcción, así como desarrollos habitacionales.",
          "Objetivo: optimizar tiempos, reducir fricción en trámites y asegurar la ejecución final con certeza legal.",
        ],
      },
      {
        id: "urbanizacion",
        title: "Proyecto definitivo de urbanización",
        desc: "Integración de proyectos para acciones urbanísticas con altos estándares y normativa.",
        icon: DraftingCompass,
        details: [
          "Elaboramos e integramos el conjunto de proyectos necesarios para acciones urbanísticas de distintos usos y destinos, maximizando estándares de funcionamiento y rentabilidad.",
          "Incluye análisis programático y coordinación entre instalaciones, equipamientos y mobiliario urbano para el correcto funcionamiento del desarrollo.",
          "Se desarrolla conforme a la legislación vigente (Jalisco y otras entidades, según aplique).",
        ],
      },
      {
        id: "especiales",
        title: "Estudios y proyectos especiales",
        desc: "Soporte técnico-legal para autorizaciones, registro y regularización urbana.",
        icon: FileText,
        details: [
          "La normativa urbana prevé procedimientos para autorizar proyectos urbanos, de edificación, régimen en condominio, subdivisiones y/o relotificaciones; así como actuaciones registrales ante Notario, Registro Público y Catastro.",
          "Ofrecemos capacidad técnica y legal para gestionar estos procesos, protegiendo el patrimonio y brindando certeza jurídica.",
        ],
        bullets: [
          "Plan parcial de desarrollo urbano",
          "Plan maestro de ordenamiento territorial",
          "Estudio de asoleamientos e imagen urbana",
          "Estudio de impacto al tránsito",
          "Impacto ambiental / informe preventivo / factibilidad ambiental",
          "Régimen de propiedad en condominio",
          "Subdivisiones y/o relotificaciones",
          "Y otros estudios requeridos por la autoridad",
        ],
      },
    ],
    []
  );

  const onToggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  const sectionBg = "bg-gray-50 dark:bg-[#0B0C10]";
  const cardBg = "bg-white dark:bg-[#101114]";
  const cardBorder = "border border-gray-200 dark:border-white/10";
  const mutedText = "text-gray-600 dark:text-white/70";
  const titleText = "text-gray-900 dark:text-white";

  return (
    <section
      id="services"
      className={`py-16 md:py-24 ${sectionBg} transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold ${titleText}`}>
            Servicios
          </h2>
          <div
            className="w-20 h-1 mx-auto mt-4 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <p className={`mt-4 text-sm sm:text-base ${mutedText} max-w-3xl mx-auto`}>
            Servicios integrales para planear, viabilizar, gestionar y ejecutar proyectos urbanos e
            inmobiliarios con certeza técnica y legal.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((srv) => {
            const Icon = srv.icon;
            const isOpen = openId === srv.id;

            return (
              <div
                key={srv.id}
                className={[
                  "relative",
                  "rounded-2xl",
                  cardBg,
                  cardBorder,
                  "shadow-sm hover:shadow-md",
                  "transition-all",
                  "overflow-hidden",
                ].join(" ")}
              >
                {/* Main clickable area (reserve space for arrow) */}
                <button
                  type="button"
                  onClick={() => onToggle(srv.id)}
                  className="w-full text-left p-5 sm:p-6 pr-14 pb-12 flex items-start gap-4"
                  aria-expanded={isOpen}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
                    style={{
                      backgroundColor: `${accentColor}18`,
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <Icon size={20} style={{ color: accentColor }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className={`text-base sm:text-lg font-semibold leading-snug ${titleText}`}>
                      {srv.title}
                    </h3>
                    <p className={`mt-1 text-sm leading-relaxed ${mutedText}`}>
                      {srv.desc}
                    </p>
                  </div>
                </button>

                {/* Arrow (always bottom-right, never collides) */}
                <button
                  type="button"
                  onClick={() => onToggle(srv.id)}
                  className="absolute bottom-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-xl border transition"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    backgroundColor: isOpen ? `${accentColor}14` : "rgba(255,255,255,0.04)",
                  }}
                  aria-label={isOpen ? "Cerrar detalle" : "Abrir detalle"}
                  title={isOpen ? "Cerrar" : "Abrir"}
                >
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? accentColor : "rgba(148,163,184,0.90)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 180ms ease",
                    }}
                  />
                </button>

                {/* Accordion body */}
                <div
                  className={[
                    "px-5 sm:px-6",
                    "transition-[max-height,opacity] duration-300 ease-out",
                    "overflow-hidden",
                    isOpen ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  style={{ maxHeight: isOpen ? 520 : 0 }}
                >
                  <div className="pb-5 sm:pb-6">
                    <div className={`text-sm ${mutedText} leading-relaxed space-y-2`}>
                      {(srv.details || []).map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>

                    {srv.bullets?.length ? (
                      <div className="mt-4 rounded-xl border border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                        <div className={`text-sm font-semibold ${titleText}`}>Incluye</div>
                        <ul className={`mt-2 text-sm ${mutedText} list-disc pl-5 space-y-1`}>
                          {srv.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* ✅ removed bottom red line completely */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
