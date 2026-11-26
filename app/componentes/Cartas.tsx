"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cartas, pareja } from "@/datos/contenido";
import Modal from "./Modal";
import Revelar from "./Revelar";
import TituloSeccion from "./TituloSeccion";

export default function Cartas() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const carta = abierta === null ? null : cartas[abierta];

  return (
    <section id="cartas" className="bg-gradient-to-b from-crema to-[#fde7da] px-4 py-24">
      <TituloSeccion
        antetitulo="Para cuando las necesites"
        titulo="Ábrela cuando…"
        subtitulo="Cartas guardadas para distintos momentos. Vuelve a ellas cada vez que quieras."
      />
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
        {cartas.map((c, i) => (
          <Revelar key={c.cuando} retraso={i * 0.1}>
            <motion.button
              onClick={() => setAbierta(i)}
              whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
              className="group relative mx-auto block aspect-[3/2] w-full max-w-sm cursor-pointer"
            >
              <div className="absolute inset-0 rounded-xl shadow-xl" style={{ background: c.color }} />
              <div
                className="absolute inset-x-0 top-0 h-[55%] rounded-t-xl transition-transform duration-500 group-hover:[transform:rotateX(25deg)]"
                style={{ background: c.color, filter: "brightness(0.93)", clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "top" }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                <span className="text-xs font-bold tracking-[0.25em] text-vino uppercase">Ábrela cuando</span>
                <span className="titulo-mano text-3xl text-vino">{c.cuando}</span>
              </div>
              <span className="absolute top-[48%] left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-vino text-sm text-white shadow-md">
                ♥
              </span>
            </motion.button>
          </Revelar>
        ))}
      </div>

      <Modal abierto={carta !== null} alCerrar={() => setAbierta(null)}>
        {carta && (
          // Hoja rayada: cada renglón mide 2rem y todo el texto usa alturas de
          // línea y márgenes múltiplos de 2rem. Como cada fuente pone la base
          // de las letras a distinta altura dentro de su renglón, cada texto
          // se baja un poco (top en em, medido en el navegador) para que las
          // letras queden apoyadas justo sobre la línea.
          <div
            className="rounded-2xl bg-[#fffaf3] px-6 py-8 shadow-2xl ring-1 ring-[#f2dccb] sm:px-10"
            style={{
              backgroundImage: "linear-gradient(to bottom, transparent calc(2rem - 1px), #efd9ca calc(2rem - 1px))",
              backgroundSize: "100% 2rem",
            }}
          >
            <p className="relative top-[0.667em] text-xs leading-8 font-bold tracking-[0.25em] text-terracota uppercase">Ábrela cuando {carta.cuando}</p>
            <h3 className="titulo-mano relative top-[0.5em] text-4xl leading-[4rem] text-vino">Para {pareja.ella},</h3>
            <p className="texto-libro relative top-[0.3em] text-xl leading-8 text-tinta">{carta.texto}</p>
            <p className="titulo-mano relative top-[0.633em] mt-8 text-right text-3xl leading-[4rem] text-vino">Con amor, {pareja.el}</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
