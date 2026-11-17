import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import { comprasApi } from "../api/comprasApi";
import { Boton, Campo, Estrellas, MensajeError, Pantalla, Seccion } from "../components";
import { colores, espaciado } from "../theme";

const DESCRIPCION_PUNTAJE = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

// Puntuar de 1 a 5 y dejar un comentario sobre una compra ya utilizada
export function ReseniarScreen({ route, navigation }) {
  const { compraId, eventoNombre } = route.params;
  const [puntuacion, setPuntuacion] = useState(5);
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await comprasApi.reseniar(compraId, { puntuacion, detalle: detalle.trim() });
      Alert.alert("¡Gracias!", "Tu reseña ya es visible para otros compradores.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla scroll>
      <Text style={estilos.evento}>{eventoNombre}</Text>
      <Text style={estilos.pregunta}>¿Cómo fue tu experiencia?</Text>

      <Seccion style={estilos.estrellas}>
        <Estrellas valor={puntuacion} onCambiar={setPuntuacion} tamanio={40} style={estilos.centrado} />
        <Text style={estilos.descripcionPuntaje}>{DESCRIPCION_PUNTAJE[puntuacion]}</Text>
      </Seccion>

      <Campo
        etiqueta="Comentario"
        value={detalle}
        onChangeText={setDetalle}
        placeholder="Contá cómo estuvo la organización, el sonido, el acceso..."
        multiline
      />

      <MensajeError mensaje={error} />

      <Boton
        titulo="Publicar reseña"
        onPress={enviar}
        cargando={enviando}
        deshabilitado={!detalle.trim()}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  evento: { fontSize: 20, fontWeight: "800", color: colores.texto },
  pregunta: { color: colores.textoSecundario, marginBottom: espaciado.m },
  estrellas: { alignItems: "center" },
  centrado: { justifyContent: "center" },
  descripcionPuntaje: { marginTop: espaciado.s, fontWeight: "600", color: colores.texto },
});
