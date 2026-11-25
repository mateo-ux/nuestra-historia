"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cartaSecreta } from "@/datos/contenido";
import Modal from "./Modal";

// Toca la luna 5 veces para descubrir la carta secreta.
export default function LunaSecreta() {
  const [toques, setToques] = useState(0);
  const [abierta, setAbierta] = useState(false);

  const tocar = () => {
    const n = toques + 1;
    setToques(n);
    if (n >= 5) {
      setAbierta(true);
      setToques(0);
    }
  };

  return (
    <>
      <motion.button
        onClick={tocar}
        aria-label="La luna"
        className="absolute top-6 right-6 h-14 w-14 sm:top-[8%] sm:right-[8%] cursor-pointer rounded-full sm:h-20 sm:w-20"
        whileTap={{ scale: 0.85 }}
        animate={{ rotate: toques * 12, scale: 1 + toques * 0.06 }}
        style={{
          background: "radial-gradient(circle at 35% 35%, #fffaf0, #ffe6c7 60%, #f5c99e)",
          boxShadow: `0 0 ${30 + toques * 12}px rgba(255,240,220,${0.6 + toques * 0.08})`,
        }}
      >
        <span className="absolute top-[30%] left-[55%] h-2 w-2 rounded-full bg-[#f1c093]/70" />
        <span className="absolute top-[58%] left-[30%] h-3 w-3 rounded-full bg-[#f1c093]/60" />
        <span className="absolute top-[60%] left-[62%] h-1.5 w-1.5 rounded-full bg-[#f1c093]/70" />
        {toques > 0 && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap text-white/90">
            {"♥".repeat(toques)}
          </span>
        )}
      </motion.button>

      <Modal abierto={abierta} alCerrar={() => setAbierta(false)}>
        <div className="rounded-3xl bg-gradient-to-b from-[#2d2550] to-[#5b3a6e] p-8 text-center text-white shadow-2xl">
          <div className="mb-3 text-4xl">🌙✨</div>
          <h3 className="titulo-mano mb-4 text-4xl text-[#ffe6c7]">{cartaSecreta.titulo}</h3>
          <p className="texto-libro text-xl leading-relaxed text-white/90">{cartaSecreta.texto}</p>
        </div>
      </Modal>
    </>
  );
}
