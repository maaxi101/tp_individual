import { cliente } from "./cliente";

export const usuariosApi = {
  listar: () => cliente.get("/usuarios"),
  compras: (usuarioId) => cliente.get(`/usuarios/${usuarioId}/compras`),
  favoritos: (usuarioId) => cliente.get(`/usuarios/${usuarioId}/favoritos`),
  agregarFavorito: (usuarioId, eventoId) =>
    cliente.post(`/usuarios/${usuarioId}/favoritos`, { eventoId }),
  quitarFavorito: (usuarioId, eventoId) =>
    cliente.delete(`/usuarios/${usuarioId}/favoritos/${eventoId}`),
};
