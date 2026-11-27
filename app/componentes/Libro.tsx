"use client";

import { AnimatePresence, motion } from "framer-motion";
import { animarEnJs } from "@/lib/aparecer";
import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useState } from "react";
import { libro } from "@/datos/contenido";
import { useMediaQuery } from "@/lib/useMediaQuery";
import TituloSeccion from "./TituloSeccion";

type Pagina = (typeof libro)[number];

// Cada "vista" es lo que se ve con el libro abierto: una hoja a la izquierda
// y/o una a la derecha. La portada y la dedicatoria van solas (a la derecha,
// porque detrás de la portada la hoja es blanca) y la contraportada sola al
// final. El resto va de a dos, como un libro de verdad.
type Vista = { izq: Pagina | null; der: Pagina | null };

// Hojas en blanco que acompañan a la dedicatoria (el reverso de la portada)
// y a la página 16 (la última hoja antes de la contraportada).
const R = "/optimizado/revista/paginas";
const blancaInicio: Pagina = { src: `${R}/hoja-blanca-inicio.webp`, ancho: 1040, alto: 1360, titulo: "" };
const blancaFinal: Pagina = { src: `${R}/hoja-blanca-final.webp`, ancho: 1040, alto: 1360, titulo: "" };
const esBlanca = (p: Pagina | null) => p === blancaInicio || p === blancaFinal;

function armarVistas(paginas: readonly Pagina[]): Vista[] {
  const n = paginas.length;
  if (n < 3) return paginas.map((p) => ({ izq: null, der: p }));
  const vistas: Vista[] = [
    { izq: null, der: paginas[0] },
    { izq: blancaInicio, der: paginas[1] },
  ];
  for (let i = 2; i <= n - 2; i += 2) {
    if (i + 1 <= n - 2) vistas.push({ izq: paginas[i], der: paginas[i + 1] });
    else vistas.push({ izq: paginas[i], der: blancaFinal });
  }
  vistas.push({ izq: paginas[n - 1], der: null });
  return vistas;
}

const vistas = armarVistas(libro);

function tituloVista(v: Vista) {
  const a = v.izq?.titulo || undefined;
  const b = v.der?.titulo || undefined;
  if (a && b) {
    const na = a.match(/^Página (\d+)$/)?.[1];
    const nb = b.match(/^Página (\d+)$/)?.[1];
    return na && nb ? `Páginas ${na} y ${nb}` : `${a} · ${b}`;
  }
  return a ?? b ?? "";
}

const TAMANOS_HOJA = "(max-width: 767px) 90vw, (max-width: 1200px) 45vw, 520px";

// decoding="sync": al pasar la hoja, la imagen nueva se pinta en el mismo cuadro.
// Con "async" (lo normal en next/image) Safari mostraba la hoja en blanco un
// instante mientras decodificaba.
function Hoja({ pagina, prioridad }: { pagina: Pagina | null; prioridad?: boolean }) {
  if (!pagina) return null;
  return (
    <Image
      src={pagina.src}
      alt={esBlanca(pagina) ? "" : pagina.titulo}
      fill
      preload={prioridad}
      decoding="sync"
      sizes={TAMANOS_HOJA}
      className="pointer-events-none object-fill select-none"
      draggable={false}
    />
  );
}

// Deja listas (descargadas y decodificadas) las hojas de las vistas vecinas,
// con la misma URL que pedirá next/image, para que nunca aparezcan en blanco.
// Se guardan solo las últimas 8 para no llenar la memoria del celular.
const precargadas = new Map<string, HTMLImageElement>();
function precargarVista(v: Vista | undefined) {
  for (const p of [v?.izq, v?.der]) {
    if (!p || precargadas.has(p.src)) continue;
    const { props } = getImageProps({ src: p.src, alt: "", fill: true, sizes: TAMANOS_HOJA });
    const img = new window.Image();
    img.sizes = props.sizes ?? "";
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
    img.decode().catch(() => {});
    precargadas.set(p.src, img);
    if (precargadas.size > 8) precargadas.delete(precargadas.keys().next().value!);
  }
}

const DURACION = 0.9;

type PropsLibro = {
  /** Vista con la que abre (para que "Ampliar" siga en la misma página). */
  inicial?: number;
  onCambio?: (vista: number) => void;
  /** Tamaño del libro (ancho CSS); el alto sale de la proporción. */
  ancho: string;
  /** El libro está girado 90° (pantalla completa con el celular vertical). */
  girado?: boolean;
  /** Escuchar las flechas del teclado. */
  teclado?: boolean;
  /** Controles reducidos para pantalla completa. */
  compacto?: boolean;
  /** Algo extra junto a los controles (por ejemplo, el botón Ampliar). */
  extra?: React.ReactNode;
};

function LibroAbierto({ inicial = 0, onCambio, ancho, girado = false, teclado = true, compacto = false, extra }: PropsLibro) {
  const [actual, setActual] = useState(inicial);
  const [giro, setGiro] = useState<{ hacia: number; dir: 1 | -1 } | null>(null);

  const ir = useCallback(
    (destino: number) => {
      if (giro || destino === actual || destino < 0 || destino >= vistas.length) return;
      setGiro({ hacia: destino, dir: destino > actual ? 1 : -1 });
      onCambio?.(destino);
    },
    [giro, actual, onCambio],
  );

  useEffect(() => {
    if (!teclado) return;
    const tecla = (e: KeyboardEvent) => {
      const libroEl = document.getElementById("libro");
      if (!libroEl) return;
      const r = libroEl.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === "ArrowRight") ir(actual + 1);
      if (e.key === "ArrowLeft") ir(actual - 1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [ir, actual, teclado]);

  // La vista actual y las dos de cada lado quedan precargadas.
  useEffect(() => {
    for (const d of [1, -1, 2, -2]) precargarVista(vistas[actual + d]);
  }, [actual]);

  const desde = vistas[actual];
  const hacia = giro ? vistas[giro.hacia] : desde;

  // Lo que queda quieto debajo de la hoja que gira.
  const base: Vista = !giro
    ? desde
    : giro.dir > 0
      ? { izq: desde.izq, der: hacia.der }
      : { izq: hacia.izq, der: desde.der };
  // La hoja que gira: su cara de adelante y la de atrás.
  const frente = giro ? (giro.dir > 0 ? desde.der : desde.izq) : null;
  const reverso = giro ? (giro.dir > 0 ? hacia.izq : hacia.der) : null;

  // Si solo hay una hoja, el libro se corre para quedar centrado.
  const corrimiento = (v: Vista) => (v.izq && v.der ? "0%" : v.der ? "-25%" : "25%");

  return (
    <div className="flex w-full flex-col items-center">
      <div className={`flex w-full justify-center overflow-hidden ${compacto ? "py-2" : "py-6"}`}>
        <motion.div
          className="relative touch-pan-y [perspective:2400px]"
          style={{ width: ancho, aspectRatio: "1.54 / 1" }}
          animate={{ x: corrimiento(hacia) }}
          initial={false}
          transition={{ duration: DURACION, ease: [0.4, 0, 0.2, 1] }}
          // Deslizar con el dedo pasa la hoja (si el libro está girado, el
          // "horizontal" del libro es el vertical de la pantalla).
          onPanEnd={(_, info) => {
            const d = girado ? info.offset.y : info.offset.x;
            const otro = girado ? info.offset.x : info.offset.y;
            if (Math.abs(d) < 40 || Math.abs(d) < Math.abs(otro)) return;
            ir(actual + (d < 0 ? 1 : -1));
          }}
        >
          {/* Hojas quietas */}
          {(["izq", "der"] as const).map((lado) => (
            <div
              key={lado}
              onClick={() => base[lado] && ir(actual + (lado === "der" ? 1 : -1))}
              className={`absolute top-0 h-full w-1/2 overflow-hidden ${base[lado] ? "cursor-pointer" : ""} ${lado === "izq" ? "left-0 rounded-l-md" : "right-0 rounded-r-md"} ${base[lado] ? "shadow-[0_25px_60px_-15px_rgba(120,50,40,0.45)]" : ""}`}
            >
              <Hoja pagina={base[lado]} prioridad={actual === 0} />
              {base[lado] && (
                <div
                  className={`pointer-events-none absolute inset-y-0 w-[8%] ${lado === "izq" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/20 to-transparent`}
                />
              )}
            </div>
          ))}

          {/* Hoja que se está pasando */}
          {giro && (
            <motion.div
              key={`${actual}-${giro.hacia}`}
              className={`absolute top-0 z-10 h-full w-1/2 [transform-style:preserve-3d] ${giro.dir > 0 ? "right-0 origin-left" : "left-0 origin-right"}`}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: giro.dir > 0 ? -180 : 180 }}
              transition={{ duration: DURACION, ease: [0.45, 0.05, 0.25, 1] }}
              onAnimationComplete={() => {
                setActual(giro.hacia);
                setGiro(null);
              }}
            >
              <div className={`absolute inset-0 overflow-hidden [backface-visibility:hidden] ${giro.dir > 0 ? "rounded-r-md" : "rounded-l-md"}`}>
                <Hoja pagina={frente} />
                {frente && (
                  <motion.div
                    onUpdate={animarEnJs}
                    className="pointer-events-none absolute inset-0 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.25, 0] }}
                    transition={{ duration: DURACION, times: [0, 0.5, 1] }}
                  />
                )}
              </div>
              <div
                className={`absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] ${giro.dir > 0 ? "rounded-l-md" : "rounded-r-md"}`}
              >
                <Hoja pagina={reverso} />
              </div>
            </motion.div>
          )}

          {/* Lomo */}
          {base.izq && base.der && (
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-black/15" />
          )}
        </motion.div>
      </div>

      <Controles
        titulo={tituloVista(hacia)}
        posicion={giro ? giro.hacia : actual}
        total={vistas.length}
        texto={compacto ? "toca o desliza una hoja" : "toca o desliza una hoja para pasarla"}
        alIr={ir}
        compacto={compacto}
        extra={extra}
      />
    </div>
  );
}

// Celular con la pantalla vertical: en pantalla completa el libro se gira 90°
// para aprovechar lo largo de la pantalla (como si giraras el celular).
const useVertical = () => useMediaQuery("(orientation: portrait)");

function LibroPantallaCompleta({ inicial, onCambio, onCerrar }: { inicial: number; onCambio: (v: number) => void; onCerrar: () => void }) {
  const vertical = useVertical();

  // Mientras está abierto, la página de atrás no se mueve y Esc lo cierra.
  useEffect(() => {
    const frenar = (e: Event) => e.preventDefault();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("wheel", frenar, { passive: false });
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("wheel", frenar);
      window.removeEventListener("keydown", tecla);
    };
  }, [onCerrar]);

  // Espacio útil (en el sistema del libro): ancho y alto disponibles.
  const anchoUtil = vertical ? "100svh" : "100vw";
  const altoUtil = vertical ? "100vw" : "100svh";
  const ancho = `min(calc(${anchoUtil} - 2rem), calc((${altoUtil} - 4.5rem) * 1.54))`;

  return (
    <motion.div
      onUpdate={animarEnJs}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[70] touch-none overflow-hidden overscroll-none bg-[#2a1a22]"
      role="dialog"
      aria-modal="true"
      aria-label="Nuestro libro en pantalla completa"
    >
      <div
        className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center"
        style={{
          width: anchoUtil,
          height: altoUtil,
          transform: `translate(-50%, -50%) ${vertical ? "rotate(90deg)" : ""}`,
        }}
      >
        <button
          onClick={onCerrar}
          className="absolute top-3 right-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg text-vino shadow-md transition hover:scale-110"
          aria-label="Cerrar libro"
        >
          ✕
        </button>
        <LibroAbierto inicial={inicial} onCambio={onCambio} ancho={ancho} girado={vertical} teclado compacto />
      </div>
    </motion.div>
  );
}

function Controles({
  titulo,
  posicion,
  total,
  texto,
  alIr,
  compacto = false,
  extra,
}: {
  titulo: string;
  posicion: number;
  total: number;
  texto: string;
  alIr: (destino: number) => void;
  compacto?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <>
      <div className={`${compacto ? "mt-2" : "mt-8"} flex w-full max-w-md items-center justify-between gap-2 sm:w-auto sm:max-w-none sm:justify-center sm:gap-4`}>
        <button
          onClick={() => alIr(posicion - 1)}
          disabled={posicion === 0}
          className={`grid shrink-0 place-items-center rounded-full bg-white text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30 ${compacto ? "h-9 w-9 text-xl" : "h-12 w-12 text-2xl"}`}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1 text-center sm:min-w-[200px] sm:flex-none">
          <p className={`texto-libro ${compacto ? "text-base text-[#ffd6a8]" : "text-lg text-vino"}`}>
            {titulo}
            {compacto && <span className="ml-2 font-sans text-xs text-white/60">{posicion + 1} de {total}</span>}
          </p>
          {!compacto && (
            <p className="text-xs text-tinta/80">
              {posicion + 1} de {total} · {texto}
            </p>
          )}
        </div>
        <button
          onClick={() => alIr(posicion + 1)}
          disabled={posicion === total - 1}
          className={`grid shrink-0 place-items-center rounded-full bg-white text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30 ${compacto ? "h-9 w-9 text-xl" : "h-12 w-12 text-2xl"}`}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>

      {extra}
      {!compacto && (
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => alIr(i)}
              aria-label={`Ir a la ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${i === posicion ? "w-7 bg-atardecer" : "w-2.5 bg-rosa"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Libro() {
  const esAncho = useMediaQuery("(min-width: 768px)", true);
  const [ampliado, setAmpliado] = useState(false);
  const [vista, setVista] = useState(0);
  // Cambia la "llave" del libro al cerrar la pantalla completa para que quede en la misma página.
  const [version, setVersion] = useState(0);
  const cerrar = useCallback(() => {
    setAmpliado(false);
    setVersion((v) => v + 1);
  }, []);

  const botonAmpliar = (
    <button
      onClick={() => setAmpliado(true)}
      className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-vino shadow-md transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </svg>
      {esAncho ? "Ver en grande" : "Ver en grande (gira el celular)"}
    </button>
  );

  return (
    <section id="libro" className="fondo-papel relative px-4 py-24">
      <TituloSeccion
        antetitulo="El regalo que me hiciste"
        titulo="Nuestro libro"
        subtitulo="Un día me regalaste nuestra historia escrita por ti. Aquí la guardo para leerla siempre."
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <LibroAbierto
          key={version}
          inicial={vista}
          onCambio={setVista}
          ancho="min(100%, calc(min(62vh, 640px) * 1.54))"
          teclado={!ampliado}
          extra={botonAmpliar}
        />
      </div>

      <AnimatePresence>
        {ampliado && <LibroPantallaCompleta inicial={vista} onCambio={setVista} onCerrar={cerrar} />}
      </AnimatePresence>
    </section>
  );
}
