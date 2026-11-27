"use client";

import { useEffect, useRef } from "react";

// ¿Por qué no framer-motion para las entradas?
// En iPhone (WebKit), cuando termina una animación que el navegador corre en la
// tarjeta gráfica (Web Animations), framer la cancela y escribe el valor final.
// Entre esas dos cosas Safari alcanza a pintar UN cuadro con el estado inicial:
// la foto o el texto desaparece un instante justo al terminar de entrar (se ve
// en el video de parpadeo). Con transiciones CSS no hay cancelación: el estilo
// final ya está puesto desde el principio, así que no existe ese cuadro vacío.
// Se ven exactamente igual y también corren en la tarjeta gráfica.

// Para las animaciones que siguen en framer-motion: pasar onUpdate hace que
// framer las anime en JS (no con Web Animations), así no hay cancelación final
// ni cuadro vacío en iPhone.
export const animarEnJs = () => {};

// Curvas de framer-motion traducidas a CSS.
export const CURVA_SUAVE = "cubic-bezier(0.22, 1, 0.36, 1)"; // ease [0.22, 1, 0.36, 1]
export const CURVA_NORMAL = "cubic-bezier(0.25, 0.1, 0.35, 1)"; // la de framer por defecto
export const CURVA_SALIDA = "cubic-bezier(0, 0, 0.58, 1)"; // "easeOut"
export const CURVA_ENTRADA_SALIDA = "cubic-bezier(0.42, 0, 0.58, 1)"; // "easeInOut"

// Un resorte de framer (rigidez, amortiguación, masa 1) como curva CSS linear(),
// con la misma duración y el mismo pequeño rebote.
export function resorte(rigidez: number, amortiguacion: number) {
  const paso = 1 / 240;
  let x = 0;
  let v = 0;
  let t = 0;
  const valores: number[] = [0];
  // se simula hasta que queda quieto (igual que framer: restDelta / restSpeed)
  while (t < 4) {
    const a = -rigidez * (x - 1) - amortiguacion * v;
    v += a * paso;
    x += v * paso;
    t += paso;
    valores.push(x);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
  }
  const duracion = t;
  const puntos = 48;
  const muestras: string[] = [];
  for (let i = 0; i <= puntos; i++) {
    const indice = Math.round((i / puntos) * (valores.length - 1));
    muestras.push((i === puntos ? 1 : valores[indice]).toFixed(4));
  }
  return { curva: `linear(${muestras.join(", ")})`, duracion: Number(duracion.toFixed(3)) };
}

// Marca el elemento con data-visto la primera vez que entra en pantalla
// (igual que whileInView con once: true). La animación la hace el CSS de
// .aparecer en globals.css, sin volver a renderizar el componente.
const observadores = new Map<string, IntersectionObserver>();

function observador(margen: string) {
  let o = observadores.get(margen);
  if (!o) {
    o = new IntersectionObserver(
      (entradas, yo) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.dispatchEvent(new Event("visto"));
          yo.unobserve(e.target);
        }
      },
      { rootMargin: margen },
    );
    observadores.set(margen, o);
  }
  return o;
}

// observarPadre: para lo que entra desde scale(0), que mientras tanto no mide
// nada y el navegador nunca lo daría por visible.
export function useAparecer<T extends Element>(margen = "0px", observarPadre = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.hasAttribute("data-visto")) return;
    const objetivo = (observarPadre && el.parentElement) || el;
    const o = observador(margen);
    // el observador marca a quien observa; si es el padre, se pasa al elemento
    objetivo.addEventListener("visto", () => el.setAttribute("data-visto", ""), { once: true });
    o.observe(objetivo);
    return () => o.unobserve(objetivo);
  }, [margen, observarPadre]);
  return ref;
}

// Variables CSS que lee .aparecer: desde dónde entra, a dónde llega, cuánto dura.
export function estiloAparecer({
  desde,
  hasta = "none",
  duracion,
  curva,
  retraso = 0,
  opacidadDesde = 0,
}: {
  desde: string;
  opacidadDesde?: number;
  hasta?: string;
  duracion: number;
  curva: string;
  retraso?: number;
}) {
  return {
    "--desde": desde,
    "--hasta": hasta,
    "--duracion": `${duracion}s`,
    "--curva": curva,
    "--retraso": `${retraso}s`,
    "--opacidad-desde": opacidadDesde,
  } as React.CSSProperties;
}
