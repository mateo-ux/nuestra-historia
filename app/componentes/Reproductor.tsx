"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { canciones as cancionesFijas, musica, pareja, type Cancion } from "@/datos/contenido";

// Reproductor flotante con la lista de canciones de Spotify.
// Usa el reproductor oficial de Spotify (iFrame API): no se descarga nada.

type Controlador = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  addListener: (evento: string, fn: (e: { data: { isPaused: boolean } }) => void) => void;
};
type ApiSpotify = {
  createController: (el: HTMLElement, opciones: Record<string, unknown>, listo: (c: Controlador) => void) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: ApiSpotify) => void;
  }
}

const CLAVE = "canciones-agregadas";

// Acepta enlaces https://open.spotify.com/(intl-xx/)track/ID?si=... o spotify:track:ID
export function aUri(url: string): string | null {
  const t = url.trim();
  const m1 = t.match(/^spotify:(track|album|playlist|episode):([A-Za-z0-9]+)$/);
  if (m1) return `spotify:${m1[1]}:${m1[2]}`;
  const m2 = t.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (m2) return `spotify:${m2[1]}:${m2[2]}`;
  return null;
}

function leerLocales(): Cancion[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function Reproductor() {
  const [abierto, setAbierto] = useState(false);
  const [locales, setLocales] = useState<Cancion[]>([]);
  const [titulos, setTitulos] = useState<Record<string, string>>({});
  const [actual, setActual] = useState<string | null>(null);
  const [sonando, setSonando] = useState(false);
  const [bienvenida, setBienvenida] = useState<{ hay: boolean; sonando: boolean }>({ hay: false, sonando: false });
  const [modo, setModo] = useState<"api" | "simple" | "cargando">("cargando");
  const [form, setForm] = useState({ url: "", titulo: "", de: `${pareja.el} para ${pareja.ella}` });
  const [aviso, setAviso] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const controlador = useRef<Controlador | null>(null);
  const pendiente = useRef<string | null>(null);

  const lista = [...cancionesFijas.map((c) => ({ ...c, local: false })), ...locales.map((c) => ({ ...c, local: true }))].filter(
    (c) => aUri(c.url),
  );

  // Cargar canciones agregadas desde la página (solo en este navegador).
  useEffect(() => {
    const t = setTimeout(() => setLocales(leerLocales()), 0);
    return () => clearTimeout(t);
  }, []);

  // Títulos automáticos desde Spotify cuando no se escribió uno.
  useEffect(() => {
    lista.forEach((c) => {
      if (c.titulo || titulos[c.url]) return;
      fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(c.url)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.title && setTitulos((t) => ({ ...t, [c.url]: d.title })))
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.length]);

  // Estado de la canción de bienvenida (mp3).
  useEffect(() => {
    const fn = (e: Event) => setBienvenida((e as CustomEvent).detail);
    window.addEventListener("estado-bienvenida", fn);
    window.dispatchEvent(new Event("pedir-estado-bienvenida"));
    return () => window.removeEventListener("estado-bienvenida", fn);
  }, []);

  // Cargar el reproductor oficial de Spotify.
  useEffect(() => {
    const respaldo = setTimeout(() => setModo((m) => (m === "cargando" ? "simple" : m)), 8000);
    window.onSpotifyIframeApiReady = (api) => {
      if (!contenedor.current) return;
      const primera = lista[0] ? aUri(lista[0].url) : null;
      api.createController(contenedor.current, { uri: primera ?? "spotify:track:0", width: "100%", height: 152 }, (c) => {
        controlador.current = c;
        setModo("api");
        if (primera && !actual) setActual(primera);
        c.addListener("playback_update", (e) => {
          const pausa = e.data.isPaused;
          setSonando(!pausa);
          if (!pausa) window.dispatchEvent(new Event("pausar-musica"));
        });
        if (pendiente.current) {
          c.loadUri(pendiente.current);
          c.play();
          pendiente.current = null;
        }
      });
    };
    if (!document.getElementById("spotify-iframe-api")) {
      const s = document.createElement("script");
      s.id = "spotify-iframe-api";
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      s.onerror = () => setModo("simple");
      document.body.appendChild(s);
    }
    return () => clearTimeout(respaldo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Los videos con sonido pausan Spotify.
  useEffect(() => {
    const fn = () => controlador.current?.pause();
    window.addEventListener("pausar-spotify", fn);
    return () => window.removeEventListener("pausar-spotify", fn);
  }, []);

  const reproducir = useCallback((uri: string) => {
    setActual(uri);
    window.dispatchEvent(new Event("pausar-musica"));
    const c = controlador.current;
    if (c) {
      c.loadUri(uri);
      c.play();
    } else pendiente.current = uri;
  }, []);

  const guardarLocales = (nuevas: Cancion[]) => {
    setLocales(nuevas);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevas));
    } catch {}
  };

  const agregar = (e: React.FormEvent) => {
    e.preventDefault();
    const uri = aUri(form.url);
    if (!uri) {
      setAviso("Ese enlace no parece de Spotify. En Spotify: Compartir → Copiar enlace.");
      return;
    }
    const nueva: Cancion = { url: form.url.trim(), titulo: form.titulo.trim() || undefined, de: form.de.trim() || undefined };
    guardarLocales([...locales, nueva]);
    setForm((f) => ({ ...f, url: "", titulo: "" }));
    setAviso("¡Agregada! 💛");
    reproducir(uri);
  };

  const lineaCodigo = (c: Cancion) =>
    `  { url: "${c.url}"${c.titulo ? `, titulo: "${c.titulo}"` : ""}${c.de ? `, de: "${c.de}"` : ""} },`;

  const idEmbed = actual ? actual.split(":").slice(1).join("/") : lista[0] ? aUri(lista[0].url)!.split(":").slice(1).join("/") : null;

  return (
    <>
      {/* botón flotante */}
      <button
        onClick={() => setAbierto((a) => !a)}
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-vino shadow-xl ring-1 ring-vino/10 transition hover:scale-105"
        aria-expanded={abierto}
      >
        <span className={sonando || bienvenida.sonando ? "animate-spin [animation-duration:3s]" : ""}>💿</span>
        {abierto ? "Cerrar" : "Nuestras canciones"}
      </button>

      {/* panel (siempre montado para que la música siga sonando) */}
      <motion.div
        initial={false}
        animate={abierto ? { opacity: 1, y: 0, pointerEvents: "auto" } : { opacity: 0, y: 30, pointerEvents: "none" }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="fixed right-4 bottom-20 z-40 flex max-h-[75vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-[#2a1a22] text-white shadow-2xl ring-1 ring-white/10"
        aria-hidden={!abierto}
      >
        <div className="px-5 pt-5 pb-3">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#ffd6a8] uppercase">Nuestra playlist</p>
          <h3 className="titulo-mano text-3xl">Canciones que nos dedicamos</h3>
        </div>

        <div className="px-4">
          {modo === "simple" && idEmbed ? (
            <iframe
              key={idEmbed}
              title="Spotify"
              src={`https://open.spotify.com/embed/${idEmbed}?utm_source=generator`}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border-0"
            />
          ) : (
            <div className={`overflow-hidden rounded-xl ${lista.length ? "" : "hidden"}`}>
              <div ref={contenedor} />
            </div>
          )}
        </div>

        <ol className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
          {musica.archivo && bienvenida.hay && (
            <li>
              <button
                onClick={() => window.dispatchEvent(new Event("alternar-bienvenida"))}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ffd6a8] text-vino">
                  {bienvenida.sonando ? "❚❚" : "▶"}
                </span>
                <span>
                  <span className="block font-semibold">{musica.titulo}</span>
                  <span className="block text-xs text-white/70">Canción de bienvenida</span>
                </span>
              </button>
            </li>
          )}
          {lista.map((c, i) => {
            const uri = aUri(c.url)!;
            const activa = uri === actual;
            return (
              <li key={`${c.url}-${i}`} className={`rounded-xl ${activa ? "bg-white/15" : ""}`}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <button
                    onClick={() => reproducir(uri)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1ed760] text-[#1a1a1a] transition hover:scale-110"
                    aria-label="Reproducir"
                  >
                    {activa && sonando ? "♫" : "▶"}
                  </button>
                  <button onClick={() => reproducir(uri)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-semibold">{c.titulo || titulos[c.url] || `Canción ${i + 1}`}</span>
                    {c.de && <span className="block truncate text-xs text-white/75">💌 {c.de}</span>}
                    {c.nota && <span className="block truncate text-xs text-white/60 italic">{c.nota}</span>}
                  </button>
                  {c.local && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        title="Copiar línea para datos/contenido.ts"
                        onClick={() => {
                          navigator.clipboard?.writeText(lineaCodigo(c)).catch(() => {});
                          setCopiado(c.url);
                          setTimeout(() => setCopiado(null), 1500);
                        }}
                        className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10"
                      >
                        {copiado === c.url ? "✓" : "⧉"}
                      </button>
                      <button
                        title="Quitar"
                        onClick={() => guardarLocales(locales.filter((l) => l.url !== c.url))}
                        className="rounded-full px-2 py-1 text-xs text-white/70 hover:bg-white/10"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {lista.length === 0 && (
            <li className="px-3 py-2 text-sm text-white/75">Todavía no hay canciones. ¡Agrega la primera aquí abajo!</li>
          )}
        </ol>

        <form onSubmit={agregar} className="space-y-2 border-t border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold tracking-widest text-[#ffd6a8] uppercase">+ Agregar canción</p>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Pega el enlace de Spotify"
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 focus:ring-2 focus:ring-[#ffd6a8] focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título (opcional)"
              className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none"
            />
            <select
              value={form.de}
              onChange={(e) => setForm({ ...form, de: e.target.value })}
              className="rounded-lg bg-white/10 px-2 py-2 text-sm focus:outline-none [&>option]:text-black"
            >
              <option value={`${pareja.el} para ${pareja.ella}`}>De {pareja.el}</option>
              <option value={`${pareja.ella} para ${pareja.el}`}>De {pareja.ella}</option>
              <option value="De los dos">De los dos</option>
            </select>
          </div>
          <button className="w-full rounded-lg bg-[#ffd6a8] py-2 text-sm font-bold text-vino transition hover:brightness-95">Agregar</button>
          <AnimatePresence>
            {aviso && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-white/80">
                {aviso}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-[11px] leading-snug text-white/55">
            Si no has iniciado sesión en Spotify en este navegador, solo suenan 30 segundos de cada canción.
          </p>
        </form>
      </motion.div>
    </>
  );
}
