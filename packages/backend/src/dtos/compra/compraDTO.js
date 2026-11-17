import { usuarioDTO } from "../usuario/usuarioDTO.js";

// Además de dar forma a la respuesta, evita exponer la referencia
// circular CambioEstadoCompra -> Compra
export const compraDTO = (compra) => ({
  id: compra.id,
  comprador: usuarioDTO(compra.comprador),
  evento: {
    id: compra.evento.id,
    nombre: compra.evento.nombre,
    fecha: compra.evento.fecha.toISOString(),
    organizador: usuarioDTO(compra.evento.organizador),
  },
  tipoEntrada: {
    id: compra.tipoEntrada.id,
    nombre: compra.tipoEntrada.nombre,
    precio: compra.tipoEntrada.precio,
  },
  cantidad: compra.cantidad,
  total: compra.total,
  estado: compra.estado,
  diasParaEvento: compra.diasParaEvento(),
  puedeCancelarse: compra.puedeCancelarse(),
  puedeSerReseniada: compra.puedeSerReseniada(),
  historial: compra.cambiosEstado.map((cambio) => ({
    estado: cambio.estado,
    quien: usuarioDTO(cambio.quien),
    fechaHora: cambio.fechaHora.toISOString(),
  })),
});
