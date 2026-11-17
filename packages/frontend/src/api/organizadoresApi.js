import { cliente } from "./cliente";

export const organizadoresApi = {
  resenias: (organizadorId) =>
    cliente.get(`/organizadores/${organizadorId}/resenias`),
};
