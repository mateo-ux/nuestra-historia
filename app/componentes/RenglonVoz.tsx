"use client";

import { useState } from "react";
import { MAXIMO_SEGUNDOS } from "@/lib/useVoces";

// Un renglón que se graba desde el celular: grabar, escuchar y borrar para
// volver a grabar. Sin framer-motion (solo transiciones CSS).
export default function RenglonVoz({
  icono,
  etiqueta,
  texto,
  hayVoz,
  grabando,
  otroGrabando,
  segundos,
  guardando,
  sonando,
  resaltado = false,
  compartido = false,
  alGrabar,
  alDetener,
  alEscuchar,
  alBorrar,
}: {
  icono: string;
  etiqueta: string;
  texto: string;
  hayVoz: boolean;
  grabando: boolean;
  otroGrabando: boolean;
  segundos: number;
  guardando: boolean;
  sonando: boolean;
  resaltado?: boolean;
  compartido?: boolean;
  alGrabar: () => void;
  alDetener: () => void;
  alEscuchar: () => void;
  alBorrar: () => void;
}) {
  // Antes de borrar se pide confirmar (igual que al eliminar una canción).
  const [confirmar, setConfirmar] = useState(false);

  const boton = "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-50";

  if (confirmar) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#8e3b46] px-3 py-2.5 text-left text-white ring-1 ring-vino/30">
        <p className="min-w-0 flex-1 basis-40 text-sm">
          ¿Eliminar la grabación <span className="font-semibold">“{etiqueta}”</span>?{compartido && " Se borra para los dos."}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmar(false)}
            className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold transition hover:bg-white/25"
          >
            No
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmar(false);
              alBorrar();
            }}
            className="shrink-0 rounded-full bg-[#ffd6a8] px-3 py-1.5 text-xs font-bold text-vino transition hover:brightness-95"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-3 py-2.5 text-left ring-1 transition-colors duration-300 ${
        resaltado ? "bg-[#fde3d2] ring-atardecer/40" : "bg-white/80 ring-durazno/60"
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fde3d2] text-lg" aria-hidden>
        {icono}
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-[10px] font-bold tracking-[0.2em] text-terracota uppercase">{etiqueta}</p>
        <p className="texto-libro text-base leading-snug text-tinta">{texto}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {grabando ? (
          <button type="button" onClick={alDetener} className={`${boton} bg-[#d6455d] text-white`}>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" aria-hidden />
            Detener 0:{String(segundos).padStart(2, "0")}
            <span className="sr-only">de 0:{MAXIMO_SEGUNDOS}</span>
          </button>
        ) : guardando ? (
          <span className={`${boton} bg-white text-vino`}>Guardando…</span>
        ) : hayVoz ? (
          <>
            <button type="button" onClick={alEscuchar} className={`${boton} bg-vino text-white`} aria-label={sonando ? "Detener" : "Escuchar"}>
              {sonando ? "■" : "▶"} <span>{sonando ? "Parar" : "Oír"}</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              className={`${boton} bg-white text-vino ring-1 ring-vino/15`}
              aria-label="Borrar para grabar otra vez"
            >
              🗑
            </button>
          </>
        ) : (
          <button type="button" onClick={alGrabar} disabled={otroGrabando} className={`${boton} bg-[#f28c38] text-white`}>
            🎙️ Grabar
          </button>
        )}
      </div>
    </div>
  );
}
