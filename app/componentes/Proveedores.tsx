"use client";

import type { ReactNode } from "react";
import { usePausarFueraDeVista } from "@/lib/usePausarFueraDeVista";

// Las animaciones se ven completas aunque el celular tenga activado "reducir
// movimiento" (antes framer-motion las cortaba y todo aparecía de golpe).
export default function Proveedores({ children }: { children: ReactNode }) {
  usePausarFueraDeVista();
  return <>{children}</>;
}
