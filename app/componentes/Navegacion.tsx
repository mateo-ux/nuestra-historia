"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const enlaces = [
  ["#libro", "Libro"],
  ["#historia", "Historia"],
  ["#viaje", "Viaje"],
  ["#videos", "Videos"],
  ["#razones", "Razones"],
  ["#cartas", "Cartas"],
];

export default function Navegacion() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto]);

  return (
    <>
      {/* computador y tablet */}
      <nav className="fixed top-3 left-1/2 z-40 hidden -translate-x-1/2 gap-1 rounded-full bg-white/95 px-2 py-1.5 text-sm font-bold text-vino shadow-lg ring-1 ring-vino/10 backdrop-blur-md sm:flex">
        {enlaces.map(([href, texto]) => (
          <a key={href} href={href} className="rounded-full px-3 py-1 transition hover:bg-vino hover:text-white">
            {texto}
          </a>
        ))}
      </nav>

      {/* celular: botón con menú */}
      <div className="fixed top-3 left-3 z-40 sm:hidden">
        <button
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-vino shadow-lg ring-1 ring-vino/10 backdrop-blur-md"
        >
          <span className="relative block h-3.5 w-5">
            <motion.span className="absolute left-0 h-0.5 w-5 rounded bg-current" animate={abierto ? { top: 6, rotate: 45 } : { top: 0, rotate: 0 }} />
            <motion.span className="absolute top-1.5 left-0 h-0.5 w-5 rounded bg-current" animate={{ opacity: abierto ? 0 : 1 }} />
            <motion.span className="absolute left-0 h-0.5 w-5 rounded bg-current" animate={abierto ? { top: 6, rotate: -45 } : { top: 12, rotate: 0 }} />
          </span>
        </button>
        <AnimatePresence>
          {abierto && (
            <motion.nav
              className="mt-2 flex w-44 flex-col overflow-hidden rounded-2xl bg-white/95 p-1.5 font-bold text-vino shadow-xl ring-1 ring-vino/10 backdrop-blur-md"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              style={{ transformOrigin: "top left" }}
            >
              {enlaces.map(([href, texto]) => (
                <a key={href} href={href} onClick={() => setAbierto(false)} className="rounded-xl px-4 py-2.5 active:bg-vino active:text-white">
                  {texto}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
