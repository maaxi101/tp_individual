import { Router } from "express";

export function crearRutasHealth() {
  const router = Router();

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Estado del servidor
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: El backend está corriendo
   */
  router.get("/", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  return router;
}
