import { Router } from "express";

export function crearRutasCategorias(categoriaController) {
  const router = Router();

  /**
   * @swagger
   * /categorias:
   *   get:
   *     summary: Lista las categorías de eventos
   *     tags: [Categorías]
   *     responses:
   *       200:
   *         description: Lista de categorías
   */
  router.get("/", categoriaController.listar);

  return router;
}
