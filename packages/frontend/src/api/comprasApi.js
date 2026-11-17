import { cliente } from "./cliente";

export const comprasApi = {
  comprar: ({ eventoId, tipoEntradaId, cantidad }) =>
    cliente.post("/compras", { eventoId, tipoEntradaId, cantidad }),
  obtener: (id) => cliente.get(`/compras/${id}`),
  confirmar: (id) => cliente.post(`/compras/${id}/confirmar`),
  utilizar: (id) => cliente.post(`/compras/${id}/utilizar`),
  cancelar: (id) => cliente.post(`/compras/${id}/cancelar`),
  listarMensajes: (id) => cliente.get(`/compras/${id}/mensajes`),
  enviarMensaje: (id, mensaje) =>
    cliente.post(`/compras/${id}/mensajes`, { mensaje }),
  reseniar: (id, { puntuacion, detalle }) =>
    cliente.post(`/compras/${id}/resenia`, { puntuacion, detalle }),
};
