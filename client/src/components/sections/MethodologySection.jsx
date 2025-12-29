import {
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function MethodologySection({ accentColor = "#C0392B" }) {
  const methodologySteps = [
    {
      number: 1,
      title: "Diagnóstico",
      description:
        "Análisis integral del sitio, su contexto urbano y condiciones normativas. Identificación de oportunidades y restricciones.",
    },
    {
      number: 2,
      title: "Estudio de Mercado",
      description:
        "Evaluación de la demanda, competencia y tendencias del mercado inmobiliario para determinar el mejor uso y posicionamiento.",
    },
    {
      number: 3,
      title: "Desarrollo Conceptual",
      description:
        "Creación de escenarios de desarrollo y planteamiento de alternativas de diseño urbano y arquitectónico.",
    },
    {
      number: 4,
      title: "Factibilidad Financiera",
      description:
        "Modelación económica del proyecto, proyecciones financieras y análisis de rentabilidad para diferentes esquemas.",
    },
    {
      number: 5,
      title: "Estrategia de Implementación",
      description:
        "Planificación de etapas, gestión normativa, y estructuración del modelo de negocios y financiamiento.",
    },
    {
      number: 6,
      title: "Ejecución y Monitoreo",
      description:
        "Implementación del plan maestro, seguimiento de avances y ajustes estratégicos para asegurar el éxito del proyecto.",
    },
  ];

  return (
    <section
      id="methodology"
      className="
        py-16 md:py-24 
        bg-white dark:bg-[#121212]
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Metodología de Trabajo
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-12"
          style={{ backgroundColor: accentColor }}
        />

        {/* DESKTOP TIMELINE */}
        <div className="hidden md:block relative mb-20">
          <div className="absolute top-16 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700" />

          <div className="grid grid-cols-6 gap-4 relative">
            {methodologySteps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className="
                    w-12 h-12 rounded-full flex items-center justify-center 
                    font-bold text-white text-xl z-10 mb-4 shadow-md
                  "
                  style={{ backgroundColor: accentColor }}
                >
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                  {step.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE TIMELINE */}
        <div className="md:hidden">
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-6 w-1 bg-gray-200 dark:bg-gray-700 ml-1.5" />

            {methodologySteps.map((step) => (
              <div key={step.number} className="flex mb-12 relative">
                <div
                  className="
                    w-9 h-9 rounded-full flex items-center justify-center 
                    font-bold text-white text-lg mt-1.5 flex-shrink-0 shadow
                  "
                  style={{ backgroundColor: accentColor }}
                >
                  {step.number}
                </div>

                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BENEFITS */}
        <div
          className="
            mt-16 md:mt-24 
            bg-gray-50 dark:bg-[#1A1A1A] 
            p-8 rounded-lg shadow-sm
            transition-colors duration-300
          "
        >
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-10 text-center">
            Beneficios de nuestra metodología
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Benefit
              icon={TrendingUp}
              title="Optimización de recursos"
              text="Identificamos las mejores oportunidades de inversión, maximizando eficiencia y retornos."
              accentColor={accentColor}
            />
            <Benefit
              icon={Clock}
              title="Reducción de tiempos"
              text="Procesos eficientes y anticipación de obstáculos para cumplir con los plazos establecidos."
              accentColor={accentColor}
            />
            <Benefit
              icon={ShieldCheck}
              title="Mitigación de riesgos"
              text="Identificación temprana de obstáculos potenciales y estrategias para minimizar su impacto."
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- HELPERS ---------- */

function Benefit({ icon: Icon, title, text, accentColor }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="
          w-16 h-16 flex items-center justify-center 
          rounded-full mb-4 shadow-sm
        "
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Icon
          className="w-8 h-8"
          style={{ color: accentColor }}
          strokeWidth={2}
        />
      </div>

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h4>

      <p className="text-gray-600 dark:text-gray-300">
        {text}
      </p>
    </div>
  );
}
