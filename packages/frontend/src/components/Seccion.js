import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radio } from "../theme";

// Tarjeta blanca con título opcional, para agrupar contenido
export function Seccion({ titulo, children, style }) {
  return (
    <View style={[estilos.tarjeta, style]}>
      {titulo ? <Text style={estilos.titulo}>{titulo}</Text> : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    padding: espaciado.m,
    marginBottom: espaciado.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "700",
    color: colores.texto,
    marginBottom: espaciado.s,
  },
});
