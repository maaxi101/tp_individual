import { StyleSheet, Text, View } from "react-native";

import { radio } from "../theme";
import { infoEstado } from "../utils/estados";

export function EstadoBadge({ estado, grande = false }) {
  const info = infoEstado(estado);
  return (
    <View style={[estilos.badge, grande && estilos.grande, { backgroundColor: info.fondo }]}>
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color: info.color }]}>
        {info.etiqueta}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radio.completo,
  },
  grande: { paddingHorizontal: 14, paddingVertical: 6 },
  texto: { fontSize: 12, fontWeight: "700" },
  textoGrande: { fontSize: 14 },
});
