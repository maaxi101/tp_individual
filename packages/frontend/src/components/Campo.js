import { StyleSheet, Text, TextInput, View } from "react-native";

import { colores, espaciado, radio } from "../theme";

export function Campo({ etiqueta, error, style, multiline, ...props }) {
  return (
    <View style={[estilos.contenedor, style]}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <TextInput
        placeholderTextColor={colores.textoSecundario}
        multiline={multiline}
        style={[estilos.input, multiline && estilos.multilinea, error && estilos.conError]}
        {...props}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: espaciado.m },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.texto,
    marginBottom: espaciado.xs,
  },
  input: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingHorizontal: espaciado.m,
    paddingVertical: 12,
    fontSize: 16,
    color: colores.texto,
  },
  multilinea: { minHeight: 90, textAlignVertical: "top" },
  conError: { borderColor: colores.peligro },
  error: { color: colores.peligro, fontSize: 13, marginTop: espaciado.xs },
});
