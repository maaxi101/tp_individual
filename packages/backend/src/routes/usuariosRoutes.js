import { Router } from "express";
import { FavoritoSchema } from "../schemas/usuarioSchemas.js";

export function crearRutasUsuarios(
  { usuarioController, compraController },
  { autenticar, validar },
) {
  const router = Router();

  /**
   * @swagger
   * /usuarios:
   *   get:
   *     summary: Lista los usuarios (sirve para elegir con cuál usar la app)
   *     tags: [Usuarios]
   *     responses:
   *       200:
   *         description: Lista de usuarios
   */
  router.get("/", usuarioController.listar);

  /**
   * @swagger
   * /usuarios/{id}/compras:
   *   get:
   *     summary: Compras del usuario, con estado y días que faltan para el evento
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Lista de compras del comprador
   *       403:
   *         description: Solo se pueden ver las compras propias
   */
  router.get("/:id/compras", autenticar, compraController.listarPorComprador);

  /**
   * @swagger
   * /usuarios/{id}/favoritos:
   *   get:
   *     summary: Eventos favoritos del usuario
   *     tags: [Favoritos]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Lista de eventos favoritos
   *   post:
   *     summary: Agrega un evento a favoritos
   *     tags: [Favoritos]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               eventoId: { type: integer, example: 1 }
   *     responses:
   *       201:
   *         description: Lista de favoritos actualizada
   */
  router.get("/:id/favoritos", autenticar, usuarioController.listarFavoritos);
  router.post(
    "/:id/favoritos",
    autenticar,
    validar(FavoritoSchema),
    usuarioController.agregarFavorito,
  );

  /**
   * @swagger
   * /usuarios/{id}/favoritos/{eventoId}:
   *   delete:
   *     summary: Quita un evento de favoritos
   *     tags: [Favoritos]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *       - { in: path, name: eventoId, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Lista de favoritos actualizada
   */
  router.delete(
    "/:id/favoritos/:eventoId",
    autenticar,
    usuarioController.quitarFavorito,
  );

  return router;
}
