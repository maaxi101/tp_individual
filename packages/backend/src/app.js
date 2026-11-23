import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { CategoriaController } from "./controllers/CategoriaController.js";
import { CompraController } from "./controllers/CompraController.js";
import { EventoController } from "./controllers/EventoController.js";
import { ReseniaController } from "./controllers/ReseniaController.js";
import { UsuarioController } from "./controllers/UsuarioController.js";
import { cargarDatosIniciales } from "./data/datosIniciales.js";
import { crearEspecificacionSwagger } from "./docs/swagger.js";
import { Compra } from "./domain/Compra.js";
import { iniciarVencimientoDeReservas } from "./jobs/vencimientoReservas.js";
import { autenticar } from "./middlewares/autenticar.js";
import { manejadorDeErrores, rutaNoEncontrada } from "./middlewares/errores.js";
import { registrarSolicitud } from "./middlewares/registrarSolicitud.js";
import { validarSchema } from "./middlewares/validarSchema.js";
import { CategoriaRepository } from "./repositories/CategoriaRepository.js";
import { CompraRepository } from "./repositories/CompraRepository.js";
import { EventoRepository } from "./repositories/EventoRepository.js";
import { ReseniaRepository } from "./repositories/ReseniaRepository.js";
import { UsuarioRepository } from "./repositories/UsuarioRepository.js";
import { crearRutas } from "./routes/index.js";
import { CategoriaService } from "./services/CategoriaService.js";
import { CompraService } from "./services/CompraService.js";
import { EventoService } from "./services/EventoService.js";
import { ReseniaService } from "./services/ReseniaService.js";
import { UsuarioService } from "./services/UsuarioService.js";

// Arma la aplicación inyectando las dependencias de cada capa:
// repositorios -> services -> controllers -> rutas (+ middlewares)
//
// minutosReserva: cuánto dura una compra PENDIENTE antes de vencer.
// jobs: inicia el job de vencimiento (lo activa index.js; los tests no).
export async function crearApp({
  cargarDatos = true,
  logs = true,
  minutosReserva = minutosReservaDelEntorno(),
  jobs = false,
} = {}) {
  const repositorios = {
    usuarioRepository: new UsuarioRepository(),
    categoriaRepository: new CategoriaRepository(),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    reseniaRepository: new ReseniaRepository(),
  };
  if (cargarDatos) {
    await cargarDatosIniciales(repositorios);
  }

  const {
    usuarioRepository,
    categoriaRepository,
    eventoRepository,
    compraRepository,
    reseniaRepository,
  } = repositorios;
  const usuarioService = new UsuarioService(usuarioRepository, eventoRepository);
  const categoriaService = new CategoriaService(categoriaRepository);
  const reseniaService = new ReseniaService(
    reseniaRepository,
    compraRepository,
    usuarioRepository,
  );
  const eventoService = new EventoService(
    eventoRepository,
    categoriaRepository,
    usuarioRepository,
    reseniaService,
  );
  const compraService = new CompraService(compraRepository, eventoRepository, {
    minutosReserva,
  });
  if (jobs) {
    iniciarVencimientoDeReservas(compraService);
  }

  const controllers = {
    usuarioController: new UsuarioController(usuarioService),
    categoriaController: new CategoriaController(categoriaService),
    eventoController: new EventoController(eventoService),
    compraController: new CompraController(compraService),
    reseniaController: new ReseniaController(reseniaService),
  };
  const middlewares = {
    autenticar: autenticar(usuarioService),
    validar: validarSchema,
  };

  const app = express();
  if (logs) {
    app.use(registrarSolicitud);
  }
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : true,
    }),
  );
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(crearEspecificacionSwagger()));
  app.use(crearRutas(controllers, middlewares));
  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores);
  return app;
}

export function minutosReservaDelEntorno() {
  const minutos = Number(process.env.RESERVA_MINUTOS);
  return Number.isFinite(minutos) && minutos > 0
    ? minutos
    : Compra.MINUTOS_RESERVA;
}
