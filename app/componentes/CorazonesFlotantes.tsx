import Corazon from "./Corazon";

// Corazones que suben lentamente por el fondo (posiciones fijas, sin azar).
export default function CorazonesFlotantes({ cantidad = 14, color = "#ffffff" }: { cantidad?: number; color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: cantidad }, (_, i) => {
        const izq = (i * 37) % 100;
        const tam = 10 + ((i * 7) % 18);
        const dur = 12 + ((i * 5) % 10);
        const ret = (i * 1.7) % dur;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px]"
            style={{
              left: `${izq}%`,
              width: tam,
              height: tam,
              color,
              opacity: 0,
              animation: `subir-corazon ${dur}s linear ${ret}s infinite`,
            }}
          >
            <Corazon className="h-full w-full" />
          </span>
        );
      })}
    </div>
  );
}
