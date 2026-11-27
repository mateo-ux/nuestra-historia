"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { razones } from "@/datos/contenido";
import Revelar from "./Revelar";
import TituloSeccion from "./TituloSeccion";

const colores = ["#f7b9b0", "#fbd3b8", "#f9c6ad", "#f4a6a0", "#ffd9b8", "#f6c1c7"];

// Se voltea en 3D igual que antes. Mientras está quieta se dibuja plana (la
// cara que toca): así no quedan capas 3D permanentes, que en el celular
// saturan la tarjeta gráfica y hacen parpadear la página.
function Tarjeta({ frente, detras, i }: { frente: string; detras: string; i: number }) {
  const [volteada, setVolteada] = useState(false);
  const [girando, setGirando] = useState(false);

  const caraFrente = (claseExtra: string) => (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-4 shadow-lg ${claseExtra}`}
      style={{ background: colores[i % colores.length] }}
    >
      <span className="text-xs font-bold tracking-[0.25em] text-vino uppercase">Razón #{i + 1}</span>
      <span className="titulo-mano mt-2 text-3xl leading-tight text-vino">{frente}</span>
      <span className="mt-3 text-xs text-vino/90">toca para leer ♡</span>
    </div>
  );
  const caraDetras = (claseExtra: string) => (
    <div className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-5 shadow-lg ${claseExtra}`}>
      <p className="texto-libro text-xl leading-snug text-tinta">{detras}</p>
    </div>
  );

  return (
    <button
      onClick={() => {
        if (girando) return;
        setGirando(true);
        setVolteada((v) => !v);
      }}
      className="h-48 w-full cursor-pointer [perspective:1000px] sm:h-52"
      aria-label={volteada ? detras : `Razón: ${frente}. Toca para leer.`}
    >
      {girando ? (
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          initial={{ rotateY: volteada ? 0 : 180 }}
          animate={{ rotateY: volteada ? 180 : 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 120, damping: 14 }}
          onAnimationComplete={() => setGirando(false)}
        >
          {caraFrente("cara-oculta")}
          {caraDetras("cara-oculta [transform:rotateY(180deg)]")}
        </motion.div>
      ) : (
        <div className="relative h-full w-full">{volteada ? caraDetras("") : caraFrente("")}</div>
      )}
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
