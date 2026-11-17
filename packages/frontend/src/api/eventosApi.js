import { cliente } from "./cliente";

export const eventosApi = {
  // filtros: { q, categoria, precioMin, precioMax, orden, dir }
  buscar: (filtros = {}) => cliente.get("/eventos", { params: filtros }),
  obtener: (id) => cliente.get(`/eventos/${id}`),
  crear: (datos) => cliente.post("/eventos", datos),
  listarPorOrganizador: (organizadorId) =>
    cliente.get(`/organizadores/${organizadorId}/eventos`),
  comprasDeEvento: (id) => cliente.get(`/eventos/${id}/compras`),
};
