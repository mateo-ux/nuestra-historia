"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { canciones as cancionesFijas, musica, pareja, type Cancion } from "@/datos/contenido";
import { buscarLetraEnLinea, useCancionesCompartidas } from "@/lib/useCancionesCompartidas";
import { animarEnJs, resorte } from "@/lib/aparecer";
import LetraCancion from "./LetraCancion";

// El mismo resorte con que se abría el panel (rigidez 260, amortiguación 26).
const PANEL = resorte(260, 26);

// Reproductor flotante con la lista de canciones de Spotify.
// Usa el reproductor oficial de Spotify (iFrame API): no se descarga nada.

type Controlador = {
  loadUri: (uri: string) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek?: (segundos: number) => void;
  addListener: (
    evento: string,
    fn: (e: { data: { isPaused: boolean; position?: number; duration?: number; playingURI?: string } }) => void,
  ) => void;
};
type ApiSpotify = {
  createController: (el: HTMLElement, opciones: Record<string, unknown>, listo: (c: Controlador) => void) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: ApiSpotify) => void;
  }
}

// Acepta enlaces https://open.spotify.com/(intl-xx/)track/ID?si=... o spotify:track:ID
export function aUri(url: string): string | null {
  const t = url.trim();
  const m1 = t.match(/^spotify:(track|album|playlist|episode):([A-Za-z0-9]+)$/);
  if (m1) return `spotify:${m1[1]}:${m1[2]}`;
  const m2 = t.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (m2) return `spotify:${m2[1]}:${m2[2]}`;
  return null;
}

// Para buscar sin importar mayúsculas ni tildes ("corazon" encuentra "Corazón").
const sinTildes = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Reproductor() {
  const [abierto, setAbierto] = useState(false);
  const { canciones: agregadas, agregar: guardarCancion, quitar, guardarLetra, compartido, error } = useCancionesCompartidas();
  const [titulos, setTitulos] = useState<Record<string, string>>({});
  const [actual, setActual] = useState<string | null>(null);
  const [sonando, setSonando] = useState(false);
  const [bienvenida, setBienvenida] = useState<{ hay: boolean; sonando: boolean }>({ hay: false, sonando: false });
  const [modo, setModo] = useState<"api" | "simple" | "cargando">("cargando");
  const [form, setForm] = useState({ url: "", titulo: "", de: `${pareja.el} para ${pareja.ella}` });
  const [aviso, setAviso] = useState("");
  // El formulario se puede esconder para que la lista ocupe toda la tarjeta.
  const [formAbierto, setFormAbierto] = useState(false);
  const [letraAbierta, setLetraAbierta] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  // Canción que espera confirmación antes de eliminarse.
  const [porBorrar, setPorBorrar] = useState<string | null>(null);
  // Segundo de la canción que está sonando (lo informa Spotify), para la letra sincronizada.
  const [posicion, setPosicion] = useState(0);
  const [copiado, setCopiado] = useState<string | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Tocar fuera del panel lo cierra (útil en celular).
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || boton.current?.contains(t)) return;
      setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);
  const controlador = useRef<Controlador | null>(null);
  const pendiente = useRef<string | null>(null);
  // Canción cargada ahora mismo en el reproductor de Spotify.
  const cargada = useRef<string | null>(null);
  // Se cargó una canción nueva y hay que darle play cuando esté lista.
  const reproducirAlCargar = useRef(false);

  const lista = [
    ...cancionesFijas.map((c) => ({ ...c, id: undefined as string | undefined })),
    ...agregadas,
  ].filter((c) => aUri(c.url));
  const uris = lista.map((c) => aUri(c.url)!);

  // Los avisos de Spotify se registran una sola vez, así que leen la lista y la
  // canción actual desde refs para no quedarse con valores viejos.
  const urisRef = useRef(uris);
  const actualRef = useRef(actual);
  useEffect(() => {
    urisRef.current = uris;
    actualRef.current = actual;
  });
  const saltarRef = useRef<(paso: 1 | -1) => void>(() => {});
  const ultimaPos = useRef({ pos: 0, dur: 0 });
  const ignorarFinHasta = useRef(0);

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

  // 1) Cargar el script oficial de Spotify (una sola vez), recién cuando se abre
  // el panel por primera vez. El reproductor de Spotify es muy pesado y, si se
  // carga junto con la página, traba las animaciones del inicio en el celular.
  const [api, setApi] = useState<ApiSpotify | null>(null);
  const [usarSpotify, setUsarSpotify] = useState(false);
  useEffect(() => {
    if (!usarSpotify) return;
    // Si el script no responde en 10 s (bloqueado, sin internet), se usa el embed simple.
    const respaldo = setTimeout(() => setModo((m) => (m === "cargando" ? "simple" : m)), 10000);
    window.onSpotifyIframeApiReady = (a) => setApi(a);
    if (!document.getElementById("spotify-iframe-api")) {
      const s = document.createElement("script");
      s.id = "spotify-iframe-api";
      s.src = "https://open.spotify.com/embed/iframe-api/v1";
      s.async = true;
      s.onerror = () => setModo("simple");
      document.body.appendChild(s);
    }
    return () => clearTimeout(respaldo);
  }, [usarSpotify]);

  // Da play cuando Spotify termine de cargar; con respaldo por si "ready" no llega.
  const reproducirCuandoEsteLista = useCallback((c: Controlador, uri: string) => {
    reproducirAlCargar.current = true;
    setTimeout(() => {
      if (reproducirAlCargar.current && cargada.current === uri) {
        reproducirAlCargar.current = false;
        c.play();
      }
    }, 1500);
  }, []);

  // 2) Crear el reproductor solo cuando ya hay una canción de verdad.
  // (Crearlo con una canción vacía hace que Spotify nunca responda.)
  const primeraUri = lista[0] ? aUri(lista[0].url) : null;
  const creando = useRef(false);
  useEffect(() => {
    const destino = pendiente.current ?? primeraUri;
    if (!api || !destino || !contenedor.current || creando.current || controlador.current) return;
    creando.current = true;
    api.createController(contenedor.current, { uri: destino, width: "100%", height: 152 }, (c) => {
      controlador.current = c;
      cargada.current = destino;
      setActual((a) => a ?? destino);
      setModo("api");
      // Spotify avisa "ready" cuando termina de cargar una canción; recién
      // ahí play() funciona. Llamarlo antes no hace nada.
      c.addListener("ready", () => {
        if (reproducirAlCargar.current) {
          reproducirAlCargar.current = false;
          c.play();
        }
      });
      c.addListener("playback_update", (e) => {
        const { isPaused: pausa, position = 0, duration = 0 } = e.data;
        setSonando(!pausa);
        setPosicion(position);
        if (!pausa) window.dispatchEvent(new Event("pausar-musica"));
        // ¿Terminó la canción? Spotify avisa con position === duration (sin pausar),
        // o la deja en pausa cerca del final, o la devuelve a 0.
        const antes = ultimaPos.current;
        ultimaPos.current = { pos: position, dur: duration };
        const llegoAlFinal = duration > 0 && position >= duration - 300;
        const pausadaAlFinal = pausa && duration > 0 && position >= duration - 1200;
        const volvioACero = pausa && position === 0 && antes.dur > 0 && antes.pos >= antes.dur - 2500;
        if ((llegoAlFinal || pausadaAlFinal || volvioACero) && Date.now() > ignorarFinHasta.current) {
          setSonando(false);
          ignorarFinHasta.current = Date.now() + 4000;
          saltarRef.current(1);
        }
      });
      // Si tocaron una canción mientras se creaba, la pone a sonar.
      const p = pendiente.current;
      pendiente.current = null;
      if (!p) return;
      if (p !== destino) {
        cargada.current = p;
        c.loadUri(p);
      }
      reproducirCuandoEsteLista(c, p);
    });
  }, [api, primeraUri, reproducirCuandoEsteLista]);

  // Los videos con sonido pausan Spotify.
  useEffect(() => {
    const fn = () => controlador.current?.pause();
    window.addEventListener("pausar-spotify", fn);
    return () => window.removeEventListener("pausar-spotify", fn);
  }, []);

  const reproducir = useCallback((uri: string) => {
    setActual(uri);
    ignorarFinHasta.current = Date.now() + 3000;
    window.dispatchEvent(new Event("pausar-musica"));
    const c = controlador.current;
    if (!c) {
      pendiente.current = uri;
      return;
    }
    if (cargada.current === uri) {
      // Misma canción: el botón funciona como play/pausa.
      c.togglePlay();
      return;
    }
    cargada.current = uri;
    c.loadUri(uri);
    reproducirCuandoEsteLista(c, uri);
  }, [reproducirCuandoEsteLista]);

  // Anterior / siguiente. Al llegar al final de la lista vuelve a empezar.
  const saltar = useCallback(
    (paso: 1 | -1) => {
      const lista = urisRef.current;
      if (lista.length === 0) return;
      const i = lista.indexOf(actualRef.current ?? "");
      const destino = lista[(i + paso + lista.length) % lista.length];
      if (destino === actualRef.current && lista.length === 1) {
        controlador.current?.seek?.(0);
        controlador.current?.play();
        return;
      }
      reproducir(destino);
    },
    [reproducir],
  );
  useEffect(() => {
    saltarRef.current = saltar;
  }, [saltar]);

  const cancionActual = lista.find((c) => aUri(c.url) === actual) ?? lista[0];
  const tituloActual = cancionActual ? cancionActual.titulo || titulos[cancionActual.url] || "Canción" : "";

  const controles = (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => saltar(-1)}
        className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10"
        aria-label="Canción anterior"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
      </button>
      <button
        onClick={() => actual && reproducir(actual)}
        className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#2a1a22] shadow transition hover:scale-105"
        aria-label={sonando ? "Pausar" : "Reproducir"}
      >
        {sonando ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden><path d="M7 4v16l13-8z" /></svg>
        )}
      </button>
      <button
        onClick={() => saltar(1)}
        className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10"
        aria-label="Canción siguiente"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
      </button>
    </div>
  );

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const uri = aUri(form.url);
    if (!uri) {
      setAviso("Ese enlace no parece de Spotify. En Spotify: Compartir → Copiar enlace.");
      return;
    }
    // Se guarda siempre el enlace limpio (sin ?si=, intl-es, texto extra, etc.).
    const [, tipo, id] = uri.split(":");
    const nueva: Cancion = { url: `https://open.spotify.com/${tipo}/${id}`, titulo: form.titulo.trim() || undefined, de: form.de.trim() || undefined };
    setAviso("Guardando…");
    const guardada = await guardarCancion(nueva);
    if (!guardada) {
      setAviso("");
      return;
    }
    setForm((f) => ({ ...f, url: "", titulo: "" }));
    setFormAbierto(false);
    setAviso(compartido ? "¡Agregada! Ya la puede ver tu amor 💛" : "¡Agregada! 💛");
    reproducir(uri);
    // Busca la letra sola y la deja guardada (si no la encuentra, se puede pegar a mano).
    const letra = await buscarLetraEnLinea(guardada.url);
    if (letra) await guardarLetra(guardada.id, letra);
  };

  const lineaCodigo = (c: Cancion) =>
    `  { url: "${c.url}"${c.titulo ? `, titulo: "${c.titulo}"` : ""}${c.de ? `, de: "${c.de}"` : ""} },`;

  const idEmbed = actual ? actual.split(":").slice(1).join("/") : lista[0] ? aUri(lista[0].url)!.split(":").slice(1).join("/") : null;

  return (
    <>
      {/* botón flotante */}
      <button
        ref={boton}
        onClick={() => {
          setAbierto((a) => !a);
          setUsarSpotify(true);
        }}
        className="fixed right-3 bottom-3 z-40 flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-white px-3 text-sm font-bold text-vino shadow-xl ring-1 ring-vino/10 transition hover:scale-105 sm:right-4 sm:bottom-4 sm:px-4"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar canciones" : "Nuestras canciones"}
      >
        {abierto ? (
          <span className="text-lg leading-none sm:text-base">✕</span>
        ) : (
          <span className={`text-xl sm:text-base ${sonando || bienvenida.sonando ? "animate-spin [animation-duration:3s]" : ""}`}>💿</span>
        )}
        <span className="hidden sm:inline">{abierto ? "Cerrar" : "Nuestras canciones"}</span>
      </button>

      {/* panel (siempre montado para que la música siga sonando) */}
      <div
        ref={panel}
        // Transición CSS con el mismo resorte de antes (en iPhone, framer dejaba
        // un cuadro medio transparente al terminar). Cerrado queda "invisible":
        // la música sigue, pero el navegador no lo pinta al desplazarse.
        style={{
          opacity: abierto ? 1 : 0,
          transform: abierto ? "translateY(0px)" : "translateY(30px)",
          pointerEvents: abierto ? "auto" : "none",
          visibility: abierto ? "visible" : "hidden",
          transition: `opacity ${PANEL.duracion}s ${PANEL.curva}, transform ${PANEL.duracion}s ${PANEL.curva}, visibility 0s linear ${abierto ? 0 : PANEL.duracion}s`,
        }}
        className="fixed right-3 bottom-18 z-40 flex max-h-[calc(100svh-7rem)] w-[calc(100vw-1.5rem)] max-w-sm sm:right-4 sm:bottom-20 flex-col overflow-hidden rounded-3xl bg-[#2a1a22] text-white shadow-2xl ring-1 ring-white/10"
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
          {lista.length > 0 && modo !== "simple" && (
            <div className="mt-2 flex items-center justify-between">
              <span className="w-16" />
              {controles}
              <button
                onClick={() => setLetraAbierta(true)}
                className="flex w-16 items-center justify-end gap-1 rounded-full py-1 text-xs font-bold text-[#ffd6a8] transition hover:text-white"
                aria-label="Ver letra"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M4 5h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z" />
                </svg>
                Letra
              </button>
            </div>
          )}
        </div>

        {lista.length > 3 && (
          <div className="relative mx-4 mt-3">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 fill-none stroke-white/50 stroke-2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar canción…"
              aria-label="Buscar canción por título"
              className="w-full rounded-full bg-white/10 py-2 pr-3 pl-9 text-sm placeholder:text-white/50 focus:ring-2 focus:ring-[#ffd6a8] focus:outline-none"
            />
          </div>
        )}

        <ol className="barra-bonita mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-2">
          {musica.archivo && bienvenida.hay && (!busqueda || sinTildes(musica.titulo).includes(sinTildes(busqueda))) && (
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
            const nombre = c.titulo || titulos[c.url] || `Canción ${i + 1}`;
            if (busqueda && !sinTildes(`${nombre} ${c.de ?? ""}`).includes(sinTildes(busqueda))) return null;
            if (c.id && porBorrar === c.id) {
              return (
                <li key={`${c.url}-${i}`} className="rounded-xl bg-[#8e3b46]/60 ring-1 ring-[#ffd6a8]/40">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <p className="min-w-0 flex-1 text-sm">
                      ¿Eliminar <span className="font-semibold">“{nombre}”</span>?{compartido && " Se borra para los dos."}
                    </p>
                    <button
                      onClick={() => setPorBorrar(null)}
                      className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-bold transition hover:bg-white/25"
                    >
                      No
                    </button>
                    <button
                      onClick={() => {
                        setPorBorrar(null);
                        quitar(c.id!);
                      }}
                      className="shrink-0 rounded-full bg-[#ffd6a8] px-3 py-1 text-xs font-bold text-vino transition hover:brightness-95"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </li>
              );
            }
            return (
              <li key={`${c.url}-${i}`} className={`rounded-xl ${activa ? "bg-white/15" : ""}`}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <button
                    onClick={() => reproducir(uri)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1ed760] text-[#1a1a1a] transition hover:scale-110"
                    aria-label={activa && sonando ? "Pausar" : "Reproducir"}
                  >
                    {activa && sonando ? "❚❚" : "▶"}
                  </button>
                  <button onClick={() => reproducir(uri)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-semibold">{nombre}</span>
                    {c.de && <span className="block truncate text-xs text-white/75">💌 {c.de}</span>}
                    {c.nota && <span className="block truncate text-xs text-white/60 italic">{c.nota}</span>}
                  </button>
                  {c.id && (
                    <div className="flex shrink-0 gap-1">
                      {!compartido && (
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
                      )}
                      <button
                        title="Quitar"
                        aria-label={`Eliminar ${nombre}`}
                        onClick={() => c.id && setPorBorrar(c.id)}
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
          {busqueda && lista.every((c, i) => !sinTildes(`${c.titulo || titulos[c.url] || `Canción ${i + 1}`} ${c.de ?? ""}`).includes(sinTildes(busqueda))) && (
            <li className="px-3 py-2 text-sm text-white/75">No encontré canciones con “{busqueda}”.</li>
          )}
          {lista.length === 0 && (
            <li className="px-3 py-2 text-sm text-white/75">Todavía no hay canciones. ¡Agrega la primera aquí abajo!</li>
          )}
        </ol>

        <AnimatePresence initial={false} mode="wait">
          {formAbierto ? (
            <motion.form
              key="formulario"
              onSubmit={agregar}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onUpdate={animarEnJs}
              className="space-y-2 overflow-hidden border-t border-white/10 bg-black/20 px-4 pt-3 pb-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest text-[#ffd6a8] uppercase">Agregar canción</p>
                <button
                  type="button"
                  onClick={() => setFormAbierto(false)}
                  className="grid h-7 w-7 place-items-center rounded-full text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar formulario"
                >
                  ✕
                </button>
              </div>
              <input
                autoFocus
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
                {(error || aviso) && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onUpdate={animarEnJs} className="text-xs text-white/80">
                    {error ?? aviso}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-[11px] leading-snug text-white/55">
                {compartido
                  ? "Las canciones que agreguen se guardan y le aparecen al instante al otro. "
                  : "Las canciones agregadas aquí solo se guardan en este navegador. "}
                Si no has iniciado sesión en Spotify en este navegador, solo suenan 30 segundos de cada canción.
              </p>
            </motion.form>
          ) : (
            <motion.div
              key="boton-agregar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onUpdate={animarEnJs}
              className="flex items-center gap-3 border-t border-white/10 px-4 py-3"
            >
              {(error || aviso) && <p className="min-w-0 flex-1 text-xs text-white/80">{error ?? aviso}</p>}
              <button
                type="button"
                onClick={() => {
                  setAviso("");
                  setFormAbierto(true);
                }}
                className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-[#ffd6a8] py-1.5 pr-4 pl-1.5 text-sm font-bold text-vino shadow-md transition hover:scale-105"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-vino text-lg leading-none text-[#ffd6a8]">+</span>
                Agregar canción
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {letraAbierta && cancionActual && (
            <LetraCancion
              key={cancionActual.url}
              titulo={tituloActual}
              letra={cancionActual.letra}
              url={cancionActual.url}
              posicionMs={posicion}
              editable={Boolean(cancionActual.id)}
              onGuardar={(texto) => (cancionActual.id ? guardarLetra(cancionActual.id, texto) : Promise.resolve(false))}
              onCerrar={() => setLetraAbierta(false)}
              controles={controles}
              error={error}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
