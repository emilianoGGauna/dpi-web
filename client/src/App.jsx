import { useEffect, useState } from "react";
import DPILandingPage from "./DPILandingPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ThemeToggle from "./components/ui/ThemeToggle";
import ProjectsSection from "./components/sections/ProjectsSection";
import ServicesSection from "./components/sections/ServicesSection";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

const ACCENT = "#D4B06A";

function usePathname() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const target = new URL(href, window.location.origin);
      event.preventDefault();
      const nextPath = target.pathname;
      const nextHash = target.hash;
      window.history.pushState({}, "", `${nextPath}${nextHash}`);
      setPath(nextPath);
      if (nextHash) {
        requestAnimationFrame(() => {
          document.querySelector(nextHash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return path;
}

function InternalPage({ children }) {
  return (
    <div className="min-h-screen bg-[#070a10] text-white">
      <ThemeToggle accentColor={ACCENT} />
      <Header accentColor={ACCENT} />
      {children}
      <Footer accentColor={ACCENT} />
    </div>
  );
}

export default function App() {
  const pathname = usePathname();
  const projectMatch = pathname.match(/^\/proyectos\/([^/]+)$/);
  const serviceMatch = pathname.match(/^\/servicios\/([^/]+)$/);

  if (pathname === "/") return <DPILandingPage accentColor={ACCENT} />;

  if (pathname === "/proyectos") {
    return (
      <InternalPage>
        <ProjectsSection />
      </InternalPage>
    );
  }

  if (pathname === "/servicios") {
    return (
      <InternalPage>
        <ServicesSection />
      </InternalPage>
    );
  }

  if (projectMatch) {
    return (
      <InternalPage>
        <ProjectDetailPage slug={projectMatch[1]} />
      </InternalPage>
    );
  }

  if (serviceMatch) {
    return (
      <InternalPage>
        <ServiceDetailPage slug={serviceMatch[1]} />
      </InternalPage>
    );
  }

  return (
    <InternalPage>
      <NotFoundPage />
    </InternalPage>
  );
}
