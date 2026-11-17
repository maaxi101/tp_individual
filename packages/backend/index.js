import "dotenv/config";
import os from "node:os";
import { crearApp } from "./src/app.js";

const puerto = Number(process.env.SERVER_PORT) || 8000;

// IPs de la red local: la app móvil tiene que apuntar a una de estas
function ipsLocales() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((red) => red.family === "IPv4" && !red.internal)
    .map((red) => red.address);
}

const app = await crearApp();

// 0.0.0.0 para aceptar conexiones del celular en la misma red
app.listen(puerto, "0.0.0.0", () => {
  console.log(`Backend escuchando en http://localhost:${puerto}`);
  for (const ip of ipsLocales()) {
    console.log(`  desde el celular: http://${ip}:${puerto}`);
  }
  console.log(`  documentación:    http://localhost:${puerto}/api-docs`);
});
