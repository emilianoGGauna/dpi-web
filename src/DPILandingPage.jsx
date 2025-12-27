import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import ThemeToggle from "./components/ui/ThemeToggle";

import HomeSection from "./components/sections/HomeSection";
import AboutSection from "./components/sections/AboutSection";
import WhyDPISection from "./components/sections/WhyDPISection";
import ServicesSection from "./components/sections/ServicesSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import MethodologySection from "./components/sections/MethodologySection";
import ClientsSection from "./components/sections/ClientsSection";
import ContactSection from "./components/sections/ContactSection";


export default function DPILandingPage({
  headline = "Soluciones estratégicas para inversiones inmobiliarias exitosas",
  subtitle = "Transformamos ideas en proyectos rentables mediante planeación urbana, análisis financiero y desarrollo inmobiliario",
  ctaText = "Agenda una asesoría",
  accentColor = "#C0392B",
  secondaryColor = "#2C3E50",

  showAboutSection = true,
  showWhyDPISection = true,
  showServicesSection = true,
  showProjectsSection = true,
  showMethodologySection = true,
  showClientsSection = true,
  showContactSection = true,
  showFooter = true,
  showTestimonials = true,
}) {
  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        transition-colors duration-300
      "
    >
      {/* DARK MODE TOGGLE */}
      <ThemeToggle />

      {/* HEADER */}
      <Header
        ctaText={ctaText}
        logoText="DPI"
        accentColor={accentColor}
      />

      {/* HERO */}
      <HomeSection
        headline={headline}
        subtitle={subtitle}
        ctaText={ctaText}
        accentColor={accentColor}
      />

      {/* ABOUT */}
      {showAboutSection && <AboutSection accentColor={accentColor} />}

      {/* SERVICES */}
      {showServicesSection && <ServicesSection accentColor={accentColor} />}

      {/* WHY DPI */}
      {showWhyDPISection && (
        <WhyDPISection
          accentColor={accentColor}
          secondaryColor={secondaryColor}
        />
      )}

      {/* METHODOLOGY */}
      {showMethodologySection && (
        <MethodologySection accentColor={accentColor} />
      )}

      {/* PROJECTS */}
      {showProjectsSection && (
        <ProjectsSection accentColor={accentColor} />
      )}

      {/* CLIENTS */}
      {showClientsSection && (
        <ClientsSection
          accentColor={accentColor}
          showTestimonials={showTestimonials}
        />
      )}

      {/* CONTACT */}
      {showContactSection && (
        <ContactSection accentColor={accentColor} />
      )}

      {/* FOOTER */}
      {showFooter && <Footer accentColor={accentColor} />}
    </div>
  );
}
