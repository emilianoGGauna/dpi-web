import { useState } from "react";

function ImageFrame({
  src,
  alt,
  style,
  className,
  imgClassName = "w-full h-full object-cover",
  fallbackLabel = "Imagen no disponible",
  showSkeleton = true,
  ...rest
}) {
  const [didError, setDidError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSource = Boolean(src);

  return (
    <div className={`relative overflow-hidden ${className || ""}`} style={style}>
      {!didError && hasSource && (
        <img
          src={src}
          alt={alt}
          {...rest}
          className={imgClassName}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setDidError(true);
            setIsLoaded(true);
          }}
        />
      )}

      {(didError || !hasSource) && (
        <div className="absolute inset-0 flex items-end bg-gradient-to-br from-[#101114] via-[#151723] to-[#29131a] border border-white/10">
          <div className="p-4 w-full">
            <div className="h-0.5 w-10 rounded-full bg-[#7e1f2a]" />
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">DPI</p>
            <p className="mt-1 text-sm text-white/85">{fallbackLabel}</p>
          </div>
        </div>
      )}

      {showSkeleton && !isLoaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#111318] via-[#1a1d24] to-[#111318]" />}
    </div>
  );
}

export default function ImageWithFallback(props) {
  return <ImageFrame key={props.src || "missing-src"} {...props} />;
}
