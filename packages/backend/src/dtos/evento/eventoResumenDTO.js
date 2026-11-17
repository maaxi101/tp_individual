import { categoriaDTO } from "../categoria/categoriaDTO.js";
import { tipoEntradaDTO } from "../tipoEntrada/tipoEntradaDTO.js";
import { usuarioDTO } from "../usuario/usuarioDTO.js";

export const eventoResumenDTO = (evento) => ({
  id: evento.id,
  nombre: evento.nombre,
  descripcion: evento.descripcion,
  categoria: categoriaDTO(evento.categoria),
  fecha: evento.fecha.toISOString(),
  precioDesde: evento.precioMinimo(),
  multimedia: evento.multimedia,
  organizador: usuarioDTO(evento.organizador),
  tiposEntrada: evento.tiposEntrada.map(tipoEntradaDTO),
});
