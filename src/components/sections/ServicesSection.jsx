export default function ServicesSection({ accentColor = "#C0392B" }) {
  const serviceIcons = {
    planning: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 22H21" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 22V10L12 2L19 10V22" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V16H15V22" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    feasibility: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 3H21V7H3V3Z" stroke={accentColor} strokeWidth="2" />
        <path d="M3 14H21V21H3V14Z" stroke={accentColor} strokeWidth="2" />
        <path d="M7 10V14" stroke={accentColor} strokeWidth="2" />
        <path d="M12 10V14" stroke={accentColor} strokeWidth="2" />
        <path d="M17 10V14" stroke={accentColor} strokeWidth="2" />
      </svg>
    ),
    landUse: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 4H20V12H4V4Z" stroke={accentColor} strokeWidth="2" />
        <path d="M2 20H22" stroke={accentColor} strokeWidth="2" />
        <path d="M8 12V20" stroke={accentColor} strokeWidth="2" />
        <path d="M16 12V20" stroke={accentColor} strokeWidth="2" />
      </svg>
    ),
    development: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 22H21" stroke={accentColor} strokeWidth="2" />
        <path d="M12 2L19 8V22H5V8L12 2Z" stroke={accentColor} strokeWidth="2" />
        <path d="M9 22V12H15V22" stroke={accentColor} strokeWidth="2" />
      </svg>
    ),
    turnkey: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C13.6569 2 15 3.34315 15 5C15 8 12 8 12 8C12 8 9 8 9 5C9 3.34315 10.3431 2 12 2Z" stroke={accentColor} strokeWidth="2" />
        <path d="M12 8V22" stroke={accentColor} strokeWidth="2" />
        <path d="M15 11H18V14H15V11Z" stroke={accentColor} strokeWidth="2" />
        <path d="M6 16H9V19H6V16Z" stroke={accentColor} strokeWidth="2" />
      </svg>
    ),
  };

  const services = [
    {
      title: "Planeación Urbana",
      desc: "Diseño y gestión de planes maestros y estrategias urbanas de largo plazo.",
      icon: serviceIcons.planning,
    },
    {
      title: "Estudios de Viabilidad",
      desc: "Evaluación financiera y de mercado para medir el potencial de cada proyecto.",
      icon: serviceIcons.feasibility,
    },
    {
      title: "Uso de Suelo",
      desc: "Análisis normativo para garantizar la viabilidad y cumplimiento regulatorio.",
      icon: serviceIcons.landUse,
    },
    {
      title: "Desarrollo Inmobiliario",
      desc: "Gestión integral desde la concepción hasta la entrega de proyectos.",
      icon: serviceIcons.development,
    },
    {
      title: "Proyectos llave en mano",
      desc: "Soluciones completas que minimizan riesgos y tiempos para el inversionista.",
      icon: serviceIcons.turnkey,
    },
  ];

  return (
    <section
      id="services"
      className="
        py-16 md:py-24 
        bg-white dark:bg-[#121212]
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Servicios
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-12"
          style={{ backgroundColor: accentColor }}
        />

        {/* SERVICE CARDS */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((srv) => (
            <div
              key={srv.title}
              className="
                bg-white dark:bg-[#1A1A1A]
                border border-gray-100 dark:border-gray-700
                rounded-lg p-8 shadow-sm 
                hover:shadow-lg transition-all
              "
            >
              <div
                className="w-14 h-14 flex items-center justify-center rounded-full mb-6"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                {srv.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {srv.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {srv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
