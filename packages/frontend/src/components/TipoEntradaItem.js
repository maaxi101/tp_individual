import { Pressable, StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radio } from "../theme";
import { formatearPrecio } from "../utils/formato";

// Fila de un tipo de entrada. Si recibe onPress funciona como opción seleccionable.
export function TipoEntradaItem({ tipo, seleccionado = false, onPress, vendidas }) {
  const agotado = tipo.cupoDisponible === 0;
  const contenido = (
    <View
      style={[
        estilos.fila,
        seleccionado && estilos.seleccionado,
        agotado && onPress && estilos.agotado,
      ]}
    >
      <View style={estilos.info}>
        <Text style={estilos.nombre}>{tipo.nombre}</Text>
        {tipo.descripcion ? <Text style={estilos.descripcion}>{tipo.descripcion}</Text> : null}
        <Text style={[estilos.cupo, agotado && estilos.cupoAgotado]}>
          {agotado ? "Agotado" : `${tipo.cupoDisponible} disponibles`}
          {vendidas != null ? ` · ${vendidas} vendidas` : ""}
        </Text>
      </View>
      <Text style={estilos.precio}>{formatearPrecio(tipo.precio)}</Text>
    </View>
  );
  if (!onPress) return contenido;
  return (
    <Pressable onPress={onPress} disabled={agotado}>
      {contenido}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    marginBottom: espaciado.s,
  },
  seleccionado: { borderColor: colores.primario, backgroundColor: colores.primarioClaro },
  agotado: { opacity: 0.5 },
  info: { flex: 1, paddingRight: espaciado.s },
  nombre: { fontSize: 16, fontWeight: "700", color: colores.texto },
  descripcion: { color: colores.textoSecundario, marginTop: 2 },
  cupo: { color: colores.primarioOscuro, fontSize: 12, marginTop: 4, fontWeight: "600" },
  cupoAgotado: { color: colores.peligro },
  precio: { fontSize: 16, fontWeight: "700", color: colores.texto },
});
