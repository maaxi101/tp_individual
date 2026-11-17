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

export function yaPaso(iso) {
  return new Date(iso) <= new Date();
}

export function nombreCompleto(usuario) {
  return `${usuario.nombre} ${usuario.apellido}`;
}

export function iniciales(usuario) {
  return `${usuario.nombre[0] ?? ""}${usuario.apellido[0] ?? ""}`.toUpperCase();
}
