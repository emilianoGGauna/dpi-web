import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import logoSvg from "../../assets/logo.svg";

export default function Header({ logoText = "DPI", accentColor = "#D4B06A" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  const isHome = window.location.pathname === "/";
  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: isHome ? "#services" : "/servicios" },
    { name: "Proyectos", href: isHome ? "#projects" : "/proyectos" },
    { name: "Metodología", href: isHome ? "#methodology" : "/#methodology" },
    { name: "Contacto", href: isHome ? "#contact" : "/#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (event) => {
      if (panelRef.current?.contains(event.target) || btnRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-[#090d14]/85 backdrop-blur-xl" : "bg-[#090d14]"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="DPI inicio">
            <div className="h-10 w-10 rounded-2xl border border-white/15 bg-white/[0.03] flex items-center justify-center">
              <img src={logoSvg} alt="DPI" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold" style={{ color: accentColor }}>{logoText}</div>
              <div className="text-[11px] text-white/60">Diseño y Planeación Integral</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm text-white/80 hover:text-[#e9cd8f] transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <button ref={btnRef} type="button" onClick={() => setIsOpen((value) => !value)} className="lg:hidden h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-white flex items-center justify-center" aria-label="Toggle menu">
            {isOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div ref={panelRef} className="lg:hidden absolute top-full right-4 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0d121b]/95 p-3 backdrop-blur-xl shadow-2xl">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10">
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
