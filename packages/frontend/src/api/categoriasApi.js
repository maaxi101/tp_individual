import { cliente } from "./cliente";

export const categoriasApi = {
  listar: () => cliente.get("/categorias"),
};
