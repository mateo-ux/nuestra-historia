import Capitulos from "./componentes/Capitulos";
import Cartas from "./componentes/Cartas";
import EscenaRobots from "./componentes/EscenaRobots";
import EscenaZootopia from "./componentes/EscenaZootopia";
import Final from "./componentes/Final";
import Galeria from "./componentes/Galeria";
import Intro from "./componentes/Intro";
import Libro from "./componentes/Libro";
import Navegacion from "./componentes/Navegacion";
import Portada from "./componentes/Portada";
import Razones from "./componentes/Razones";
import Reproductor from "./componentes/Reproductor";
import Videos from "./componentes/Videos";

export default function Inicio() {
  return (
    <main>
      <Intro />
      <Navegacion />
      <Reproductor />
      <Portada />
      <Libro />
      <Capitulos />
      <EscenaRobots />
      <Galeria />
      <Videos />
      <EscenaZootopia />
      <Razones />
      <Cartas />
      <Final />
    </main>
  );
}
