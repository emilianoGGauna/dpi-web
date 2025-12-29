import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail 
} from "lucide-react";

export default function Footer({ accentColor = "#C0392B" }) {
  const year = new Date().getFullYear();

  return (
    <footer className="
      bg-gray-100 text-gray-700
      dark:bg-black dark:text-gray-300
      transition-colors duration-300
    ">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <span
                className="text-2xl font-bold mr-1"
                style={{ color: accentColor }}
              >
                DPI
              </span>
              <span className="text-xl font-light dark:text-gray-200">
                Diseño Planeación Integral
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              Desarrollamos soluciones urbanas e inmobiliarias que optimizan recursos,
              minimizan riesgos y maximizan el valor de la inversión, creando entornos
              que mejoran la calidad de vida.
            </p>

            <div className="flex space-x-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Instagram, label: "Instagram" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="
                    w-10 h-10 rounded-full flex items-center justify-center
                    border border-gray-400 dark:border-gray-700
                    hover:border-gray-600 dark:hover:border-gray-500
                    transition-colors
                  "
                  aria-label={label}
                >
                  <Icon
                    size={18}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              <span
                className="border-b-2 pb-1 pr-4"
                style={{ borderColor: accentColor }}
              >
                Enlaces Rápidos
              </span>
            </h3>

            <ul className="space-y-3">
              {[
                { label: "Inicio", href: "#" },
                { label: "Quiénes Somos", href: "#about" },
                { label: "Servicios", href: "#services" },
                { label: "Proyectos", href: "#projects" },
                { label: "Contacto", href: "#contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a 
                    href={href}
                    className="
                      flex items-center
                      text-gray-600 dark:text-gray-400
                      hover:text-black dark:hover:text-white
                      transition-colors
                    "
                  >
                    <ArrowRight size={14} className="mr-2" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              <span
                className="border-b-2 pb-1 pr-4"
                style={{ borderColor: accentColor }}
              >
                Servicios
              </span>
            </h3>

            <ul className="space-y-3">
              {[
                "Planeación Urbana",
                "Estudios de Viabilidad",
                "Uso de Suelo",
                "Desarrollo Inmobiliario",
                "Proyectos llave en mano",
              ].map((service) => (
                <li key={service}>
                  <a 
                    href="#services"
                    className="
                      flex items-center
                      text-gray-600 dark:text-gray-400
                      hover:text-black dark:hover:text-white
                      transition-colors
                    "
                  >
                    <ArrowRight size={14} className="mr-2" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              <span
                className="border-b-2 pb-1 pr-4"
                style={{ borderColor: accentColor }}
              >
                Contacto
              </span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin size={18} className="text-gray-600 dark:text-gray-400 mt-1" />
                <p className="ml-3 text-gray-600 dark:text-gray-400">
                  Av. Reforma 222, Piso 15<br />
                  Col. Juárez, 06600<br />
                  Ciudad de México, México
                </p>
              </div>

              <div className="flex items-center">
                <Phone size={18} className="text-gray-600 dark:text-gray-400" />
                <p className="ml-3 text-gray-600 dark:text-gray-400">
                  +52 55 1234 5678
                </p>
              </div>

              <div className="flex items-center">
                <Mail size={18} className="text-gray-600 dark:text-gray-400" />
                <p className="ml-3 text-gray-600 dark:text-gray-400">
                  contacto@dpi.mx
                </p>
              </div>

              <a
                href="#contact"
                className="
                  inline-flex items-center px-4 py-2 mt-2 rounded-md text-white
                  hover:bg-opacity-90 transition-colors
                "
                style={{ backgroundColor: accentColor }}
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-300 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-600 dark:text-gray-500 text-sm mb-4 md:mb-0">
              © {year} DPI - Diseño Planeación Integral S.A. de C.V. Todos los derechos reservados.
            </div>

            <div className="flex space-x-6 text-gray-600 dark:text-gray-500 text-sm">
              {["Política de Privacidad", "Términos y Condiciones", "Aviso Legal"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
