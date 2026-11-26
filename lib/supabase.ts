import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador. Solo usa la clave pública "anon",
// que está pensada para estar en el frontend; la seguridad la ponen las
// reglas (RLS) de la tabla. Si faltan las variables, devuelve null y la
// página sigue funcionando sin Supabase.
// Acepta la URL aunque se pegue con "/rest/v1/" o una barra al final.
export const limpiarUrlSupabase = (u?: string) => u?.trim().replace(/\/(rest\/v1\/?)?$/, "").replace(/\/+$/, "");
const url = limpiarUrlSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL);
const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

let cliente: SupabaseClient | null = null;

export function obtenerSupabase(): SupabaseClient | null {
  if (!url || !clave) return null;
  cliente ??= createClient(url, clave, { auth: { persistSession: false } });
  return cliente;
}
