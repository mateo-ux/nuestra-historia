"use client";

import { useEffect } from "react";

const esInfinita = (a: Animation) => a.effect?.getTiming().iterations === Infinity;

/**
 * Quita / pausa las animaciones que se repiten sin fin (corazones, estrellas, robots…)
 * de las secciones que no se están viendo, y las reanuda al volver a ellas.
 * En celular, tener todas corriendo a la vez satura la tarjeta gráfica y
 * produce parpadeos al desplazarse.
 */
export function usePausarFueraDeVista() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !Element.prototype.getAnimations) return;
    const secciones = Array.from(document.querySelectorAll<HTMLElement>("main > section, main section[id]"));

    const aplicar = (el: HTMLElement, visible: boolean) => {
      // CSS: fuera de pantalla se quitan del todo (ver globals.css).
      if (visible) el.removeAttribute("data-fuera-de-vista");
      else el.setAttribute("data-fuera-de-vista", "");
      // Animaciones de framer-motion en bucle: se pausan. Solo las infinitas,
      // para no reiniciar las que ya terminaron.
      for (const a of el.getAnimations({ subtree: true })) {
        if (!esInfinita(a) || a instanceof CSSAnimation) continue;
        if (visible && a.playState === "paused") a.play();
        else if (!visible && a.playState === "running") a.pause();
      }
    };

    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => aplicar(e.target as HTMLElement, e.isIntersecting)),
      { rootMargin: "150px 0px" },
    );
    secciones.forEach((s) => observador.observe(s));
    return () => {
      observador.disconnect();
      secciones.forEach((s) => aplicar(s, true));
    };
  }, []);
}
