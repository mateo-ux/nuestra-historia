// ============================================================
//  TODO EL TEXTO DE LA PÁGINA ESTÁ AQUÍ.
//  Cambia lo que quieras: nombres, fechas, razones, cartas...
//  Las fotos están en public/optimizado/fotos y las páginas
//  del libro en public/optimizado/revista.
// ============================================================

export const pareja = {
  ella: "María Fernanda",
  apodoElla: "mi amor",
  el: "Mateo",
  // Fecha y hora en que empezó todo (año, mes, día, hora). Se usa para el contador.
  inicio: "2025-08-30T20:00:00-05:00",
  inicioTexto: "30 de agosto de 2025",
};

// Dirección pública de la página (va en el mensaje de WhatsApp).
export const sitioWeb = "https://nuestra-historia-app-kohl.vercel.app";

// ============================================================
//  NUESTRAS CANCIONES (Spotify)
//  Copia el enlace de la canción en Spotify (Compartir → Copiar enlace)
//  y agrégala aquí. "titulo" y "nota" son opcionales.
//  "de" es quién se la dedicó a quién.
//  También se pueden agregar desde la página (botón "+ Agregar"), pero esas
//  solo quedan guardadas en ese navegador; para que queden para siempre,
//  ponlas aquí (la página te da la línea lista para copiar).
// ============================================================
export type Cancion = {
  url: string;
  titulo?: string;
  de?: string;
  nota?: string;
  /** Letra escrita a mano. Si cada línea empieza con [mm:ss] se sincroniza con la canción. */
  letra?: string;
};

export const canciones: Cancion[] = [
  // Ejemplo (borra las dos barras // del inicio y pon tu enlace):
  // { url: "https://open.spotify.com/track/XXXXXXXXXXXX", titulo: "Nuestra canción", de: "Mateo para María Fernanda", nota: "La que sonaba esa noche" },
];

// Canción de bienvenida (opcional): suena sola al abrir el sobre.
// El archivo va en public/musica/. Si cambias el nombre del
// archivo, cámbialo también aquí. Si no existe, el botón de música no aparece.
export const musica = {
  archivo: "/musica/cancion.mp3",
  titulo: "Nuestra canción",
};

const f = (nombre: string) => `/optimizado/fotos/${nombre}.webp`;
const p = (n: number) =>
  `/optimizado/revista/paginas/pagina-${String(n).padStart(2, "0")}.webp`;

// Páginas del libro "Siempre fuiste tú" (el regalo de ella).
// Cada página va suelta (las dobles se cortaron por el doblez).
export const libro = [
  { src: p(0), ancho: 1528, alto: 2000, titulo: "Portada" },
  { src: p(1), ancho: 1055, alto: 1392, titulo: "Dedicatoria" },
  { src: p(2), ancho: 1010, alto: 1313, titulo: "Prólogo" },
  { src: p(3), ancho: 990, alto: 1313, titulo: "Capítulo 1" },
  { src: p(4), ancho: 1025, alto: 1316, titulo: "Página 4" },
  { src: p(5), ancho: 975, alto: 1324, titulo: "Página 5" },
  { src: p(6), ancho: 1021, alto: 1294, titulo: "Página 6" },
  { src: p(7), ancho: 979, alto: 1302, titulo: "Página 7" },
  { src: p(8), ancho: 988, alto: 1252, titulo: "Página 8" },
  { src: p(9), ancho: 928, alto: 1252, titulo: "Página 9" },
  { src: p(10), ancho: 898, alto: 1158, titulo: "Página 10" },
  { src: p(11), ancho: 881, alto: 1158, titulo: "Página 11" },
  { src: p(12), ancho: 883, alto: 1171, titulo: "Página 12" },
  { src: p(13), ancho: 871, alto: 1171, titulo: "Página 13" },
  { src: p(14), ancho: 913, alto: 1148, titulo: "Página 14" },
  { src: p(15), ancho: 863, alto: 1148, titulo: "Página 15" },
  { src: p(16), ancho: 1308, alto: 1758, titulo: "Página 16" },
  { src: p(17), ancho: 1538, alto: 1982, titulo: "Te amo" },
];

export type Foto = { src: string; pie?: string };

export type Capitulo = {
  numero: string;
  titulo: string;
  fecha: string;
  cita: string; // frase del libro
  texto: string; // lo que tú le dices
  fotos: Foto[];
};

export const capitulos: Capitulo[] = [
  {
    numero: "Capítulo 1",
    titulo: "La noche de la pregunta",
    fecha: "Agosto 2025",
    cita: "No había fuegos artificiales en el cielo ni señales mágicas anunciando que algo importante estaba por suceder.",
    texto:
      "Te llevé flores y un libro lleno de páginas en blanco. Adentro iba una pregunta que llevaba años esperando el momento correcto. Dijiste que sí, y desde esa noche todo empezó a escribirse solo.",
    fotos: [
      { src: f("9a1bc1f4-e9df-4112-80f0-e572cdac0eab"), pie: "Nuestra primera foto" },
      { src: f("img_0058"), pie: "Nuestras primeras fotos" },
      { src: f("img_0332"), pie: "Esa sonrisa" },
    ],
  },
  {
    numero: "Capítulo 2",
    titulo: "Los primeros recuerdos",
    fecha: "Noviembre 2025 · Enero 2026",
    cita: "Tomarse de la mano se sentía como una pequeña aventura.",
    texto:
      "Paseos, caminos de campo y un muro entero de girasoles. Cada salida parecía la primera, y cada despedida venía con ganas de volver a vernos pronto.",
    fotos: [
      { src: f("img_0280"), pie: "Aventuras de campo" },
      { src: f("img_1332"), pie: "Entre girasoles" },
      { src: f("img_1748"), pie: "Siempre juntos" },
    ],
  },
  {
    numero: "Capítulo 3",
    titulo: "Cumpleaños, cartas y locuras",
    fecha: "Febrero · Mayo 2026",
    cita: "Después llegaron los cumpleaños, llenos de sorpresas, detalles y momentos que terminaron guardándose para siempre en la memoria.",
    texto:
      "Tu carta en rompecabezas, las tortas, las mascarillas a medianoche y todas las caras chistosas que solo me haces a mí.",
    fotos: [
      { src: f("9b90bb83-ea9a-4f8a-85f0-fd395e91c1fe"), pie: "Tu carta rompecabezas" },
      { src: f("img_2068"), pie: "Torta de cumpleaños" },
      { src: f("img_2631"), pie: "Noche de mascarillas" },
    ],
  },
  {
    numero: "Capítulo 4",
    titulo: "Sostener el paraguas juntos",
    fecha: "Julio 2026",
    cita: "El amor no consiste en evitar las tormentas, sino en aprender a sostener el paraguas juntos cuando la lluvia aparece.",
    texto:
      "No todo fue fácil, pero cada día difícil terminó enseñándonos algo valioso: que tu mano y la mía encajan incluso cuando llueve.",
    fotos: [
      { src: f("img_3887"), pie: "Tu mano y la mía" },
      { src: f("img_3059"), pie: "Refugio" },
    ],
  },
  {
    numero: "Capítulo 5",
    titulo: "Un hogar que no es de paredes",
    fecha: "Todo el año",
    cita: "No un hogar hecho de paredes y ventanas, sino uno formado por abrazos, conversaciones, besos antes de dormir.",
    texto:
      "Mi hogar es donde tú estás. Tu voz, tu olor, tus abrazos y hasta el dibujo de tu ingeniero favorito.",
    fotos: [
      { src: f("img_3826"), pie: "Besos robados" },
      { src: f("img_3833"), pie: "Nosotros" },
      { src: f("cf6ec729-ce13-4371-88a2-a9f9884ef4db"), pie: "Tu ingeniero favorito" },
    ],
  },
  {
    numero: "Capítulo 6",
    titulo: "Nuestro primer aniversario",
    fecha: "29 y 30 de agosto de 2026",
    cita: "Lo único que sabían era lo más importante: que después de tantos caminos, finalmente caminarían juntos.",
    texto:
      "Cascadas, moto, risas y un libro que me hizo llorar. Gracias por regalarme nuestra historia escrita por ti.",
    fotos: [
      { src: f("img_3809"), pie: "La cascada" },
      { src: f("img_3855"), pie: "Aventura en moto" },
      { src: f("img_3847"), pie: "Explorando" },
    ],
  },
];

// Galería del viaje a la playa (28 sep – 2 oct 2026)
export const viaje = {
  titulo: "El viaje del aniversario",
  fecha: "28 de septiembre – 2 de octubre de 2026",
  cita: "Muy lejos, donde el mar abraza la arena y los atardeceres pintan el cielo de colores imposibles, los esperaba un viaje especial.",
  fotos: [
    { src: f("img_4058"), pie: "¡Nos vamos!" },
    { src: f("img_4094"), pie: "Primer día de mar" },
    { src: f("img_4153"), pie: "Pushaina" },
    { src: f("img_4266"), pie: "Atardecer de colores imposibles" },
    { src: f("img_4251"), pie: "Tú y yo" },
    { src: f("img_4359"), pie: "Pintadas de felicidad" },
    { src: f("img_4445"), pie: "Beso en el mar" },
    { src: f("img_4432"), pie: "Sombreros" },
    { src: f("img_4487"), pie: "Mi silueta favorita" },
    { src: f("img_4549"), pie: "¡Libres!" },
    { src: f("img_4565"), pie: "Agua salada" },
    { src: f("img_4589"), pie: "Listos para la cena" },
    { src: f("img_4614"), pie: "Cena junto al mar" },
    { src: f("img_4641"), pie: "Mi ángel" },
    { src: f("img_4668"), pie: "Conchitas" },
    { src: f("img_4429"), pie: "En la arena" },
  ] as Foto[],
};

// "Y lo que sigue..." (fotos recientes)
export const despues: Foto[] = [
  { src: f("img_4819"), pie: "Octubre" },
  { src: f("img_5233"), pie: "Noviembre" },
];

// "¿Escribimos juntos el capítulo 2?" (nuestro segundo año)
export const capituloDos = {
  inicio: "30 de agosto de 2026",
  mensaje:
    "Capítulo 2: empezó el 30 de agosto de 2026, el día que cumplimos nuestro primer año. Ahora lo seguimos escribiendo juntos, página por página. Siempre fuiste tú.",
};

// Tarjetas que se voltean: "razones por las que te quiero"
export const razones = [
  { frente: "Tu risa", detras: "Porque cuando te ríes, todo lo demás deja de importar." },
  { frente: "Tus caras chistosas", detras: "Porque sacas la lengua en las fotos y me robas el corazón cada vez." },
  { frente: "Tu forma de cuidarme", detras: "Porque me cuidas como quien cuida algo valioso." },
  { frente: "Nuestro libro", detras: "Porque convertiste nuestra historia en un libro y me hiciste llorar de felicidad." },
  { frente: "Tus abrazos", detras: "Porque en tus abrazos encontré mi hogar." },
  { frente: "Tu valentía", detras: "Porque te atreves a todo: mar, moto, cascadas… y a quererme." },
  { frente: "Tus detalles", detras: "Porque escribes cartas en rompecabezas y dibujas a tu ingeniero favorito." },
  { frente: "Tu mirada", detras: "Porque detrás de esas gafas están los ojos más bonitos del mundo." },
  { frente: "Los planes", detras: "Porque contigo hasta un día normal se vuelve aventura." },
  { frente: "Las tormentas", detras: "Porque cuando llueve, sostienes el paraguas conmigo." },
  { frente: "Tus sueños", detras: "Porque tus sueños ya son también los míos." },
  { frente: "Simplemente tú", detras: "Porque siempre fuiste tú. Y siempre vas a ser tú." },
];

// Cartas "Ábrela cuando..."
export const cartas = [
  {
    cuando: "estés triste",
    color: "#f4a6a0",
    texto:
      "Mi amor, si estás leyendo esto es porque hoy pesa un poquito. Respira. No tienes que estar bien todo el tiempo. Recuerda que no estás sola: aquí estoy yo, para sostener el paraguas contigo hasta que salga el sol. Llámame, que tengo un abrazo guardado solo para ti.",
  },
  {
    cuando: "me extrañes",
    color: "#f7c59f",
    texto:
      "Yo también te estoy extrañando, seguro. Cierra los ojos y piensa en el mar de La Guajira, en nuestras manos entrelazadas y en mi voz diciéndote que te amo. La distancia es solo un ratico; lo nuestro es para siempre.",
  },
  {
    cuando: "no puedas dormir",
    color: "#c9b6e4",
    texto:
      "Imagina que estamos acostados, que te estoy acariciando el pelo y contándote cómo va a ser nuestro próximo viaje. Cuenta estrellas conmigo: una por cada beso que te debo. Seguro te duermes antes de llegar a cien. Dulces sueños, mi niña.",
  },
  {
    cuando: "estés feliz",
    color: "#ffd88a",
    texto:
      "¡Qué bonito! Me encanta imaginarte sonriendo mientras lees esto. Guarda este momento y cuéntamelo todo, que tu felicidad es mi parte favorita del día. Te amo cuando estás feliz, cuando estás triste y en todos los ratos de en medio.",
  },
];

// Carta secreta (aparece al tocar la luna 5 veces)
export const cartaSecreta = {
  titulo: "Encontraste el secreto",
  texto:
    "Sabía que ibas a encontrarlo, porque siempre te fijas en los detalles. Aquí va algo que no te digo lo suficiente: gracias por elegirme cada día. Si me dieran a escoger otra vez, entre todas las vidas posibles, te escogería a ti en todas. Siempre fuiste tú. — Mateo",
};

// ============================================================
//  VIDEOS ("Nuestras escenas")
//  Los videos completos están en public/optimizado/videos.
//  Solo se reproduce el fragmento entre "inicio" y "fin" (en segundos),
//  en bucle. Para elegir otra parte, cambia esos dos números.
//  Ejemplo: inicio: 12, fin: 20  -> del segundo 12 al 20.
//  (Puedes ver los segundos abriendo el video en tu computador.)
// ============================================================
const v = (nombre: string) => `/optimizado/videos/${nombre}`;

export type Video = {
  archivo: string;
  portada: string;
  titulo: string;
  texto: string;
  inicio: number;
  fin: number;
  horizontal?: boolean;
};

export const videos: Video[] = [
  { archivo: v("img_3897.mp4"), portada: v("img_3897.webp"), titulo: "Cita de sushi", texto: "Tú peleando con los palitos y yo enamorándome otra vez.", inicio: 5, fin: 15 },
  { archivo: v("img_4218.mp4"), portada: v("img_4218.webp"), titulo: "En las dunas de La Guajira", texto: "Yo abajo, tú allá arriba saludándome. Siempre llegas primero.", inicio: 3, fin: 13 },
  { archivo: v("img_4511.mp4"), portada: v("img_4511.webp"), titulo: "Besitos desde la playa", texto: "El mejor video de todo el viaje.", inicio: 0, fin: 7.4 },
  { archivo: v("img_4516.mp4"), portada: v("img_4516.webp"), titulo: "El mar a nuestros pies", texto: "Donde el mar abraza la arena.", inicio: 0, fin: 14 },
  { archivo: v("img_5282.mp4"), portada: v("img_5282.webp"), titulo: "Karaoke en la piscina", texto: "Tu concierto privado (y yo tu fan número uno).", inicio: 0, fin: 17 },
  { archivo: v("img_5285.mp4"), portada: v("img_5285.webp"), titulo: "¿Y este baile?", texto: "Nadie baila como nosotros. Literal, nadie.", inicio: 0, fin: 14 },
  { archivo: v("img_5286.mp4"), portada: v("img_5286.webp"), titulo: "Segunda ronda", texto: "Porque una vez nunca es suficiente.", inicio: 8, fin: 20 },
  { archivo: v("img_5293.mp4"), portada: v("img_5293.webp"), titulo: "Noche de fiesta y familia", texto: "Sabores exoticos.", inicio: 65, fin: 80, horizontal: true },
];

// ============================================================
//  PERSONAJES
//  Si pones imágenes PNG (fondo transparente) en public/personajes/
//  con estos nombres, la página las usa en vez de los dibujos.
//  Las versiones "guino", "feliz" y "sonrisa" son opcionales.
// ============================================================
export const personajes = {
  zorro: ["/personajes/zorro.png"],
  zorroGuino: ["/personajes/zorro-guino.png", "/personajes/zorro.png"],
  coneja: ["/personajes/coneja.png"],
  conejaFeliz: ["/personajes/coneja-feliz.png", "/personajes/coneja.png"],
  perezoso: ["/personajes/perezoso.png"],
  perezosoSonrisa: ["/personajes/perezoso-sonrisa.png", "/personajes/perezoso.png"],
};
