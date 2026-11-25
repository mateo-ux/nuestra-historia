"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { pareja } from "@/datos/contenido";

function sumarMeses(desde: Date, n: number) {
  const d = new Date(desde);
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return d;
}

function calcular(desde: Date, ahora: Date) {
  let meses = (ahora.getFullYear() - desde.getFullYear()) * 12 + (ahora.getMonth() - desde.getMonth());
  let ancla = sumarMeses(desde, meses);
  if (ancla > ahora) {
    meses -= 1;
    ancla = sumarMeses(desde, meses);
  }
  let resto = Math.floor((ahora.getTime() - ancla.getTime()) / 1000);
  const dias = Math.floor(resto / 86400);
  resto -= dias * 86400;
  const horas = Math.floor(resto / 3600);
  resto -= horas * 3600;
  const minutos = Math.floor(resto / 60);
  const segundos = resto - minutos * 60;
  const totalDias = Math.floor((ahora.getTime() - desde.getTime()) / 86400000);
  return { anios: Math.floor(meses / 12), meses: meses % 12, dias, horas, minutos, segundos, totalDias };
}

export default function Contador() {
  const [t, setT] = useState<ReturnType<typeof calcular> | null>(null);

  useEffect(() => {
    const desde = new Date(pareja.inicio);
    const tic = () => setT(calcular(desde, new Date()));
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);

  const piezas: [string, number | undefined][] = [
    ["años", t?.anios],
    ["meses", t?.meses],
    ["días", t?.dias],
    ["horas", t?.horas],
    ["min", t?.minutos],
    ["seg", t?.segundos],
  ];

  return (
    <div className="text-center">
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-white uppercase drop-shadow">Juntos desde hace</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {piezas.map(([etiqueta, valor], i) => {
          const texto = valor === undefined ? "··" : String(valor).padStart(2, "0");
          return (
            <motion.div
              key={etiqueta}
              className="min-w-[78px] rounded-2xl bg-[#6e2433]/35 px-3 py-3 shadow-sm ring-1 ring-white/40 backdrop-blur-md"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
            >
              {/* cada número cambia deslizándose suavemente */}
              <div className="relative h-9 overflow-hidden text-3xl leading-9 font-bold text-white tabular-nums sm:h-10 sm:text-4xl sm:leading-10">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={texto}
                    className="block"
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    {texto}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="text-[11px] font-semibold tracking-wider text-white uppercase">{etiqueta}</div>
            </motion.div>
          );
        })}
      </div>
      <p className="texto-libro mt-4 text-lg text-white drop-shadow">
        {t ? `${t.totalDias.toLocaleString("es-CO")} días eligiéndote, desde el ${pareja.inicioTexto}` : " "}
      </p>
    </div>
  );
}
