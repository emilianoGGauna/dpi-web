import { useMemo, useState } from "react";

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  imageClassName = "",
  fallbackLabel = "Imagen no disponible",
  aspectRatio,
  fit = "cover",
  loading = "lazy",
  sizes,
  quality = "high",
}) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const safeAlt = alt?.trim() || "Imagen DPI";
  const hasSource = Boolean(src && !hasError);
  const wrapperStyle = useMemo(
    () => (aspectRatio ? { aspectRatio } : undefined),
    [aspectRatio]
  );

  return (
    <div className={`relative overflow-hidden bg-[#0f1319] ${className}`} style={wrapperStyle}>
      {hasSource ? (
        <img
          src={src}
          alt={safeAlt}
          loading={loading}
          sizes={sizes}
          fetchPriority={loading === "eager" ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
          className={`h-full w-full transition duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${imageClassName}`}
          style={{ objectFit: fit }}
          data-quality={quality}
        />
      ) : null}

      {!loaded && (
        <div aria-hidden className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#0e1116] via-[#171d26] to-[#0e1116]" />
      )}

      {!hasSource && (
        <div className="absolute inset-0 flex flex-col justify-end border border-white/10 bg-gradient-to-br from-[#0f1218] via-[#171c26] to-[#2f2615] p-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#e1c27a]/80">DPI</p>
          <p className="mt-1 text-sm text-white/85">{fallbackLabel}</p>
        </div>
      )}
    </div>
  );
}
