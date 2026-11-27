"use client";

import Image from "next/image";
import { useState } from "react";
import { viaje } from "@/datos/contenido";
import { CURVA_SUAVE } from "@/lib/aparecer";
import Aparecer from "./Aparecer";
import Modal from "./Modal";
import TituloSeccion from "./TituloSeccion";

export default function Galeria() {
  const [abierta, setAbierta] = useState<number | null>(null);
  const foto = abierta === null ? null : viaje.fotos[abierta];
  const mover = (paso: number) =>
    setAbierta((a) => (a === null ? a : (a + paso + viaje.fotos.length) % viaje.fotos.length));

  return (
    <section id="viaje" className="relative overflow-hidden bg-gradient-to-b from-[#fde7da] via-[#ffd2b0] to-[#f7a072] px-4 py-24">
      <TituloSeccion antetitulo={viaje.fecha} titulo={viaje.titulo} subtitulo={`“${viaje.cita}”`} />

      <div className="mx-auto max-w-6xl columns-2 gap-4 md:columns-3 lg:columns-4">
        {viaje.fotos.map((f, i) => (
          <Aparecer
            key={f.src}
            className="mb-4 break-inside-avoid"
            margen="-60px"
            desde={`translateY(30px) scale(0.95) rotate(${i % 2 ? 1.5 : -1.5}deg)`}
            hasta="translateY(0px) scale(1) rotate(0deg)"
            duracion={0.8}
            curva={CURVA_SUAVE}
            retraso={(i % 4) * 0.08}
          >
            <button
              onClick={() => setAbierta(i)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-lg"
            >
              <Image
                src={f.src}
                alt={f.pie ?? "Foto del viaje"}
                width={600}
                height={i % 3 === 1 ? 600 : 800}
                sizes="(max-width: 768px) 50vw, 300px"
                className={`w-full object-cover transition duration-700 group-hover:scale-110 ${i % 3 === 1 ? "aspect-square" : "aspect-[3/4]"}`}
              />
              {f.pie && (
                <span className="titulo-mano absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-full bg-black/45 px-2.5 py-0.5 text-left text-base leading-snug text-white sm:inset-x-0 sm:bottom-0 sm:left-0 sm:max-w-none sm:rounded-none sm:bg-transparent sm:bg-gradient-to-t sm:from-black/60 sm:to-transparent sm:px-3 sm:pt-8 sm:pb-2 sm:text-xl sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  {f.pie}
                </span>
              )}
            </button>
          </Aparecer>
        ))}
      </div>

      <Modal abierto={foto !== null} alCerrar={() => setAbierta(null)} ancho="max-w-3xl">
        {foto && (
          <div className="overflow-hidden rounded-2xl bg-white p-3 pb-4 shadow-2xl">
            <div className="relative h-[70vh] w-full">
              <Image src={foto.src} alt={foto.pie ?? ""} fill sizes="90vw" className="object-contain" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 px-2">
              <button onClick={() => mover(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-durazno text-xl text-vino" aria-label="Anterior">‹</button>
              <p className="titulo-mano text-center text-2xl text-vino">{foto.pie}</p>
              <button onClick={() => mover(1)} className="grid h-10 w-10 place-items-center rounded-full bg-durazno text-xl text-vino" aria-label="Siguiente">›</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
