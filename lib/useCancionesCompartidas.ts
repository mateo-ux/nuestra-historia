"use client";

import { useCallback, useEffect, useState } from "react";
import type { Cancion } from "@/datos/contenido";
import { obtenerSupabase } from "./supabase";

export type CancionGuardada = Cancion & { id: string };

const CLAVE_LOCAL = "canciones-agregadas";
const TABLA = "canciones";

type Fila = { id: string; url: string; titulo: string | null; de: string | null; nota: string | null; letra?: string | null };
const aCancion = (f: Fila): CancionGuardada => ({
  id: f.id,
  url: f.url,
  titulo: f.titulo ?? undefined,
  de: f.de ?? undefined,
  nota: f.nota ?? undefined,
  letra: f.letra ?? undefined,
});

/** Traduce el error de Supabase a algo entendible y lo deja en la consola. */
function explicarError(accion: string, e: { code?: string; message?: string }): string {
  console.error(`[canciones] ${accion}:`, e);
  if (e.code === "PGRST205" || e.code === "42P01")
    return "Falta la tabla de canciones en Supabase. Ejecuta supabase/canciones.sql en el SQL Editor.";
  if (e.code === "42703" || e.code === "PGRST204")
    return "Falta la columna de letras en Supabase. Ejecuta supabase/letras.sql en el SQL Editor.";
  if (e.code === "42501")
    return "Supabase no dio permiso. Ejecuta supabase/canciones.sql para crear las políticas.";
  if (e.message?.includes("Invalid API key") || e.code === "401")
    return "La clave de Supabase no es válida. Revisa NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.";
  if (e.message?.includes("Failed to fetch"))
    return "No se pudo conectar con Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y tu internet.";
  return `No se pudo ${accion}. (${e.code ?? "sin código"}: ${e.message ?? "error desconocido"})`;
}

function leerLocales(): CancionGuardada[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(CLAVE_LOCAL) ?? "[]");
    return Array.isArray(v) ? v.map((c: Cancion) => ({ ...c, id: `local-${c.url}` })) : [];
  } catch {
    return [];
  }
}

/** Busca la letra de una canción de Spotify (ruta /api/letra → LRCLIB). */
export async function buscarLetraEnLinea(url: string): Promise<string | null> {
  const id = url.match(/track[/:]([A-Za-z0-9]+)/)?.[1];
  if (!id) return null;
  try {
    const r = await fetch(`/api/letra?id=${id}`);
    if (!r.ok) return null;
    const d: { ok: boolean; letra?: string } = await r.json();
    return d.ok && d.letra ? d.letra : null;
  } catch {
    return null;
  }
}

/**
 * Canciones agregadas desde la página.
 * - Con Supabase configurado: se guardan en la tabla "canciones" y se
 *   sincronizan en tiempo real entre todos los que tengan la página abierta.
 * - Sin Supabase: se guardan solo en este navegador (localStorage).
 */
export function useCancionesCompartidas() {
  const supabase = obtenerSupabase();
  const compartido = supabase !== null;
  const [canciones, setCanciones] = useState<CancionGuardada[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      const t = setTimeout(() => setCanciones(leerLocales()), 0);
      return () => clearTimeout(t);
    }

    let activo = true;
    supabase
      .from(TABLA)
      .select("*")
      .order("creado", { ascending: true })
      .then(({ data, error }) => {
        if (!activo) return;
        if (error) setError(explicarError("cargar las canciones", error));
        else setCanciones((data as Fila[]).map(aCancion));
      });

    const canal = supabase
      .channel("canciones-en-vivo")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: TABLA }, (p) => {
        const nueva = aCancion(p.new as Fila);
        setCanciones((c) => (c.some((x) => x.id === nueva.id) ? c : [...c, nueva]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: TABLA }, (p) => {
        const cambiada = aCancion(p.new as Fila);
        setCanciones((c) => c.map((x) => (x.id === cambiada.id ? cambiada : x)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: TABLA }, (p) => {
        const id = (p.old as Partial<Fila>).id;
        setCanciones((c) => c.filter((x) => x.id !== id));
      })
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [supabase]);

  const guardarLocal = (lista: CancionGuardada[]) => {
    setCanciones(lista);
    try {
      localStorage.setItem(CLAVE_LOCAL, JSON.stringify(lista.map((c) => ({ url: c.url, titulo: c.titulo, de: c.de, nota: c.nota, letra: c.letra }))));
    } catch {}
  };

  const agregar = useCallback(
    async (c: Cancion): Promise<CancionGuardada | null> => {
      setError(null);
      if (!supabase) {
        const local = { ...c, id: `local-${c.url}` };
        guardarLocal([...leerLocales().filter((x) => x.url !== c.url), local]);
        return local;
      }
      const { data, error } = await supabase
        .from(TABLA)
        .insert({ url: c.url, titulo: c.titulo ?? null, de: c.de ?? null, nota: c.nota ?? null })
        .select("*")
        .single();
      if (error) {
        setError(explicarError("guardar", error));
        return null;
      }
      const nueva = aCancion(data as Fila);
      setCanciones((l) => (l.some((x) => x.id === nueva.id) ? l : [...l, nueva]));
      return nueva;
    },
    [supabase],
  );

  const quitar = useCallback(
    async (id: string) => {
      setError(null);
      if (!supabase) {
        guardarLocal(leerLocales().filter((c) => c.id !== id));
        return;
      }
      setCanciones((l) => l.filter((x) => x.id !== id));
      const { error } = await supabase.from(TABLA).delete().eq("id", id);
      if (error) setError(explicarError("quitar la canción", error));
    },
    [supabase],
  );

  // Guarda (o borra, si viene vacía) la letra de una canción.
  const guardarLetra = useCallback(
    async (id: string, letra: string) => {
      setError(null);
      const valor = letra.trim() || undefined;
      if (!supabase) {
        guardarLocal(leerLocales().map((c) => (c.id === id ? { ...c, letra: valor } : c)));
        return true;
      }
      const { error } = await supabase.from(TABLA).update({ letra: valor ?? null }).eq("id", id);
      if (error) {
        setError(explicarError("guardar la letra", error));
        return false;
      }
      setCanciones((l) => l.map((x) => (x.id === id ? { ...x, letra: valor } : x)));
      return true;
    },
    [supabase],
  );

  return { canciones, agregar, quitar, guardarLetra, compartido, error };
}
