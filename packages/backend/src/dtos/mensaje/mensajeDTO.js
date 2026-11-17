import { usuarioDTO } from "../usuario/usuarioDTO.js";

export const mensajeDTO = (mensaje) => ({
  usuario: usuarioDTO(mensaje.usuario),
  mensaje: mensaje.mensaje,
  enviado: mensaje.enviado.toISOString(),
});
