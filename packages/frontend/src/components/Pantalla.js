import { ScrollView, StyleSheet, View } from "react-native";

import { colores, espaciado } from "../theme";

// Contenedor base de cada pantalla: fondo, padding y scroll opcional
export function Pantalla({ children, scroll = false, sinPadding = false, style }) {
  if (scroll) {
    return (
      <ScrollView
        style={estilos.fondo}
        contentContainerStyle={[!sinPadding && estilos.contenido, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[estilos.fondo, !sinPadding && estilos.contenido, style]}>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espaciado.m, paddingBottom: espaciado.xl },
});
