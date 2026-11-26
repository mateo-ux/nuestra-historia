"use client";

import { useSyncExternalStore } from "react";

/**
 * Devuelve si la media query se cumple, sin errores de hidratación:
 * en el servidor usa `valorServidor` y en el navegador se actualiza solo.
 */
export function useMediaQuery(consulta: string, valorServidor = false) {
  return useSyncExternalStore(
    (avisar) => {
      const m = window.matchMedia(consulta);
      m.addEventListener("change", avisar);
      return () => m.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consulta).matches,
    () => valorServidor,
  );
}
