// MethodologySection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  FileText,
  Clock,
  LineChart,
  Layers,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function MethodologySection({ accentColor = "#C0392B" }) {
  const INTERVAL_MS = 5000; // cambia cada 5s
  const FADE_MS = 1000; // ✅ transición simple 1s (solo fade-in)

  const steps = useMemo(
    () => [
      {
        id: "acercamiento",
        title: "Acercamiento",
        subtitle: "Conocemos expectativas, resolvemos dudas y alineamos objetivos.",
        icon: Users,
        points: [
          "Reunión de acercamiento para entender visión, prioridades y restricciones.",
          "Aclaración de dudas para definir una solución viable y ejecutable.",
          "Alineación de expectativas: alcance, entregables y criterios de éxito.",
        ],
        meta: ["Kickoff con cliente", "Objetivos y alcance", "Ruta inicial"],
      },
      {
        id: "expediente",
        title: "Expediente único",
        subtitle: "El cliente entrega documentos una sola vez para todo el proceso.",
        icon: FileText,
        points: [
          "Recepción de documentos de acreditación de propiedad.",
          "Identificación del promovente y documentación técnica base del predio/proyecto.",
          "Cartas poder del cliente hacia DPI para la gestión y representación ante instancias.",
        ],
        meta: ["Documentos legales", "Documentos técnicos", "Cartas poder"],
      },
      {
        id: "alcances",
        title: "Procesos, alcances y tiempos",
        subtitle: "Definimos etapas, hitos y cronograma (ruta crítica).",
        icon: Clock,
        points: [
          "Presentación de procesos y metodología por materia (urbano, edificación, movilidad, ambiental, riesgo, etc.).",
          "Definición de alcances por etapa y dependencias para una ruta crítica clara.",
          "Cronograma con hitos de revisión, entregas y ventanas de gestión ante autoridad.",
        ],
        meta: ["Ruta crítica", "Hitos", "Cronograma"],
      },
      {
        id: "presupuesto",
        title: "Propuesta de presupuesto",
        subtitle: "Cotizamos por materia y por etapas con claridad de entregables.",
        icon: LineChart,
        points: [
          "Presupuestos por materia: edificación, urbano, movilidad, ambiental y riesgo (y otros insumos requeridos).",
          "Definición de entregables y criterios de aceptación por componente.",
          "Ajuste de propuesta según estrategia, prioridades y secuencia de ejecución.",
        ],
        meta: ["Por materia", "Por etapas", "Entregables"],
      },
      {
        id: "desarrollo",
        title: "Desarrollo técnico",
        subtitle: "Iniciamos trabajos y reportamos avances con retroalimentación.",
        icon: Layers,
        points: [
          "Inicio de trabajos en las diferentes materias (técnica y normativa) con coordinación multidisciplinaria.",
          "Retroalimentación periódica y presentación de avances para alinear decisiones.",
          "Ajustes y optimización según restricciones, riesgos, costos y tiempos.",
          "Conclusión de proyectos o estudios listos para trámite y ejecución.",
        ],
        meta: ["Avances", "Ajustes", "Cierre técnico"],
      },
      {
        id: "gestion",
        title: "Gestión y autorizaciones",
        subtitle: "Tramitamos ante autoridades hasta obtener licencias y resoluciones.",
        icon: FileCheck2,
        points: [
          "Presentación ante autoridades competentes para obtener autorizaciones y licencias.",
          "Atención a observaciones/previsiones y seguimiento hasta la resolución.",
          "Entrega al cliente de autorizaciones obtenidas ante las diferentes instancias.",
        ],
        meta: ["Trámites", "Resoluciones", "Certeza legal"],
      },
      {
        id: "ejecucion",
        title: "Ejecución, supervisión y cierres",
        subtitle: "Acompañamos la obra hasta habitabilidades y licencias finales.",
        icon: ShieldCheck,
        points: [
          "Inicio de la edificación o urbanización conforme al proyecto autorizado.",
          "Supervisión de avances y congruencia con proyecto y autorizaciones (DRO, DRU y EGR).",
          "Conclusión de acciones de edificación/urbanización y habitabilidades.",
          "Recepción de obra de urbanización y licencias de giro (cuando aplique).",
        ],
        meta: ["Supervisión", "Cierres", "Operación"],
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        title: "Presupuesto claro",
        text: "Cotización por materia y por etapas, con alcance y entregables definidos.",
        icon: TrendingUp,
      },
      {
        title: "Menos tiempos",
        text: "Ruta crítica + coordinación para evitar retrabajos, fricción y atrasos.",
        icon: Clock,
      },
      {
        title: "Certeza legal",
        text: "Gestión ante autoridad + congruencia en obra y cierres con supervisión.",
        icon: ShieldCheck,
      },
    ],
    []
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // ✅ animación simple: oculto instantáneo -> fade-in 1s (sin “doble transición”)
  const [entered, setEntered] = useState(true);

  const intervalRef = useRef(null);

  // autoplay (no se reinicia por cada render)
  useEffect(() => {
    if (!autoPlay) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % steps.length);
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [autoPlay, steps.length]);

  // fade-in 1s SOLO UNA VEZ por cambio
  useEffect(() => {
    setEntered(false); // oculta instantáneo
    const raf = requestAnimationFrame(() => setEntered(true)); // entra con fade 1s
    return () => cancelAnimationFrame(raf);
  }, [activeIdx]);

  const step = steps[activeIdx];
  const Icon = step.icon;

  const onSelect = (i) => {
    setAutoPlay(false); // ✅ si el usuario clickea, se fija y no rota
    setActiveIdx(i);
  };

  const sectionBg = "bg-gray-50 dark:bg-[#0B0C10]";
  const cardBg = "bg-white dark:bg-[#101114]";
  const border = "border border-gray-200 dark:border-white/10";
  const titleText = "text-gray-900 dark:text-white";
  const mutedText = "text-gray-600 dark:text-white/70";

  return (
    <section
      id="methodology"
      className={`py-16 md:py-24 ${sectionBg} transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold ${titleText}`}>
            Metodología de Trabajo
          </h2>
          <div
            className="w-20 h-1 mx-auto mt-4 rounded"
            style={{ backgroundColor: accentColor }}
          />
          <p className={`mt-4 text-sm sm:text-base ${mutedText} max-w-3xl mx-auto`}>
            Proceso estructurado: expediente único, presupuestos por materia, gestión de permisos y
            acompañamiento hasta la ejecución.
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(i)}
                className="rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-white/20 focus:ring-black/10"
                style={{
                  width: isActive ? 34 : 10,
                  height: 10,
                  backgroundColor: isActive ? accentColor : "rgba(148,163,184,0.45)",
                }}
                aria-label={`Ir al paso ${i + 1}: ${s.title}`}
                title={`Paso ${i + 1}: ${s.title}`}
              />
            );
          })}
        </div>

        {/* Card */}
        <div
          className={[
            "rounded-2xl overflow-hidden",
            "shadow-[0_10px_40px_rgba(0,0,0,0.18)]",
            cardBg,
            border,
          ].join(" ")}
        >
          {/* top accent */}
          <div className="h-1" style={{ backgroundColor: `${accentColor}CC` }} />

          <div className="p-6 sm:p-7">
            <div
              className={[
                "transition-[opacity,transform] ease-out",
                entered ? `opacity-100 translate-y-0 duration-[${FADE_MS}ms]` : "opacity-0 translate-y-2 duration-0",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-200/50 dark:border-white/10"
                  style={{ backgroundColor: `${accentColor}18` }}
                >
                  <Icon size={20} style={{ color: accentColor }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <div className={`text-lg sm:text-xl font-semibold ${titleText}`}>
                        {step.title}
                      </div>
                      <div className={`mt-1 text-sm ${mutedText}`}>{step.subtitle}</div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <span className="shrink-0 text-xs px-3 py-1 rounded-full border border-gray-200/60 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/70">
                        Paso {activeIdx + 1} / {steps.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.meta.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-3 py-1 rounded-full border border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/70"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <ul className={`mt-5 space-y-2 text-sm ${mutedText} leading-relaxed`}>
                    {step.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span
                          className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  {!autoPlay && (
                    <div className={`mt-5 text-xs ${mutedText}`}>
                      Tip: si quieres reactivar el auto-rotado, cambia <code>autoPlay</code> a{" "}
                      <code>true</code> (o agrega un botón “Reanudar”).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#101114]/70 backdrop-blur p-6 sm:p-7">
          <div className={`text-lg font-semibold ${titleText}`}>
            Beneficios de esta metodología
          </div>
          <div className={`mt-1 text-sm ${mutedText}`}>
            Menos fricción, más claridad y mayor certeza en cada etapa.
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <BenefitCard key={b.title} benefit={b} accentColor={accentColor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ benefit, accentColor }) {
  const Icon = benefit.icon;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#101114] p-5 shadow-sm">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center border border-gray-200/60 dark:border-white/10"
        style={{ backgroundColor: `${accentColor}18` }}
      >
        <Icon size={18} style={{ color: accentColor }} />
      </div>

      <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
        {benefit.title}
      </div>
      <div className="mt-1 text-sm text-gray-600 dark:text-white/70 leading-relaxed">
        {benefit.text}
      </div>
    </div>
  );
}
