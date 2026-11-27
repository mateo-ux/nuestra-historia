"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Título que no cabe en una línea: avanza despacio hacia la izquierda y,
// después de un espacio, vuelve a entrar el nombre por la derecha (sin
// devolverse). Antes de cada vuelta se queda quieto un momento para leerlo.
// Si cabe, se queda quieto.
const ESPACIO = 56; // px entre el final del nombre y su repetición

export function TextoDeslizante({ texto, className = "" }: { texto: string; className?: string }) {
  const caja = useRef<HTMLSpanElement>(null);
  const linea = useRef<HTMLSpanElement>(null);
  const [ancho, setAncho] = useState(0); // ancho del nombre si no cabe; 0 si cabe

  useEffect(() => {
    const c = caja.current;
    const l = linea.current;
    if (!c || !l) return;
    const medir = () => {
      if (!c.clientWidth) return; // panel aún sin medidas
      setAncho(l.offsetWidth > c.clientWidth ? l.offsetWidth : 0);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(c);
    return () => observador.disconnect();
  }, [texto]);

  const recorrido = ancho + ESPACIO;
  const estilo = ancho
    ? // ~30 px por segundo, más la pausa del inicio (15 % de la vuelta)
      ({ "--distancia": `-${recorrido}px`, "--duracion": `${Math.round(recorrido / 30 / 0.85)}s` } as CSSProperties)
    : undefined;

  return (
    <span ref={caja} className={`block overflow-hidden whitespace-nowrap ${ancho ? "borde-desvanecido" : ""} ${className}`} title={texto}>
      <span className={`inline-flex ${ancho ? "titulo-deslizante" : ""}`} style={estilo}>
        <span ref={linea}>{texto}</span>
        {ancho > 0 && (
          <span aria-hidden style={{ paddingLeft: ESPACIO }}>
            {texto}
          </span>
        )}
      </span>
    </span>
  );
}

// Dedicatoria: muestra dos líneas y, si hay más, "Ver más" / "Ver menos".
export function TextoPlegable({ texto, className = "" }: { texto: string; className?: string }) {
  const parrafo = useRef<HTMLSpanElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [largo, setLargo] = useState(false);

  useEffect(() => {
    const p = parrafo.current;
    if (!p || abierto) return;
    const medir = () => setLargo(p.scrollHeight > p.clientHeight + 1);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(p);
    return () => observador.disconnect();
  }, [texto, abierto]);

  return (
    <span className="block">
      <span ref={parrafo} className={`whitespace-pre-line break-words ${abierto ? "block" : "line-clamp-2"} ${className}`}>
        {texto}
      </span>
      {(largo || abierto) && (
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          className="mt-0.5 text-[11px] font-bold text-[#ffd6a8] transition hover:text-white"
          aria-expanded={abierto}
        >
          {abierto ? "Ver menos" : "Ver más"}
        </button>
      )}
    </span>
  );
}
