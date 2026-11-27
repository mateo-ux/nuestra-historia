"use client";

import { useAnimate } from "framer-motion";
import { useRef, useState } from "react";
import { razones } from "@/datos/contenido";
import Revelar from "./Revelar";
import TituloSeccion from "./TituloSeccion";

const colores = ["#f7b9b0", "#fbd3b8", "#f9c6ad", "#f4a6a0", "#ffd9b8", "#f6c1c7"];

// La tarjeta se voltea "aplanándose" (escala horizontal 1 → 0 → 1) en vez de
// girar en 3D: se ve igual, pero no deja capas 3D permanentes, que en el
// celular saturan la tarjeta gráfica y hacen parpadear la página.
function Tarjeta({ frente, detras, i }: { frente: string; detras: string; i: number }) {
  const [volteada, setVolteada] = useState(false);
  const [alcance, animar] = useAnimate<HTMLDivElement>();
  const girando = useRef(false);

  const voltear = async () => {
    if (girando.current) return;
    girando.current = true;
    await animar(alcance.current, { scaleX: 0 }, { duration: 0.16, ease: "easeIn" });
    setVolteada((v) => !v);
    await animar(alcance.current, { scaleX: 1 }, { duration: 0.24, ease: [0.34, 1.56, 0.64, 1] });
    girando.current = false;
  };

  return (
    <button
      onClick={voltear}
      className="h-48 w-full cursor-pointer sm:h-52"
      aria-label={volteada ? detras : `Razón: ${frente}. Toca para leer.`}
    >
      <div ref={alcance} className="relative h-full w-full">
        {volteada ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-5 shadow-lg">
            <p className="texto-libro text-xl leading-snug text-tinta">{detras}</p>
          </div>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-4 shadow-lg"
            style={{ background: colores[i % colores.length] }}
          >
            <span className="text-xs font-bold tracking-[0.25em] text-vino uppercase">Razón #{i + 1}</span>
            <span className="titulo-mano mt-2 text-3xl leading-tight text-vino">{frente}</span>
            <span className="mt-3 text-xs text-vino/90">toca para leer ♡</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function Razones() {
  return (
    <section id="razones" className="fondo-papel px-4 py-24">
      <TituloSeccion
        antetitulo="Toca cada tarjeta"
        titulo="Razones por las que te quiero"
        subtitulo={`Son ${razones.length}, pero podría seguir escribiendo toda la vida.`}
      />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {razones.map((r, i) => (
          <Revelar key={r.frente} retraso={(i % 4) * 0.08}>
            <Tarjeta {...r} i={i} />
          </Revelar>
        ))}
      </div>
    </section>
  );
}
