import request from "supertest";
import { crearApp } from "../../src/app.js";
import { Evento } from "../../src/domain/Evento.js";
import { TipoEntrada } from "../../src/domain/TipoEntrada.js";
import { Usuario } from "../../src/domain/Usuario.js";
import { CompraRepository } from "../../src/repositories/CompraRepository.js";
import { EventoRepository } from "../../src/repositories/EventoRepository.js";
import { CompraService } from "../../src/services/CompraService.js";

// Seed: usuarios 1 Ana, 2 Martín (organizadores), 3 Juan, 4 Lucía.
// Compras: 1 Juan/Rock CONFIRMADA, 2 Juan/Hamlet PENDIENTE, 3 Juan/Jazz UTILIZADA,
// 5 Lucía/Conferencia CONFIRMADA, 7 Lucía/StandUp UTILIZADA (sin reseñar), 8 Lucía/Hamlet VENCIDA.
// Tipos de entrada: 1 Rock General (500), 2 Rock VIP (50), 7 Básquet Popular (1000), 9 Jazz General.
let app;

beforeAll(async () => {
  app = await crearApp({ logs: false });
});

const como = (usuarioId) => (req) => req.set("x-user-id", String(usuarioId));

describe("flujo de compra", () => {
  let compraId;

  test("comprar deja la compra PENDIENTE y descuenta el cupo", async () => {
    const res = await como(3)(request(app).post("/compras")).send({
      eventoId: 4,
      tipoEntradaId: 7,
      cantidad: 3,
    });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("PENDIENTE");
    expect(res.body.total).toBe(27000);
    expect(res.body.diasParaEvento).toBeNull();
    compraId = res.body.id;

    const evento = await request(app).get("/eventos/4");
    expect(evento.body.tiposEntrada[0].cupoDisponible).toBe(997);
  });

  test("confirmar (pagar) la deja CONFIRMADA y muestra los días que faltan", async () => {
    const res = await como(3)(request(app).post(`/compras/${compraId}/confirmar`));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("CONFIRMADA");
    expect(res.body.diasParaEvento).toBe(3);
    expect(res.body.puedeCancelarse).toBe(true);
  });

  test("solo el comprador puede pagar", async () => {
    const res = await como(1)(request(app).post(`/compras/${compraId}/confirmar`));

    expect(res.status).toBe(403);
  });

  test("cancelar una compra paga la REEMBOLSA y repone el cupo", async () => {
    const res = await como(3)(request(app).post(`/compras/${compraId}/cancelar`));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("REEMBOLSADA");
    expect(res.body.historial.map((h) => h.estado)).toEqual([
      "PENDIENTE",
      "CONFIRMADA",
      "CANCELADA",
      "REEMBOLSADA",
    ]);

    const evento = await request(app).get("/eventos/4");
    expect(evento.body.tiposEntrada[0].cupoDisponible).toBe(1000);
  });

  test("409 si no hay cupo suficiente", async () => {
    const res = await como(3)(request(app).post("/compras")).send({
      eventoId: 1,
      tipoEntradaId: 2,
      cantidad: 51,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/cupo/);
  });

  test("409 si el evento ya se realizó", async () => {
    const res = await como(3)(request(app).post("/compras")).send({
      eventoId: 5,
      tipoEntradaId: 9,
      cantidad: 1,
    });

    expect(res.status).toBe(409);
  });

  test("400 si el body no tiene la forma esperada", async () => {
    const res = await como(3)(request(app).post("/compras")).send({
      eventoId: 1,
      cantidad: "dos",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tipoEntradaId/);
    expect(res.body.error).toMatch(/cantidad/);
  });
});

describe("utilizar y cancelar", () => {
  test("el comprador no puede marcar su entrada como utilizada", async () => {
    const res = await como(3)(request(app).post("/compras/1/utilizar"));

    expect(res.status).toBe(403);
  });

  test("el organizador marca la entrada como UTILIZADA", async () => {
    const res = await como(1)(request(app).post("/compras/1/utilizar"));

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("UTILIZADA");
    expect(res.body.puedeSerReseniada).toBe(true);
  });

  test("una compra utilizada no se puede cancelar", async () => {
    const res = await como(3)(request(app).post("/compras/3/cancelar"));

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/utilizada/);
  });
});

describe("reseñas", () => {
  test("solo se reseñan compras utilizadas", async () => {
    const res = await como(4)(request(app).post("/compras/5/resenia")).send({
      puntuacion: 5,
      detalle: "Genial",
    });

    expect(res.status).toBe(409);
  });

  test("la reseña queda visible en los eventos del organizador y solo se hace una vez", async () => {
    const creada = await como(4)(request(app).post("/compras/7/resenia")).send({
      puntuacion: 3,
      detalle: "Estuvo bien",
    });
    expect(creada.status).toBe(201);

    const resenias = await request(app).get("/organizadores/2/resenias");
    expect(resenias.body.cantidad).toBe(1);
    expect(resenias.body.promedio).toBe(3);

    const repetida = await como(4)(request(app).post("/compras/7/resenia")).send({
      puntuacion: 4,
      detalle: "Otra vez",
    });
    expect(repetida.status).toBe(409);
  });

  test("400 si la puntuación está fuera de 1..5", async () => {
    const res = await como(4)(request(app).post("/compras/7/resenia")).send({
      puntuacion: 6,
      detalle: "x",
    });

    expect(res.status).toBe(400);
  });
});

describe("chat de la compra", () => {
  test("comprador y organizador intercambian mensajes", async () => {
    const deJuan = await como(3)(request(app).post("/compras/2/mensajes")).send({
      mensaje: "¿Hay estacionamiento?",
    });
    expect(deJuan.status).toBe(201);
    expect(deJuan.body.usuario.id).toBe(3);

    const deMartin = await como(2)(request(app).post("/compras/2/mensajes")).send({
      mensaje: "Sí, en la cochera de al lado",
    });
    expect(deMartin.status).toBe(201);

    const chat = await como(3)(request(app).get("/compras/2/mensajes"));
    expect(chat.body.map((m) => m.usuario.nombre)).toEqual(["Juan", "Martín"]);
  });

  test("un tercero no puede ver ni escribir en el chat", async () => {
    const lectura = await como(1)(request(app).get("/compras/2/mensajes"));
    const escritura = await como(1)(request(app).post("/compras/2/mensajes")).send({
      mensaje: "Hola",
    });

    expect(lectura.status).toBe(403);
    expect(escritura.status).toBe(403);
  });

  test("400 si el mensaje está vacío", async () => {
    const res = await como(3)(request(app).post("/compras/2/mensajes")).send({
      mensaje: "   ",
    });

    expect(res.status).toBe(400);
  });
});

describe("listados", () => {
  test("el comprador ve sus compras con estado y días para el evento", async () => {
    const res = await como(4)(request(app).get("/usuarios/4/compras"));

    expect(res.status).toBe(200);
    const confirmada = res.body.find((c) => c.estado === "CONFIRMADA");
    expect(confirmada.diasParaEvento).toBe(7);
    expect(res.body.map((c) => c.estado)).toEqual(
      expect.arrayContaining(["REEMBOLSADA", "CONFIRMADA", "UTILIZADA"]),
    );
  });

  test("no se pueden ver las compras de otro usuario", async () => {
    const res = await como(3)(request(app).get("/usuarios/4/compras"));

    expect(res.status).toBe(403);
  });

  test("el organizador ve las compras del evento y la disponibilidad por tipo", async () => {
    const res = await como(1)(request(app).get("/eventos/1/compras"));

    expect(res.status).toBe(200);
    expect(res.body.compras.length).toBeGreaterThanOrEqual(2);
    const general = res.body.disponibilidad.find((t) => t.nombre === "General");
    expect(general.vendidas).toBe(2);
    expect(general.cupoDisponible).toBe(498);
    const vip = res.body.disponibilidad.find((t) => t.nombre === "VIP");
    expect(vip.vendidas).toBe(0);
  });

  test("otro usuario no puede ver las compras del evento", async () => {
    const res = await como(3)(request(app).get("/eventos/1/compras"));

    expect(res.status).toBe(403);
  });
});

describe("vencimiento de reservas", () => {
  test("el detalle de una compra pendiente informa hasta cuándo se puede pagar", async () => {
    const res = await como(3)(request(app).get("/compras/2"));

    expect(res.body.estado).toBe("PENDIENTE");
    expect(new Date(res.body.venceEn).getTime()).toBeGreaterThan(Date.now());
  });

  test("la compra vencida del seed figura VENCIDA, sin venceEn y registrada por el sistema", async () => {
    const res = await como(4)(request(app).get("/compras/8"));

    expect(res.body.estado).toBe("VENCIDA");
    expect(res.body.venceEn).toBeNull();
    expect(res.body.historial.at(-1)).toMatchObject({ estado: "VENCIDA", quien: null });
  });

  test("las compras del organizador vienen de la más nueva a la más vieja", async () => {
    const res = await como(1)(request(app).get("/eventos/1/compras"));
    const ids = res.body.compras.map((c) => c.id);

    expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });

  describe("con reservas de 0 minutos (vencen enseguida)", () => {
    let appVence;

    beforeAll(async () => {
      appVence = await crearApp({ logs: false, minutosReserva: 0 });
    });

    const comprarGeneralRock = () =>
      como(3)(request(appVence).post("/compras")).send({
        eventoId: 1,
        tipoEntradaId: 1,
        cantidad: 5,
      });

    test("pagar una reserva vencida da 409, la deja VENCIDA y repone el cupo", async () => {
      const compra = await comprarGeneralRock();
      expect(compra.status).toBe(201);

      const pago = await como(3)(request(appVence).post(`/compras/${compra.body.id}/confirmar`));
      expect(pago.status).toBe(409);
      expect(pago.body.error).toMatch(/venció/);

      const detalle = await como(3)(request(appVence).get(`/compras/${compra.body.id}`));
      expect(detalle.body.estado).toBe("VENCIDA");
      const evento = await request(appVence).get("/eventos/1");
      expect(evento.body.tiposEntrada[0].cupoDisponible).toBe(498);
    });

    test("el job vence todas las reservas expiradas", async () => {

      const compraRepository = new CompraRepository();
      const eventoRepository = new EventoRepository();
      const service = new CompraService(compraRepository, eventoRepository, { minutosReserva: 10 });
      const tipo = new TipoEntrada("General", "", 100, 10);
      tipo.id = 1;
      const evento = new Evento("E", "", null, new Date(Date.now() + 864e5), [tipo], [], new Usuario("A", "B"));
      await eventoRepository.guardar(evento);
      const comprador = new Usuario("J", "P");
      for (let i = 0; i < 3; i++) {
        await service.comprar(comprador, { eventoId: evento.id, tipoEntradaId: 1, cantidad: 2 });
      }
      expect(tipo.cupo).toBe(4);

      expect(await service.vencerReservasExpiradas()).toBe(0);
      const enOnceMinutos = new Date(Date.now() + 11 * 60 * 1000);
      expect(await service.vencerReservasExpiradas(enOnceMinutos)).toBe(3);
      expect(tipo.cupo).toBe(10);
    });
  });
});
