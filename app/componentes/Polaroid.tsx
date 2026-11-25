"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Foto } from "@/datos/contenido";

// Foto tipo polaroid que "cae" suavemente sobre la mesa al aparecer.
export default function Polaroid({
  foto,
  giro = 0,
  className = "",
  sizes = "(max-width: 768px) 60vw, 300px",
  retraso = 0,
}: {
  foto: Foto;
  giro?: number;
  className?: string;
  sizes?: string;
  retraso?: number;
}) {
  return (
    <motion.figure
      className={`relative bg-white p-2.5 pb-10 shadow-[0_15px_35px_-10px_rgba(90,40,30,0.35)] hover:z-10 ${className}`}
      initial={{ opacity: 0, y: 30, rotate: giro * 2.2, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: giro, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 110, damping: 16, delay: retraso }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-durazno">
        <Image src={foto.src} alt={foto.pie ?? "Foto de nosotros"} fill sizes={sizes} className="object-cover" />
      </div>
      {foto.pie && <figcaption className="titulo-mano absolute inset-x-0 bottom-2 text-center text-xl text-tinta/80">{foto.pie}</figcaption>}
    </motion.figure>
  );
}
