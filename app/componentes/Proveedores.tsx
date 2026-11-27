"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { usePausarFueraDeVista } from "@/lib/usePausarFueraDeVista";

// Si el celular tiene activado "reducir movimiento", las animaciones de
// framer-motion se vuelven suaves fundidos en lugar de desplazamientos.
export default function Proveedores({ children }: { children: ReactNode }) {
  usePausarFueraDeVista();
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
