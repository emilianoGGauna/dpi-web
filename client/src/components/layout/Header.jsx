import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import logoSvg from "../../assets/logo.svg";

export default function Header({
  logoText = "DPI",
  accentColor = "#C0392B",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // ✅ Contacto ANTES que Clientes + sin "Por qué DPI"
  const navLinks = useMemo(
    () => [
      { name: "Inicio", href: "#" },
      { name: "Quiénes Somos", href: "#about" },
      { name: "Proyectos", href: "#projects" },
      { name: "Servicios", href: "#services" },
      { name: "Metodología", href: "#methodology" },
      { name: "Contacto", href: "#contact" },
      { name: "Clientes", href: "#clients" },
    ],
    []
  );

  // Change header background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const onDown = (e) => {
      const panel = panelRef.current;
      const btn = btnRef.current;
      if (!panel || !btn) return;

      const t = e.target;
      if (panel.contains(t) || btn.contains(t)) return;

      setIsOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [isOpen]);

  return (
    <header
      style={{ ["--accent"]: accentColor }}
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-[#0B0C10]/80 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.14)] border-b border-black/5 dark:border-white/10"
          : "bg-white dark:bg-[#0B0C10] border-b border-black/0 dark:border-white/0",
      ].join(" ")}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="#"
            className="flex items-center gap-3 select-none group"
            aria-label="DPI - Inicio"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-center overflow-hidden">
                <img src={logoSvg} alt="DPI" className="h-6 w-6" draggable={false} />
              </div>
              <div
                className="absolute -inset-1 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  boxShadow: `0 0 0 2px ${accentColor}22, 0 14px 40px rgba(0,0,0,0.18)`,
                }}
              />
            </div>

            <div className="leading-tight">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-lg md:text-xl font-semibold tracking-tight"
                  style={{ color: accentColor }}
                >
                  {logoText}
                </span>
                <span className="text-[12px] md:text-sm font-medium text-gray-900 dark:text-white/90">
                  Diseño Planeación Integral
                </span>
              </div>

              <div className="text-[11px] md:text-[12px] text-gray-600 dark:text-white/55">
                Consultoría urbana • Gestión • Desarrollo
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={[
                  "text-sm font-medium",
                  "text-gray-800 dark:text-white/80",
                  "hover:text-[color:var(--accent)] dark:hover:text-[color:var(--accent)]",
                  "transition-colors",
                ].join(" ")}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            ref={btnRef}
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:bg-black/[0.03] dark:hover:bg-white/10 transition lg:hidden"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-5 w-5 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="h-5 w-5 text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown (compact, sin CTA rojo) */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/45" />

          <div
            ref={panelRef}
            className={[
              "fixed z-[60]",
              "top-[72px] md:top-[84px] right-4",
              "w-[min(92vw,360px)]",
              "rounded-2xl overflow-hidden",
              "border border-black/10 dark:border-white/10",
              "bg-white/95 dark:bg-[#101114]/95 backdrop-blur-xl",
              "shadow-[0_18px_80px_rgba(0,0,0,0.35)]",
            ].join(" ")}
            role="dialog"
            aria-label="Menú"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 pb-3 border-b border-black/5 dark:border-white/10">
                <div className="h-9 w-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-center">
                  <img src={logoSvg} alt="DPI" className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold" style={{ color: accentColor }}>
                      {logoText}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white/90 truncate">
                      Diseño Planeación Integral
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-white/55">
                    Planeación y gestión urbana integral.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="ml-auto h-9 w-9 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/10 transition flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4 text-gray-900 dark:text-white" />
                </button>
              </div>

              <div className="pt-3">
                <div className="grid gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={[
                        "px-3 py-2 rounded-xl",
                        "text-sm font-semibold",
                        "text-gray-900 dark:text-white/90",
                        "hover:bg-black/[0.03] dark:hover:bg-white/10",
                        "transition",
                      ].join(" ")}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
