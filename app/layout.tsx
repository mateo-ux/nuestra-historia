import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cormorant_Garamond, Nunito } from "next/font/google";
import "./globals.css";

const manuscrita = Dancing_Script({
  variable: "--font-manuscrita",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const texto = Nunito({
  variable: "--font-texto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siempre fuiste tú 💛",
  description: "La historia de María Fernanda y Mateo",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f08a5d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manuscrita.variable} ${serif.variable} ${texto.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
