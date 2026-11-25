"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Intenta mostrar tus imágenes (public/personajes/...). Si ninguna existe,
// muestra el dibujo SVG de respaldo.
export default function ImagenPersonaje({
  opciones,
  alt,
  respaldo,
}: {
  opciones: string[];
  alt: string;
  respaldo: ReactNode;
}) {
  const [fallidas, setFallidas] = useState<string[]>([]);
  const img = useRef<HTMLImageElement>(null);
  const actual = opciones.find((o) => !fallidas.includes(o));
  const fallo = (src: string) => setFallidas((f) => (f.includes(src) ? f : [...f, src]));

  // Por si la imagen falló antes de que React estuviera listo.
  useEffect(() => {
    const el = img.current;
    if (actual && el && el.complete && el.naturalWidth === 0) fallo(actual);
  }, [actual]);

  if (!actual) return <>{respaldo}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={img}
      key={actual}
      src={actual}
      alt={alt}
      onError={() => fallo(actual)}
      className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_15px_rgba(80,40,30,0.25)]"
    />
  );
}
