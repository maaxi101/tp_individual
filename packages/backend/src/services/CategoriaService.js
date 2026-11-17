export class CategoriaService {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async listar() {
    return this.categoriaRepository.buscarTodos();
  }
}
