import { Pressable, StyleSheet, Text, View } from "react-native";

import { colores } from "../theme";

// Muestra un puntaje de 1 a 5. Si recibe onCambiar, las estrellas se pueden tocar.
export function Estrellas({ valor = 0, onCambiar, tamanio = 18, style }) {
  return (
    <View style={[estilos.fila, style]}>
      {[1, 2, 3, 4, 5].map((n) => {
        const llena = n <= Math.round(valor);
        const estrella = (
          <Text style={{ fontSize: tamanio, color: llena ? colores.estrella : colores.borde }}>
            {llena ? "★" : "☆"}
          </Text>
        );
        return onCambiar ? (
          <Pressable key={n} onPress={() => onCambiar(n)} hitSlop={6} style={estilos.tocable}>
            {estrella}
          </Pressable>
        ) : (
          <View key={n}>{estrella}</View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center" },
  tocable: { paddingHorizontal: 2 },
});
