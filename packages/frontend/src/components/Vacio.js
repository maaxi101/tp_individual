import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado } from "../theme";

export function Vacio({ titulo, detalle }) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {detalle ? <Text style={estilos.detalle}>{detalle}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: "center", padding: espaciado.xl },
  titulo: { fontSize: 16, fontWeight: "600", color: colores.texto, textAlign: "center" },
  detalle: {
    marginTop: espaciado.s,
    color: colores.textoSecundario,
    textAlign: "center",
  },
});
