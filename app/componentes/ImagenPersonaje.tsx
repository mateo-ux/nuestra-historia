"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

// Intenta mostrar tus imágenes (public/personajes/...) optimizadas con
// next/image. Si ninguna existe, muestra el dibujo SVG de respaldo.
export default function ImagenPersonaje({
  opciones,
  alt,
  respaldo,
  sizes = "(max-width: 640px) 45vw, 240px",
}: {
  opciones: string[];
  alt: string;
  respaldo: ReactNode;
  sizes?: string;
}) {
  const [fallidas, setFallidas] = useState<string[]>([]);
  const actual = opciones.find((o) => !fallidas.includes(o));

  if (!actual) return <>{respaldo}</>;

  return (
    <div className="relative h-full w-full">
      <Image
        key={actual}
        src={actual}
        alt={alt}
        fill
        sizes={sizes}
        onError={() => setFallidas((f) => (f.includes(actual) ? f : [...f, actual]))}
        className="object-contain object-bottom drop-shadow-[0_10px_15px_rgba(80,40,30,0.25)]"
      />
    </div>
  );
}
