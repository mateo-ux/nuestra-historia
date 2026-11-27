"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import { useEffect, useMemo, useRef, useState } from "react";
import { buscarLetraEnLinea } from "@/lib/useCancionesCompartidas";

type Linea = { ms: number | null; texto: string };

// Lee letras normales o con tiempos estilo LRC: "[01:23.45] texto".
export function leerLetra(letra: string): { lineas: Linea[]; sincronizada: boolean } {
  const lineas: Linea[] = [];
  for (const cruda of letra.split(/\r?\n/)) {
    const tiempos = [...cruda.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    const texto = cruda.replace(/\[[^\]]*\]/g, "").trim();
    if (tiempos.length === 0) {
      if (!/^\[[a-z]+:/i.test(cruda.trim())) lineas.push({ ms: null, texto });
      continue;
    }
    for (const t of tiempos) {
      const fraccion = t[3] ? Number(t[3].padEnd(3, "0")) : 0;
      lineas.push({ ms: Number(t[1]) * 60000 + Number(t[2]) * 1000 + fraccion, texto });
    }
  }
  const sincronizada = lineas.some((l) => l.ms !== null);
  if (!sincronizada) return { lineas, sincronizada };
  const conTiempo = lineas.filter((l) => l.ms !== null).sort((a, b) => a.ms! - b.ms!);
  return { lineas: conTiempo, sincronizada };
}

type Props = {
  titulo: string;
  letra?: string;
  /** Enlace de Spotify: si la canción no tiene letra, se busca sola en LRCLIB. */
  url: string;
  posicionMs: number;
  /** Si se puede escribir la letra (solo canciones guardadas en la página). */
  editable: boolean;
  onGuardar: (letra: string) => Promise<boolean>;
  onCerrar: () => void;
  /** Botones de anterior / play / siguiente para usar sin salir de la letra. */
  controles?: React.ReactNode;
  error?: string | null;
};

export default function LetraCancion({ titulo, letra: letraGuardada, url, posicionMs, editable, onGuardar, onCerrar, controles, error }: Props) {
  // Letra encontrada en línea (para canciones que aún no la tenían guardada).
  const [encontrada, setEncontrada] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(!letraGuardada);
  const letra = letraGuardada ?? encontrada ?? undefined;
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(letra ?? "");

  useEffect(() => {
    if (letraGuardada) return;
    let activo = true;
    buscarLetraEnLinea(url).then(async (texto) => {
      if (!activo) return;
      setBuscando(false);
      if (!texto) {
        if (editable) setEditando(true);
        return;
      }
      setEncontrada(texto);
      if (editable) await onGuardar(texto);
    });
    return () => {
      activo = false;
    };
    // Solo al abrir la letra de esta canción.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const [guardando, setGuardando] = useState(false);
  const { lineas, sincronizada } = useMemo(() => leerLetra(letra ?? ""), [letra]);
  const caja = useRef<HTMLDivElement>(null);

  // Línea que está sonando ahora (solo si la letra tiene tiempos).
  let actual = -1;
  if (sincronizada) lineas.forEach((l, i) => l.ms !== null && l.ms <= posicionMs + 250 && (actual = i));

  useEffect(() => {
    if (actual < 0 || !caja.current) return;
    const el = caja.current.querySelector<HTMLElement>(`[data-linea="${actual}"]`);
    if (el) caja.current.scrollTo({ top: el.offsetTop - caja.current.clientHeight / 3, behavior: "smooth" });
  }, [actual]);

  const guardar = async () => {
    setGuardando(true);
    const ok = await onGuardar(borrador);
    setGuardando(false);
    if (ok) setEditando(false);
  };

  return (
    <motion.div
      onUpdate={animarEnJs}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-10 flex flex-col rounded-3xl bg-gradient-to-b from-[#a8452a] via-[#8e3b46] to-[#4a2c2a] text-white"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#ffd6a8] uppercase">Letra</p>
          <h3 className="truncate text-lg font-bold">{titulo}</h3>
        </div>
        <div className="flex shrink-0 gap-1">
          {editable && !editando && (
            <button
              onClick={() => {
                setBorrador(letra ?? "");
                setEditando(true);
              }}
              className="rounded-full px-3 py-1 text-xs font-bold text-white/80 transition hover:bg-white/10"
            >
              ✎ Editar
            </button>
          )}
          <button
            onClick={onCerrar}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10"
            aria-label="Cerrar letra"
          >
            ✕
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {editando ? (
          <motion.div onUpdate={animarEnJs} key="editar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col gap-2 px-4 pb-4">
            <textarea
              data-desplazable
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              placeholder={"Escribe o pega la letra aquí.\n\nPara que se mueva con la canción, empieza cada línea con su tiempo:\n[00:12] Primera línea\n[00:17] Segunda línea"}
              className="barra-bonita min-h-0 flex-1 resize-none rounded-xl bg-black/25 p-3 text-sm leading-relaxed placeholder:text-white/45 focus:ring-2 focus:ring-[#ffd6a8] focus:outline-none"
            />
            {!letra && <p className="text-xs text-white/70">No encontré la letra en línea. Puedes pegarla aquí.</p>}
            {error && <p className="text-xs text-[#ffd6a8]">{error}</p>}
            <div className="flex gap-2">
              {letra && (
                <button onClick={() => setEditando(false)} className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-bold transition hover:bg-white/15">
                  Cancelar
                </button>
              )}
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 rounded-lg bg-[#ffd6a8] py-2 text-sm font-bold text-vino transition hover:brightness-95 disabled:opacity-60"
              >
                {guardando ? "Guardando…" : "Guardar letra"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            onUpdate={animarEnJs}
            key="leer"
            ref={caja}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-desplazable
            className="barra-bonita relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6"
          >
            {buscando ? (
              <p className="animate-pulse pt-6 text-center text-sm text-white/75">Buscando la letra…</p>
            ) : lineas.length === 0 ? (
              <p className="pt-6 text-center text-sm text-white/75">
                Esta canción todavía no tiene letra.
                {!editable && " Se puede agregar en datos/contenido.ts."}
              </p>
            ) : (
              lineas.map((l, i) => (
                <p
                  key={i}
                  data-linea={i}
                  className={`text-xl leading-snug font-bold transition-all duration-300 sm:text-2xl ${
                    l.texto === "" ? "h-4" : "py-1"
                  } ${!sincronizada ? "text-white/90" : i === actual ? "text-white" : i < actual ? "text-white/45" : "text-white/30"}`}
                >
                  {l.texto || (sincronizada ? "♪" : "")}
                </p>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {controles && !editando && <div className="border-t border-white/10 px-4 py-3">{controles}</div>}
    </motion.div>
  );
}
