"use client";

import Image from "next/image";
import { useState } from "react";
import { picos, type Foto } from "@/datos/contenido";
import { CURVA_NORMAL, resorte } from "@/lib/aparecer";
import Aparecer from "./Aparecer";
import Corazon from "./Corazon";
import TituloSeccion from "./TituloSeccion";

// Las tiras caen como las polaroids (mismo resorte) y quedan un poco torcidas.
const CAIDA = resorte(110, 16);
const giros = [-3, 2.5];

// Una foto de la tira: al tocarla se voltea (transición CSS, sin framer-motion,
// así en iPhone no queda el cuadro vacío al terminar). Atrás está su pie.
function Cuadro({ foto, numero }: { foto: Foto; numero: number }) {
  const [volteada, setVolteada] = useState(false);
  const cara = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;
  return (
    <button
      type="button"
      onClick={() => setVolteada((v) => !v)}
      aria-pressed={volteada}
      aria-label={volteada ? `Ver la foto otra vez: ${foto.pie}` : `Voltear la foto: ${foto.pie}`}
      className="block w-full cursor-pointer [perspective:900px] md:w-36 lg:w-44"
    >
      <div
        className="relative aspect-[3/4] w-full"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: volteada ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: `transform 0.7s ${CURVA_NORMAL}`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden bg-durazno" style={cara}>
          <Image
            src={foto.src}
            alt={foto.pie ?? "Foto de ella"}
            fill
            sizes="(min-width: 1024px) 176px, (min-width: 768px) 144px, 45vw"
            className="object-cover"
            style={foto.encuadre ? { objectPosition: foto.encuadre } : undefined}
          />
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fde3d2] via-[#f9c6ad] to-[#f7b9b0] p-3 text-center"
          style={{ ...cara, transform: "rotateY(180deg)" }}
        >
          <Corazon className="h-6 w-6 text-vino/80" />
          <span className="titulo-mano text-xl leading-tight text-vino sm:text-2xl">{foto.pie}</span>
          <span className="text-[10px] font-bold tracking-[0.25em] text-vino/50 uppercase">n.º {numero}</span>
        </div>
      </div>
    </button>
  );
}

export default function Fotomaton() {
  let contador = 0;
  return (
    <section
      id="picos"
      className="relative overflow-hidden bg-gradient-to-b from-[#f7a072] via-[#fbc6aa] to-[#f7a072] px-4 py-24"
    >
      <TituloSeccion antetitulo={picos.antetitulo} titulo={picos.titulo} subtitulo={picos.subtitulo} />

      <p className="-mt-6 mb-10 text-center text-xs font-bold tracking-[0.25em] text-vino/70 uppercase">
        Toca una foto para voltearla
      </p>

      {/* En celular: dos tiras verticales lado a lado. Desde tablet: tiras
          horizontales, una debajo de la otra y corridas. */}
      <div className="mx-auto flex max-w-md items-start justify-center gap-4 md:max-w-none md:flex-col md:items-center md:gap-10">
        {picos.tiras.map((tira, t) => (
          <Aparecer
            key={tira.nombre}
            margen="-60px"
            className={`curva-resorte w-[45%] md:w-auto ${t === 1 ? "mt-10 md:mt-0 md:ml-24" : "md:mr-24"}`}
            desde={`translateY(40px) rotate(${giros[t] * 2.2}deg) scale(0.95)`}
            hasta={`translateY(0px) rotate(${giros[t]}deg) scale(1)`}
            duracion={CAIDA.duracion}
            curva={CAIDA.curva}
            retraso={0.1 + t * 0.15}
          >
            <div className="bg-white p-2 pb-1 shadow-[0_18px_40px_-12px_rgba(90,40,30,0.4)] sm:p-2.5 sm:pb-1.5">
              <div className="flex flex-col gap-2 md:flex-row sm:gap-2.5">
                {tira.fotos.map((foto) => (
                  <Cuadro key={foto.src} foto={foto} numero={++contador} />
                ))}
              </div>
              <p className="titulo-mano flex items-center justify-center gap-1.5 py-1.5 text-lg text-tinta/75 sm:text-xl">
                {tira.nombre}
                <Corazon className="h-3.5 w-3.5 text-rosa" />
              </p>
            </div>
          </Aparecer>
        ))}
      </div>
    </section>
  );
}
