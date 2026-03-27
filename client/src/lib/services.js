import { toSlug } from "./projects";

export const SERVICE_DEFINITIONS = [
  {
    id: "planeacion-urbana",
    title: "Planeación urbana",
    overview: "Planes maestros para estructurar crecimiento, conectividad y valor urbano sostenible.",
    keywords: ["planeacion urbana", "gestion urbana", "urbanizacion"],
  },
  {
    id: "estudios-viabilidad",
    title: "Estudios de viabilidad",
    overview: "Evaluación normativa, comercial y financiera para decisiones de inversión más seguras.",
    keywords: ["viabilidad", "desarrollo inmobiliario"],
  },
  {
    id: "estudios-movilidad",
    title: "Estudios de movilidad",
    overview: "Diagnóstico de tránsito y accesibilidad para proyectos urbanos de alto impacto.",
    keywords: ["movilidad", "integracion urbana"],
  },
  {
    id: "uso-suelo-normatividad",
    title: "Uso de suelo y normatividad",
    overview: "Estrategia regulatoria para alinear uso permitido, densidades y permisos.",
    keywords: ["uso de suelo", "normatividad", "gestion urbana"],
  },
  {
    id: "desarrollo-llave-mano",
    title: "Desarrollo inmobiliario llave en mano",
    overview: "Coordinación integral de planeación, gestión y ejecución para proyectos completos.",
    keywords: ["desarrollo inmobiliario", "llave en mano", "viabilidad"],
  },
];

function normalizeTag(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function inferServiceId(project) {
  const hints = Array.isArray(project.serviceHints) ? project.serviceHints : [];
  if (hints.length) {
    const direct = SERVICE_DEFINITIONS.find((service) => hints.includes(service.id));
    if (direct) return direct.id;
  }

  const searchPool = [project.category, project.status, ...(project.tags || [])]
    .map(normalizeTag)
    .join(" ");

  const byKeyword = SERVICE_DEFINITIONS.find((service) =>
    service.keywords.some((keyword) => searchPool.includes(normalizeTag(keyword)))
  );

  return byKeyword?.id || SERVICE_DEFINITIONS[0].id;
}

export function buildServiceCollections(projects = []) {
  const grouped = SERVICE_DEFINITIONS.reduce((acc, service) => {
    acc[service.id] = [];
    return acc;
  }, {});

  projects.forEach((project) => {
    const serviceId = inferServiceId(project);
    grouped[serviceId].push({
      ...project,
      serviceId,
      tags: (project.tags || []).length ? project.tags : [toSlug(project.category).replaceAll("-", " ")],
    });
  });

  return grouped;
}
