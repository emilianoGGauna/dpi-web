// AboutSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  Scale,
  Building2,
  Leaf,
  Target,
  TrendingUp,
  BadgeCheck,
  Compass,
  Gavel,
  Coins,
  FileCheck2,
  ShieldAlert,
  LineChart,
  DraftingCompass,
  Layers,
  Link2,
  Sparkles,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

/* -----------------------------
   deterministic “random” (stable entropy)
----------------------------- */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/* -----------------------------
   Read-only theme sync (NO toggle here)
   - follows your global theme toggle (dark class / localStorage / OS)
----------------------------- */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const read = () => {
      if (typeof document === "undefined") return false;
      // Primary source of truth: Tailwind dark class
      const hasClass = document.documentElement.classList.contains("dark");
      return hasClass;
    };

    const apply = () => setIsDark(read());

    // initial
    apply();

    // observe class changes (so it follows an external toggle instantly)
    let mo;
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      mo = new MutationObserver(() => apply());
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    // follow storage changes (theme stored elsewhere)
    const onStorage = (e) => {
      if (e.key !== "theme") return;
      apply();
    };
    window.addEventListener("storage", onStorage);

    // follow prefers-color-scheme changes if your global toggle uses it
    const mm = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMedia = () => apply();
    mm?.addEventListener?.("change", onMedia);

    return () => {
      window.removeEventListener("storage", onStorage);
      mm?.removeEventListener?.("change", onMedia);
      if (mo) mo.disconnect();
    };
  }, []);

  return isDark;
}

/* -----------------------------
   TopicsSphere3D
   - drag rotate + pinch/wheel zoom
   - tap/click a node to select topic (no collision with rotation)
   - detail panel BELOW the sphere (never overlaps)
   - NO local theme toggle (follows global)
----------------------------- */
function TopicsSphere3D({ accentColor = "#C0392B" }) {
  const isDark = useIsDarkMode();

  const topics = useMemo(
    () => [
      { id: "arquitectura", label: "Arquitectura", desc: "Conceptualización y diseño alineados a normativa, mercado y operación.", icon: DraftingCompass },
      { id: "ingenieria", label: "Ingeniería", desc: "Factibilidad técnica, soluciones estructurales y criterios de eficiencia.", icon: Layers },
      { id: "urbanismo", label: "Urbanismo", desc: "Lectura de ciudad: movilidad, densidad, centralidades y vocación del sitio.", icon: Compass },
      { id: "planeacion", label: "Planeación urbana", desc: "Estrategia de implantación, etapas, usos y compatibilidades para viabilidad.", icon: Building2, primary: true },
      { id: "derecho", label: "Derecho urbano", desc: "Marco normativo: uso de suelo, densidades, restricciones y cumplimiento.", icon: Gavel },
      { id: "economia", label: "Economía", desc: "Análisis de mercado, demanda, escenarios y sensibilidad del proyecto.", icon: Coins },
      { id: "permisos", label: "Gestión de permisos", desc: "Ruta crítica de trámites: coordinación, tiempos, requisitos y mitigación.", icon: FileCheck2 },
      { id: "ambiental", label: "Ambiental y riesgo", desc: "Diagnóstico ambiental, impacto, riesgos y medidas preventivas.", icon: ShieldAlert },
      { id: "viabilidad", label: "Viabilidad financiera", desc: "Modelos, TIR/ROI, costos, ingresos y estrategia para maximizar valor.", icon: LineChart },
      { id: "integral", label: "Proyecto integral", desc: "De la idea a la ejecución: integración técnica, legal y financiera.", icon: BadgeCheck },
    ],
    []
  );

  const edges = useMemo(
    () => [
      ["planeacion", "urbanismo"],
      ["planeacion", "derecho"],
      ["planeacion", "permisos"],
      ["planeacion", "viabilidad"],
      ["planeacion", "arquitectura"],
      ["urbanismo", "arquitectura"],
      ["urbanismo", "ingenieria"],
      ["derecho", "permisos"],
      ["ambiental", "permisos"],
      ["ambiental", "viabilidad"],
      ["economia", "viabilidad"],
      ["economia", "planeacion"],
      ["integral", "planeacion"],
      ["integral", "viabilidad"],
      ["integral", "permisos"],
    ],
    []
  );

  const edgesById = useMemo(() => {
    const m = new Map();
    for (const t of topics) m.set(t.id, new Set());
    for (const [a, b] of edges) {
      m.get(a)?.add(b);
      m.get(b)?.add(a);
    }
    return m;
  }, [topics, edges]);

  const topicById = useMemo(() => {
    const m = new Map();
    topics.forEach((t) => m.set(t.id, t));
    return m;
  }, [topics]);

  // Stable sphere distribution with entropy
  const baseVectors = useMemo(() => {
    const n = topics.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return topics.map((t, i) => {
      const rand = mulberry32(hashString(t.id));
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      let theta = i * goldenAngle;

      theta += (rand() - 0.5) * 1.05;
      const yJ = y + (rand() - 0.5) * 0.22;

      const rJ = Math.sqrt(Math.max(0, 1 - yJ * yJ));
      const x = Math.cos(theta) * rJ + (rand() - 0.5) * 0.14;
      const z = Math.sin(theta) * rJ + (rand() - 0.5) * 0.14;

      const len = Math.hypot(x, yJ, z) || 1;
      return { id: t.id, x: x / len, y: yJ / len, z: z / len };
    });
  }, [topics]);

  const containerRef = useRef(null);
  const { w, h } = useElementSize(containerRef);

  // ACTIVE (user can select, but autoplay continues)
  const [activeId, setActiveId] = useState("planeacion");

  // ALWAYS auto-advance every 3s
  const AUTO_MS = 4200;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setActiveId((prev) => {
        const idx = topics.findIndex((x) => x.id === prev);
        const next = topics[(idx + 1) % topics.length];
        return next?.id || prev;
      });
    }, AUTO_MS);

    return () => window.clearTimeout(id);
  }, [activeId, topics]);


  const activeTopic = topics.find((t) => t.id === activeId) || topics[0];
  const ActiveIcon = activeTopic?.icon;

  const connections = useMemo(() => {
    const set = edgesById.get(activeId);
    if (!set) return [];
    return Array.from(set).map((id) => topicById.get(id)).filter(Boolean);
  }, [activeId, edgesById, topicById]);

  // Rotation + inertia
  const rotRef = useRef({ rx: -10, ry: 18 });
  const velRef = useRef({ vx: 0.0, vy: 0.0 });

  // pinch pointers
  const pointersRef = useRef(new Map());
  const pinchRef = useRef({ startDist: 0, startZoom: 1 });

  // click-vs-drag (select node on tap)
  const dragRef = useRef({
    dragging: false,
    moved: false,
    downNodeId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const pickNodeIdFromEvent = (e) => {
    const el = e.target?.closest?.("[data-node-id]");
    return el?.dataset?.nodeId || null;
  };

  const [isDragging, setIsDragging] = useState(false);

  // Zoom
  const [zoom, setZoom] = useState(1);
  const ZMIN = 0.78;
  const ZMAX = 1.65;
  const setZoomSafe = (z) => setZoom(clamp(z, ZMIN, ZMAX));

  const [renderNodes, setRenderNodes] = useState([]);
  const [renderLines, setRenderLines] = useState([]);

  // Pointer handlers
  const onPointerDownCapture = (e) => {
    const st = dragRef.current;

    setIsDragging(true);

    st.dragging = true;
    st.moved = false;
    st.downNodeId = pickNodeIdFromEvent(e);

    st.startX = e.clientX;
    st.startY = e.clientY;
    st.lastX = e.clientX;
    st.lastY = e.clientY;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // pinch start
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchRef.current.startDist =
        Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      pinchRef.current.startZoom = zoom;
      velRef.current.vx = 0;
      velRef.current.vy = 0;
      st.moved = true; // pinch should never select
    }

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    if (!pointersRef.current.has(e.pointerId)) return;

    const st = dragRef.current;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const dxTotal = e.clientX - st.startX;
    const dyTotal = e.clientY - st.startY;
    if (Math.hypot(dxTotal, dyTotal) > 6) st.moved = true;

    // pinch zoom
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const factor = dist / (pinchRef.current.startDist || 1);
      setZoomSafe(pinchRef.current.startZoom * factor);
      return;
    }

    // rotate
    const dx = e.clientX - st.lastX;
    const dy = e.clientY - st.lastY;
    st.lastX = e.clientX;
    st.lastY = e.clientY;

    const k = 0.11;
    rotRef.current.ry = clamp(rotRef.current.ry + dx * k, -85, 85);
    rotRef.current.rx = clamp(rotRef.current.rx - dy * k, -35, 30);

    velRef.current.vy = dx * 0.0014;
    velRef.current.vx = -dy * 0.0014;
  };

  const onPointerUp = (e) => {
    const st = dragRef.current;

    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current.startDist = 0;

    // tap selects node only if no drag happened
    if (!st.moved && st.downNodeId) {
      setActiveId(st.downNodeId);
    }

    if (pointersRef.current.size === 0) {
      st.dragging = false;
      st.moved = false;
      st.downNodeId = null;
      setIsDragging(false);
    }
  };

  const onWheel = (e) => {
    e.preventDefault?.();
    const next = zoom + (e.deltaY > 0 ? -0.06 : 0.06);
    setZoomSafe(next);
  };

  // Animation loop
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const W = Math.max(320, w || 600);
      const H = Math.max(320, h || 420);

      const isMobile = W < 520;
      const topPad = isMobile ? 14 : 18;
      const sidePad = isMobile ? 14 : 18;

      // gentle auto-rotation when not touching
      if (pointersRef.current.size === 0) {
        velRef.current.vx *= 0.93;
        velRef.current.vy *= 0.93;
        rotRef.current.ry += 0.08 + velRef.current.vy;
        rotRef.current.rx += 0.02 + velRef.current.vx;
        rotRef.current.ry = ((rotRef.current.ry + 180) % 360) - 180;
        rotRef.current.rx = clamp(rotRef.current.rx, -35, 30);
      }

      const rx = (rotRef.current.rx * Math.PI) / 180;
      const ry = (rotRef.current.ry * Math.PI) / 180;
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);

      const cx = W / 2;
      const cy = H / 2;

      const baseRadius =
        Math.min(W - sidePad * 2, H - topPad * 2) * (isMobile ? 0.43 : 0.46);
      const radius = baseRadius * zoom;

      const fov = isMobile ? 760 : 860;

      const raw = baseVectors.map((v) => {
        let x = v.x * radius;
        let y = v.y * radius;
        let z = v.z * radius;

        // rotate Y
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = fov / (fov - z2);
        let px = cx + x1 * scale;
        let py = cy + y2 * scale;

        px = clamp(px, sidePad, W - sidePad);
        py = clamp(py, topPad, H - topPad);

        const depth = (z2 / radius + 1) / 2; // 0..1
        return { id: v.id, x: px, y: py, z: z2, scale, depth };
      });

      // label policy
      const labelPolicy = new Map();
      for (const n of raw) {
        const isActive = n.id === activeId;
        const show = isActive || (!isMobile && n.depth > 0.5) || (isMobile && n.depth > 0.72);
        labelPolicy.set(n.id, show);
      }

      // overlap relaxation
      const relaxed = raw.map((n) => ({ ...n }));
      const getR = (id, n) => {
        const showLabel = labelPolicy.get(id);
        const base = showLabel ? (isMobile ? 64 : 76) : (isMobile ? 44 : 50);
        const s = clamp(n.scale, 0.82, 1.18);
        return base * s;
      };

      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < relaxed.length; i++) {
          for (let j = i + 1; j < relaxed.length; j++) {
            const a = relaxed[i];
            const b = relaxed[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;

            const minDist = (getR(a.id, a) + getR(b.id, b)) * 0.52;
            if (dist < minDist) {
              const push = (minDist - dist) * 0.5;
              const ux = dx / dist;
              const uy = dy / dist;

              a.x = clamp(a.x - ux * push, sidePad, W - sidePad);
              a.y = clamp(a.y - uy * push, topPad, H - topPad);

              b.x = clamp(b.x + ux * push, sidePad, W - sidePad);
              b.y = clamp(b.y + uy * push, topPad, H - topPad);
            }
          }
        }
      }

      const sorted = [...relaxed].sort((a, b) => a.z - b.z);
      const map = new Map();
      for (const p of relaxed) map.set(p.id, p);

      const lines = edges
        .map(([a, b]) => {
          const A = map.get(a);
          const B = map.get(b);
          if (!A || !B) return null;

          const hot = a === activeId || b === activeId;
          const avgDepth = (A.depth + B.depth) / 2;

          return {
            x1: A.x,
            y1: A.y,
            x2: B.x,
            y2: B.y,
            hot,
            opacity: hot ? 0.9 : 0.1 + avgDepth * 0.22,
          };
        })
        .filter(Boolean);

      setRenderNodes(sorted);
      setRenderLines(lines);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [w, h, baseVectors, edges, activeId, zoom]);

  const cardWrap = isDark ? "border-white/10 bg-[#101114]/90" : "border-gray-200 bg-white";
  const stageBg = isDark ? "bg-[#0B0C10]" : "bg-gradient-to-br from-gray-50 via-white to-gray-100";
  const coldLine = isDark ? "rgba(148,163,184,0.50)" : "rgba(17,24,39,0.20)";

  const pill = isDark
    ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100";

  return (
    <div className="mt-6">
      <div className={`rounded-2xl overflow-hidden border shadow-[0_10px_40px_rgba(0,0,0,0.18)] ${cardWrap}`}>
        {/* Header */}
        <div className={`px-4 py-3 sm:px-5 sm:py-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Constelación de sectores DPI
              </div>
              <div className={`mt-1 text-xs sm:text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}>
                La constelación muestra, de forma interactiva, cómo se conectan los sectores de DPI para llevar un proyecto de la planeación a la ejecución.
              </div>
            </div>

            {/* Controls (NO auto/fijar) */}
            <div className="flex items-center gap-2">

              <div className={`inline-flex items-center gap-1 rounded-full border px-1 py-1 ${pill}`}>
                <button
                  type="button"
                  onClick={() => setZoomSafe(zoom - 0.12)}
                  className={`h-8 w-8 rounded-full transition inline-flex items-center justify-center ${isDark ? "text-white/80 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setZoomSafe(zoom + 0.12)}
                  className={`h-8 w-8 rounded-full transition inline-flex items-center justify-center ${isDark ? "text-white/80 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <Plus size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoomSafe(1.08);
                    rotRef.current = { rx: -10, ry: 18 };
                    velRef.current = { vx: 0, vy: 0 };
                    setActiveId("planeacion");
                  }}
                  className={`h-8 w-8 rounded-full transition inline-flex items-center justify-center ${isDark ? "text-white/80 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"}`}
                  aria-label="Reset"
                  title="Reset"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Stage */}
          <div
            ref={containerRef}
            className={[
              "relative",
              "h-[330px] sm:h-[400px] lg:h-[460px]",
              "rounded-2xl overflow-hidden",
              "border select-none touch-none",
              isDark ? "border-white/10" : "border-gray-200",
              stageBg,
            ].join(" ")}
            onPointerDownCapture={onPointerDownCapture}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: isDark
                  ? "radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.06),transparent_55%)"
                  : "radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.05),transparent_55%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage: isDark
                  ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 0)"
                  : "radial-gradient(circle at 1px 1px, rgba(17,24,39,0.08) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: isDark
                  ? "linear-gradient(to top, rgba(0,0,0,0.55), transparent)"
                  : "linear-gradient(to top, rgba(0,0,0,0.06), transparent)",
              }}
            />

            {/* Lines */}
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
              {renderLines.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={l.hot ? accentColor : coldLine}
                  strokeWidth={l.hot ? 1.7 : 1.05}
                  strokeOpacity={l.opacity}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Nodes */}
            {renderNodes.map((n) => {
              const t = topicById.get(n.id);
              if (!t) return null;

              const Icon = t.icon;
              const isActive = n.id === activeId;

              const showLabel = isActive || (w >= 520 ? n.depth > 0.5 : n.depth > 0.72);
              const s = clamp(n.scale, 0.82, 1.15) * (w < 520 ? 0.92 : 0.98);
              const opacity = 0.18 + n.depth * 0.82;

              const nodeClass = isDark
                ? isActive
                  ? "bg-white/90 text-black border-white/30"
                  : "bg-white/12 text-white border-white/10 hover:bg-white/16"
                : isActive
                ? "bg-gray-900 text-white border-gray-900/20"
                : "bg-white/85 text-gray-900 border-gray-200 hover:bg-white";

              return (
                <button
                  key={n.id}
                  type="button"
                  data-node-id={n.id}
                  className={[
                    "absolute -translate-x-1/2 -translate-y-1/2",
                    "rounded-full border backdrop-blur",
                    "transition",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                    "cursor-pointer",
                    isDark ? "focus:ring-white/20" : "focus:ring-black/10",
                    nodeClass,
                  ].join(" ")}
                  style={{
                    left: `${n.x}px`,
                    top: `${n.y}px`,
                    transform: `translate(-50%, -50%) scale(${s})`,
                    opacity,
                    zIndex: Math.round(n.z + 2000),
                    boxShadow: isActive
                      ? `0 0 0 2px ${accentColor}55, 0 16px 50px rgba(0,0,0,0.22)`
                      : "0 10px 30px rgba(0,0,0,0.14)",
                  }}
                  aria-label={t.label}
                  title={t.label}
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border"
                      style={{
                        borderColor: isActive
                          ? isDark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.16)"
                          : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
                        backgroundColor: isActive
                          ? `${accentColor}18`
                          : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Icon
                        size={16}
                        style={{
                          color: isActive
                            ? accentColor
                            : isDark ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.72)",
                        }}
                      />
                    </span>

                    {showLabel && (
                      <div className="text-left">
                        <div
                          className="font-semibold leading-tight"
                          style={{
                            fontSize: w < 520 ? 12 : 13,
                            maxWidth: w < 520 ? 130 : 160,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.label}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Hint */}
            <div className={`absolute left-4 bottom-3 text-[11px] pointer-events-none ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Tip: en móvil puedes deslizar para rotar y pellizcar para zoom.
            </div>
          </div>

          {/* Detail panel BELOW */}
          <div
            className={[
              "mt-4 rounded-2xl border backdrop-blur p-4",
              isDark ? "border-white/10 bg-[#0F1013]/85" : "border-gray-200 bg-white",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <span
                className={[
                  "mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-xl border",
                  isDark ? "border-white/10" : "border-gray-200",
                ].join(" ")}
                style={{ backgroundColor: `${accentColor}18` }}
              >
                {ActiveIcon ? <ActiveIcon size={18} style={{ color: accentColor }} /> : null}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{activeTopic?.label}</div>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <div className={`text-xs ${isDark ? "text-white/60" : "text-gray-500"}`}>Auto</div>
                </div>

                <div className={`mt-1 text-sm leading-relaxed ${isDark ? "text-white/80" : "text-gray-700"}`}>
                  {activeTopic?.desc}
                </div>

                <div className={`mt-3 flex items-start gap-2 text-xs ${isDark ? "text-white/65" : "text-gray-600"}`}>
                  <Link2 size={14} style={{ color: accentColor }} className="mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    <span className="mr-1">Conecta con:</span>
                    {connections.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={[
                          "px-2 py-0.5 rounded-full border transition",
                          isDark
                            ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/75"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   AboutSection (two columns + palette)
----------------------------- */
export default function AboutSection({ accentColor = "#C0392B", projectsCount = 500 }) {
  const missionCards = [
    {
      title: "Misión",
      icon: Target,
      desc:
        "Facilitar a nuestros clientes el proceso integral de planeación, gestión y desarrollo de inversiones inmobiliarias, desde el análisis de uso de suelo y viabilidad hasta proyectos llave en mano, maximizando el valor de cada inversión.",
    },
    {
      title: "Visión",
      icon: TrendingUp,
      desc:
        "Ser una empresa líder y referente en consultoría y desarrollo inmobiliario, transformando ideas en proyectos exitosos, rentables y sostenibles para las ciudades donde intervenimos.",
    },
    {
      title: "Objetivo resumido",
      icon: LineChart,
      desc:
        "Impulsar inversiones inmobiliarias exitosas a través de planeación estratégica, análisis especializado y desarrollos integrales.",
    },
  ];

  const fourCards = [
    {
      title: "Equipo multidisciplinario",
      icon: Users,
      desc:
        "Arquitectos, ingenieros, abogados, economistas, biólogos, geógrafos, urbanistas y especialistas en planeación y desarrollo urbano, enfocados en proyectos sustentables.",
    },
    {
      title: "Técnico + jurídico",
      icon: Scale,
      desc:
        "Asesoramiento y documentos técnicos/legales conforme a la legislación urbana, ambiental y de riesgo vigente para viabilidad y emplazamiento de desarrollos.",
    },
    {
      title: "Sector público y privado",
      icon: Building2,
      desc:
        "Consultorías a instancias municipales, estatales y federales, y acompañamiento a desarrolladores e inversionistas en proyectos privados.",
    },
    {
      title: "Ética y valor de inversión",
      icon: Leaf,
      desc:
        "Procesos sólidos y actualización constante para proteger e impulsar el valor de cada inversión con criterio profesional.",
    },
  ];

  const sectorsIntro = [
    "Planeación y ordenamiento urbano",
    "Gestión de permisos y ruta crítica",
    "Análisis normativo (urbano/ambiental/riesgo)",
    "Viabilidad técnica y financiera",
    "Diseño, urbanización y ejecución",
  ];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-[#0B0C10] transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            ¿Quiénes Somos?
          </h2>
          <div className="w-20 h-1 mx-auto mt-4 rounded" style={{ backgroundColor: accentColor }} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left */}
          <div className="lg:col-span-7">
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-white/80">
              En{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                DPI – Diseño Planeación Integral
              </span>{" "}
              facilitamos el proceso integral de planeación, gestión y desarrollo de inversiones
              inmobiliarias. Unimos visión urbana, soporte técnico-jurídico y análisis financiero
              para convertir ideas en{" "}
              <span className="font-semibold">proyectos rentables y sostenibles</span>. Acompañamos
              desde el diagnóstico (uso de suelo, restricciones, riesgos y factibilidad) hasta la
              estrategia, permisos y ejecución — asegurando decisiones sólidas y resultados de alto
              impacto urbano y económico.
            </p>

            {/* Sphere */}
            <TopicsSphere3D accentColor={accentColor} />

          </div>

          {/* Right */}
          <div className="lg:col-span-5">
            {/* Mission/Vision/Objective */}
            <div className="grid grid-cols-1 gap-4">
              {missionCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="
                      rounded-xl p-5
                      bg-white dark:bg-[#101114]
                      border border-gray-200 dark:border-white/10
                      shadow-sm
                    "
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <Icon size={18} />
                      {c.title}
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-white/75 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 2x2 under */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {fourCards.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="
                      group rounded-2xl p-4
                      bg-white dark:bg-[#101114]
                      border border-gray-200 dark:border-white/10
                      shadow-sm hover:shadow-md
                      transition-all
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}18` }}
                      >
                        <Icon size={18} style={{ color: accentColor }} />
                      </div>
                      <span
                        className="h-1 w-8 rounded-full opacity-80 group-hover:opacity-100 transition"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>

                    <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {p.title}
                    </div>

                    <p className="mt-1 text-xs text-gray-700 dark:text-white/70 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
        {/* Top stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { k: "Empresa desde", v: "2006" },
            { k: "Socios activos desde", v: "1988" },
            { k: "Enfoque", v: "Integral y estratégico", icon: BadgeCheck },
            { k: "Proyectos", v: `+${projectsCount}`, sub: "Intervenciones y consultorías." },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.k}
                className="
                  rounded-xl p-5
                  bg-white dark:bg-[#101114]
                  border border-gray-200 dark:border-white/10
                  shadow-sm
                "
              >
                <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-white/55">
                  {s.k}
                </div>

                {Icon ? (
                  <div className="mt-2 flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                    <Icon size={18} />
                    <span>{s.v}</span>
                  </div>
                ) : (
                  <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
                    {s.v}
                  </div>
                )}

                {s.sub ? (
                  <div className="mt-1 text-xs text-gray-600 dark:text-white/55">
                    {s.sub}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* Closing */}
        <div className="mt-10 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/70 max-w-3xl mx-auto">
            DPI se distingue por ser una empresa{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              fiable, ética y con experiencia
            </span>
            , protegiendo e impulsando el valor de cada inversión a través de procesos sólidos y
            acompañamiento cercano.
          </p>
        </div>
      </div>

    </section>
  );
}
