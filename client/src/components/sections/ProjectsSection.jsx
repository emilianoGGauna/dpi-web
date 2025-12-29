import { useState } from "react";
import { MapPin, Search, ChevronDown, Filter } from "lucide-react";
import ImageWithFallback from "../ui/ImageWithFallback";

export default function ProjectsSection({ accentColor = "#C0392B" }) {
  const IMG_API = import.meta.env.VITE_IMAGES_API_BASE || "http://localhost:8080";

  const allProjects = [
    {
      id: 1,
      title: "Parque Empresarial Santa Fe",
      type: "Uso mixto / Oficinas",
      location: "Ciudad de México",
      role: "Planeación Urbana y Gestión",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 2,
      title: "Residencial Altavista",
      type: "Vivienda Vertical",
      location: "Monterrey",
      role: "Desarrollo Inmobiliario",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 3,
      title: "Centro Comercial La Marina",
      type: "Retail",
      location: "Guadalajara",
      role: "Estudio de Viabilidad y Uso de Suelo",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 4,
      title: "Corredor Logístico Norte",
      type: "Industrial",
      location: "Querétaro",
      role: "Proyecto Llave en Mano",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 5,
      title: "Distrito Urbano Reforma",
      type: "Regeneración Urbana",
      location: "Ciudad de México",
      role: "Master Plan y Gestión",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 6,
      title: "Hotel Riviera",
      type: "Hospitalidad",
      location: "Cancún",
      role: "Consultoría Integral",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 7,
      title: "Parque Industrial Toluca",
      type: "Industrial",
      location: "Toluca",
      role: "Planeación y Desarrollo",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 8,
      title: "Torre Ejecutiva Polanco",
      type: "Oficinas",
      location: "Ciudad de México",
      role: "Gestión y Desarrollo",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 9,
      title: "Conjunto Residencial Los Pinos",
      type: "Vivienda Vertical",
      location: "Puebla",
      role: "Desarrollo Inmobiliario",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 10,
      title: "Centro Corporativo Valle",
      type: "Uso mixto / Oficinas",
      location: "Monterrey",
      role: "Consultoría Integral",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 11,
      title: "Plaza Comercial El Dorado",
      type: "Retail",
      location: "León",
      role: "Estudio de Viabilidad y Desarrollo",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
    {
      id: 12,
      title: "Eco Residencial Bosque Real",
      type: "Vivienda Horizontal",
      location: "Ciudad de México",
      role: "Master Plan y Gestión",
      img: `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg`,
    },
  ];


  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const projectTypes = [
    ...new Set(allProjects.map((p) => p.type.split("/")[0].trim())),
  ];
  const projectLocations = [
    ...new Set(allProjects.map((p) => p.location)),
  ];

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch =
      searchTerm === "" ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "" || project.type.includes(typeFilter);
    const matchesLocation =
      locationFilter === "" || project.location === locationFilter;

    return matchesSearch && matchesType && matchesLocation;
  });

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + 6, filteredProjects.length)
    );
  };

  return (
    <section
      id="projects"
      className="
        py-16 md:py-24 
        bg-[#F4F5F7] dark:bg-[#121212]
        transition-colors duration-300
      "
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Proyectos
        </h2>

        <div
          className="w-20 h-1.5 mx-auto mb-8"
          style={{ backgroundColor: accentColor }}
        />

        {/* FILTER BOX */}
        <div
          className="
            bg-white dark:bg-[#1A1A1A] 
            rounded-lg shadow-sm p-4 mb-8
            border border-gray-200 dark:border-gray-700
            transition-colors duration-300
          "
        >

          <div className="flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <div className="flex-grow md:max-w-md relative">
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full px-4 py-2.5 pl-10 rounded-md
                  border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-[#2A2A2A]
                  text-gray-900 dark:text-gray-200
                  focus:outline-none focus:ring-2 
                  focus:ring-gray-200 dark:focus:ring-gray-700
                  transition-colors duration-300
                "
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
            </div>

            {/* TYPE FILTER */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="
                px-4 py-2.5 rounded-md
                bg-white dark:bg-[#2A2A2A]
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                transition-colors duration-300
              "
            >
              <option value="">Todos los tipos</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* LOCATION FILTER */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="
                px-4 py-2.5 rounded-md
                bg-white dark:bg-[#2A2A2A]
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                transition-colors duration-300
              "
            >
              <option value="">Todas las ubicaciones</option>
              {projectLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* CLEAR FILTERS */}
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("");
                setLocationFilter("");
              }}
              className="
                px-4 py-2.5 rounded-md
                bg-white dark:bg-[#2A2A2A]
                border border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-[#333]
                transition-colors duration-300
              "
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* FILTER SUMMARY */}
        <div className="mb-6 text-gray-600 dark:text-gray-300 flex items-center">
          <Filter size={16} className="mr-2" />
          Mostrando {visibleProjects.length} de {filteredProjects.length} proyectos
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProjects.map((p) => (
            <div
              key={p.id}
              className="
                relative group rounded-lg overflow-hidden shadow-md
                bg-white dark:bg-[#1A1A1A]
                border border-gray-200 dark:border-gray-700
                transition-colors duration-300
              "
            >
              <ImageWithFallback
                src={p.img}
                alt={p.title}
                className="w-full h-64 object-cover"
              />

              {/* HOVER OVERLAY */}
              <div className="
                absolute inset-0 bg-black/60 
                opacity-0 group-hover:opacity-100
                transition-opacity flex flex-col justify-end p-6
              ">
                <h3 className="text-white text-lg font-semibold">
                  {p.title}
                </h3>
                <p className="text-gray-200 text-sm">{p.type}</p>
                <p className="text-gray-200 text-sm italic">{p.role}</p>
                <p className="text-gray-200 text-sm mt-1">
                  <MapPin size={14} className="inline mr-1" />
                  {p.location}
                </p>

                <div
                  className="mt-2 h-0.5 w-16"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {filteredProjects.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="
                inline-flex items-center px-6 py-3 rounded-md border
                bg-white dark:bg-[#2A2A2A]
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-[#333]
                transition-colors duration-300
              "
            >
              Cargar más proyectos
              <ChevronDown size={16} className="ml-2" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
