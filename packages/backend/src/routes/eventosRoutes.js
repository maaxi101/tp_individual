import { Router } from "express";
import {
  BuscarEventosQuerySchema,
  CrearEventoSchema,
} from "../schemas/eventoSchemas.js";

export function crearRutasEventos(
  { eventoController, compraController },
  { autenticar, validar },
) {
  const router = Router();

  /**
   * @swagger
   * /eventos:
   *   get:
   *     summary: Busca eventos por texto, categoría y rango de precio, con orden opcional
   *     tags: [Eventos]
   *     parameters:
   *       - { in: query, name: q, schema: { type: string }, description: Texto a buscar en nombre, descripción o categoría }
   *       - { in: query, name: categoria, schema: { type: integer } }
   *       - { in: query, name: precioMin, schema: { type: number } }
   *       - { in: query, name: precioMax, schema: { type: number } }
   *       - { in: query, name: orden, schema: { type: string, enum: [precio, fecha, puntaje] } }
   *       - { in: query, name: dir, schema: { type: string, enum: [asc, desc] } }
   *     responses:
   *       200:
   *         description: Lista de eventos con el puntaje de su organizador
   *   post:
   *     summary: Crea un evento con sus tipos de entrada (el usuario autenticado es el organizador)
   *     tags: [Eventos]
   *     security: [{ usuario: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nombre, descripcion, categoriaId, fecha, tiposEntrada]
   *             properties:
   *               nombre: { type: string, example: Festival de Jazz }
   *               descripcion: { type: string, example: Tres noches de jazz }
   *               categoriaId: { type: integer, example: 1 }
   *               fecha: { type: string, format: date-time, example: "2027-03-15T21:00:00.000Z" }
   *               multimedia: { type: array, items: { type: string, format: uri } }
   *               tiposEntrada:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required: [nombre, precio, cupo]
   *                   properties:
   *                     nombre: { type: string, example: General }
   *                     descripcion: { type: string }
   *                     precio: { type: number, example: 15000 }
   *                     cupo: { type: integer, example: 200 }
   *     responses:
   *       201:
   *         description: Evento creado
   *       400:
   *         description: Datos inválidos
   */
  router.get(
    "/",
    validar(BuscarEventosQuerySchema, "query"),
    eventoController.buscar,
  );
  router.post("/", autenticar, validar(CrearEventoSchema), eventoController.crear);

  /**
   * @swagger
   * /eventos/{id}:
   *   get:
   *     summary: Detalle de un evento con sus tipos de entrada y las reseñas del organizador
   *     tags: [Eventos]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Detalle del evento
   *       404:
   *         description: No existe el evento
   */
  router.get("/:id", eventoController.obtener);

  /**
   * @swagger
   * /eventos/{id}/compras:
   *   get:
   *     summary: Compras de un evento y disponibilidad por tipo de entrada (solo el organizador)
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Compras y disponibilidad del evento
   *       403:
   *         description: El usuario no es el organizador
   */
  router.get("/:id/compras", autenticar, compraController.listarPorEvento);

  return router;
}
