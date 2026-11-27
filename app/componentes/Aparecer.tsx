"use client";

import type { ReactNode } from "react";
import { estiloAparecer, useAparecer } from "@/lib/aparecer";

// Bloque que entra la primera vez que se ve en pantalla (ver lib/aparecer.ts).
export default function Aparecer({
  children,
  className = "",
  margen = "0px",
  observarPadre = false,
  ...estilo
}: {
  children: ReactNode;
  className?: string;
  margen?: string;
  observarPadre?: boolean;
} & Parameters<typeof estiloAparecer>[0]) {
  const ref = useAparecer<HTMLDivElement>(margen, observarPadre);
  return (
    <div ref={ref} className={`aparecer ${className}`} style={estiloAparecer(estilo)}>
      {children}
    </div>
  );
}
