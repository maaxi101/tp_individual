import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radio } from "../theme";
import { formatearFecha, formatearPrecio, yaPaso } from "../utils/formato";
import { Estrellas } from "./Estrellas";

export function EventoCard({ evento, onPress }) {
  const imagen = evento.multimedia?.[0];
  const pasado = yaPaso(evento.fecha);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      {imagen ? (
        <Image source={{ uri: imagen }} style={estilos.imagen} />
      ) : (
        <View style={[estilos.imagen, estilos.sinImagen]} />
      )}
      <View style={estilos.cuerpo}>
        <View style={estilos.filaSuperior}>
          <Text style={estilos.categoria}>{evento.categoria?.nombre}</Text>
          {pasado ? <Text style={estilos.pasado}>Finalizado</Text> : null}
        </View>
        <Text style={estilos.nombre} numberOfLines={2}>
          {evento.nombre}
        </Text>
        <Text style={estilos.fecha}>{formatearFecha(evento.fecha)}</Text>
        <View style={estilos.filaInferior}>
          <Text style={estilos.precio}>Desde {formatearPrecio(evento.precioDesde)}</Text>
          {evento.puntajeOrganizador != null ? (
            <View style={estilos.puntaje}>
              <Estrellas valor={evento.puntajeOrganizador} tamanio={13} />
              <Text style={estilos.puntajeTexto}>{evento.puntajeOrganizador}</Text>
            </View>
          ) : (
            <Text style={estilos.sinPuntaje}>Sin reseñas</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    marginBottom: espaciado.m,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionada: { opacity: 0.9 },
  imagen: { width: "100%", height: 150 },
  sinImagen: { backgroundColor: colores.primarioClaro },
  cuerpo: { padding: espaciado.m },
  filaSuperior: { flexDirection: "row", justifyContent: "space-between" },
  categoria: {
    color: colores.primarioOscuro,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pasado: { color: colores.textoSecundario, fontSize: 12, fontWeight: "600" },
  nombre: { fontSize: 18, fontWeight: "700", color: colores.texto, marginTop: 4 },
  fecha: { color: colores.textoSecundario, marginTop: 4 },
  filaInferior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: espaciado.s,
  },
  precio: { fontSize: 16, fontWeight: "700", color: colores.texto },
  puntaje: { flexDirection: "row", alignItems: "center" },
  puntajeTexto: { marginLeft: 4, fontWeight: "600", color: colores.texto },
  sinPuntaje: { color: colores.textoSecundario, fontSize: 12 },
});
