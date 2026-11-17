// Error base de la aplicación. No conoce HTTP: el middleware de errores
// es quien traduce cada tipo de error a un código de estado.
export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
