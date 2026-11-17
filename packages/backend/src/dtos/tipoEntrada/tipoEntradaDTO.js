export const tipoEntradaDTO = (tipo) => ({
  id: tipo.id,
  nombre: tipo.nombre,
  descripcion: tipo.descripcion,
  precio: tipo.precio,
  cupoDisponible: tipo.cupo,
});
