import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";
import { getImagesApiBase } from "../../lib/imageApi";

function shouldShowCategory(project) {
  return project?.category && project?.category !== project?.title;
}

export default function ProjectsSection({ accentColor = "#C0392B" }) {
  const IMG_API = getImagesApiBase();
  const PROJECTS_URL = `${IMG_API}/api/projects`;

  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(PROJECTS_URL, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Se esperaba un arreglo de proyectos.");
        setProjects(data.filter((p) => p?.images?.length));
        setStatus("ready");
      } catch (e) {
        if (e?.name === "AbortError") return;
        setStatus("error");
        setErrorMsg(`No se pudo cargar /api/projects (${e?.message || "error"}).`);
      }
    }
    load();
    return () => controller.abort();
  }, [PROJECTS_URL]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setSelectedProject(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchTerm, categoryFilter]);

  return (
    <section id="projects" className="py-16 md:py-24 bg-[#F4F5F7] dark:bg-[#0B0C10] scroll-mt-[96px] md:scroll-mt-[112px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Proyectos</h2>
          <div className="w-20 h-1.5 mx-auto mt-5 rounded" style={{ backgroundColor: accentColor }} />
        </div>

        <div className="bg-white/90 dark:bg-[#101114]/85 rounded-2xl border border-gray-200 dark:border-white/10 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por proyecto o categoría" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
              <option value="">Todas las categorías</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {status === "error" && <div className="text-red-500">{errorMsg}</div>}
        {status === "ready" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <button key={p.id} type="button" onClick={() => { setSelectedProject(p); setActiveImageIdx(0); }} className="text-left rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101114] shadow-sm hover:shadow-lg transition">
                <div className="h-56">
                  <ImageWithFallback src={p.images[0]?.url} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  {shouldShowCategory(p) && <p className="text-sm text-gray-500 dark:text-white/65 mt-1">{p.category}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 md:p-8" role="dialog" aria-modal="true" aria-label={`Galería de ${selectedProject.title}`}>
          <div className="max-w-6xl mx-auto bg-white dark:bg-[#101114] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <div><h3 className="font-semibold text-lg dark:text-white">{selectedProject.title}</h3>{shouldShowCategory(selectedProject) && <p className="text-sm text-gray-500 dark:text-white/65">{selectedProject.category}</p>}</div>
              <button onClick={() => setSelectedProject(null)} aria-label="Cerrar galería" className="p-2 rounded-lg border border-gray-200 dark:border-white/10"><X size={18} /></button>
            </div>
            <div className="p-4 grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3 rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 min-h-[300px]">
                <ImageWithFallback src={selectedProject.images[activeImageIdx]?.url} alt={selectedProject.title} className="w-full h-full object-contain max-h-[70vh] mx-auto" />
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto">
                {selectedProject.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImageIdx(i)} className={`rounded-lg overflow-hidden border ${i === activeImageIdx ? "border-red-500" : "border-gray-200 dark:border-white/10"}`}>
                    <ImageWithFallback src={img.url} alt="Vista previa" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
