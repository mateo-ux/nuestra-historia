"use client";

import Image from "next/image";
import type { Foto } from "@/datos/contenido";
import { estiloAparecer, resorte, useAparecer } from "@/lib/aparecer";

// El mismo resorte que tenía con framer-motion (rigidez 110, amortiguación 16).
const CAIDA = resorte(110, 16);

// Foto tipo polaroid que "cae" suavemente sobre la mesa al aparecer.
export default function Polaroid({
  foto,
  giro = 0,
  className = "",
  sizes = "(max-width: 768px) 60vw, 300px",
  retraso = 0,
}: {
  foto: Foto;
  giro?: number;
  className?: string;
  sizes?: string;
  retraso?: number;
}) {
  const ref = useAparecer<HTMLElement>("-60px");
  return (
    <figure
      ref={ref}
      className={`aparecer polaroid relative bg-white p-2 pb-2 sm:p-2.5 sm:pb-3 shadow-[0_15px_35px_-10px_rgba(90,40,30,0.35)] hover:z-10 ${className}`}
      style={estiloAparecer({
        desde: `translateY(30px) rotate(${giro * 2.2}deg) scale(0.94)`,
        hasta: `translateY(0px) rotate(${giro}deg) scale(1)`,
        duracion: CAIDA.duracion,
        curva: CAIDA.curva,
        retraso,
      })}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-durazno">
        <Image src={foto.src} alt={foto.pie ?? "Foto de nosotros"} fill sizes={sizes} className="object-cover" />
      </div>
      <figcaption className="titulo-mano flex min-h-8 items-center justify-center px-1 pt-1.5 text-center text-base leading-tight text-tinta/80 sm:min-h-9 sm:text-xl">
        {foto.pie}
      </figcaption>
    </figure>
  );
}
