"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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

// Celular: una hoja a la vez. Computador: libro abierto.
const useEsAncho = () => useMediaQuery("(min-width: 768px)", true);

function Hoja({ pagina, prioridad }: { pagina: Pagina | null; prioridad?: boolean }) {
  if (!pagina) return null;
  return (
    <Image
      src={pagina.src}
      alt={esBlanca(pagina) ? "" : pagina.titulo}
      fill
      preload={prioridad}
      sizes="(max-width: 1200px) 45vw, 520px"
      className="pointer-events-none object-fill select-none"
      draggable={false}
    />
  );
}

const DURACION = 0.9;

function LibroAbierto() {
  const [actual, setActual] = useState(0);
  const [giro, setGiro] = useState<{ hacia: number; dir: 1 | -1 } | null>(null);

  const ir = useCallback(
    (destino: number) => {
      if (giro || destino === actual || destino < 0 || destino >= vistas.length) return;
      setGiro({ hacia: destino, dir: destino > actual ? 1 : -1 });
    },
    [giro, actual],
  );

  useEffect(() => {
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
  }, [ir, actual]);

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
      <div className="flex w-full justify-center overflow-hidden py-6">
        <motion.div
          className="relative [perspective:2400px]"
          style={{ width: "min(100%, calc(min(62vh, 640px) * 1.54))", aspectRatio: "1.54 / 1" }}
          animate={{ x: corrimiento(hacia) }}
          initial={false}
          transition={{ duration: DURACION, ease: [0.4, 0, 0.2, 1] }}
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
                  className={`pointer-events-none absolute inset-y-0 w-10 ${lado === "izq" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/20 to-transparent`}
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
        texto="toca una hoja o usa las flechas para pasarla"
        alIr={ir}
      />
    </div>
  );
}

function LibroCelular() {
  const [[indice, dir], setPagina] = useState<[number, number]>([0, 0]);
  const pagina = libro[indice];

  const ir = useCallback((destino: number) => {
    setPagina(([i]) => {
      const n = Math.min(libro.length - 1, Math.max(0, destino));
      return [n, n > i ? 1 : -1];
    });
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex h-[62vh] max-h-[640px] min-h-[300px] w-full items-center justify-center [perspective:1600px]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={indice}
            custom={dir}
            className="relative h-full cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: `${pagina.ancho} / ${pagina.alto}`, maxWidth: "100%", transformOrigin: dir >= 0 ? "left center" : "right center" }}
            variants={{
              entra: (d: number) => ({ rotateY: d > 0 ? 70 : d < 0 ? -70 : 0, opacity: 0, x: d * 40 }),
              centro: { rotateY: 0, opacity: 1, x: 0 },
              sale: (d: number) => ({ rotateY: d > 0 ? -80 : 80, opacity: 0, x: -d * 40 }),
            }}
            initial="entra"
            animate="centro"
            exit="sale"
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) ir(indice + 1);
              else if (info.offset.x > 60) ir(indice - 1);
            }}
          >
            <Image
              src={pagina.src}
              alt={pagina.titulo}
              fill
              sizes="100vw"
              className="pointer-events-none rounded-lg object-contain shadow-[0_25px_60px_-15px_rgba(120,50,40,0.45)]"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <Controles
        titulo={pagina.titulo}
        posicion={indice}
        total={libro.length}
        texto="desliza o usa las flechas"
        alIr={ir}
      />
    </div>
  );
}

function Controles({
  titulo,
  posicion,
  total,
  texto,
  alIr,
}: {
  titulo: string;
  posicion: number;
  total: number;
  texto: string;
  alIr: (destino: number) => void;
}) {
  return (
    <>
      <div className="mt-8 flex w-full max-w-md items-center justify-between gap-2 sm:w-auto sm:max-w-none sm:justify-center sm:gap-4">
        <button
          onClick={() => alIr(posicion - 1)}
          disabled={posicion === 0}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-2xl text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30"
          aria-label="Página anterior"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1 text-center sm:min-w-[200px] sm:flex-none">
          <p className="texto-libro text-lg text-vino">{titulo}</p>
          <p className="text-xs text-tinta/80">
            {posicion + 1} de {total} · {texto}
          </p>
        </div>
        <button
          onClick={() => alIr(posicion + 1)}
          disabled={posicion === total - 1}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-2xl text-vino shadow-md transition enabled:hover:scale-110 disabled:opacity-30"
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>

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
    </>
  );
}

export default function Libro() {
  const esAncho = useEsAncho();

  return (
    <section id="libro" className="fondo-papel relative px-4 py-24">
      <TituloSeccion
        antetitulo="El regalo que me hiciste"
        titulo="Nuestro libro"
        subtitulo="Un día me regalaste nuestra historia escrita por ti. Aquí la guardo para leerla siempre."
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center">
        {esAncho ? <LibroAbierto /> : <LibroCelular />}
      </div>

    </section>
  );
}
