"use client";

import type { ReactNode } from "react";
import { CURVA_SUAVE, estiloAparecer, useAparecer } from "@/lib/aparecer";

// Sube y aparece la primera vez que entra en pantalla (transición CSS: en
// iPhone no deja el cuadro vacío que dejaba framer-motion al terminar).
export default function Revelar({
  children,
  retraso = 0,
  className,
}: {
  children: ReactNode;
  retraso?: number;
  className?: string;
}) {
  const ref = useAparecer<HTMLDivElement>("-80px");
  return (
    <div
      ref={ref}
      className={`aparecer ${className ?? ""}`}
      style={estiloAparecer({ desde: "translateY(40px)", duracion: 0.8, curva: CURVA_SUAVE, retraso })}
    >
      {children}
    </div>
  );
}
