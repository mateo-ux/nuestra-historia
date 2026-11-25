import { capitulos } from "@/datos/contenido";
import Polaroid from "./Polaroid";
import { EntradaLateral, HiloHistoria, PuntoHilo } from "./HiloHistoria";
import TituloSeccion from "./TituloSeccion";

const giros = [-6, 4, -3, 7, -5];

export default function Capitulos() {
  return (
    <section id="historia" className="relative overflow-hidden bg-gradient-to-b from-crema via-[#fde7da] to-crema px-4 py-24">
      <TituloSeccion
        antetitulo="Capítulo a capítulo"
        titulo="Nuestra historia"
        subtitulo="Las páginas que hemos ido llenando juntos."
      />

      <HiloHistoria>

        {capitulos.map((c, i) => {
          const izquierda = i % 2 === 0;
          return (
            <div key={c.titulo} className="relative mb-24 grid items-center gap-10 pl-12 md:grid-cols-2 md:gap-16 md:pl-0">
              {/* punto del hilo */}
              <PuntoHilo />

              <EntradaLateral desde={izquierda ? -1 : 1} className={izquierda ? "md:order-1 md:text-right" : "md:order-2"}>
                <p className="text-xs font-bold tracking-[0.3em] text-terracota uppercase">
                  {c.numero} · {c.fecha}
                </p>
                <h3 className="titulo-mano mt-1 text-4xl text-vino sm:text-5xl">{c.titulo}</h3>
                <blockquote className="texto-libro mt-4 border-rosa text-xl leading-relaxed text-tinta/85">
                  “{c.cita}”
                </blockquote>
                <p className="mt-4 leading-relaxed text-tinta/90">{c.texto}</p>
              </EntradaLateral>

              <div className={izquierda ? "md:order-2" : "md:order-1"}>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
                  {c.fotos.map((foto, j) => (
                    <Polaroid
                      key={foto.src}
                      foto={foto}
                      giro={giros[(i + j) % giros.length]}
                      retraso={0.15 + j * 0.12}
                      className={`w-[46%] ${c.fotos.length > 2 ? "sm:w-[36%]" : "sm:w-[48%]"} ${j > 0 ? (c.fotos.length > 2 ? "sm:-ml-4" : "sm:-ml-10") : ""} ${j === 1 ? "sm:mt-12" : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </HiloHistoria>
    </section>
  );
}
