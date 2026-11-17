import { Categoria } from "../../src/domain/Categoria.js";
import { EstadoCompra } from "../../src/domain/EstadoCompra.js";
import { Evento } from "../../src/domain/Evento.js";
import { TipoEntrada } from "../../src/domain/TipoEntrada.js";
import { Usuario } from "../../src/domain/Usuario.js";
import { ConflictError, NotFoundError } from "../../src/errors/index.js";

function enDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

function armarEvento({ diasParaElEvento = 10 } = {}) {
  const organizador = new Usuario("Ana", "García");
  organizador.id = 1;
  const general = new TipoEntrada("General", "", 1000, 5);
  general.id = 1;
  const vip = new TipoEntrada("VIP", "", 5000, 2);
  vip.id = 2;
  const evento = new Evento(
    "Recital",
    "desc",
    new Categoria("Música", ""),
    enDias(diasParaElEvento),
    [general, vip],
    [],
    organizador,
  );
  return { organizador, general, vip, evento };
}

describe("Dominio: Evento y TipoEntrada", () => {
  test("vender entradas descuenta el cupo y crea una compra pendiente", () => {
    const { general, evento } = armarEvento();
    const comprador = new Usuario("Juan", "Pérez");

    const compra = evento.venderEntradas(comprador, general.id, 3);

    expect(general.cupo).toBe(2);
    expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    expect(compra.tipoEntrada).toBe(general);
    expect(compra.total).toBe(3000);
  });

  test("no se puede vender más entradas que el cupo disponible", () => {
    const { vip, evento } = armarEvento();
    const comprador = new Usuario("Juan", "Pérez");

    expect(() => evento.venderEntradas(comprador, vip.id, 3)).toThrow(
      ConflictError,
    );
    expect(vip.cupo).toBe(2);
  });

  test("no se puede vender para un evento que ya se realizó", () => {
    const { general, evento } = armarEvento({ diasParaElEvento: -1 });
    const comprador = new Usuario("Juan", "Pérez");

    expect(evento.yaSeRealizo()).toBe(true);
    expect(() => evento.venderEntradas(comprador, general.id, 1)).toThrow(
      "ya se realizó",
    );
  });

  test("falla si el tipo de entrada no pertenece al evento", () => {
    const { evento } = armarEvento();
    const comprador = new Usuario("Juan", "Pérez");

    expect(() => evento.venderEntradas(comprador, 99, 1)).toThrow(
      NotFoundError,
    );
  });

  test("tuPrecioEstaEntre mira todos los tipos de entrada", () => {
    const { evento } = armarEvento();

    expect(evento.tuPrecioEstaEntre(0, 1500)).toBe(true);
    expect(evento.tuPrecioEstaEntre(4000, 6000)).toBe(true);
    expect(evento.tuPrecioEstaEntre(1500, 4000)).toBe(false);
    expect(evento.precioMinimo()).toBe(1000);
  });

  test("hayCupoPara rechaza cantidades no positivas y mayores al cupo", () => {
    const tipo = new TipoEntrada("General", "", 100, 3);

    expect(tipo.hayCupoPara(0)).toBe(false);
    expect(tipo.hayCupoPara(3)).toBe(true);
    expect(tipo.hayCupoPara(4)).toBe(false);
  });
});
