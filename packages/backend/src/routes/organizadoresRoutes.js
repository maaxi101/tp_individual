import { Router } from "express";

export function crearRutasOrganizadores({ eventoController, reseniaController }) {
  const router = Router();

  /**
   * @swagger
   * /organizadores/{id}/eventos:
   *   get:
   *     summary: Eventos organizados por un usuario
   *     tags: [Eventos]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Lista de eventos del organizador
   */
  router.get("/:id/eventos", eventoController.listarPorOrganizador);

  /**
   * @swagger
   * /organizadores/{id}/resenias:
   *   get:
   *     summary: Reseñas recibidas por un organizador y su promedio
   *     tags: [Reseñas]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Promedio, cantidad y lista de reseñas
   */
  router.get("/:id/resenias", reseniaController.listarPorOrganizador);

  return router;
}
