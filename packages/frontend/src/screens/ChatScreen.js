import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { comprasApi } from "../api/comprasApi";
import { Cargando, MensajeBurbuja, MensajeError, Vacio } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";

const INTERVALO_ACTUALIZACION_MS = 4000;

// Chat de una compra entre comprador y organizador
export function ChatScreen({ route, navigation }) {
  const { compraId, titulo } = route.params;
  const { usuario } = useUsuario();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const lista = useRef(null);

  const { datos: mensajes, cargando, error, recargar } = useCargar(
    () => comprasApi.listarMensajes(compraId),
    [compraId],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: titulo ?? "Chat" });
  }, [navigation, titulo]);

  // mientras la pantalla está visible se consultan mensajes nuevos cada pocos segundos
  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => recargar({ silencioso: true }), INTERVALO_ACTUALIZACION_MS);
      return () => clearInterval(timer);
    }, [recargar]),
  );

  const enviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await comprasApi.enviarMensaje(compraId, mensaje);
      setTexto("");
      await recargar({ silencioso: true });
      setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      setErrorEnvio(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {cargando && !mensajes ? (
        <Cargando texto="Cargando mensajes..." />
      ) : error && !mensajes ? (
        <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />
      ) : (
        <FlatList
          ref={lista}
          data={mensajes}
          keyExtractor={(m, i) => `${m.enviado}-${i}`}
          contentContainerStyle={estilos.lista}
          onContentSizeChange={() => lista.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Vacio
              titulo="Todavía no hay mensajes"
              detalle="Escribí para consultar sobre el evento, el acceso o cambios de fecha"
            />
          }
          renderItem={({ item }) => (
            <MensajeBurbuja mensaje={item} esMio={item.usuario.id === usuario.id} />
          )}
        />
      )}

      <MensajeError mensaje={errorEnvio} style={estilos.errorEnvio} />

      <View style={estilos.barra}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          placeholderTextColor={colores.textoSecundario}
          style={estilos.input}
          multiline
        />
        <Pressable
          onPress={enviar}
          disabled={enviando || !texto.trim()}
          style={[estilos.enviar, (enviando || !texto.trim()) && estilos.enviarInactivo]}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
      {Platform.OS === "android" ? <Text style={estilos.espaciador} /> : null}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espaciado.m, flexGrow: 1, justifyContent: "flex-end" },
  barra: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: espaciado.s,
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colores.fondo,
    borderRadius: radio.l,
    paddingHorizontal: espaciado.m,
    paddingVertical: 10,
    fontSize: 15,
    color: colores.texto,
  },
  enviar: {
    marginLeft: espaciado.s,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  enviarInactivo: { opacity: 0.4 },
  espaciador: { height: 0 },
  error: { margin: espaciado.m },
  errorEnvio: { marginHorizontal: espaciado.m },
});
