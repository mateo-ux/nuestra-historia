// Estrellitas que titilan. Se agrupan en 3 capas que titilan a destiempo: se ve
// igual que animar cada estrella, pero el celular maneja 3 capas en vez de 30.
export default function Estrellas({
  cantidad,
  alto,
  pasoArriba,
  pasoIzquierda,
  desfase = 0,
  tam = "h-1 w-1",
}: {
  cantidad: number;
  /** Hasta qué altura (en %) llegan las estrellas. */
  alto: number;
  pasoArriba: number;
  pasoIzquierda: number;
  desfase?: number;
  tam?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {[0, 1, 2].map((grupo) => (
        <div
          key={grupo}
          className="absolute inset-0"
          style={{ animation: `titilar ${2.4 + grupo * 0.9}s ease-in-out ${grupo * 0.7}s infinite` }}
        >
          {Array.from({ length: cantidad }, (_, i) => i)
            .filter((i) => i % 3 === grupo)
            .map((i) => (
              <span
                key={i}
                className={`absolute rounded-full bg-white ${tam}`}
                style={{ top: `${(i * pasoArriba) % alto}%`, left: `${(i * pasoIzquierda + desfase) % 100}%` }}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
