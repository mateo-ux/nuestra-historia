const enlaces = [
  ["#libro", "Libro"],
  ["#historia", "Historia"],
  ["#viaje", "Viaje"],
  ["#videos", "Videos"],
  ["#razones", "Razones"],
  ["#cartas", "Cartas"],
];

export default function Navegacion() {
  return (
    <nav className="fixed top-3 left-1/2 z-40 hidden -translate-x-1/2 gap-1 rounded-full bg-white/95 px-2 py-1.5 text-sm font-bold text-vino shadow-lg ring-1 ring-vino/10 backdrop-blur-md sm:flex">
      {enlaces.map(([href, texto]) => (
        <a key={href} href={href} className="rounded-full px-3 py-1 transition hover:bg-vino hover:text-white">
          {texto}
        </a>
      ))}
    </nav>
  );
}
