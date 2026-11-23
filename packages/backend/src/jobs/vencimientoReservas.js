// Job en segundo plano: cada cierto intervalo vence las reservas pendientes
// cuyo plazo de pago pasó y libera su cupo.
//
// No es la única defensa: el service también vence de forma perezosa al leer
// una compra, y Compra.confirmar() valida contra la fecha. Así, aunque el job
// se atrase, nunca se acepta el pago de una reserva vencida.
export function iniciarVencimientoDeReservas(compraService, intervaloMs = 30_000) {
  const timer = setInterval(async () => {
    try {
      const cantidad = await compraService.vencerReservasExpiradas();
      if (cantidad > 0) {
        console.log(`[job] ${cantidad} reserva(s) vencida(s), cupo liberado`);
      }
    } catch (error) {
      console.error("[job] Error al vencer reservas:", error);
    }
  }, intervaloMs);
  // no impide que el proceso termine
  timer.unref();
  return () => clearInterval(timer);
}
