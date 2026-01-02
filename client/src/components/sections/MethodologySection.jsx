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

/* -------------------- helpers -------------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(Boolean(mq.matches));
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return reduced;
}

/* Swipe (sin preventDefault / sin warning passive) */
function useSwipe({ onLeft, onRight, disabled }) {
  const ref = useRef({ down: false, x0: 0, y0: 0, dx: 0, dy: 0, t0: 0 });

  const onPointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    ref.current = {
      down: true,
      x0: e.clientX,
      y0: e.clientY,
      dx: 0,
      dy: 0,
      t0: performance.now(),
    };
  };

  const onPointerMove = (e) => {
    if (disabled) return;
    if (!ref.current.down) return;
    ref.current.dx = e.clientX - ref.current.x0;
    ref.current.dy = e.clientY - ref.current.y0;
  };

  const onPointerUp = () => {
    if (disabled) return;
    const s = ref.current;
    ref.current.down = false;

    const absX = Math.abs(s.dx);
    const absY = Math.abs(s.dy);
    const dt = Math.max(1, performance.now() - s.t0);

    const fastEnough = dt < 600;
    const farEnough = absX > 55;
    const mostlyHorizontal = absX > absY * 1.2;

    if (mostlyHorizontal && (farEnough || (fastEnough && absX > 35))) {
      if (s.dx < 0) onLeft?.();
      else onRight?.();
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}

export default function MethodologySection({
  accentColor = "#C0392B",
  autoplayMs = 5000,
  fadeMs = 1000,
}) {
  const reducedMotion = usePrefersReducedMotion();

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

  const total = steps.length;

  const [activeIdx, setActiveIdx] = useState(0);

  // ✅ pausa temporal por interacción, luego reanuda sola
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const pauseFor = (ms = 1500) => {
    setPaused(true);
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), ms);
  };

  // ✅ animación simple: oculto instantáneo -> fade-in
  const [entered, setEntered] = useState(true);

  const clampIdx = (i) => {
    if (!total) return 0;
    return (i + total) % total;
  };

  const goNext = () => setActiveIdx((i) => clampIdx(i + 1));
  const goPrev = () => setActiveIdx((i) => clampIdx(i - 1));

  // Autoplay robusto
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (reducedMotion) return;
    if (paused) return;
    if (total < 2) return;

    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => clampIdx(i + 1));
    }, Math.max(1200, Number(autoplayMs) || 5000));

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [paused, reducedMotion, total, autoplayMs]);

  // Fade-in on change
  useEffect(() => {
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [activeIdx]);

  // Limpieza timers al desmontar
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const step = total ? steps[activeIdx] : null;
  const Icon = step?.icon || Users;

  const onSelect = (i) => {
    pauseFor(Math.max(1500, autoplayMs + 600));
    setActiveIdx(clampIdx(i));
  };

  const swipe = useSwipe({
    onLeft: () => {
      pauseFor(1200);
      goNext();
    },
    onRight: () => {
      pauseFor(1200);
      goPrev();
    },
    disabled: total < 2,
  });

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      pauseFor(1200);
      goPrev();
    }
    if (e.key === "ArrowRight") {
      pauseFor(1200);
      goNext();
    }
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
        {total > 1 && (
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
        )}

        {/* Card (swipe enabled) */}
        <div
          className={[
            "rounded-2xl overflow-hidden",
            "shadow-[0_10px_40px_rgba(0,0,0,0.18)]",
            cardBg,
            border,
          ].join(" ")}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            // pausa mientras empieza a interactuar
            pauseFor(1500);
            swipe.onPointerDown(e);
          }}
          onPointerMove={swipe.onPointerMove}
          onPointerUp={swipe.onPointerUp}
          onPointerCancel={swipe.onPointerUp}
          style={{ touchAction: "pan-y" }}
          role="group"
          aria-label="Tarjeta de metodología (desliza izquierda/derecha para cambiar)"
        >
          <div className="h-1" style={{ backgroundColor: `${accentColor}CC` }} />

          <div className="p-6 sm:p-7">
            {step ? (
              <div
                className={[
                  "transition-[opacity,transform] ease-out",
                  entered
                    ? `opacity-100 translate-y-0 duration-[${fadeMs}ms]`
                    : "opacity-0 translate-y-2 duration-0",
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
                          Paso {activeIdx + 1} / {total}
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

                    <div className={`mt-5 text-xs ${mutedText}`}>
                      Tip: puedes <span className="font-semibold">deslizar</span> (izq/der) o usar los{" "}
                      <span className="font-semibold">puntos</span>.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-sm ${mutedText}`}>No hay pasos para mostrar.</div>
            )}
          </div>

          {/* Arrows (opcional pero útil en mobile) */}
          {total > 1 && (
            <div className="px-6 sm:px-7 pb-6 -mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  pauseFor(1200);
                  goPrev();
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white/80 hover:brightness-105 transition"
                aria-label="Paso anterior"
                title="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => {
                  pauseFor(1200);
                  goNext();
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white/80 hover:brightness-105 transition"
                aria-label="Paso siguiente"
                title="Siguiente"
              >
                ›
              </button>
            </div>
          )}
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
