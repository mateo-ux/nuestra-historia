import { NextResponse } from "next/server";
import { limpiarUrlSupabase } from "@/lib/supabase";

// Ruta que Vercel Cron llama una vez al día (ver vercel.json).
// Hace una consulta mínima a Supabase para que el proyecto gratuito
// no se pause por inactividad. También sirve para revisar la conexión:
// abre /api/ping en el navegador y verás si Supabase responde.
export async function GET(request: Request) {
  const autorizacion = request.headers.get("authorization");
  const secreto = process.env.CRON_SECRET;
  if (secreto && autorizacion !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const url = limpiarUrlSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !clave) {
    return NextResponse.json(
      { ok: false, error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 },
    );
  }

  try {
    const respuesta = await fetch(`${url}/rest/v1/canciones?select=id&limit=1`, {
      headers: { apikey: clave, Authorization: `Bearer ${clave}` },
      cache: "no-store",
    });
    const cuerpo = await respuesta.text();
    if (!respuesta.ok) {
      return NextResponse.json(
        { ok: false, estado: respuesta.status, detalle: cuerpo.slice(0, 300) },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, supabase: "conectado", fecha: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 502 },
    );
  }
}
