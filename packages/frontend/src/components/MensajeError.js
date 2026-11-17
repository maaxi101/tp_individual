import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radio } from "../theme";
import { Boton } from "./Boton";

export function MensajeError({ mensaje, onReintentar, style }) {
  if (!mensaje) return null;
  return (
    <View style={[estilos.caja, style]}>
      <Text style={estilos.texto}>{mensaje}</Text>
      {onReintentar ? (
        <Boton titulo="Reintentar" variante="peligro" chico onPress={onReintentar} style={estilos.boton} />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: colores.peligroClaro,
    borderRadius: radio.m,
    padding: espaciado.m,
    marginVertical: espaciado.s,
  },
  texto: { color: colores.peligro, fontSize: 14 },
  boton: { marginTop: espaciado.s, alignSelf: "flex-start" },
});
