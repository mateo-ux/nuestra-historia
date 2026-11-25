"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

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

// El corazoncito de cada capítulo aparece con un pequeño latido.
export function PuntoHilo() {
  return (
    <motion.div
      className="absolute top-2 left-4 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-atardecer text-white shadow-md md:left-1/2"
      initial={{ scale: 0 }}
      whileInView={{ scale: [0, 1.2, 1] }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      ♥
    </motion.div>
  );
}

// El texto de cada capítulo entra desde su lado.
export function EntradaLateral({ children, desde, className }: { children: ReactNode; desde: 1 | -1; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: desde * 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
