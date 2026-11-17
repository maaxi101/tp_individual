import { tipoEntradaDTO } from "../tipoEntrada/tipoEntradaDTO.js";
import { compraDTO } from "./compraDTO.js";

export const comprasDeEventoDTO = ({ evento, compras }) => ({
  evento: {
    id: evento.id,
    nombre: evento.nombre,
    fecha: evento.fecha.toISOString(),
  },
  disponibilidad: evento.tiposEntrada.map((tipo) => ({
    ...tipoEntradaDTO(tipo),
    vendidas: compras
      .filter((compra) => compra.tipoEntrada === tipo && compra.estaActiva())
      .reduce((total, compra) => total + compra.cantidad, 0),
  })),
  compras: compras.map(compraDTO),
});
