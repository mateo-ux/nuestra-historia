"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Revelar({
  children,
  retraso = 0,
  className,
}: {
  children: ReactNode;
  retraso?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      // "transform" como texto (y no "y") para que el navegador anime en la
      // tarjeta gráfica: se ve igual, pero no se traba ni parpadea en celular.
      initial={{ opacity: 0, transform: "translateY(40px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
