import Capitulos from "./componentes/Capitulos";
import Cartas from "./componentes/Cartas";
import EscenaRobots from "./componentes/EscenaRobots";
import EscenaZootopia from "./componentes/EscenaZootopia";
import Final from "./componentes/Final";
import Fotomaton from "./componentes/Fotomaton";
import Galeria from "./componentes/Galeria";
import Intro from "./componentes/Intro";
import Libro from "./componentes/Libro";
import Navegacion from "./componentes/Navegacion";
import Portada from "./componentes/Portada";
import Proveedores from "./componentes/Proveedores";
import Razones from "./componentes/Razones";
import Reproductor from "./componentes/Reproductor";
import Videos from "./componentes/Videos";

export default function Inicio() {
  return (
    <Proveedores>
      <main>
      <Intro />
      <Navegacion />
      <Reproductor />
      <Portada />
      <Libro />
      <Capitulos />
      <EscenaRobots />
      <Galeria />
      <Fotomaton />
      <Videos />
      <EscenaZootopia />
      <Razones />
      <Cartas />
      <Final />
      </main>
    </Proveedores>
  );
}
