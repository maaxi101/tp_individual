// Etiqueta y colores de cada estado de compra (EstadoCompra del backend)
export const ESTADOS = {
  PENDIENTE: { etiqueta: "Pendiente de pago", color: "#B45309", fondo: "#FEF3C7" },
  CONFIRMADA: { etiqueta: "Confirmada", color: "#15803D", fondo: "#DCFCE7" },
  UTILIZADA: { etiqueta: "Utilizada", color: "#1D4ED8", fondo: "#DBEAFE" },
  CANCELADA: { etiqueta: "Cancelada", color: "#4B5563", fondo: "#F3F4F6" },
  REEMBOLSADA: { etiqueta: "Reembolsada", color: "#6D28D9", fondo: "#EDE9FE" },
};

export function infoEstado(estado) {
  return ESTADOS[estado] ?? { etiqueta: estado, color: "#4B5563", fondo: "#F3F4F6" };
}
