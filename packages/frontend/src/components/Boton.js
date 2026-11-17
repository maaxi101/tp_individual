import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colores, espaciado, radio } from "../theme";

const VARIANTES = {
  primario: { fondo: colores.primario, texto: "#FFFFFF", borde: colores.primario },
  secundario: { fondo: colores.superficie, texto: colores.primarioOscuro, borde: colores.primario },
  peligro: { fondo: colores.peligroClaro, texto: colores.peligro, borde: colores.peligroClaro },
  texto: { fondo: "transparent", texto: colores.primarioOscuro, borde: "transparent" },
};

export function Boton({
  titulo,
  onPress,
  variante = "primario",
  cargando = false,
  deshabilitado = false,
  chico = false,
  style,
}) {
  const v = VARIANTES[variante] ?? VARIANTES.primario;
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        chico && estilos.chico,
        { backgroundColor: v.fondo, borderColor: v.borde },
        inactivo && estilos.inactivo,
        pressed && estilos.presionado,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <Text style={[estilos.texto, chico && estilos.textoChico, { color: v.texto }]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: espaciado.l,
    borderRadius: radio.m,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  chico: { paddingVertical: 8, paddingHorizontal: espaciado.m },
  texto: { fontSize: 16, fontWeight: "600" },
  textoChico: { fontSize: 14 },
  inactivo: { opacity: 0.5 },
  presionado: { opacity: 0.8 },
});
