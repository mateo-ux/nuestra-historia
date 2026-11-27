"use client";

import { useEffect, useRef, useState } from "react";
import { musica, pareja } from "@/datos/contenido";
import { CURVA_ENTRADA_SALIDA, CURVA_NORMAL, CURVA_SALIDA } from "@/lib/aparecer";
import Image from "next/image";
import Corazon from "./Corazon";

const fotoCarta = "/optimizado/fotos/img_4447.webp";

// Girasol pequeño dibujado (pétalos alrededor de un centro café).
function Girasol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="12" cy="5.2" rx="2.1" ry="4.2" fill="#f6c343" transform={`rotate(${i * 30} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="4.4" fill="#7a4a24" />
      <circle cx="12" cy="12" r="2.6" fill="#5c3418" />
    </svg>
  );
}

// Atardecer pequeño: medio sol sobre el horizonte y dos líneas de agua.
function Atardecer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 22" className={className} aria-hidden="true">
      <path d="M8 15a12 12 0 0 1 24 0z" fill="#f08a5d" />
      <path d="M20 3v-2.5M10.5 6.5 9 5M29.5 6.5 31 5" stroke="#f08a5d" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 15h34M9 18.2h22M15 21h10" stroke="#e8673c" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Adornos muy suaves de la carta: no tapan el texto ni la foto.
function DecoracionCarta() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
      <Corazon className="absolute top-3 left-3 h-3 w-3 -rotate-12 text-rosa opacity-80" />
      <Corazon className="absolute top-8 left-7 h-2 w-2 rotate-12 text-atardecer opacity-50" />
      <Corazon className="absolute top-4 right-9 h-2 w-2 rotate-6 text-rosa opacity-70" />
      <Girasol className="absolute top-2.5 right-3 h-5 w-5 rotate-12 opacity-85" />
      <Girasol className="absolute top-[5.6rem] left-5 h-4 w-4 -rotate-12 opacity-75 sm:left-8" />
      <Atardecer className="absolute top-[5.4rem] right-5 h-4 w-8 opacity-60 sm:right-8" />
      <Corazon className="absolute top-[7.4rem] right-10 h-2.5 w-2.5 -rotate-6 text-vino opacity-35 sm:right-14" />
    </div>
  );
}

// Sobre sellado al entrar + botón flotante de música.
export default function Intro() {
  const [fase, setFase] = useState<"cerrado" | "abriendo" | "saliendo" | "fuera">("cerrado");
  // Desde que se toca el sobre ya no vuelve a su estado inicial (antes, al pasar
  // a la salida durante el fundido de salida, el texto de ayuda reaparecía).
  const abierto = fase !== "cerrado";
  const saliendo = fase === "saliendo" || fase === "fuera";
  const [hayMusica, setHayMusica] = useState(true);
  const [sonando, setSonando] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  // Mientras el sobre está en pantalla, la página de atrás no se mueve.
  // No se cambia el overflow del body: en celular eso hace que la barra del
  // navegador aparezca/desaparezca y la página "parpadee" al cerrar el sobre.
  useEffect(() => {
    if (saliendo) return;
    const bloquear = (e: Event) => e.preventDefault();
    const teclas = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", bloquear, { passive: false });
    window.addEventListener("touchmove", bloquear, { passive: false });
    window.addEventListener("keydown", teclas);
    return () => {
      window.removeEventListener("wheel", bloquear);
      window.removeEventListener("touchmove", bloquear);
      window.removeEventListener("keydown", teclas);
    };
  }, [saliendo]);

  // Por si el navegador no avisa el fin del fundido (pestaña en segundo plano).
  useEffect(() => {
    if (fase !== "saliendo") return;
    const t = setTimeout(() => setFase("fuera"), 1200);
    return () => clearTimeout(t);
  }, [fase]);

  const abrir = () => {
    if (fase !== "cerrado") return;
    window.scrollTo(0, 0);
    setFase("abriendo");
    const a = audio.current;
    if (a && hayMusica) {
      a.volume = 0.5;
      a.play().then(() => setSonando(true)).catch(() => setSonando(false));
    }
    setTimeout(() => setFase("saliendo"), 2600);
  };

  // Los videos con sonido pausan la canción y la reanudan al terminar.
  useEffect(() => {
    let estabaSonando = false;
    const pausar = () => {
      const a = audio.current;
      if (a && !a.paused) {
        estabaSonando = true;
        a.pause();
        setSonando(false);
      }
    };
    const reanudar = () => {
      const a = audio.current;
      if (a && estabaSonando) {
        estabaSonando = false;
        a.play().then(() => setSonando(true)).catch(() => { });
      }
    };
    window.addEventListener("pausar-musica", pausar);
    window.addEventListener("reanudar-musica", reanudar);
    return () => {
      window.removeEventListener("pausar-musica", pausar);
      window.removeEventListener("reanudar-musica", reanudar);
    };
  }, []);

  // Comunica el estado al reproductor de canciones.
  useEffect(() => {
    const enviar = () =>
      window.dispatchEvent(new CustomEvent("estado-bienvenida", { detail: { hay: hayMusica && !!musica.archivo, sonando } }));
    enviar();
    window.addEventListener("pedir-estado-bienvenida", enviar);
    return () => window.removeEventListener("pedir-estado-bienvenida", enviar);
  }, [hayMusica, sonando]);

  useEffect(() => {
    const fn = () => {
      const a = audio.current;
      if (!a) return;
      if (a.paused) a.play().then(() => setSonando(true)).catch(() => { });
      else {
        a.pause();
        setSonando(false);
      }
    };
    window.addEventListener("alternar-bienvenida", fn);
    return () => window.removeEventListener("alternar-bienvenida", fn);
  }, []);


  return (
    <>
      <audio ref={audio} src={musica.archivo} loop preload="none" onError={() => setHayMusica(false)} />

      {/* Todo el sobre se anima con transiciones CSS (no framer-motion): en iPhone,
          al terminar cada animación de framer se veía un cuadro con el estado
          inicial (la solapa cerrada otra vez, el sobre reapareciendo al salir).
          Mismos tiempos y curvas que antes. Ver lib/aparecer.ts. */}
      {fase !== "fuera" && (
        <div
          className={`fixed inset-0 z-[60] flex touch-none flex-col items-center justify-center overscroll-none bg-gradient-to-b from-[#e47f52] via-[#d4603e] to-[#a8414c] px-6 will-change-[opacity] ${saliendo ? "pointer-events-none" : ""}`}
          style={{ opacity: saliendo ? 0 : 1, transition: `opacity 0.8s ${CURVA_ENTRADA_SALIDA}` }}
          onTransitionEnd={(e) => {
            if (saliendo && e.target === e.currentTarget && e.propertyName === "opacity") setFase("fuera");
          }}
        >
          <p
            className="titulo-mano mb-12 text-center text-3xl text-white drop-shadow sm:text-4xl"
            style={{
              opacity: abierto ? 0 : 1,
              transform: abierto ? "translateY(-10px)" : "translateY(0px)",
              transition: `opacity 0.4s ${CURVA_NORMAL}, transform 0.4s ${CURVA_NORMAL}`,
            }}
          >
            Para mi morenita
          </p>

          <button
            onClick={abrir}
            aria-label="Abrir el sobre"
            className="relative h-[200px] w-[300px] cursor-pointer [perspective:900px] sm:h-[230px] sm:w-[340px]"
            style={{
              transform: abierto ? "translateY(60px)" : "translateY(0px)",
              transition: `transform 0.8s ${CURVA_ENTRADA_SALIDA}`,
            }}
          >
            {/* sombra aparte y un poco más adentro: si la lleva el fondo, en el
                celular se ve una línea oscura en los bordes y esquinas */}
            <div
              className="absolute inset-[3px] rounded-lg shadow-[0_25px_50px_-12px_rgba(90,30,30,0.45)]"
              style={{ zIndex: 0 }}
              aria-hidden
            />
            {/* fondo interior del sobre */}
            <div className="absolute inset-0 rounded-lg bg-[#f3c7ae]" style={{ zIndex: 0 }} />
            {/* carta que sale */}
            <div
              className="absolute inset-x-4 top-3 bottom-3 flex flex-col items-center justify-start rounded-md bg-crema p-4 pt-5 text-center shadow"
              style={{
                zIndex: 1,
                transform: abierto ? "translateY(-130px)" : "translateY(0px)",
                transition: `transform 1s ${CURVA_SALIDA} 0.6s`,
              }}
            >
              <DecoracionCarta />
              <span className="titulo-mano relative text-2xl text-vino">Siempre fuiste tú</span>
              <span className="texto-libro relative mt-1 text-sm text-tinta/70">una historia para ti</span>
              {/* foto pegada con cinta, pequeña y un poco torcida */}
              <div className="relative mt-2.5 -rotate-3 rounded-[2px] bg-white p-[3px] pb-[9px] shadow-[0_2px_6px_rgba(90,40,30,0.22)]">
                <div className="relative h-[58px] w-[78px] overflow-hidden sm:h-[78px] sm:w-[104px]">
                  <Image
                    src={fotoCarta}
                    alt="Nosotros en el mar"
                    fill
                    sizes="(min-width: 640px) 104px, 78px"
                    loading="eager"
                    className="object-cover object-[50%_72%]"
                  />
                </div>
                <span
                  aria-hidden
                  className="absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 rotate-[4deg] bg-[#f7b9b0]/60 shadow-[0_1px_1px_rgba(120,60,50,0.08)]"
                  style={{ clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 50%)" }}
                />
              </div>
            </div>
            {/* bolsillo: solapas laterales e inferior, cubren todo menos el triángulo de arriba */}
            <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ zIndex: 2 }}>
              <div className="absolute inset-0 bg-[#fde3d2]" style={{ clipPath: "polygon(0 0, 50% 54%, 0 100%)" }} />
              <div className="absolute inset-0 bg-[#fde3d2]" style={{ clipPath: "polygon(100% 0, 50% 54%, 100% 100%)" }} />
              <div className="absolute inset-0 drop-shadow-[0_-2px_3px_rgba(120,50,40,0.12)]">
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 100%, 50% 46%, 100% 100%)", background: "linear-gradient(to top, #fbd3b8, #fde3d2)" }}
                />
              </div>
            </div>
            {/* solapa de arriba */}
            <div
              className="absolute inset-x-0 top-0 h-[60%] origin-top overflow-hidden rounded-t-lg drop-shadow-[0_3px_4px_rgba(120,50,40,0.18)]"
              style={{
                zIndex: abierto ? 0 : 3,
                transform: abierto ? "rotateX(180deg)" : "rotateX(0deg)",
                transition: `transform 0.6s ${CURVA_NORMAL}`,
              }}
            >
              <div className="absolute inset-0 bg-[#f9c6ad]" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            </div>
            {/* sello: late mientras espera; al abrir se encoge y desaparece */}
            <div
              className={`absolute top-[56%] left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-vino shadow-lg ${abierto ? "" : "animate-[latido-sello_1.6s_ease-in-out_infinite]"}`}
              style={{
                zIndex: 4,
                transform: abierto ? "scale(0)" : "scale(1)",
                opacity: abierto ? 0 : 1,
                transition: `transform 0.3s ${CURVA_NORMAL}, opacity 0.3s ${CURVA_NORMAL}`,
              }}
            >
              <Corazon className="h-7 w-7 text-[#ffd6c9]" />
            </div>
          </button>

          {/* Al tocar el sobre, las instrucciones se apagan al instante. Se
              mantienen en su sitio para que el sobre no salte. */}
          <div
            className="flex flex-col items-center"
            style={{ opacity: abierto ? 0 : 1, transition: `opacity 0.15s ${CURVA_NORMAL}` }}
          >
            <p
              className={`mt-10 text-sm font-semibold tracking-widest text-white uppercase ${abierto ? "" : "animate-[pulso-ayuda_2s_ease-in-out_infinite]"}`}
            >
              Toca el sobre para abrirlo
            </p>
            {hayMusica && <p className="mt-2 text-xs text-white/90">(sube el volumen 🎶)</p>}
          </div>
        </div>
      )}

    </>
  );
}
