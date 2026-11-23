const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const dosDigitos = (n) => String(n).padStart(2, "0");

export function formatearPrecio(valor) {
  if (valor == null) return "-";
  const entero = String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${entero}`;
}

// "sáb 7 dic, 21:00"
export function formatearFecha(iso) {
  const fecha = new Date(iso);
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]}, ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

// "7 dic 2026 21:00"
export function formatearFechaLarga(iso) {
  const fecha = new Date(iso);
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

export function textoDiasParaEvento(dias) {
  if (dias == null) return null;
  if (dias < 0) return "El evento ya pasó";
  if (dias === 0) return "¡Es hoy!";
  if (dias === 1) return "Falta 1 día";
  return `Faltan ${dias} días`;
}

// 581000 -> "9:41"
export function formatearTiempoRestante(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(segundos / 60)}:${dosDigitos(segundos % 60)}`;
}

// minutos (redondeados hacia arriba) que faltan para una fecha ISO
export function minutosRestantes(iso) {
  return Math.max(0, Math.ceil((new Date(iso) - Date.now()) / 60000));
}

export function yaPaso(iso) {
  return new Date(iso) <= new Date();
}

// usuario null = cambio hecho por el sistema (ej: vencimiento de una reserva)
export function nombreCompleto(usuario) {
  if (!usuario) return "Sistema";
  return `${usuario.nombre} ${usuario.apellido}`;
}

export function iniciales(usuario) {
  return `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase();
}
