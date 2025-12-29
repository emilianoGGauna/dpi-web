export default function WhyDPISection({
  accentColor = "#C0392B",
  secondaryColor = "#2C3E50",
}) {
  const reasons = [
    {
      number: "01",
      title: "Visión Integral",
      description:
        "Integramos planeación urbana, análisis financiero, normatividad y mercado inmobiliario para ofrecer soluciones completas y estratégicas.",
    },
    {
      number: "02",
      title: "Experiencia Comprobada",
      description:
        "Contamos con amplia trayectoria en proyectos urbanos y desarrollos inmobiliarios de distintas escalas y tipologías.",
    },
    {
      number: "03",
      title: "Enfoque en Rentabilidad",
      description:
        "Cada decisión está orientada a maximizar el valor del suelo y el retorno de inversión, minimizando riesgos.",
    },
    {
      number: "04",
      title: "Conocimiento Normativo",
      description:
        "Dominamos los marcos regulatorios y procesos de gestión urbana, agilizando trámites y reduciendo incertidumbre.",
    },
    {
      number: "05",
      title: "Soluciones a la Medida",
      description:
        "Diseñamos estrategias personalizadas que responden a las necesidades específicas de cada cliente y proyecto.",
    },
    {
      number: "06",
      title: "Acompañamiento Estratégico",
      description:
        "Acompañamos a nuestros clientes en todas las etapas del proyecto, desde la concepción hasta la ejecución.",
    },
  ];

  return (
    <section
      id="why-dpi"
      className="
        py-16 md:py-24
        bg-gray-50 dark:bg-[#121212]
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          ¿Por qué DPI?
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-12"
          style={{ backgroundColor: accentColor }}
        />

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.number}
              className="
                bg-white dark:bg-[#1A1A1A]
                rounded-lg p-8 shadow-sm 
                hover:shadow-lg transition-shadow
                relative overflow-hidden
                border border-gray-100 dark:border-gray-700
              "
            >
              {/* Number watermark */}
              <div
                className="
                  absolute -top-6 -right-6 
                  text-7xl font-bold 
                  opacity-10 dark:opacity-[0.07]
                  pointer-events-none
                "
                style={{ color: secondaryColor }}
              >
                {reason.number}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 relative z-10">
                {reason.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm relative z-10">
                {reason.description}
              </p>

              <div
                className="mt-6 h-0.5 w-16"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
