import { NextResponse, type NextRequest } from "next/server";

// Abre WhatsApp con la dedicatoria. Los números viven solo en el servidor
// (WHATSAPP_EL y WHATSAPP_ELLA en .env.local y en Vercel, sin NEXT_PUBLIC),
// así no aparecen en el código que descarga el navegador.
//   /api/whatsapp?para=ella&texto=...
export function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const para = parametros.get("para");
  const texto = (parametros.get("texto") ?? "").slice(0, 2000);
  const numero =
    (para === "el" ? process.env.WHATSAPP_EL : para === "ella" ? process.env.WHATSAPP_ELLA : undefined)?.replace(/\D/g, "") ?? "";

  // Sin número, WhatsApp pregunta a quién enviarlo.
  const destino = `https://api.whatsapp.com/send?${numero ? `phone=${numero}&` : ""}text=${encodeURIComponent(texto)}`;
  const respuesta = NextResponse.redirect(destino, 302);
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}
