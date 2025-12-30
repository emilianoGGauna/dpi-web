import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer({ accentColor = "#C0392B" }) {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Inicio", href: "#" },
    { label: "Quiénes Somos", href: "#about" },
    { label: "Proyectos", href: "#projects" },
    { label: "Servicios", href: "#services" },
    { label: "Metodología", href: "#methodology" },
    { label: "Clientes", href: "#clients" },
    { label: "Contacto", href: "#contact" },
  ];

  const services = [
    "Planeación urbana",
    "Estudios de viabilidad",
    "Uso de suelo y normatividad",
    "Desarrollo inmobiliario",
    "Proyectos llave en mano",
    "Proyectos de integración urbana",
    "Gestión urbana",
    "Proyecto definitivo de urbanización",
    "Estudios y proyectos especiales",
  ];

  // Contact (from your current site copy)
  const addressLines = [
    "Av. de los Arcos 735",
    "Jardines del Bosque, 44520",
    "Guadalajara, Jal.",
  ];
  const phone = "+52 33 3616 3987";
  const email = "dpimexico_planeacion@yahoo.com.mx";
  const mapsQuery = "Av. de los Arcos 735, Jardines del Bosque, 44520 Guadalajara, Jal.";
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(mapsQuery);

  // If you don’t have socials yet, you can set this to false.
  const showSocials = false;

  return (
    <footer className="bg-gray-50 text-gray-700 dark:bg-[#0B0C10] dark:text-white/70 transition-colors duration-300">
      {/* subtle top accent */}
      <div className="h-[2px]" style={{ backgroundColor: `${accentColor}AA` }} />

      {/* Main */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-extrabold" style={{ color: accentColor }}>
                DPI
              </span>
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                Diseño Planeación Integral
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/65">
              Facilitamos la planeación, gestión y desarrollo de inversiones inmobiliarias con
              visión urbana, soporte técnico-jurídico y análisis financiero.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { k: "Desde", v: "2006" },
                { k: "Socios", v: "1988" },
                { k: "Proyectos", v: "+500" },
              ].map((s) => (
                <span
                  key={s.k}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs
                             border-gray-200 bg-white/60 text-gray-700
                             dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                >
                  <span className="opacity-70">{s.k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{s.v}</span>
                </span>
              ))}
            </div>

            {showSocials && (
              <div className="mt-6 flex items-center gap-3">
                {[
                  { Icon: Facebook, label: "Facebook", href: "#" },
                  { Icon: Twitter, label: "Twitter", href: "#" },
                  { Icon: Linkedin, label: "LinkedIn", href: "#" },
                  { Icon: Instagram, label: "Instagram", href: "#" },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="
                      w-10 h-10 rounded-full inline-flex items-center justify-center
                      border border-gray-200 bg-white/60
                      hover:bg-white transition
                      dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
                    "
                  >
                    <Icon size={18} className="text-gray-700 dark:text-white/70" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
              <span className="inline-block border-b-2 pb-1 pr-4" style={{ borderColor: accentColor }}>
                Navegación
              </span>
            </h3>

            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900
                               dark:text-white/65 dark:hover:text-white transition-colors"
                  >
                    <ArrowRight size={14} className="opacity-60 group-hover:opacity-100" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
              <span className="inline-block border-b-2 pb-1 pr-4" style={{ borderColor: accentColor }}>
                Servicios
              </span>
            </h3>

            <ul className="space-y-3">
              {services.slice(0, 6).map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900
                               dark:text-white/65 dark:hover:text-white transition-colors"
                  >
                    <ArrowRight size={14} className="opacity-60 group-hover:opacity-100" />
                    {s}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#services"
              className="
                mt-5 inline-flex items-center gap-2 text-xs font-semibold
                text-gray-900 dark:text-white
                border rounded-full px-3 py-2
                border-gray-200 bg-white/60 hover:bg-white
                dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10
                transition
              "
            >
              Ver todos los servicios <ArrowRight size={14} />
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
              <span className="inline-block border-b-2 pb-1 pr-4" style={{ borderColor: accentColor }}>
                Contacto
              </span>
            </h3>

            <div className="space-y-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 text-sm text-gray-600 hover:text-gray-900
                           dark:text-white/65 dark:hover:text-white transition-colors"
                title="Abrir en Google Maps"
              >
                <MapPin size={18} className="mt-0.5 opacity-70 group-hover:opacity-100" />
                <div className="leading-relaxed">
                  {addressLines.map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                  <div className="mt-1 text-[12px] opacity-70">Abrir en Google Maps</div>
                </div>
              </a>

              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="group flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900
                           dark:text-white/65 dark:hover:text-white transition-colors"
              >
                <Phone size={18} className="opacity-70 group-hover:opacity-100" />
                <span>{phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900
                           dark:text-white/65 dark:hover:text-white transition-colors break-all"
              >
                <Mail size={18} className="opacity-70 group-hover:opacity-100" />
                <span>{email}</span>
              </a>

              <a
                href="#contact"
                className="
                  inline-flex items-center justify-center
                  mt-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
                  hover:brightness-110 transition
                "
                style={{ backgroundColor: accentColor }}
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-white/45">
              © {year} DPI - Diseño Planeación Integral S.A. de C.V. Todos los derechos reservados.
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-white/45">
              {["Política de Privacidad", "Términos y Condiciones", "Aviso Legal"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
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
