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
  headline = "Transformamos ideas en proyectos rentables mediante planeación urbana",
  subtitle = "Acompañamos a inmobiliarias, constructoras y propietarios desde la planeación y el diseño hasta la gestión urbana del proyecto.",
  ctaText = "Contáctanos",
  accentColor = "#C0392B",
  secondaryColor = "#2C3E50",

  showAboutSection = true,
  showWhyDPISection = false,
  showServicesSection = true,
  showProjectsSection = true,
  showMethodologySection = true,
  showClientsSection = true,
  showContactSection = true,
  showFooter = true,
  showTestimonials = true,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Theme toggle (styled + accent border) */}
      <ThemeToggle accentColor={accentColor} />

      {/* Header */}
      <Header ctaText={ctaText} logoText="DPI" accentColor={accentColor} />

      {/* Hero */}
      <HomeSection
        headline={headline}
        subtitle={subtitle}
        ctaText={ctaText}
        accentColor={accentColor}
      />

      {/* About */}
      {showAboutSection && <AboutSection accentColor={accentColor} />}

      {/* Services */}
      {showServicesSection && <ServicesSection accentColor={accentColor} />}


      {showProjectsSection && <ProjectsSection accentColor={accentColor} />}

      {/* Why DPI */}
      {showWhyDPISection && (
        <WhyDPISection
          accentColor={accentColor}
          secondaryColor={secondaryColor}
        />
      )}

      {/* Methodology */}
      {showMethodologySection && (
        <MethodologySection accentColor={accentColor} />
      )}
      
      {/* Contact */}
      {showContactSection && <ContactSection accentColor={accentColor} />}

      {/* Clients */}
      {showClientsSection && (
        <ClientsSection
          accentColor={accentColor}
          showTestimonials={showTestimonials}
        />
      )}

      {/* Footer */}
      {showFooter && <Footer accentColor={accentColor} />}
    </div>
  );
}
