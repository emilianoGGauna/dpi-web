import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";

export default function ClientsSection({
  accentColor = "#C0392B",
  showTestimonials = true
}) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const clients = [
    { id: 1, name: "GRUPO CARSO", logo: "https://via.placeholder.com/200x80?text=GRUPO+CARSO" },
    { id: 2, name: "GICSA", logo: "https://via.placeholder.com/200x80?text=GICSA" },
    { id: 3, name: "GRUPO GIGANTE", logo: "https://via.placeholder.com/200x80?text=GRUPO+GIGANTE" },
    { id: 4, name: "FRISA", logo: "https://via.placeholder.com/200x80?text=FRISA" },
    { id: 5, name: "SORDO MADALENO", logo: "https://via.placeholder.com/200x80?text=SORDO+MADALENO" },
    { id: 6, name: "GRUPO MRP", logo: "https://via.placeholder.com/200x80?text=GRUPO+MRP" },
    { id: 7, name: "GAVA CAPITAL", logo: "https://via.placeholder.com/200x80?text=GAVA+CAPITAL" },
    { id: 8, name: "THOR URBANA", logo: "https://via.placeholder.com/200x80?text=THOR+URBANA" },
  ];

  const testimonials = [
    {
      id: 1,
      quote:
        "DPI fue clave en el éxito de nuestro desarrollo habitacional. Su profundo conocimiento del mercado inmobiliario y normatividad urbana nos permitió optimizar el proyecto y aumentar significativamente su rentabilidad.",
      author: "Ing. Carlos Hernández",
      position: "Director de Desarrollo, Grupo Carso",
      logo: "https://via.placeholder.com/200x80?text=GRUPO+CARSO",
    },
    {
      id: 2,
      quote:
        "La metodología de DPI ha sido fundamental para nuestro proyecto comercial. Su análisis minucioso del entorno urbano y las tendencias de mercado nos dieron una ventaja competitiva clara frente a desarrollos similares en la zona.",
      author: "Arq. Adriana Morales",
      position: "Directora de Proyectos, GICSA",
      logo: "https://via.placeholder.com/200x80?text=GICSA",
    },
    {
      id: 3,
      quote:
        "Trabajar con DPI significó un cambio radical en nuestra estrategia de expansión. Su visión integral nos permitió identificar oportunidades que otros consultores no habían detectado, resultando en un proyecto mucho más exitoso.",
      author: "Lic. Roberto Sánchez",
      position: "CEO, Grupo Gigante Inmobiliario",
      logo: "https://via.placeholder.com/200x80?text=GRUPO+GIGANTE",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="clients"
      className="py-16 md:py-24 bg-white dark:bg-[#121212] transition-colors duration-300"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Clientes y Colaboraciones
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-12"
          style={{ backgroundColor: accentColor }}
        />

        {/* CLIENT LOGOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {clients.map((client) => (
            <div
              key={client.id}
              className="
                flex items-center justify-center p-6 
                bg-white dark:bg-[#1E1E1E] 
                border border-gray-100 dark:border-gray-700 
                rounded-lg shadow-sm
                transition-colors duration-300
              "
            >
              <ImageWithFallback
                src={client.logo}
                alt={client.name}
                className="max-h-12 w-auto mx-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* TESTIMONIALS */}
        {showTestimonials && (
          <div className="max-w-4xl mx-auto mt-20">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-12">
              Lo que dicen nuestros clientes
            </h3>

            <div className="
              relative bg-white dark:bg-[#1E1E1E] 
              rounded-lg shadow-lg p-8 md:p-10 
              transition-colors duration-300
            ">
              
              {/* QUOTE ICON */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#2C2C2C] shadow-md">
                  <svg width="24" height="24" fill="none">
                    <path
                      d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V17C10 17.5304 9.78929 18.0391 9.41421 18.4142C9.03914 18.7893 8.53043 19 8 19H6"
                      stroke={accentColor}
                      strokeWidth="2"
                    />
                    <path
                      d="M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V17C20 17.5304 19.7893 18.0391 19.4142 18.4142C19.0391 18.7893 18.5304 19 18 19H16"
                      stroke={accentColor}
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* TEXT */}
              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-300 text-lg italic mb-6">
                  "{testimonials[currentTestimonial].quote}"
                </p>

                <div className="flex items-center justify-center mb-4">
                  <ImageWithFallback
                    src={testimonials[currentTestimonial].logo}
                    alt={testimonials[currentTestimonial].author}
                    className="h-8 grayscale"
                  />
                </div>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {testimonials[currentTestimonial].position}
                </p>
              </div>

              {/* NAV BUTTONS */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={prevTestimonial}
                  className="
                    w-10 h-10 flex items-center justify-center rounded-full 
                    border border-gray-300 dark:border-gray-600 
                    mr-4 hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors duration-300
                  "
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="
                    w-10 h-10 flex items-center justify-center rounded-full 
                    border border-gray-300 dark:border-gray-600 
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors duration-300
                  "
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS */}
        <div className="mt-20 text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            Colaboraciones institucionales
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-8 mt-6">
            {["UNAM", "COLEGIO ARQ", "SEDUVI", "CANADEVI"].map((name) => (
              <div
                key={name}
                className="grayscale hover:grayscale-0 transition-all duration-300"
              >
                <ImageWithFallback
                  src={`https://via.placeholder.com/150x50?text=${name.replace(
                    " ",
                    "+"
                  )}`}
                  alt={name}
                  className="h-8"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
