"use client";

import { motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import { useCallback, useEffect, useRef, useState } from "react";
import { videos, type Video } from "@/datos/contenido";
import TituloSeccion from "./TituloSeccion";

// "Nuestras escenas": carrusel tipo rollo de película. Solo el video del centro
// se reproduce, y solo el fragmento entre `inicio` y `fin` (datos/contenido.ts).

function Escena({
  video,
  numero,
  activo,
  sonido,
  alSeleccionar,
  alAlternarSonido,
}: {
  video: Video;
  numero: number;
  activo: boolean;
  sonido: boolean;
  alSeleccionar: () => void;
  alAlternarSonido: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (activo) {
      if (el.currentTime < video.inicio || el.currentTime >= video.fin) el.currentTime = video.inicio;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [activo, video.inicio, video.fin]);

  useEffect(() => {
    if (ref.current) ref.current.muted = !(activo && sonido);
  }, [activo, sonido]);

  const alAvanzar = () => {
    const el = ref.current;
    if (!el) return;
    if (el.currentTime >= video.fin || el.currentTime < video.inicio - 0.5) el.currentTime = video.inicio;
    setProgreso(Math.min(1, Math.max(0, (el.currentTime - video.inicio) / (video.fin - video.inicio))));
  };

  return (
    <motion.div
      onUpdate={animarEnJs}
      data-escena
      onClick={alSeleccionar}
      animate={{ scale: activo ? 1 : 0.86, opacity: activo ? 1 : 0.55 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className={`relative shrink-0 snap-center cursor-pointer ${video.horizontal ? "w-[86vw] max-w-[560px]" : "w-[62vw] max-w-[290px]"}`}
    >
      <p className="mb-3 text-center text-[11px] font-bold tracking-[0.3em] text-[#ffd6a8] uppercase">
        Escena {String(numero).padStart(2, "0")}
      </p>
      <div
        className={`relative overflow-hidden rounded-[1.6rem] border-[6px] border-[#1a1216] bg-black shadow-[0_25px_60px_-10px_rgba(0,0,0,0.7)] ${video.horizontal ? "aspect-video" : "aspect-[9/16]"}`}
      >
        <video
          ref={ref}
          src={`${video.archivo}#t=${video.inicio},${video.fin}`}
          poster={video.portada}
          muted
          playsInline
          preload={activo ? "auto" : "none"}
          onTimeUpdate={alAvanzar}
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = video.inicio;
          }}
          className="h-full w-full object-cover"
        />
        {/* barra del fragmento */}
        <div className="absolute inset-x-3 top-3 h-1 overflow-hidden rounded-full bg-white/30">
          <div className="h-full bg-white" style={{ width: `${activo ? progreso * 100 : 0}%` }} />
        </div>
        {activo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              alAlternarSonido();
            }}
            className="absolute right-3 bottom-3 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur"
          >
            {sonido ? "🔊 Con sonido" : "🔇 Toca para oír"}
          </button>
        )}
        {!activo && <div className="absolute inset-0 grid place-items-center text-5xl text-white/90">▶</div>}
      </div>
      <div className={`mt-4 text-center transition-opacity ${activo ? "opacity-100" : "opacity-0"}`}>
        <h3 className="titulo-mano text-3xl text-white">{video.titulo}</h3>
        <p className="texto-libro mt-1 text-lg text-white/90">{video.texto}</p>
      </div>
    </motion.div>
  );
}

export default function Videos() {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const [visible, setVisible] = useState(false);
  const [sonido, setSonido] = useState(false);
  const seccion = useRef<HTMLElement>(null);

  // Solo reproducir cuando la sección está en pantalla.
  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Si se apaga la sección o se quita el sonido, la canción vuelve.
  useEffect(() => {
    if (sonido && visible) {
      window.dispatchEvent(new Event("pausar-musica"));
      window.dispatchEvent(new Event("pausar-spotify"));
    }
    else window.dispatchEvent(new Event("reanudar-musica"));
  }, [sonido, visible]);

  const irA = useCallback((i: number) => {
    const p = pista.current;
    const tarjeta = p?.querySelectorAll<HTMLElement>("[data-escena]")[i];
    if (!p || !tarjeta) return;
    p.scrollTo({ left: tarjeta.offsetLeft - (p.clientWidth - tarjeta.clientWidth) / 2, behavior: "smooth" });
  }, []);

  const alDesplazar = () => {
    const p = pista.current;
    if (!p) return;
    const centro = p.scrollLeft + p.clientWidth / 2;
    let mejor = 0;
    let dist = Infinity;
    p.querySelectorAll<HTMLElement>("[data-escena]").forEach((t, i) => {
      const d = Math.abs(t.offsetLeft + t.clientWidth / 2 - centro);
      if (d < dist) {
        dist = d;
        mejor = i;
      }
    });
    if (mejor !== activo) setActivo(mejor);
  };

  return (
    <section
      ref={seccion}
      id="videos"
      className="relative overflow-hidden bg-gradient-to-b from-[#2a1a22] via-[#3a1f2b] to-[#2a1a22] py-24 text-white"
    >
      {/* perforaciones de rollo de película */}
      {["top-3", "bottom-3"].map((pos) => (
        <div key={pos} className={`pointer-events-none absolute inset-x-0 ${pos} flex justify-center gap-4 overflow-hidden`}>
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} className="h-4 w-6 shrink-0 rounded-sm bg-[#f7e6d4]/15" />
          ))}
        </div>
      ))}

      <div className="px-4">
        <TituloSeccion
          claro
          antetitulo="Rodada en vivo · sin ensayar"
          titulo="Nuestra película"
          subtitulo="Las escenas que más me gusta repetir. Desliza para ver la siguiente."
        />
      </div>

      <div
        ref={pista}
        onScroll={alDesplazar}
        className="flex snap-x snap-mandatory items-start gap-6 overflow-x-auto px-[19vw] pb-6 [scrollbar-width:none] sm:px-[calc(50vw-145px)] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((vid, i) => (
          <Escena
            key={vid.archivo}
            video={vid}
            numero={i + 1}
            activo={visible && i === activo}
            sonido={sonido}
            alSeleccionar={() => irA(i)}
            alAlternarSonido={() => setSonido((s) => !s)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => irA(Math.max(0, activo - 1))}
          disabled={activo === 0}
          aria-label="Escena anterior"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {videos.map((vid, i) => (
            <button
              key={vid.archivo}
              onClick={() => irA(i)}
              aria-label={`Ir a ${vid.titulo}`}
              className={`h-2.5 rounded-full transition-all ${i === activo ? "w-7 bg-[#ffd6a8]" : "w-2.5 bg-white/40"}`}
            />
          ))}
        </div>
        <button
          onClick={() => irA(Math.min(videos.length - 1, activo + 1))}
          disabled={activo === videos.length - 1}
          aria-label="Escena siguiente"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </section>
  );
}
