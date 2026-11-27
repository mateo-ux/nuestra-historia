"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import { useEffect, useState } from "react";
import Corazon from "./Corazon";

const enlaces = [
  { id: "libro", texto: "Nuestro libro", corto: "Libro", icono: "📖" },
  { id: "historia", texto: "Nuestra historia", corto: "Historia", icono: "💞" },
  { id: "viaje", texto: "El viaje", corto: "Viaje", icono: "🌅" },
  { id: "videos", texto: "Nuestra película", corto: "Videos", icono: "🎬" },
  { id: "razones", texto: "Razones", corto: "Razones", icono: "💗" },
  { id: "cartas", texto: "Ábrela cuando…", corto: "Cartas", icono: "💌" },
] as const;

// Marca la sección que se está viendo.
function useSeccionActual() {
  const [actual, setActual] = useState<string | null>(null);
  useEffect(() => {
    const secciones = enlaces.map((e) => document.getElementById(e.id)).filter((el): el is HTMLElement => !!el);
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActual(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    secciones.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);
  return actual;
}

export default function Navegacion() {
  const [abierto, setAbierto] = useState(false);
  const actual = useSeccionActual();

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto]);

  return (
    <>
      {/* computador y tablet */}
      <nav
        aria-label="Secciones"
        className="fixed top-3 left-1/2 z-40 hidden -translate-x-1/2 gap-1 rounded-full bg-white/95 px-2 py-1.5 text-sm font-bold text-vino shadow-lg ring-1 ring-vino/10 backdrop-blur-md sm:flex"
      >
        {enlaces.map((e) => (
          <a
            key={e.id}
            href={`#${e.id}`}
            aria-current={actual === e.id ? "location" : undefined}
            className={`rounded-full px-3 py-1 transition ${actual === e.id ? "bg-vino text-white" : "hover:bg-vino/10"}`}
          >
            {e.corto}
          </a>
        ))}
      </nav>

      {/* celular */}
      <div className="sm:hidden">
        <AnimatePresence>
          {abierto && (
            <motion.div
              onUpdate={animarEnJs}
              key="fondo"
              className="fixed inset-0 z-40 bg-[#4a2c2a]/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAbierto(false)}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-controls="menu-celular"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="fixed top-3 left-3 z-50 flex h-11 items-center gap-2 rounded-full bg-white/95 pr-4 pl-3 text-sm font-bold text-vino shadow-lg ring-1 ring-vino/10"
          whileTap={{ scale: 0.94 }}
        >
          <span className="relative grid h-6 w-6 place-items-center">
            <motion.span className="absolute" animate={{ scale: abierto ? 0 : 1, rotate: abierto ? 90 : 0 }}>
              <Corazon className="h-5 w-5 text-atardecer" />
            </motion.span>
            <motion.span className="absolute text-lg leading-none" initial={false} animate={{ scale: abierto ? 1 : 0, rotate: abierto ? 0 : -90 }}>
              ✕
            </motion.span>
          </span>
          <span className="tracking-wide">{abierto ? "Cerrar" : "Menú"}</span>
        </motion.button>

        <AnimatePresence>
          {abierto && (
            <motion.nav
              onUpdate={animarEnJs}
              id="menu-celular"
              key="menu"
              aria-label="Secciones"
              className="fixed top-16 right-3 left-3 z-50 overflow-hidden rounded-3xl bg-gradient-to-b from-[#fffaf3] to-[#fde7da] p-3 shadow-2xl ring-1 ring-vino/10"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              style={{ transformOrigin: "top left" }}
            >
              <p className="titulo-mano px-3 pt-1 pb-2 text-2xl text-vino">Ir a…</p>
              <ul className="grid grid-cols-2 gap-2">
                {enlaces.map((e, i) => (
                  <motion.li onUpdate={animarEnJs} key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                    <a
                      href={`#${e.id}`}
                      onClick={() => setAbierto(false)}
                      aria-current={actual === e.id ? "location" : undefined}
                      className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 text-[15px] leading-tight font-bold transition active:scale-[0.97] ${
                        actual === e.id ? "bg-vino text-white" : "bg-white/80 text-vino ring-1 ring-vino/5"
                      }`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fde3d2] text-base">{e.icono}</span>
                      {e.texto}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
