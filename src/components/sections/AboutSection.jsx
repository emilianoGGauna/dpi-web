export default function AboutSection({ accentColor = "#C0392B" }) {
  return (
    <section
      id="about"
      className="py-20 bg-gray-50 dark:bg-[#121212] transition-colors duration-300"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            ¿Quiénes Somos?
          </h2>
          <div
            className="w-20 h-1 mx-auto mt-4 rounded"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="space-y-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            <p>
              En <strong>DPI – Diseño Planeación Integral</strong> somos una
              firma especializada en el desarrollo integral de proyectos
              inmobiliarios, desde la conceptualización hasta la ejecución.
            </p>

            <p>
              Integramos análisis urbano, planeación estratégica y evaluación
              financiera para maximizar el valor de cada inversión, siempre con
              una visión sustentable y de largo plazo.
            </p>

            <p>
              Nuestro enfoque combina experiencia técnica, conocimiento del
              mercado y acompañamiento cercano a nuestros clientes, generando
              soluciones sólidas y rentables.
            </p>
          </div>

          {/* Highlight box */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg p-8 transition-colors duration-300">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Nuestra filosofía
            </h3>

            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span>Visión estratégica desde el origen del proyecto</span>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span>Decisiones basadas en análisis técnico y financiero</span>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span>Desarrollo responsable y sustentable</span>
              </li>

              <li className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <span>Acompañamiento cercano al inversionista</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
