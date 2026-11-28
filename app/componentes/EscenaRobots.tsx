"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import { useState } from "react";
import Corazon from "./Corazon";
import Estrellas from "./Estrellas";
import TituloSeccion from "./TituloSeccion";

// Dos robots originales: él, cuadradito y oxidado, que cuida una plantita;
// ella, blanca y ovalada, que flota. Inspirados en esa película que nos encanta.

function RobotEl({ parpadeo }: { parpadeo: boolean }) {
  return (
    <g>
      {/* orugas */}
      <rect x={-72} y={-38} width={144} height={38} rx={18} fill="#5b4636" />
      {[-48, -16, 16, 48].map((cx) => (
        <circle key={cx} cx={cx} cy={-19} r={12} fill="#3d2f25" stroke="#7a604b" strokeWidth={3} />
      ))}
      {/* cuerpo */}
      <rect x={-56} y={-142} width={112} height={106} rx={10} fill="#e3a63c" stroke="#a8711f" strokeWidth={4} />
      <rect x={-40} y={-126} width={80} height={44} rx={6} fill="#c98a2a" />
      <circle cx={-30} cy={-58} r={5} fill="#b35c2e" opacity={0.6} />
      <circle cx={34} cy={-50} r={4} fill="#b35c2e" opacity={0.5} />
      <path d="M0 -92 l-10 -10 a6 6 0 0 1 10 -7 a6 6 0 0 1 10 7 z" fill="#f05a5a" />
      {/* cuello */}
      <rect x={-6} y={-172} width={12} height={32} fill="#8d7a66" />
      {/* ojos binoculares */}
      <g>
        <rect x={-44} y={-208} width={40} height={36} rx={14} fill="#9aa0a7" stroke="#6f757c" strokeWidth={3} />
        <rect x={4} y={-208} width={40} height={36} rx={14} fill="#9aa0a7" stroke="#6f757c" strokeWidth={3} />
        <circle cx={-24} cy={-190} r={11} fill="#2a2e36" />
        <circle cx={24} cy={-190} r={11} fill="#2a2e36" />
        <circle cx={-20} cy={-194} r={3.5} fill="#fff" />
        <circle cx={28} cy={-194} r={3.5} fill="#fff" />
        <motion.rect
          x={-46}
          y={-210}
          width={92}
          height={20}
          fill="#9aa0a7"
          style={{ originY: 0 }}
          animate={{ scaleY: parpadeo ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        />
      </g>
    </g>
  );
}

function Maceta() {
  return (
    <g>
      <path d="M-16 0 L16 0 L12 26 L-12 26 Z" fill="#c9653d" />
      <rect x={-18} y={-4} width={36} height={8} rx={3} fill="#b4552f" />
      <path d="M0 -4 C0 -18 0 -26 0 -34" stroke="#4f9a4a" strokeWidth={3} fill="none" />
      <path d="M0 -26 C-10 -34 -18 -30 -20 -24 C-12 -20 -4 -22 0 -26Z" fill="#6cc164" />
      <path d="M0 -32 C10 -42 18 -38 20 -32 C12 -27 4 -28 0 -32Z" fill="#7fd477" />
    </g>
  );
}

function RobotElla({ enamorada }: { enamorada: boolean }) {
  return (
    <g>
      <defs>
        <radialGradient id="cuerpo-ella" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#eef1f6" />
          <stop offset="100%" stopColor="#cfd6e2" />
        </radialGradient>
      </defs>
      {/* cuerpo ovalado */}
      <ellipse cx={0} cy={0} rx={46} ry={70} fill="url(#cuerpo-ella)" stroke="#d7dde8" strokeWidth={2} />
      {/* brazos */}
      <ellipse cx={-50} cy={8} rx={10} ry={30} fill="url(#cuerpo-ella)" transform="rotate(12 -50 8)" />
      <ellipse cx={50} cy={8} rx={10} ry={30} fill="url(#cuerpo-ella)" transform="rotate(-12 50 8)" />
      {/* visor */}
      <ellipse cx={0} cy={-30} rx={34} ry={24} fill="#1d2233" />
      {enamorada ? (
        <g fill="#ff7aa2">
          <path d="M-14 -24 l-9 -9 a5.5 5.5 0 0 1 9 -6.5 a5.5 5.5 0 0 1 9 6.5 z" />
          <path d="M14 -24 l-9 -9 a5.5 5.5 0 0 1 9 -6.5 a5.5 5.5 0 0 1 9 6.5 z" />
        </g>
      ) : (
        <g fill="#ffb38a">
          <ellipse cx={-13} cy={-31} rx={9} ry={5} transform="rotate(-10 -13 -31)" />
          <ellipse cx={13} cy={-31} rx={9} ry={5} transform="rotate(10 13 -31)" />
        </g>
      )}
      {/* rubor */}
      {enamorada && (
        <>
          <ellipse cx={-26} cy={-14} rx={6} ry={3} fill="#ff9fb8" opacity={0.7} />
          <ellipse cx={26} cy={-14} rx={6} ry={3} fill="#ff9fb8" opacity={0.7} />
        </>
      )}
    </g>
  );
}

export default function EscenaRobots() {
  const [fase, setFase] = useState<0 | 1 | 2>(0); // 0 quieto, 1 acercándose, 2 chispa
  const [parpadeo, setParpadeo] = useState(false);

  const regalar = () => {
    if (fase !== 0) {
      setFase(0);
      return;
    }
    setFase(1);
    setTimeout(() => setFase(2), 1800);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2c2350] via-[#6b3f6e] to-[#f08a5d] px-4 py-24 text-white">
      <Estrellas cantidad={30} alto={55} pasoArriba={17} pasoIzquierda={31} desfase={3} tam="h-[3px] w-[3px]" />

      <TituloSeccion
        claro
        antetitulo="Como en nuestras peliculas"
        titulo="Dos robots en un mundo enorme"
        subtitulo="Él guardaba una plantita esperando a alguien con quien compartirla. Un día bajó del cielo la robot más bonita del universo."
      />

      <div className="relative mx-auto max-w-4xl">
        <svg viewBox="90 70 620 310" className="w-full" onMouseEnter={() => setParpadeo(true)} onMouseLeave={() => setParpadeo(false)}>
          {/* suelo */}
          <path d="M0 330 Q200 300 400 322 T800 315 L800 380 L0 380Z" fill="#c9714f" />
          <path d="M0 345 Q250 325 500 342 T800 338 L800 380 L0 380Z" fill="#a85a41" />

          {/* robot él */}
          <motion.g
            initial={{ x: 200, y: 332 }}
            animate={{ x: fase === 0 ? 200 : 300, y: [332, 329, 332] }}
            transition={{ x: { duration: 1.6, ease: "easeInOut" }, y: { repeat: Infinity, duration: 0.6 } }}
          >
            <motion.g animate={{ rotate: fase === 2 ? 6 : 0 }} style={{ originX: "50%", originY: "100%" }}>
              <RobotEl parpadeo={parpadeo || fase === 2} />
            </motion.g>
            {/* brazo con maceta */}
            <rect x={52} y={-96} width={fase === 0 ? 30 : 48} height={12} rx={5} fill="#a8711f" />
            <motion.g animate={{ x: fase === 0 ? 96 : 116, y: fase === 0 ? -112 : -150 }} transition={{ duration: 1.2, delay: 0.4 }}>
              <Maceta />
            </motion.g>
          </motion.g>

          {/* robot ella */}
          <motion.g
            initial={{ x: 600, y: 180 }}
            animate={{
              x: fase === 0 ? 600 : 470,
              y: fase === 2 ? 190 : [175, 195, 175],
              rotate: fase === 2 ? -10 : 0,
            }}
            transition={{
              x: { duration: 1.8, ease: "easeInOut" },
              y: fase === 2 ? { duration: 0.6 } : { repeat: Infinity, duration: 3, ease: "easeInOut" },
              rotate: { duration: 0.6 },
            }}
          >
            <RobotElla enamorada={fase === 2} />
          </motion.g>
          {/* sombra de ella */}
          <motion.ellipse
            onUpdate={animarEnJs}
            cy={330}
            rx={36}
            ry={7}
            fill="#000"
            opacity={0.18}
            initial={{ cx: 600 }}
            animate={{ cx: fase === 0 ? 600 : 470 }}
            transition={{ duration: 1.8 }}
          />

          {/* chispa */}
          <AnimatePresence>
            {fase === 2 && (
              <motion.g
                onUpdate={animarEnJs}
                key="chispa"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <circle cx={418} cy={160} r={30} fill="#ffe9a8" opacity={0.35} />
                <path
                  d="M418 128 L424 152 L448 160 L424 168 L418 192 L412 168 L388 160 L412 152 Z"
                  fill="#fff6c9"
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* corazoncitos al tocarse */}
        <AnimatePresence>
          {fase === 2 &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <motion.span
                onUpdate={animarEnJs}
                key={i}
                className="absolute text-[#ff8fb1]"
                style={{ left: `${50 + (i - 2.5) * 4}%`, top: "38%" }}
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ y: -120 - i * 15, opacity: [0, 1, 0], scale: 1.2 }}
                transition={{ duration: 2.2, delay: 0.3 + i * 0.15 }}
              >
                <Corazon className="h-6 w-6" />
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 text-center">
        {/* Mientras espera: un halo que late, un brillo que pasa y la plantita
            que se mece, para que se note que se puede tocar (todo con CSS). */}
        <span className="relative inline-block">
          {fase === 0 && (
            <>
              <span aria-hidden className="halo-boton pointer-events-none absolute inset-0 rounded-full bg-[#ffe9a8]" />
              <span aria-hidden className="halo-boton halo-boton-2 pointer-events-none absolute inset-0 rounded-full bg-[#ffe9a8]" />
            </>
          )}
          <button
            onClick={regalar}
            className={`relative overflow-hidden rounded-full bg-white px-7 py-3 font-bold text-vino transition hover:scale-105 active:scale-95 ${
              fase === 0 ? "shadow-[0_0_24px_6px_rgba(255,226,150,0.55)]" : "shadow-lg"
            }`}
          >
            {fase === 0 && <span aria-hidden className="brillo-boton pointer-events-none absolute inset-y-0 -left-1/2 w-1/3" />}
            <span className="relative">
              {fase === 0 ? (
                <>
                  <span className="mecer-plantita inline-block">🌱</span> Dale la plantita
                </>
              ) : fase === 1 ? (
                "…"
              ) : (
                "↺ Otra vez"
              )}
            </span>
          </button>
        </span>
        <AnimatePresence>
          {fase === 2 && (
            <motion.p
              onUpdate={animarEnJs}
              className="texto-libro mx-auto mt-6 max-w-xl text-2xl text-white drop-shadow-[0_2px_6px_rgba(60,20,30,0.6)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              Entre todo el universo, mi chispa favorita es la que salta cuando estoy contigo.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
