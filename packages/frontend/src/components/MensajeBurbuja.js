import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radio } from "../theme";

const dosDigitos = (n) => String(n).padStart(2, "0");

export function MensajeBurbuja({ mensaje, esMio }) {
  const fecha = new Date(mensaje.enviado);
  return (
    <View style={[estilos.fila, esMio ? estilos.filaMia : estilos.filaAjena]}>
      <View style={[estilos.burbuja, esMio ? estilos.burbujaMia : estilos.burbujaAjena]}>
        {!esMio ? <Text style={estilos.autor}>{mensaje.usuario.nombre}</Text> : null}
        <Text style={[estilos.texto, esMio && estilos.textoMio]}>{mensaje.mensaje}</Text>
        <Text style={[estilos.hora, esMio && estilos.horaMia]}>
          {dosDigitos(fecha.getHours())}:{dosDigitos(fecha.getMinutes())}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", marginBottom: espaciado.s },
  filaMia: { justifyContent: "flex-end" },
  filaAjena: { justifyContent: "flex-start" },
  burbuja: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: radio.l,
  },
  burbujaMia: { backgroundColor: colores.primario, borderBottomRightRadius: 4 },
  burbujaAjena: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderBottomLeftRadius: 4,
  },
  autor: { fontSize: 12, fontWeight: "700", color: colores.primarioOscuro, marginBottom: 2 },
  texto: { color: colores.texto, fontSize: 15 },
  textoMio: { color: "#FFFFFF" },
  hora: { fontSize: 10, color: colores.textoSecundario, marginTop: 4, alignSelf: "flex-end" },
  horaMia: { color: "#E8F7EA" },
});
