import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ThemeToggle from "./components/ui/ThemeToggle";
import HomeSection from "./components/sections/HomeSection";
import AboutSection from "./components/sections/AboutSection";
import ServicesSection from "./components/sections/ServicesSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import MethodologySection from "./components/sections/MethodologySection";
import ClientsSection from "./components/sections/ClientsSection";
import ContactSection from "./components/sections/ContactSection";

export default function DPILandingPage({
  headline = "Transformamos ideas en proyectos rentables mediante planeación urbana",
  subtitle = "Acompañamos a inmobiliarias, constructoras y propietarios desde la planeación y el diseño hasta la gestión urbana del proyecto.",
  ctaText = "Contáctanos",
  accentColor = "#D4B06A",
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070a10] text-gray-100">
      <ThemeToggle accentColor={accentColor} />
      <Header ctaText={ctaText} logoText="DPI" accentColor={accentColor} />

      <main>
        <HomeSection headline={headline} subtitle={subtitle} ctaText={ctaText} accentColor={accentColor} />
        <AboutSection accentColor={accentColor} />
        <ServicesSection accentColor={accentColor} />
        <ProjectsSection accentColor={accentColor} />
        <MethodologySection accentColor={accentColor} />
        <ClientsSection accentColor={accentColor} showTestimonials />
        <ContactSection accentColor={accentColor} />
      </main>

      <Footer accentColor={accentColor} />
    </div>
  );
}
