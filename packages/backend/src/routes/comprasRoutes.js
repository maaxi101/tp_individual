import { Router } from "express";
import {
  CrearCompraSchema,
  MensajeSchema,
  ReseniaSchema,
} from "../schemas/compraSchemas.js";

export function crearRutasCompras(
  { compraController, reseniaController },
  { autenticar, validar },
) {
  const router = Router();

  // Todas las rutas de compras requieren usuario
  router.use(autenticar);

  /**
   * @swagger
   * /compras:
   *   post:
   *     summary: "Compra entradas de un evento. Queda PENDIENTE y reserva el cupo durante RESERVA_MINUTOS (ver venceEn)."
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [eventoId, tipoEntradaId, cantidad]
   *             properties:
   *               eventoId: { type: integer, example: 1 }
   *               tipoEntradaId: { type: integer, example: 1 }
   *               cantidad: { type: integer, example: 2 }
   *     responses:
   *       201:
   *         description: Compra creada
   *       409:
   *         description: Sin cupo o el evento ya se realizó
   */
  router.post("/", validar(CrearCompraSchema), compraController.comprar);

  /**
   * @swagger
   * /compras/{id}:
   *   get:
   *     summary: Detalle de una compra con su historial de estados
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Detalle de la compra
   *       403:
   *         description: El usuario no participa de la compra
   */
  router.get("/:id", compraController.obtener);

  /**
   * @swagger
   * /compras/{id}/confirmar:
   *   post:
   *     summary: "Paga la compra (PENDIENTE a CONFIRMADA) antes de que venza la reserva. Solo el comprador."
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Compra confirmada
   *       409:
   *         description: La compra no está pendiente o la reserva venció
   */
  router.post("/:id/confirmar", compraController.confirmar);

  /**
   * @swagger
   * /compras/{id}/utilizar:
   *   post:
   *     summary: "Registra el ingreso al evento (CONFIRMADA a UTILIZADA). Solo el organizador."
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Compra utilizada
   *       409:
   *         description: La compra no está confirmada
   */
  router.post("/:id/utilizar", compraController.utilizar);

  /**
   * @swagger
   * /compras/{id}/cancelar:
   *   post:
   *     summary: "Cancela la compra y repone el cupo. Si estaba paga, queda REEMBOLSADA."
   *     tags: [Compras]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Compra cancelada o reembolsada
   *       409:
   *         description: Ya fue utilizada o el evento ya se realizó
   */
  router.post("/:id/cancelar", compraController.cancelar);

  /**
   * @swagger
   * /compras/{id}/mensajes:
   *   get:
   *     summary: Chat de la compra entre comprador y organizador
   *     tags: [Mensajes]
   *     security: [{ usuario: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200:
   *         description: Lista de mensajes
   *   post:
   *     summary: Envía un mensaje en el chat de la compra
   *     tags: [Mensajes]
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
   *               mensaje: { type: string, example: "A qué hora abren las puertas?" }
   *     responses:
   *       201:
   *         description: Mensaje enviado
   */
  router.get("/:id/mensajes", compraController.listarMensajes);
  router.post(
    "/:id/mensajes",
    validar(MensajeSchema),
    compraController.enviarMensaje,
  );

  /**
   * @swagger
   * /compras/{id}/resenia:
   *   post:
   *     summary: Reseña el evento de una compra ya UTILIZADA (una vez por evento)
   *     tags: [Reseñas]
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
   *               puntuacion: { type: integer, minimum: 1, maximum: 5, example: 5 }
   *               detalle: { type: string, example: Excelente organización }
   *     responses:
   *       201:
   *         description: Reseña creada
   *       409:
   *         description: La compra no fue utilizada o ya fue reseñada
   */
  router.post("/:id/resenia", validar(ReseniaSchema), reseniaController.reseniar);

  return router;
}
