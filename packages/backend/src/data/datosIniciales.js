import { Categoria } from "../domain/Categoria.js";
import { Compra } from "../domain/Compra.js";
import { Evento } from "../domain/Evento.js";
import { Mensaje } from "../domain/Mensaje.js";
import { Resenia } from "../domain/Resenia.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";
import { Usuario } from "../domain/Usuario.js";

// Datos de ejemplo para poder mostrar todos los flujos sin cargar nada a mano.
// Se usan las entidades de dominio directamente (sin services) porque algunas
// compras corresponden a eventos que ya pasaron.

function enDias(dias, hora = 21) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha;
}

// para eventos pasados no se puede usar evento.venderEntradas()
function compraHistorica(comprador, evento, tipoEntrada, cantidad) {
  tipoEntrada.descontarCupo(cantidad);
  return new Compra(comprador, evento, tipoEntrada, cantidad);
}

export async function cargarDatosIniciales({
  usuarioRepository,
  categoriaRepository,
  eventoRepository,
  compraRepository,
  reseniaRepository,
}) {
  const ana = new Usuario("Ana", "García");
  const martin = new Usuario("Martín", "López");
  const juan = new Usuario("Juan", "Pérez");
  const lucia = new Usuario("Lucía", "Fernández");
  for (const usuario of [ana, martin, juan, lucia]) {
    await usuarioRepository.guardar(usuario);
  }

  const musica = new Categoria("Música", "Recitales y festivales");
  const teatro = new Categoria("Teatro", "Obras de teatro y stand up");
  const deportes = new Categoria("Deportes", "Partidos y competencias");
  const conferencias = new Categoria("Conferencias", "Charlas y workshops");
  for (const categoria of [musica, teatro, deportes, conferencias]) {
    await categoriaRepository.guardar(categoria);
  }

  const rock = new Evento(
    "Noche de Rock Nacional",
    "Las mejores bandas del rock nacional en una sola noche",
    musica,
    enDias(20),
    [
      new TipoEntrada("General", "Campo general", 15000, 500),
      new TipoEntrada("VIP", "Campo delantero con barra exclusiva", 35000, 50),
    ],
    ["https://picsum.photos/seed/rock/800/400"],
    ana,
  );
  const hamlet = new Evento(
    "Hamlet",
    "Clásico de Shakespeare en versión moderna",
    teatro,
    enDias(45, 20),
    [
      new TipoEntrada("Platea", "Planta baja", 22000, 120),
      new TipoEntrada("Pullman", "Primer piso", 16000, 80),
    ],
    ["https://picsum.photos/seed/hamlet/800/400"],
    martin,
  );
  const conferenciaJs = new Evento(
    "Conferencia JS Argentina",
    "Charlas sobre JavaScript, Node y React Native",
    conferencias,
    enDias(7, 9),
    [
      new TipoEntrada("General", "Acceso a todas las charlas", 10000, 300),
      new TipoEntrada("Workshop", "Charlas + workshop práctico", 25000, 30),
    ],
    ["https://picsum.photos/seed/js/800/400"],
    martin,
  );
  const basquet = new Evento(
    "Final Liga de Básquet",
    "Partido definitorio del campeonato",
    deportes,
    enDias(3, 20),
    [
      new TipoEntrada("Popular", "Tribuna popular", 9000, 1000),
      new TipoEntrada("Platea", "Platea numerada", 18000, 400),
    ],
    ["https://picsum.photos/seed/basquet/800/400"],
    ana,
  );
  const jazz = new Evento(
    "Jazz en el Parque",
    "Tarde de jazz al aire libre",
    musica,
    enDias(-10, 18),
    [new TipoEntrada("General", "Acceso general", 8000, 200)],
    ["https://picsum.photos/seed/jazz/800/400"],
    ana,
  );
  const standUp = new Evento(
    "Stand Up de Primavera",
    "Cinco comediantes, una noche",
    teatro,
    enDias(-5),
    [new TipoEntrada("General", "Acceso general", 12000, 150)],
    ["https://picsum.photos/seed/standup/800/400"],
    martin,
  );
  for (const evento of [rock, hamlet, conferenciaJs, basquet, jazz, standUp]) {
    await eventoRepository.guardar(evento);
  }

  // Juan: confirmada (muestra días restantes), pendiente y una utilizada ya reseñada
  const juanRock = rock.venderEntradas(juan, rock.tiposEntrada[0].id, 2);
  juanRock.confirmar(juan);
  juanRock.mensajes.push(
    new Mensaje(juan, "Hola, ¿a qué hora abren las puertas?"),
    new Mensaje(ana, "¡Hola Juan! Las puertas abren a las 19 hs."),
  );
  const juanHamlet = hamlet.venderEntradas(juan, hamlet.tiposEntrada[0].id, 1);
  const juanJazz = compraHistorica(juan, jazz, jazz.tiposEntrada[0], 2);
  juanJazz.confirmar(juan);
  juanJazz.utilizar(ana);

  // Lucía: reembolsada, confirmada, utilizada reseñada y una utilizada sin reseñar
  const luciaRock = rock.venderEntradas(lucia, rock.tiposEntrada[1].id, 1);
  luciaRock.confirmar(lucia);
  luciaRock.cancelar(lucia);
  const luciaConferencia = conferenciaJs.venderEntradas(
    lucia,
    conferenciaJs.tiposEntrada[1].id,
    1,
  );
  luciaConferencia.confirmar(lucia);
  const luciaJazz = compraHistorica(lucia, jazz, jazz.tiposEntrada[0], 1);
  luciaJazz.confirmar(lucia);
  luciaJazz.utilizar(ana);
  const luciaStandUp = compraHistorica(lucia, standUp, standUp.tiposEntrada[0], 2);
  luciaStandUp.confirmar(lucia);
  luciaStandUp.utilizar(martin);

  for (const compra of [
    juanRock,
    juanHamlet,
    juanJazz,
    luciaRock,
    luciaConferencia,
    luciaJazz,
    luciaStandUp,
  ]) {
    await compraRepository.guardar(compra);
  }

  await reseniaRepository.guardar(
    new Resenia(juan, jazz, "Excelente organización y muy buen sonido", 5),
  );
  await reseniaRepository.guardar(
    new Resenia(lucia, jazz, "Muy lindo, aunque faltaban baños", 4),
  );
}
