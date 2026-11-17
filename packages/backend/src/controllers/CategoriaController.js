import { categoriaDTO } from "../dtos/categoria/categoriaDTO.js";

export class CategoriaController {
  constructor(categoriaService) {
    this.categoriaService = categoriaService;
  }

  listar = async (req, res) => {
    const categorias = await this.categoriaService.listar();
    res.json(categorias.map(categoriaDTO));
  };
}
