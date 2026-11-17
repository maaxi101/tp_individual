import request from "supertest";
import { crearApp } from "../../src/app.js";

// Usuarios del seed: 1 Ana y 2 Martín (organizadores), 3 Juan y 4 Lucía (compradores).
// Eventos: 1 Rock (Ana), 2 Hamlet (Martín), 3 Conferencia JS (Martín),
// 4 Básquet (Ana), 5 Jazz (Ana, pasado), 6 Stand Up (Martín, pasado).
let app;

beforeAll(async () => {
  app = await crearApp({ logs: false });
});

describe("GET /eventos", () => {
  test("busca por texto ignorando acentos y mayúsculas", async () => {
    const res = await request(app).get("/eventos").query({ q: "basquet" });

    expect(res.status).toBe(200);
    expect(res.body.map((e) => e.nombre)).toEqual(["Final Liga de Básquet"]);
  });

  test("el texto también matchea con el nombre de la categoría", async () => {
    const res = await request(app).get("/eventos").query({ q: "música" });

    expect(res.body.map((e) => e.nombre).sort()).toEqual([
      "Jazz en el Parque",
      "Noche de Rock Nacional",
    ]);
  });

  test("filtra por categoría", async () => {
    const res = await request(app).get("/eventos").query({ categoria: 2 });

    expect(res.body.map((e) => e.categoria.nombre)).toEqual([
      "Teatro",
      "Teatro",
    ]);
  });

  test("ordena por precio ascendente y descendente", async () => {
    const asc = await request(app)
      .get("/eventos")
      .query({ orden: "precio", dir: "asc" });
    const desc = await request(app)
      .get("/eventos")
      .query({ orden: "precio", dir: "desc" });

    expect(asc.body[0].nombre).toBe("Jazz en el Parque");
    expect(desc.body[0].nombre).toBe("Hamlet");
  });

  test("ordena por fecha", async () => {
    const res = await request(app).get("/eventos").query({ orden: "fecha" });
    const fechas = res.body.map((e) => new Date(e.fecha).getTime());

    expect(fechas).toEqual([...fechas].sort((a, b) => a - b));
  });

  test("ordena por puntaje del organizador dejando los sin reseñas al final", async () => {
    const res = await request(app)
      .get("/eventos")
      .query({ orden: "puntaje", dir: "desc" });

    expect(res.body[0].puntajeOrganizador).toBe(4.5);
    expect(res.body.at(-1).puntajeOrganizador).toBeNull();
  });

  test("rechaza un criterio de orden inválido", async () => {
    const res = await request(app).get("/eventos").query({ orden: "nombre" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/orden/);
  });
});

describe("GET /eventos/:id", () => {
  test("devuelve el detalle con tipos de entrada y reseñas del organizador", async () => {
    const res = await request(app).get("/eventos/1");

    expect(res.status).toBe(200);
    expect(res.body.tiposEntrada.map((t) => t.nombre)).toEqual([
      "General",
      "VIP",
    ]);
    expect(res.body.puntajeOrganizador).toBe(4.5);
    expect(res.body.resenias).toHaveLength(2);
  });

  test("404 si no existe y 400 si el id no es numérico", async () => {
    expect((await request(app).get("/eventos/999")).status).toBe(404);
    expect((await request(app).get("/eventos/abc")).status).toBe(400);
  });
});

describe("POST /eventos", () => {
  const eventoValido = {
    nombre: "Festival de Jazz",
    descripcion: "Tres noches de jazz",
    categoriaId: 1,
    fecha: "2030-03-15T21:00:00.000Z",
    tiposEntrada: [
      { nombre: "General", precio: 15000, cupo: 200 },
      { nombre: "VIP", descripcion: "Con barra", precio: 40000, cupo: 20 },
    ],
  };

  test("crea el evento con el usuario autenticado como organizador", async () => {
    const res = await request(app)
      .post("/eventos")
      .set("x-user-id", "2")
      .send(eventoValido);

    expect(res.status).toBe(201);
    expect(res.body.organizador.id).toBe(2);
    expect(res.body.tiposEntrada).toHaveLength(2);
    expect(res.body.tiposEntrada[0].cupoDisponible).toBe(200);
    expect(res.body.precioDesde).toBe(15000);

    const mios = await request(app).get("/organizadores/2/eventos");
    expect(mios.body.map((e) => e.nombre)).toContain("Festival de Jazz");
  });

  test("400 con detalle si faltan datos o la fecha no es futura", async () => {
    const res = await request(app)
      .post("/eventos")
      .set("x-user-id", "2")
      .send({ ...eventoValido, fecha: "2020-01-01", tiposEntrada: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fecha/);
    expect(res.body.error).toMatch(/tiposEntrada/);
  });

  test("401 sin header x-user-id", async () => {
    const res = await request(app).post("/eventos").send(eventoValido);

    expect(res.status).toBe(401);
  });
});

describe("favoritos", () => {
  test("agregar y quitar un favorito", async () => {
    const agregado = await request(app)
      .post("/usuarios/3/favoritos")
      .set("x-user-id", "3")
      .send({ eventoId: 1 });
    expect(agregado.status).toBe(201);
    expect(agregado.body.map((e) => e.id)).toEqual([1]);

    const quitado = await request(app)
      .delete("/usuarios/3/favoritos/1")
      .set("x-user-id", "3");
    expect(quitado.status).toBe(200);
    expect(quitado.body).toEqual([]);
  });

  test("no se pueden tocar los favoritos de otro usuario", async () => {
    const res = await request(app)
      .post("/usuarios/3/favoritos")
      .set("x-user-id", "4")
      .send({ eventoId: 1 });

    expect(res.status).toBe(403);
  });
});
