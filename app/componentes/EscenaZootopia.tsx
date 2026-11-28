"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import { useCallback, useEffect, useRef, useState } from "react";
import { pareja, personajes } from "@/datos/contenido";
import { useGrabadora, useVoces, type ClaveVoz } from "@/lib/useVoces";
import Corazon from "./Corazon";
import ImagenPersonaje from "./ImagenPersonaje";
import RenglonVoz from "./RenglonVoz";
import Revelar from "./Revelar";
import TituloSeccion from "./TituloSeccion";

// Versiones propias, dibujadas a mano en SVG, de un zorro pícaro, una conejita
// policía y un perezoso muuuy lento. Un guiño a esa ciudad de animales que tanto nos gusta.

function Zorro({ guino }: { guino: boolean }) {
  const piel = "#d9652e";
  const crema = "#f6dfc2";
  const oscuro = "#3f2219";
  return (
    <svg viewBox="0 0 220 280" className="h-full w-full overflow-visible">
      {/* cola esponjada */}
      <motion.g animate={{ rotate: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ originX: "0%", originY: "100%" }}>
        <path d="M150 250 C210 245 222 185 196 150 C188 140 178 138 172 142 C186 170 178 205 140 228 Z" fill={piel} />
        <path d="M196 150 C204 162 206 176 202 188 C192 178 184 160 186 146 C190 146 193 147 196 150Z" fill={crema} />
      </motion.g>
      {/* pantalón */}
      <path d="M68 280 L70 250 L150 250 L152 280 Z" fill="#c9b48a" />
      {/* camisa hawaiana verde */}
      <path d="M58 262 C56 214 74 190 110 188 C146 190 164 214 162 262 Z" fill="#6aa84f" />
      {[[78, 222], [140, 218], [86, 248], [134, 246], [70, 240], [150, 238]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${i * 40})`}>
          <ellipse rx={7} ry={3.5} fill="#3f7a32" />
          <ellipse rx={3.5} ry={7} fill="#4c8c3b" opacity={0.8} />
        </g>
      ))}
      {/* cuello de piel */}
      <ellipse cx={110} cy={190} rx={22} ry={9} fill={crema} />
      {/* solapas */}
      <path d="M90 190 L110 210 L98 222 L84 196 Z" fill="#8fc46f" />
      <path d="M130 190 L110 210 L122 222 L136 196 Z" fill="#8fc46f" />
      {/* corbata a rayas */}
      <path d="M105 206 L115 206 L120 252 L110 264 L100 252 Z" fill="#4d4f96" />
      <path d="M102 222 L118 216 M101 236 L119 230 M103 250 L118 244" stroke="#a7a9e0" strokeWidth={3} />
      <path d="M104 204 L116 204 L114 212 L106 212 Z" fill="#3b3d7a" />

      {/* orejas grandes y puntiagudas */}
      <motion.g animate={{ rotate: guino ? -6 : 0 }} style={{ originX: "80%", originY: "100%" }}>
        <path d="M58 92 L42 14 L100 62 Z" fill={piel} />
        <path d="M63 84 L52 34 L90 64 Z" fill={oscuro} />
      </motion.g>
      <motion.g animate={{ rotate: guino ? 6 : 0 }} style={{ originX: "20%", originY: "100%" }}>
        <path d="M162 92 L178 14 L120 62 Z" fill={piel} />
        <path d="M157 84 L168 34 L130 64 Z" fill={oscuro} />
      </motion.g>

      {/* cabeza */}
      <path d="M46 108 Q48 60 110 56 Q172 60 174 108 Q172 136 150 150 L110 184 L70 150 Q48 136 46 108 Z" fill={piel} />
      {/* mechones de las mejillas */}
      <path d="M46 112 L36 128 L52 126 L44 140 L64 138 Z" fill={piel} />
      <path d="M174 112 L184 128 L168 126 L176 140 L156 138 Z" fill={piel} />
      {/* hocico crema */}
      <path d="M62 124 Q84 120 102 138 L110 150 L118 138 Q136 120 158 124 Q150 158 110 186 Q70 158 62 124 Z" fill={crema} />
      {/* puente del hocico */}
      <path d="M100 96 L120 96 L114 156 L106 156 Z" fill={piel} />

      {/* ojo izquierdo, medio cerrado y pícaro */}
      <path d="M66 112 Q82 100 98 110 Q82 120 66 112 Z" fill="#f4efcf" />
      <circle cx={84} cy={110} r={6.5} fill="#5aa13a" />
      <circle cx={85} cy={110} r={3.2} fill="#161616" />
      <circle cx={87} cy={108} r={1.4} fill="#fff" />
      <path d="M62 104 L100 104 L98 110 Q82 105 66 112 Z" fill={piel} />
      <path d="M66 112 Q82 105 98 110" stroke={oscuro} strokeWidth={2.5} fill="none" />
      <path d="M66 96 Q82 92 98 98" stroke={oscuro} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* ojo derecho / guiño */}
      {guino ? (
        <path d="M122 112 Q138 120 154 110" stroke={oscuro} strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M122 110 Q138 100 154 112 Q138 120 122 110 Z" fill="#f4efcf" />
          <circle cx={136} cy={110} r={6.5} fill="#5aa13a" />
          <circle cx={135} cy={110} r={3.2} fill="#161616" />
          <circle cx={137} cy={108} r={1.4} fill="#fff" />
          <path d="M120 104 L158 104 L154 112 Q138 105 122 110 Z" fill={piel} />
          <path d="M122 110 Q138 105 154 112" stroke={oscuro} strokeWidth={2.5} fill="none" />
        </g>
      )}
      {/* ceja levantada */}
      <path d="M122 92 Q138 82 156 92" stroke={oscuro} strokeWidth={3.5} fill="none" strokeLinecap="round" />

      {/* nariz y sonrisa de medio lado */}
      <ellipse cx={110} cy={156} rx={10} ry={7} fill="#1d1210" />
      <ellipse cx={107} cy={154} rx={3} ry={1.6} fill="#fff" opacity={0.5} />
      <path d="M96 168 Q110 172 124 162 Q128 160 130 156" stroke={oscuro} strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Coneja({ feliz }: { feliz: boolean }) {
  const piel = "#9d9aab";
  const claro = "#e4e0ea";
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full overflow-visible">
      {/* orejas largas con puntas negras */}
      <motion.g
        animate={{ rotate: feliz ? [-6, 6, -6] : [-3, 0, -3] }}
        transition={{ repeat: Infinity, duration: feliz ? 0.6 : 3 }}
        style={{ originX: "50%", originY: "100%" }}
      >
        <g transform="rotate(-8 78 70)">
          <ellipse cx={78} cy={58} rx={16} ry={58} fill="#2b2930" />
          <ellipse cx={78} cy={74} rx={16} ry={48} fill={piel} />
          <ellipse cx={78} cy={78} rx={8} ry={38} fill="#f2b6c6" />
        </g>
      </motion.g>
      <motion.g
        animate={{ rotate: feliz ? [6, -6, 6] : [3, 0, 3] }}
        transition={{ repeat: Infinity, duration: feliz ? 0.6 : 3.4 }}
        style={{ originX: "50%", originY: "100%" }}
      >
        <g transform="rotate(8 122 70)">
          <ellipse cx={122} cy={58} rx={16} ry={58} fill="#2b2930" />
          <ellipse cx={122} cy={74} rx={16} ry={48} fill={piel} />
          <ellipse cx={122} cy={78} rx={8} ry={38} fill="#f2b6c6" />
        </g>
      </motion.g>

      {/* uniforme de policía */}
      <path d="M62 290 C60 236 76 208 100 206 C124 208 140 236 138 290 Z" fill="#2a3a5e" />
      <path d="M70 290 L70 236 Q100 224 130 236 L130 290 Z" fill="#1c1e26" />
      <path d="M86 208 L100 222 L92 232 L80 214 Z" fill="#3b5080" />
      <path d="M114 208 L100 222 L108 232 L120 214 Z" fill="#3b5080" />
      <ellipse cx={100} cy={207} rx={16} ry={6} fill={claro} />
      {/* placa dorada */}
      <path d="M114 244 L124 240 L134 244 L132 258 L124 264 L116 258 Z" fill="#f2c14e" stroke="#c99a2e" strokeWidth={1.5} />
      <circle cx={124} cy={252} r={3} fill="#c99a2e" />
      <rect x={76} y={244} width={16} height={8} rx={2} fill="#3b3f4c" />
      {/* zanahoria grabadora */}
      <g transform="rotate(-25 72 262)">
        <path d="M60 258 L86 254 L86 266 Z" fill="#f28c38" />
        <path d="M86 254 L94 250 M86 260 L96 260 M86 266 L94 270" stroke="#4f9a4a" strokeWidth={3} strokeLinecap="round" />
      </g>

      <rect x={86} y={186} width={28} height={22} rx={8} fill={piel} />
      {/* cabeza */}
      <ellipse cx={100} cy={150} rx={52} ry={47} fill={piel} />
      <path d="M58 160 Q66 136 100 150 Q134 136 142 160 Q134 192 100 196 Q66 192 58 160 Z" fill={claro} />
      <path d="M90 104 Q100 98 110 104 L104 128 L96 128 Z" fill="#8b889a" />

      {/* ojos grandes violeta */}
      {feliz ? (
        <g stroke="#3a2a4d" strokeWidth={4} fill="none" strokeLinecap="round">
          <path d="M66 142 Q78 130 90 142" />
          <path d="M110 142 Q122 130 134 142" />
        </g>
      ) : (
        <g>
          <ellipse cx={78} cy={140} rx={13} ry={15} fill="#fff" />
          <ellipse cx={122} cy={140} rx={13} ry={15} fill="#fff" />
          <circle cx={79} cy={142} r={10} fill="#7a4fb5" />
          <circle cx={121} cy={142} r={10} fill="#7a4fb5" />
          <circle cx={79} cy={143} r={5} fill="#231a33" />
          <circle cx={121} cy={143} r={5} fill="#231a33" />
          <circle cx={83} cy={138} r={3} fill="#fff" />
          <circle cx={125} cy={138} r={3} fill="#fff" />
          <path d="M64 130 Q78 120 92 128 M108 128 Q122 120 136 130" stroke="#3a3346" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* mejillas */}
      <ellipse cx={62} cy={168} rx={9} ry={5} fill="#f5a3b8" opacity={feliz ? 0.95 : 0.5} />
      <ellipse cx={138} cy={168} rx={9} ry={5} fill="#f5a3b8" opacity={feliz ? 0.95 : 0.5} />
      {/* nariz rosada, boca y dientes */}
      <path d="M93 162 L107 162 L100 170 Z" fill="#ef7f9c" />
      <path d="M100 170 Q92 180 85 175 M100 170 Q108 180 115 175" stroke="#5a3d45" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <rect x={95.5} y={175} width={9} height={8} rx={1.5} fill="#fff" stroke="#d9d3dc" strokeWidth={0.8} />
      <line x1={100} y1={175} x2={100} y2={183} stroke="#d9d3dc" strokeWidth={0.8} />
    </svg>
  );
}

function Perezoso({ sonrisa, ojos }: { sonrisa: number; ojos: number }) {
  return (
    <svg viewBox="0 0 220 280" className="h-full w-full">
      {/* camisa y corbata de oficina */}
      <path d="M40 280 Q46 206 110 200 Q174 206 180 280 Z" fill="#cfe3c4" />
      <path d="M92 202 L110 222 L98 236 L84 208 Z" fill="#e6f1df" />
      <path d="M128 202 L110 222 L122 236 L136 208 Z" fill="#e6f1df" />
      <path d="M105 220 L115 220 L120 268 L110 280 L100 268 Z" fill="#5b4a8a" />
      <rect x={128} y={244} width={38} height={14} rx={3} fill="#fff" stroke="#b9c9b0" />
      <text x={147} y={254} textAnchor="middle" fontSize={8} fontWeight={700} fill="#4a3b2c">FLASH</text>
      {/* brazos largos */}
      <path d="M44 270 Q30 230 58 214" stroke="#a88b6c" strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* cabeza */}
      <ellipse cx={110} cy={120} rx={86} ry={80} fill="#a88b6c" />
      <ellipse cx={110} cy={128} rx={66} ry={56} fill="#ecdcc3" />
      <ellipse cx={78} cy={118} rx={22} ry={13} fill="#6b4f39" transform="rotate(-18 78 118)" />
      <ellipse cx={142} cy={118} rx={22} ry={13} fill="#6b4f39" transform="rotate(18 142 118)" />
      <circle cx={80} cy={116} r={6} fill="#1d1612" />
      <circle cx={140} cy={116} r={6} fill="#1d1612" />
      <circle cx={82} cy={114} r={1.8} fill="#fff" />
      <circle cx={142} cy={114} r={1.8} fill="#fff" />
      <rect x={60} y={100} width={40} height={24 * ojos} fill="#6b4f39" transform="rotate(-18 78 118)" />
      <rect x={120} y={100} width={40} height={24 * ojos} fill="#6b4f39" transform="rotate(18 142 118)" />
      <ellipse cx={110} cy={142} rx={12} ry={8} fill="#3d2c22" />
      <motion.path
        d="M64 156 Q110 200 156 156"
        stroke="#3d2c22"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        animate={{ pathLength: 0.15 + sonrisa * 0.85 }}
        initial={{ pathLength: 0.15 }}
        transition={{ duration: 2.5, ease: "linear" }}
        style={{ pathOffset: (1 - (0.15 + sonrisa * 0.85)) / 2 }}
      />
      {sonrisa > 0.95 && <path d="M80 168 Q110 192 140 168 Q110 182 80 168Z" fill="#fffaf0" />}
      <path d="M95 42 Q100 30 108 40 Q114 28 122 42" stroke="#8a6f53" strokeWidth={3} fill="none" />
    </svg>
  );
}

const mensajeLento = "Te... a... mo...";

// El guion de la zanahoria grabadora: un renglón para cada uno.
const guion = [
  { clave: "zanahoria-1", icono: "🦊", quien: pareja.el, texto: "«Te amo, conejita. Y te amare por siempre»" },
  { clave: "zanahoria-2", icono: "🐰", quien: pareja.ella, texto: "«Lo sé, zorro desgraciado. Yo te amo mucho mas.»" },
] as const;

const vocesFlash = [
  { clave: "flash-lento", icono: "🦥", etiqueta: "Mateo Flash", texto: "«Te… a… mo…»" },
] as const;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Un solo reproductor de audio para toda la escena. Mientras suena una voz,
// la canción de fondo se pausa y vuelve al terminar.
function useReproductorVoz() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fin = useRef<(() => void) | null>(null);
  const [sonando, setSonando] = useState<string | null>(null);

  const parar = useCallback(() => {
    const a = audio.current;
    if (a) a.pause();
    fin.current?.();
  }, []);

  // Devuelve una promesa que se cumple cuando la voz termina (o se detiene).
  const tocar = useCallback((id: string, url: string) => {
    fin.current?.();
    const a = (audio.current ??= new Audio());
    a.preload = "auto";
    a.src = url;
    setSonando(id);
    window.dispatchEvent(new Event("pausar-musica"));
    window.dispatchEvent(new Event("pausar-spotify"));
    return new Promise<void>((resolver) => {
      const terminar = () => {
        a.removeEventListener("ended", terminar);
        a.removeEventListener("error", terminar);
        fin.current = null;
        setSonando(null);
        window.dispatchEvent(new Event("reanudar-musica"));
        resolver();
      };
      fin.current = terminar;
      a.addEventListener("ended", terminar);
      a.addEventListener("error", terminar);
      a.play().catch(terminar);
    });
  }, []);

  useEffect(() => () => audio.current?.pause(), []);
  return { sonando, tocar, parar };
}

export default function EscenaZootopia() {
  const [grabacion, setGrabacion] = useState(false);
  const [linea, setLinea] = useState<number | null>(null);
  const turno = useRef(0);
  const { voces, guardar, borrar, guardando, error, compartido } = useVoces();
  const { grabando, segundos, aviso, empezar, detener } = useGrabadora((clave, audio) => void guardar(clave, audio));
  const { sonando, tocar, parar } = useReproductorVoz();

  // Reproduce el guion completo: el renglón de él y luego el de ella. Si un
  // renglón todavía no está grabado, solo se resalta un momento.
  const reproducirGuion = async () => {
    if (grabacion) {
      turno.current += 1;
      parar();
      setLinea(null);
      setGrabacion(false);
      return;
    }
    const mio = ++turno.current;
    setGrabacion(true);
    for (let i = 0; i < guion.length; i++) {
      if (turno.current !== mio) return;
      setLinea(i);
      const voz = voces[guion[i].clave];
      if (voz) await tocar(guion[i].clave, voz.url);
      else await esperar(2200);
    }
    // al terminar las grabaciones, la zanahoria se detiene sola
    if (turno.current === mio) {
      setLinea(null);
      setGrabacion(false);
    }
  };

  const controlesVoz = (clave: ClaveVoz) => ({
    hayVoz: !!voces[clave],
    grabando: grabando === clave,
    otroGrabando: grabando !== null && grabando !== clave,
    segundos,
    guardando: guardando === clave,
    sonando: sonando === clave,
    alGrabar: () => {
      parar();
      void empezar(clave);
    },
    alDetener: detener,
    alEscuchar: () => {
      if (sonando === clave) parar();
      else if (voces[clave]) void tocar(clave, voces[clave].url);
    },
    alBorrar: () => {
      if (sonando === clave) parar();
      void borrar(clave);
    },
  });

  const avisoVoz = aviso ?? error;
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const hablarLento = () => {
    if (escribiendo) return;
    setTexto("");
    setEscribiendo(true);
    const vozFlash = voces["flash-lento"];
    if (vozFlash) setTimeout(() => void tocar("flash-lento", vozFlash.url), 1200);
    let i = 0;
    const paso = () => {
      i += 1;
      setTexto(mensajeLento.slice(0, i));
      if (i < mensajeLento.length) {
        const ch = mensajeLento[i - 1];
        temporizador.current = setTimeout(paso, ch === "." ? 650 : ch === " " ? 900 : 450);
      } else {
        temporizador.current = setTimeout(() => setEscribiendo(false), 400);
      }
    };
    temporizador.current = setTimeout(paso, 1200);
  };

  const progreso = texto.length / mensajeLento.length;
  const terminado = !escribiendo && texto.length === mensajeLento.length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fde7da] via-[#e9f3e4] to-[#fde7da] px-4 py-24">
      <TituloSeccion
        antetitulo="Una ciudad donde cualquiera puede ser lo que quiera"
        titulo="El zorro y la conejita"
        subtitulo="Él siempre tiene un plan una sonrisa pícara. Juntos, el mejor equipo de la ciudad."
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
        {/* zorro y coneja */}
        <Revelar className="relative rounded-[2rem] bg-white/70 p-4 shadow-xl ring-1 ring-white sm:p-6">
          <div className="mb-2 flex min-h-[8.5rem] items-end">
            <AnimatePresence>
              {grabacion && (
                <motion.div
                  onUpdate={animarEnJs}
                  className="mx-auto w-full max-w-md rounded-2xl bg-white p-4 text-center shadow-lg ring-1 ring-durazno"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <p className="text-[11px] font-bold tracking-widest text-terracota uppercase">🔴 Grabación #001</p>
                  {guion.map((g, i) => (
                    <p
                      key={g.clave}
                      className={`texto-libro mt-1 rounded-lg px-1 text-lg transition-[opacity,background-color] duration-300 ${i === 0 ? "text-tinta" : "text-vino"} ${linea === null ? "" : linea === i ? "bg-[#fde3d2]" : "opacity-50"
                        }`}
                    >
                      {g.texto}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-end justify-center gap-2">
            <motion.div className="h-52 w-[50%] max-w-56 sm:h-72 sm:w-56" animate={{ x: grabacion ? 10 : 0 }}>
              <ImagenPersonaje opciones={grabacion ? personajes.zorroGuino : personajes.zorro} alt="El zorro" respaldo={<Zorro guino={grabacion} />} />
            </motion.div>
            <motion.div className="h-52 w-[42%] max-w-48 sm:h-72 sm:w-48" animate={{ x: grabacion ? -10 : 0, y: grabacion ? [0, -12, 0] : 0 }} transition={{ y: { repeat: grabacion ? 2 : 0, duration: 0.4 } }}>
              <ImagenPersonaje opciones={grabacion ? personajes.conejaFeliz : personajes.coneja} alt="La conejita" respaldo={<Coneja feliz={grabacion} />} />
            </motion.div>
          </div>



          <div className="mt-4 text-center">
            <button
              onClick={reproducirGuion}
              className="inline-flex items-center gap-2 rounded-full bg-[#f28c38] px-5 py-3 text-sm font-bold text-white sm:px-6 sm:text-base shadow-lg transition hover:scale-105 active:scale-95"
            >
              <span className="text-xl">🥕</span>
              {grabacion ? "Detener grabación" : "Reproducir la zanahoria grabadora"}
            </button>
          </div>

          {/* cada uno graba su renglón desde su celular */}
          <div className="relative z-10 mx-auto mt-5 max-w-md space-y-2">
            <p className="text-center text-[11px] font-bold tracking-[0.25em] text-terracota uppercase">
              🎙️ Graben su renglón
            </p>
            {guion.map((g, i) => (
              <RenglonVoz
                key={g.clave}
                icono={g.icono}
                etiqueta={`Lo dice ${g.quien}`}
                compartido={compartido}
                texto={g.texto}
                resaltado={linea === i}
                {...controlesVoz(g.clave)}
              />
            ))}
            {!compartido && (
              <p className="text-center text-xs text-tinta/60">Sin Supabase, las grabaciones se pierden al recargar.</p>
            )}
            {avisoVoz && <p className="text-center text-xs font-semibold text-[#b8334a]">{avisoVoz}</p>}
          </div>

          {grabacion && (
            <div className="pointer-events-none absolute inset-0">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  onUpdate={animarEnJs}
                  key={i}
                  className="absolute text-[#ff7aa2]"
                  style={{ left: `${44 + i * 4}%`, top: "50%" }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -90 }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Corazon className="h-5 w-5" />
                </motion.span>
              ))}
            </div>
          )}
        </Revelar>

        {/* perezoso */}
        <Revelar retraso={0.15} className="flex flex-col items-center rounded-[2rem] bg-[#f6efe2] p-4 text-center sm:p-6 shadow-xl ring-1 ring-white">
          <p className="text-xs font-bold tracking-[0.25em] text-[#8a6f53] uppercase">Oficina de trámites</p>
          <h3 className="titulo-mano mt-1 text-3xl text-vino sm:text-4xl">El perezoso más veloz</h3>
          <motion.div
            className="my-4 h-56 w-44"
            animate={escribiendo ? { rotate: [-4, 4, -4], y: [0, -4, 0] } : terminado ? { scale: [1, 1.06, 1] } : { rotate: 0 }}
            transition={{ repeat: escribiendo ? Infinity : 0, duration: 3, ease: "easeInOut" }}
          >
            <ImagenPersonaje opciones={terminado ? personajes.perezosoSonrisa : personajes.perezoso} alt="El perezoso" respaldo={<Perezoso sonrisa={terminado ? 1 : progreso * 0.7} ojos={escribiendo ? 0.35 + 0.25 * Math.sin(texto.length) : 0.15} />} />
          </motion.div>
          <div className="min-h-[3.5rem] w-full rounded-xl bg-white px-4 py-3 font-mono text-xl sm:text-2xl tracking-wide text-tinta shadow-inner">
            {texto}
            {escribiendo && <span className="animate-pulse">|</span>}
          </div>
          <AnimatePresence>
            {terminado && (
              <motion.p onUpdate={animarEnJs} className="mt-3 text-sm text-tinta/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                …y eso fue lo más rápido que pude decírtelo. 🦥💛
              </motion.p>
            )}
          </AnimatePresence>
          <button
            onClick={hablarLento}
            disabled={escribiendo}
            className="mt-4 rounded-full bg-[#8a6f53] px-6 py-3 font-bold text-white shadow-md transition enabled:hover:scale-105 disabled:opacity-60"
          >
            {escribiendo ? "Espera… ya casi…" : "Dime algo rápido"}
          </button>

          <div className="mt-5 w-full max-w-md space-y-2">
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#8a6f53] uppercase">🎙️ Las voces de Flash</p>
            {vocesFlash.map((v) => (
              <RenglonVoz key={v.clave} icono={v.icono} etiqueta={v.etiqueta} texto={v.texto} compartido={compartido} {...controlesVoz(v.clave)} />
            ))}
          </div>
        </Revelar>
      </div>
    </section>
  );
}
