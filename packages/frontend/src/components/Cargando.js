import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colores, espaciado } from "../theme";

export function Cargando({ texto = "Cargando..." }) {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: espaciado.xl,
  },
  texto: { marginTop: espaciado.m, color: colores.textoSecundario },
});
