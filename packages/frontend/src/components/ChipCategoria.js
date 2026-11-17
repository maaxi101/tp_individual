import { Pressable, StyleSheet, Text } from "react-native";

import { colores, radio } from "../theme";

export function ChipCategoria({ etiqueta, activa, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[estilos.chip, activa && estilos.activa, style]}
    >
      <Text style={[estilos.texto, activa && estilos.textoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radio.completo,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    marginRight: 8,
  },
  activa: { backgroundColor: colores.primario, borderColor: colores.primario },
  texto: { color: colores.texto, fontSize: 14, fontWeight: "500" },
  textoActivo: { color: "#FFFFFF" },
});
