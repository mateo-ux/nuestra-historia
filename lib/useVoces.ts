"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerSupabase } from "./supabase";

// Audios grabados desde la página (zanahoria grabadora y Flash).
// - Con Supabase: el audio va al bucket "voces" y la tabla "voces" guarda cuál
//   audio corresponde a cada renglón. Se ve en vivo en los dos celulares.
// - Sin Supabase: el audio solo vive mientras la página está abierta.

export type ClaveVoz = "zanahoria-1" | "zanahoria-2" | "flash-lento" | "flash-normal";
type Voz = { url: string; ruta?: string };
type Fila = { clave: ClaveVoz; ruta: string };

const BUCKET = "voces";
const TABLA = "voces";

function explicar(accion: string, e: { code?: string; message?: string; statusCode?: string }): string {
  console.error(`[voces] ${accion}:`, e);
  const m = e.message ?? "";
  if (e.code === "PGRST205" || e.code === "42P01" || /bucket not found/i.test(m))
    return "Falta preparar Supabase para las voces. Ejecuta supabase/voces.sql en el SQL Editor.";
  if (e.code === "42501" || /row-level security|unauthorized/i.test(m))
    return "Supabase no dio permiso para guardar la voz. Ejecuta supabase/voces.sql en el SQL Editor.";
  if (/maximum allowed size|too large/i.test(m)) return "La grabación quedó muy pesada. Intenta una más corta.";
  if (/mime type/i.test(m)) return "Este celular grabó en un formato que no se aceptó. Ejecuta de nuevo supabase/voces.sql.";
  if (/failed to fetch/i.test(m)) return "No se pudo conectar con Supabase. Revisa tu internet.";
  return `No se pudo ${accion}. (${e.code ?? e.statusCode ?? "sin código"}: ${m || "error desconocido"})`;
}

const extension = (tipo: string) =>
  tipo.includes("mp4") || tipo.includes("aac") || tipo.includes("m4a") ? "m4a" : tipo.includes("ogg") ? "ogg" : tipo.includes("mpeg") ? "mp3" : "webm";

export function useVoces() {
  const supabase = obtenerSupabase();
  const compartido = supabase !== null;
  const [voces, setVoces] = useState<Partial<Record<ClaveVoz, Voz>>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<ClaveVoz | null>(null);

  const urlPublica = useCallback(
    (ruta: string) => supabase?.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl ?? "",
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    let activo = true;
    const aplicar = (f: Fila) => setVoces((v) => ({ ...v, [f.clave]: { ruta: f.ruta, url: urlPublica(f.ruta) } }));
    supabase
      .from(TABLA)
      .select("clave, ruta")
      .then(({ data, error }) => {
        if (!activo) return;
        if (error) setError(explicar("cargar las grabaciones", error));
        else (data as Fila[]).forEach(aplicar);
      });
    const canal = supabase
      .channel("voces-en-vivo")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: TABLA }, (p) => aplicar(p.new as Fila))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: TABLA }, (p) => aplicar(p.new as Fila))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: TABLA }, (p) => {
        const clave = (p.old as Partial<Fila>).clave;
        if (clave) setVoces((v) => ({ ...v, [clave]: undefined }));
      })
      .subscribe();
    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [supabase, urlPublica]);

  // Las URL locales (sin Supabase) se liberan al salir.
  const locales = useRef<string[]>([]);
  useEffect(() => () => locales.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const guardar = useCallback(
    async (clave: ClaveVoz, audio: Blob) => {
      setError(null);
      if (!supabase) {
        const url = URL.createObjectURL(audio);
        locales.current.push(url);
        setVoces((v) => ({ ...v, [clave]: { url } }));
        return true;
      }
      setGuardando(clave);
      try {
        const tipo = audio.type.split(";")[0] || "audio/webm";
        const ruta = `${clave}-${Date.now()}.${extension(tipo)}`;
        const subida = await supabase.storage.from(BUCKET).upload(ruta, audio, { contentType: tipo, cacheControl: "31536000" });
        if (subida.error) {
          setError(explicar("guardar la grabación", subida.error));
          return false;
        }
        const anterior = voces[clave]?.ruta;
        const { error } = await supabase.from(TABLA).upsert({ clave, ruta, actualizado: new Date().toISOString() });
        if (error) {
          setError(explicar("guardar la grabación", error));
          await supabase.storage.from(BUCKET).remove([ruta]);
          return false;
        }
        setVoces((v) => ({ ...v, [clave]: { ruta, url: urlPublica(ruta) } }));
        if (anterior) await supabase.storage.from(BUCKET).remove([anterior]);
        return true;
      } finally {
        setGuardando(null);
      }
    },
    [supabase, voces, urlPublica],
  );

  const borrar = useCallback(
    async (clave: ClaveVoz) => {
      setError(null);
      const anterior = voces[clave];
      setVoces((v) => ({ ...v, [clave]: undefined }));
      if (!supabase || !anterior?.ruta) return;
      const { error } = await supabase.from(TABLA).delete().eq("clave", clave);
      if (error) {
        setError(explicar("borrar la grabación", error));
        setVoces((v) => ({ ...v, [clave]: anterior }));
        return;
      }
      await supabase.storage.from(BUCKET).remove([anterior.ruta]);
    },
    [supabase, voces],
  );

  return { voces, guardar, borrar, guardando, error, compartido };
}

// ---------- grabadora (micrófono) ----------

// iPhone graba en audio/mp4; Chrome y Android, si pueden, también (así el
// audio suena en cualquier celular). Si no, webm.
function formatoGrabacion(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t));
}

export const MAXIMO_SEGUNDOS = 20;

/** Graba del micrófono. Solo una grabación a la vez en toda la página. */
export function useGrabadora(alTerminar: (clave: ClaveVoz, audio: Blob) => void) {
  const [grabando, setGrabando] = useState<ClaveVoz | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const grabadora = useRef<MediaRecorder | null>(null);
  const reloj = useRef<ReturnType<typeof setInterval> | null>(null);
  const terminar = useRef(alTerminar);
  useEffect(() => {
    terminar.current = alTerminar;
  });

  const detener = useCallback(() => {
    if (grabadora.current?.state === "recording") grabadora.current.stop();
  }, []);

  const empezar = useCallback(async (clave: ClaveVoz) => {
    setAviso(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAviso("Este navegador no deja grabar. Abre la página en Safari o Chrome (con https).");
      return;
    }
    let flujo: MediaStream;
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setAviso("No hay permiso para el micrófono. Actívalo en los ajustes del navegador y vuelve a intentar.");
      return;
    }
    const tipo = formatoGrabacion();
    const r = new MediaRecorder(flujo, tipo ? { mimeType: tipo, audioBitsPerSecond: 96000 } : undefined);
    const partes: Blob[] = [];
    r.ondataavailable = (e) => e.data.size > 0 && partes.push(e.data);
    r.onstop = () => {
      flujo.getTracks().forEach((t) => t.stop());
      if (reloj.current) clearInterval(reloj.current);
      setGrabando(null);
      const audio = new Blob(partes, { type: r.mimeType || tipo || "audio/webm" });
      if (audio.size > 0) terminar.current(clave, audio);
    };
    grabadora.current = r;
    r.start(250);
    setGrabando(clave);
    setSegundos(0);
    const inicio = Date.now();
    reloj.current = setInterval(() => {
      const s = Math.floor((Date.now() - inicio) / 1000);
      setSegundos(s);
      if (s >= MAXIMO_SEGUNDOS) r.stop();
    }, 250);
  }, []);

  useEffect(
    () => () => {
      if (reloj.current) clearInterval(reloj.current);
      if (grabadora.current?.state === "recording") grabadora.current.stop();
    },
    [],
  );

  return { grabando, segundos, aviso, empezar, detener };
}
