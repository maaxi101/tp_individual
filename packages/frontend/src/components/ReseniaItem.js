import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado } from "../theme";
import { nombreCompleto } from "../utils/formato";
import { Estrellas } from "./Estrellas";

export function ReseniaItem({ resenia }) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.autor}>{nombreCompleto(resenia.comprador)}</Text>
        <Estrellas valor={resenia.puntuacion} tamanio={14} />
      </View>
      <Text style={estilos.evento}>{resenia.evento.nombre}</Text>
      <Text style={estilos.detalle}>{resenia.detalle}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingVertical: espaciado.s,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  autor: { fontWeight: "700", color: colores.texto },
  evento: { color: colores.textoSecundario, fontSize: 12, marginTop: 2 },
  detalle: { color: colores.texto, marginTop: 4 },
});
