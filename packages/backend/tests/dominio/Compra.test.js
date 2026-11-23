import { Compra } from "../../src/domain/Compra.js";
import { EstadoCompra } from "../../src/domain/EstadoCompra.js";
import { Evento } from "../../src/domain/Evento.js";
import { TipoEntrada } from "../../src/domain/TipoEntrada.js";
import { Usuario } from "../../src/domain/Usuario.js";
import { Categoria } from "../../src/domain/Categoria.js";
import { ConflictError } from "../../src/errors/index.js";

function enDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

function armarEscenario({ diasParaElEvento = 10, cupo = 10 } = {}) {
  const organizador = new Usuario("Ana", "García");
  organizador.id = 1;
  const comprador = new Usuario("Juan", "Pérez");
  comprador.id = 2;
  const tipo = new TipoEntrada("General", "", 1000, cupo);
  tipo.id = 1;
  const evento = new Evento(
    "Recital",
    "desc",
    new Categoria("Música", ""),
    enDias(diasParaElEvento),
    [tipo],
    [],
    organizador,
  );
  return { organizador, comprador, tipo, evento };
}

describe("Dominio: Compra", () => {
  test("nace pendiente con el total calculado y el primer cambio de estado", () => {
    const { comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 3);

    expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    expect(compra.total).toBe(3000);
    expect(compra.cambiosEstado).toHaveLength(1);
    expect(compra.cambiosEstado[0].quien).toBe(comprador);
  });

  test("pendiente -> confirmada -> utilizada, registrando quién hizo cada cambio", () => {
    const { organizador, comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);

    compra.confirmar(comprador);
    expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    compra.utilizar(organizador);
    expect(compra.estado).toBe(EstadoCompra.UTILIZADA);
    expect(compra.cambiosEstado.map((c) => c.estado)).toEqual([
      EstadoCompra.PENDIENTE,
      EstadoCompra.CONFIRMADA,
      EstadoCompra.UTILIZADA,
    ]);
    expect(compra.cambiosEstado.at(-1).quien).toBe(organizador);
  });

  test("no se puede utilizar una compra que no está confirmada", () => {
    const { organizador, comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);

    expect(() => compra.utilizar(organizador)).toThrow(ConflictError);
  });

  test("no se puede confirmar dos veces", () => {
    const { comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);
    compra.confirmar(comprador);

    expect(() => compra.confirmar(comprador)).toThrow(ConflictError);
  });

  test("cancelar una compra pendiente la deja cancelada y repone el cupo", () => {
    const { comprador, tipo, evento } = armarEscenario({ cupo: 10 });
    const compra = evento.venderEntradas(comprador, tipo.id, 4);
    expect(tipo.cupo).toBe(6);

    compra.cancelar(comprador);

    expect(compra.estado).toBe(EstadoCompra.CANCELADA);
    expect(tipo.cupo).toBe(10);
  });

  test("cancelar una compra confirmada (paga) la reembolsa", () => {
    const { comprador, tipo, evento } = armarEscenario();
    const compra = evento.venderEntradas(comprador, tipo.id, 2);
    compra.confirmar(comprador);

    compra.cancelar(comprador);

    expect(compra.estado).toBe(EstadoCompra.REEMBOLSADA);
    expect(compra.cambiosEstado.map((c) => c.estado)).toEqual([
      EstadoCompra.PENDIENTE,
      EstadoCompra.CONFIRMADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ]);
  });

  test("no se puede cancelar una compra utilizada", () => {
    const { organizador, comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);
    compra.confirmar(comprador);
    compra.utilizar(organizador);

    expect(compra.puedeCancelarse()).toBe(false);
    expect(() => compra.cancelar(comprador)).toThrow("ya utilizada");
  });

  test("no se puede cancelar si el evento ya se realizó", () => {
    const { comprador, tipo, evento } = armarEscenario({ diasParaElEvento: -1 });
    const compra = new Compra(comprador, evento, tipo, 1);
    compra.confirmar(comprador);

    expect(compra.puedeCancelarse()).toBe(false);
    expect(() => compra.cancelar(comprador)).toThrow("ya se realizó");
  });

  test("diasParaEvento solo aplica a compras confirmadas", () => {
    const { comprador, tipo, evento } = armarEscenario({ diasParaElEvento: 7 });
    const compra = new Compra(comprador, evento, tipo, 1);

    expect(compra.diasParaEvento()).toBeNull();
    compra.confirmar(comprador);
    expect(compra.diasParaEvento()).toBe(7);
  });

  test("solo las compras utilizadas pueden reseñarse", () => {
    const { organizador, comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);

    expect(compra.puedeSerReseniada()).toBe(false);
    compra.confirmar(comprador);
    compra.utilizar(organizador);
    expect(compra.puedeSerReseniada()).toBe(true);
  });

  describe("vencimiento de la reserva", () => {
    const enMinutos = (minutos) => new Date(Date.now() + minutos * 60 * 1000);

    test("nace con venceEn = creada + minutos de reserva", () => {
      const { comprador, tipo, evento } = armarEscenario();
      const compra = new Compra(comprador, evento, tipo, 1, 15);

      expect(compra.venceEn - compra.creada).toBe(15 * 60 * 1000);
      expect(compra.estaVencida()).toBe(false);
      expect(compra.estaVencida(enMinutos(16))).toBe(true);
    });

    test("vencerSiExpiro la pasa a VENCIDA, repone el cupo y la registra el sistema", () => {
      const { comprador, tipo, evento } = armarEscenario({ cupo: 10 });
      const compra = evento.venderEntradas(comprador, tipo.id, 4, 10);
      expect(tipo.cupo).toBe(6);

      expect(compra.vencerSiExpiro()).toBe(false);
      expect(compra.vencerSiExpiro(enMinutos(11))).toBe(true);

      expect(compra.estado).toBe(EstadoCompra.VENCIDA);
      expect(tipo.cupo).toBe(10);
      expect(compra.cambiosEstado.at(-1).quien).toBeNull();
      // vencer dos veces no repone el cupo de nuevo
      expect(compra.vencerSiExpiro(enMinutos(20))).toBe(false);
      expect(tipo.cupo).toBe(10);
    });

    test("una compra ya pagada no vence", () => {
      const { comprador, tipo, evento } = armarEscenario();
      const compra = evento.venderEntradas(comprador, tipo.id, 1, 10);
      compra.confirmar(comprador);

      expect(compra.vencerSiExpiro(enMinutos(60))).toBe(false);
      expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    });

    test("pagar después de venceEn falla aunque el job todavía no la haya marcado", () => {
      const { comprador, tipo, evento } = armarEscenario();
      const compra = evento.venderEntradas(comprador, tipo.id, 1, 10);

      // sigue PENDIENTE porque nadie la venció, pero la fecha ya pasó
      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
      expect(() => compra.confirmar(comprador, enMinutos(11))).toThrow("venció");
      expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    });

    test("una reserva vencida no se puede pagar ni cancelar", () => {
      const { comprador, tipo, evento } = armarEscenario();
      const compra = evento.venderEntradas(comprador, tipo.id, 1, 0);
      compra.vencerSiExpiro();

      expect(() => compra.confirmar(comprador)).toThrow("venció");
      expect(compra.puedeCancelarse()).toBe(false);
      expect(() => compra.cancelar(comprador)).toThrow("venció");
    });
  });

  test("participan de la compra el comprador y el organizador del evento", () => {
    const { organizador, comprador, tipo, evento } = armarEscenario();
    const compra = new Compra(comprador, evento, tipo, 1);
    const otro = new Usuario("Lucía", "Fernández");
    otro.id = 99;

    expect(compra.esParticipante(comprador)).toBe(true);
    expect(compra.esParticipante(organizador)).toBe(true);
    expect(compra.esParticipante(otro)).toBe(false);
  });
});
