import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Header({ 
  ctaText = "Agenda una asesoría",
  logoText = "DPI",
  accentColor = "#C0392B"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Change header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation menu items
  const navLinks = [
    { name: "Inicio", href: "#" },
    { name: "Quiénes Somos", href: "#about" },
    { name: "Servicios", href: "#services" },
    { name: "Por qué DPI", href: "#why-dpi" },
    { name: "Metodología", href: "#methodology" },
    { name: "Proyectos", href: "#projects" },
    { name: "Clientes", href: "#clients" },
    { name: "Contacto", href: "#contact" },
  ];

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "shadow-md bg-white/90 dark:bg-[#1C1C1C]/90 backdrop-blur-md"
          : "bg-white dark:bg-[#1C1C1C]"
        }
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* LOGO */}
          <div className="flex items-center select-none">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: accentColor }}
            >
              {logoText}
            </span>

            <span className="ml-2 text-xl font-light text-gray-800 dark:text-gray-200">
              Diseño Planeación Integral
            </span>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="
                  text-gray-800 dark:text-gray-200
                  hover:text-[#C0392B] dark:hover:text-[#E74C3C]
                  transition-colors duration-200 font-medium text-sm
                "
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden md:block">
            <a
              href="#contact"
              className="
                inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                rounded-md text-white shadow-sm hover:brightness-110 transition-all
              "
              style={{ backgroundColor: accentColor }}
            >
              {ctaText}
            </a>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden">
            <button
              type="button"
              className="
                inline-flex items-center justify-center p-2 rounded-md
                text-gray-800 dark:text-gray-100
                hover:bg-gray-100 dark:hover:bg-[#2a2a2a]
                transition
              "
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 py-3 bg-white dark:bg-[#1C1C1C] shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="
                block px-3 py-2 rounded-md
                text-base font-medium
                text-gray-800 dark:text-gray-100
                hover:bg-gray-100 dark:hover:bg-[#2c2c2c]
                transition
              "
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}

          {/* MOBILE CTA */}
          <div className="mt-3 px-3 py-2">
            <a
              href="#contact"
              className="
                block text-center px-4 py-2 text-sm font-medium
                rounded-md text-white shadow-sm hover:brightness-110 transition-all
              "
              style={{ backgroundColor: accentColor }}
              onClick={() => setIsOpen(false)}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
