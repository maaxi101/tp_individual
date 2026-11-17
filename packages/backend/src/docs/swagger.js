import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const carpetaRutas = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "routes",
);

// La documentación se arma a partir de los bloques @swagger de cada archivo de rutas
export function crearEspecificacionSwagger() {
  return swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "AI Ticket It",
        version: "1.0.0",
        description:
          "API de publicación de eventos y venta de entradas. " +
          "No hay login: el usuario actual se indica con el header x-user-id.",
      },
      components: {
        securitySchemes: {
          usuario: { type: "apiKey", in: "header", name: "x-user-id" },
        },
      },
    },
    // swagger-jsdoc usa globs con barras normales, incluso en Windows
    apis: [path.posix.join(carpetaRutas.replace(/\\/g, "/"), "*.js")],
  });
}
