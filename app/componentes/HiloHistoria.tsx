"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { CURVA_SUAVE } from "@/lib/aparecer";
import Aparecer from "./Aparecer";

// El hilo punteado de la historia se va "dibujando" a medida que bajas.
export function HiloHistoria({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const escala = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  return (
    <div ref={ref} className="relative mx-auto max-w-6xl">
      <div className="absolute top-0 bottom-0 left-4 w-px border-l-2 border-dashed border-rosa/40 md:left-1/2" />
      <motion.div
        className="absolute top-0 bottom-0 left-4 w-px origin-top border-l-2 border-dashed border-atardecer md:left-1/2"
        style={{ scaleY: escala }}
      />
      {children}
    </div>
  );
}

// Curva para el latido: 0 → 1.2 → 1, cada mitad con "easeOut" (como estaba).
const LATIDO = (() => {
  // easeOut = cubic-bezier(0, 0, 0.58, 1)
  const salida = (t: number) => {
    let u = t;
    for (let i = 0; i < 8; i++) {
      const x = 3 * (1 - u) * u * u * 0.58 + u * u * u;
      const dx = 6 * (1 - u) * u * 0.58 - 3 * u * u * 0.58 + 3 * u * u + 1e-6;
      u -= (x - t) / dx;
      u = Math.min(1, Math.max(0, u));
    }
    return 3 * (1 - u) * u * u + u * u * u;
  };
  const puntos: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const v = t < 0.5 ? 1.2 * salida(t / 0.5) : 1.2 - 0.2 * salida((t - 0.5) / 0.5);
    puntos.push(v.toFixed(4));
  }
  return `linear(${puntos.join(", ")})`;
})();

// El corazoncito de cada capítulo aparece con un pequeño latido.
export function PuntoHilo() {
  return (
    <Aparecer
      className="absolute top-2 left-4 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-atardecer text-white shadow-md md:left-1/2"
      margen="-120px"
      observarPadre
      desde="scale(0)"
      hasta="scale(1)"
      opacidadDesde={1}
      duracion={0.6}
      curva={LATIDO}
    >
      ♥
    </Aparecer>
  );
}

// El texto de cada capítulo entra desde su lado.
export function EntradaLateral({ children, desde, className }: { children: ReactNode; desde: 1 | -1; className?: string }) {
  return (
    <Aparecer
      className={className}
      margen="-80px"
      desde={`translateX(${desde * 40}px)`}
      hasta="translateX(0px)"
      duracion={0.8}
      curva={CURVA_SUAVE}
    >
      {children}
    </Aparecer>
  );
}
