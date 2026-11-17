import { Router } from "express";
import { crearRutasCategorias } from "./categoriasRoutes.js";
import { crearRutasCompras } from "./comprasRoutes.js";
import { crearRutasEventos } from "./eventosRoutes.js";
import { crearRutasHealth } from "./healthRoutes.js";
import { crearRutasOrganizadores } from "./organizadoresRoutes.js";
import { crearRutasUsuarios } from "./usuariosRoutes.js";

// Monta las rutas de cada flujo bajo su prefijo. Los middlewares
// (autenticar, validar) se inyectan para no depender de instancias globales.
export function crearRutas(controllers, middlewares) {
  const router = Router();

  router.use("/health", crearRutasHealth());
  router.use("/categorias", crearRutasCategorias(controllers.categoriaController));
  router.use("/usuarios", crearRutasUsuarios(controllers, middlewares));
  router.use("/eventos", crearRutasEventos(controllers, middlewares));
  router.use("/organizadores", crearRutasOrganizadores(controllers));
  router.use("/compras", crearRutasCompras(controllers, middlewares));

  return router;
}
