"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import Image from "next/image";
import { useState } from "react";
import { capituloDos, despues, pareja } from "@/datos/contenido";
import { useMediaQuery } from "@/lib/useMediaQuery";
import Corazon from "./Corazon";
import CorazonesFlotantes from "./CorazonesFlotantes";
import Polaroid from "./Polaroid";
import Revelar from "./Revelar";

const frasesNo = ["No", "¿Segura?", "Piénsalo bien", "¡No se puede!", "Ese botón no funciona 😜"];

export default function Final() {
  const [dijoSi, setDijoSi] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const huir = () => setIntentos((n) => n + 1);
  // En celular el botón "No" huye menos para no salirse de la pantalla.
  const escala = useMediaQuery("(max-width: 639px)") ? 0.5 : 1;
  const base = [
    { x: 0, y: 0 },
    { x: 110, y: -50 },
    { x: -120, y: 40 },
    { x: 90, y: 60 },
    { x: -80, y: -60 },
  ][intentos % 5];
  const posNo = { x: base.x * escala, y: base.y * escala };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#d4603e] via-[#b8474f] to-[#6e2433] px-4 pt-24 pb-32 text-white">
      <CorazonesFlotantes cantidad={20} color="rgba(255,220,210,0.6)" />

      <div className="relative mx-auto max-w-5xl text-center">
        <Revelar>
          <p className="text-xs font-bold tracking-[0.3em] text-white uppercase">Y lo que sigue…</p>
          <h2 className="titulo-mano mt-2 text-6xl sm:text-7xl">Continuará…</h2>
          <p className="texto-libro mx-auto mt-5 max-w-2xl text-2xl text-white">
            “Algunas historias comienzan con un capítulo. Pero las más bonitas comienzan cuando dos personas deciden convertirse en hogar.”
          </p>
        </Revelar>

        <Revelar retraso={0.1} className="mt-14 flex flex-wrap items-center justify-center gap-6">
          {despues.map((f, i) => (
            <Polaroid key={f.src} foto={f} giro={[-7, 3, -2][i % 3]} retraso={i * 0.15} className="w-40 sm:w-52" />
          ))}
        </Revelar>

        <Revelar retraso={0.2} className="mx-auto mt-16 max-w-xl rounded-[2rem] bg-white/15 p-5 ring-1 sm:p-8 ring-white/30 sm:backdrop-blur-md">
          <p className="titulo-mano text-4xl">{pareja.ella},</p>
          <p className="texto-libro mt-2 text-2xl">¿escribimos juntos la segunda temporada?</p>
          <p className="mt-1 text-sm text-white/85">Nuestro segundo año, desde el {capituloDos.inicio}</p>

          <div className="relative mt-8 flex min-h-[90px] items-center justify-center gap-3 sm:gap-6">
            <motion.button
              onClick={() => setDijoSi(true)}
              animate={{ scale: 1 + Math.min(intentos, 5) * 0.12 * escala }}
              className="rounded-full bg-white px-6 py-3 text-base font-bold whitespace-nowrap sm:px-8 sm:text-lg text-vino shadow-xl transition hover:brightness-95"
            >
              ¡Sí! 💛
            </motion.button>
            {!dijoSi && (
              <motion.button
                onPointerEnter={(e) => e.pointerType === "mouse" && huir()}
                onClick={huir}
                animate={posNo}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-[7.5rem] rounded-full border-2 border-white px-3 py-2.5 text-xs leading-tight font-semibold text-white sm:w-auto sm:px-6 sm:py-3 sm:text-base"
              >
                {frasesNo[Math.min(intentos, frasesNo.length - 1)]}
              </motion.button>
            )}
          </div>
        </Revelar>

        <div className="mt-16 flex flex-col items-center">
          <div className="relative h-40 w-32 overflow-hidden rounded-[45%] [clip-path:ellipse(50%_50%)] border-4 border-white/70 shadow-2xl">
            <Image src="/optimizado/revista/pagina-10.webp" alt="Te amo" fill sizes="128px" className="scale-[2.2] object-cover object-[48%_70%]" />
          </div>
          <p className="titulo-mano mt-6 text-5xl">te amo</p>
          <p className="mt-2 text-sm text-white/90">
            Hecho con todo mi amor por {pareja.el}, para {pareja.ella}.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {dijoSi && (
          <motion.div
            onUpdate={animarEnJs}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#8e3b46]/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDijoSi(false)}
          >
            {Array.from({ length: 40 }, (_, i) => (
              <motion.span
                key={i}
                className="absolute top-[-40px] text-[#ffd0dc]"
                style={{ left: `${(i * 23) % 100}%` }}
                initial={{ y: -40, rotate: 0 }}
                animate={{ y: "110vh", rotate: (i % 2 ? 1 : -1) * 180 }}
                transition={{ duration: 3 + (i % 5) * 0.6, delay: (i % 10) * 0.15, repeat: Infinity }}
              >
                <Corazon className="h-6 w-6" />
              </motion.span>
            ))}
            <motion.div
              className="relative max-w-md rounded-3xl bg-white p-8 text-center text-vino shadow-2xl"
              initial={{ scale: 0.6, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <div className="text-5xl">📖💛</div>
              <p className="titulo-mano mt-3 text-5xl">¡Trato hecho!</p>
              <p className="texto-libro mt-3 text-xl text-tinta">
                {capituloDos.mensaje}
              </p>
              <p className="mt-4 text-xs text-tinta/50">(toca para cerrar)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
