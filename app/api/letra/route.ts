import { NextResponse } from "next/server";

// Busca la letra de una canción de Spotify en LRCLIB (https://lrclib.net),
// una base de datos libre de letras con tiempos. No necesita clave.
//   GET /api/letra?id=<id de la canción en Spotify>
// 1) Lee título, artista y duración desde el reproductor público de Spotify.
// 2) Pide la letra a LRCLIB (primero coincidencia exacta, luego búsqueda).

const AGENTE = "SiempreFuisteTu/1.0 (sitio personal, https://nuestra-historia-app-kohl.vercel.app)";
const UN_DIA = "public, s-maxage=86400, stale-while-revalidate=604800";

type DatosCancion = { titulo: string; artista: string; duracionSeg: number };
type ResultadoLrclib = {
  trackName: string;
  artistName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
};

async function datosDeSpotify(id: string): Promise<DatosCancion | null> {
  const r = await fetch(`https://open.spotify.com/embed/track/${id}`, {
    headers: { "User-Agent": AGENTE, "Accept-Language": "es" },
    next: { revalidate: 86400 },
  });
  if (!r.ok) return null;
  const html = await r.text();
  const json = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  if (!json) return null;
  try {
    const e = JSON.parse(json)?.props?.pageProps?.state?.data?.entity;
    const titulo: string | undefined = e?.name ?? e?.title;
    const artista: string | undefined = e?.artists?.[0]?.name;
    if (!titulo || !artista) return null;
    return { titulo, artista, duracionSeg: Math.round((e?.duration ?? 0) / 1000) };
  } catch {
    return null;
  }
}

async function pedirLrclib(ruta: string, params: Record<string, string>) {
  const r = await fetch(`https://lrclib.net/api/${ruta}?${new URLSearchParams(params)}`, {
    headers: { "User-Agent": AGENTE },
    next: { revalidate: 86400 },
  });
  return r.ok ? r.json() : null;
}

async function buscarLetra({ titulo, artista, duracionSeg }: DatosCancion): Promise<ResultadoLrclib | null> {
  // Coincidencia exacta (LRCLIB acepta ±2 s de diferencia en la duración).
  if (duracionSeg > 0) {
    const exacta: ResultadoLrclib | null = await pedirLrclib("get", {
      track_name: titulo,
      artist_name: artista,
      duration: String(duracionSeg),
    });
    if (exacta && (exacta.syncedLyrics || exacta.plainLyrics)) return exacta;
  }
  // Búsqueda: prefiere la que tenga tiempos y la duración más parecida.
  const lista: ResultadoLrclib[] | null = await pedirLrclib("search", { track_name: titulo, artist_name: artista });
  if (!lista?.length) return null;
  const puntaje = (x: ResultadoLrclib) =>
    (x.syncedLyrics ? 0 : 1000) + (x.plainLyrics || x.syncedLyrics ? 0 : 5000) + Math.abs(x.duration - duracionSeg);
  const mejor = [...lista].sort((a, b) => puntaje(a) - puntaje(b))[0];
  if (duracionSeg > 0 && Math.abs(mejor.duration - duracionSeg) > 15) return null;
  return mejor.syncedLyrics || mejor.plainLyrics ? mejor : null;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) {
    return NextResponse.json({ ok: false, error: "id de canción no válido" }, { status: 400 });
  }
  try {
    const datos = await datosDeSpotify(id);
    if (!datos) return NextResponse.json({ ok: false, error: "No se pudo leer la canción en Spotify" }, { status: 404 });
    const r = await buscarLetra(datos);
    if (!r) {
      return NextResponse.json({ ok: false, error: "No encontré la letra", ...datos }, { status: 404, headers: { "Cache-Control": UN_DIA } });
    }
    return NextResponse.json(
      {
        ok: true,
        titulo: datos.titulo,
        artista: datos.artista,
        sincronizada: Boolean(r.syncedLyrics),
        letra: r.syncedLyrics || r.plainLyrics,
      },
      { headers: { "Cache-Control": UN_DIA } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo conectar con el buscador de letras" }, { status: 502 });
  }
}
