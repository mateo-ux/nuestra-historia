"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { musica, pareja } from "@/datos/contenido";
import Corazon from "./Corazon";

// Sobre sellado al entrar + botón flotante de música.
export default function Intro() {
  const [fase, setFase] = useState<"cerrado" | "abriendo" | "listo">("cerrado");
  const [hayMusica, setHayMusica] = useState(true);
  const [sonando, setSonando] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (fase !== "listo") document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fase]);

  const abrir = () => {
    if (fase !== "cerrado") return;
    setFase("abriendo");
    const a = audio.current;
    if (a && hayMusica) {
      a.volume = 0.5;
      a.play().then(() => setSonando(true)).catch(() => setSonando(false));
    }
    setTimeout(() => setFase("listo"), 2600);
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
        a.play().then(() => setSonando(true)).catch(() => {});
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
      if (a.paused) a.play().then(() => setSonando(true)).catch(() => {});
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

      <AnimatePresence>
        {fase !== "listo" && (
          <motion.div
            key="sobre"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gradient-to-b from-[#e47f52] via-[#d4603e] to-[#a8414c] px-6"
            exit={{ opacity: 0, transition: { duration: 0.9 } }}
          >
            <p className="titulo-mano mb-10 text-center text-3xl text-white drop-shadow sm:text-4xl">
              Para {pareja.ella}
            </p>

            <button
              onClick={abrir}
              aria-label="Abrir el sobre"
              className="group relative h-[200px] w-[300px] cursor-pointer [perspective:900px] sm:h-[230px] sm:w-[340px]"
            >
              {/* carta que sale */}
              <motion.div
                className="absolute inset-x-5 top-4 bottom-4 flex flex-col items-center justify-start rounded-md bg-crema p-4 pt-5 text-center shadow"
                style={{ zIndex: 1 }}
                animate={fase === "abriendo" ? { y: -120 } : { y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              >
                <span className="titulo-mano text-2xl text-vino">Siempre fuiste tú</span>
                <span className="texto-libro mt-1 text-sm text-tinta/70">una historia para ti</span>
              </motion.div>
              {/* cuerpo del sobre */}
              <div className="absolute inset-0 rounded-lg bg-[#fff1e6] shadow-2xl" style={{ zIndex: 0 }} />
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  zIndex: 2,
                  background:
                    "linear-gradient(to top right, #fde3d2 50%, transparent 50%) left / 50% 100% no-repeat, linear-gradient(to top left, #fde3d2 50%, transparent 50%) right / 50% 100% no-repeat",
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-lg"
                style={{ zIndex: 2, background: "linear-gradient(to top, #fbd3b8, #fde3d2)", clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
              />
              {/* solapa */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[60%] origin-top"
                style={{ zIndex: fase === "abriendo" ? 0 : 3, clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "#f9c6ad" }}
                animate={fase === "abriendo" ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.6 }}
              />
              {/* sello */}
              <motion.div
                className="absolute left-1/2 top-[52%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-vino shadow-lg"
                style={{ zIndex: 4 }}
                animate={fase === "abriendo" ? { scale: 0, opacity: 0 } : { scale: [1, 1.08, 1] }}
                transition={fase === "abriendo" ? { duration: 0.3 } : { repeat: Infinity, duration: 1.6 }}
              >
                <Corazon className="h-7 w-7 text-[#ffd6c9]" />
              </motion.div>
            </button>

            <motion.p
              className="mt-10 text-sm font-semibold tracking-widest text-white uppercase"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Toca el sobre para abrirlo
            </motion.p>
            {hayMusica && <p className="mt-2 text-xs text-white/90">(sube el volumen 🎶)</p>}
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
