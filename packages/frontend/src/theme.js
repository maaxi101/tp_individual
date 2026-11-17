import { DefaultTheme } from "@react-navigation/native";

export const colores = {
  primario: "#3DB54A",
  primarioOscuro: "#2E8F3A",
  primarioClaro: "#E8F7EA",
  fondo: "#F6F7F9",
  superficie: "#FFFFFF",
  texto: "#1A1A1A",
  textoSecundario: "#6B7280",
  borde: "#E5E7EB",
  peligro: "#DC2626",
  peligroClaro: "#FEE2E2",
  advertencia: "#D97706",
  info: "#2563EB",
  estrella: "#F59E0B",
};

export const espaciado = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const radio = {
  s: 8,
  m: 12,
  l: 16,
  completo: 999,
};

export const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colores.primario,
    background: colores.fondo,
    card: colores.superficie,
    text: colores.texto,
    border: colores.borde,
  },
};
