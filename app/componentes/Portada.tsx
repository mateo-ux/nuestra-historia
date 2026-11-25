import Image from "next/image";
import { pareja } from "@/datos/contenido";
import Contador from "./Contador";
import CorazonesFlotantes from "./CorazonesFlotantes";
import LunaSecreta from "./LunaSecreta";
import Revelar from "./Revelar";

export default function Portada() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#e47f52] via-[#d4603e] to-[#a8414c] px-4 pt-32 pb-16 sm:pt-20">
      {/* estrellitas */}
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{
            top: `${(i * 13) % 45}%`,
            left: `${(i * 29 + 7) % 100}%`,
            animation: `titilar ${2 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
      <LunaSecreta />
      <CorazonesFlotantes cantidad={16} color="rgba(255,255,255,0.7)" />

      {/* sol poniéndose */}
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#ffd27a]/50 blur-2xl" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <Revelar>
          <p className="text-center text-sm font-bold tracking-[0.35em] text-white uppercase drop-shadow">
            {pareja.ella} &amp; {pareja.el}
          </p>
        </Revelar>
        <Revelar retraso={0.15}>
          <h1 className="titulo-mano mt-3 text-center text-7xl leading-[0.95] text-white drop-shadow-[0_3px_12px_rgba(120,40,40,0.35)] sm:text-8xl md:text-9xl">
            Siempre
            <br />
            fuiste tú
          </h1>
        </Revelar>

        <Revelar retraso={0.3} className="my-10">
          <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64">
            <div className="absolute inset-0 animate-[flotar_6s_ease-in-out_infinite] rounded-full border-[6px] border-white/80 bg-durazno shadow-2xl">
              <div className="absolute inset-0 overflow-hidden rounded-full [clip-path:circle(50%)]">
              <Image
                src="/optimizado/revista/pagina-0.webp"
                alt="Ilustración de la portada del libro"
                fill
                sizes="256px"
                className="origin-[50%_74%] scale-[1.9] object-cover object-[50%_74%]"
                preload
              />
              </div>
            </div>
            <span className="absolute -right-2 -bottom-1 text-4xl">💛</span>
          </div>
        </Revelar>

        <Revelar retraso={0.45} className="w-full max-w-3xl">
          <Contador />
        </Revelar>

        <a
          href="#libro"
          className="mt-12 flex flex-col items-center text-white drop-shadow transition hover:scale-105"
        >
          <span className="text-xs font-bold tracking-[0.3em] uppercase">Empieza nuestra historia</span>
          <span className="mt-2 animate-bounce text-2xl">↓</span>
        </a>
      </div>
    </section>
  );
}
