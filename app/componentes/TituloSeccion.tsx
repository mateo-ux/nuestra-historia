import Revelar from "./Revelar";

export default function TituloSeccion({
  antetitulo,
  titulo,
  subtitulo,
  claro = false,
}: {
  antetitulo?: string;
  titulo: string;
  subtitulo?: string;
  claro?: boolean;
}) {
  return (
    <Revelar className="mx-auto mb-12 max-w-2xl text-center">
      {antetitulo && (
        <p className={`mb-2 text-xs font-bold uppercase tracking-[0.3em] ${claro ? "text-white drop-shadow" : "text-terracota"}`}>
          {antetitulo}
        </p>
      )}
      <h2 className={`titulo-mano text-5xl leading-tight sm:text-6xl ${claro ? "text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" : "text-vino"}`}>{titulo}</h2>
      <div className={`mx-auto mt-3 flex items-center justify-center gap-2 ${claro ? "text-white/70" : "text-rosa"}`}>
        <span className="h-px w-12 bg-current" />
        <span>♡</span>
        <span className="h-px w-12 bg-current" />
      </div>
      {subtitulo && (
        <p className={`texto-libro mt-4 text-xl ${claro ? "text-white drop-shadow" : "text-tinta"}`}>{subtitulo}</p>
      )}
    </Revelar>
  );
}
