import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_URL } from "../api/cliente";
import { usuariosApi } from "../api/usuariosApi";
import { Cargando, MensajeError } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { iniciales, nombreCompleto } from "../utils/formato";

// No hay login: se elige con qué usuario de prueba usar la app
export function SeleccionarUsuarioScreen() {
  const { seleccionarUsuario } = useUsuario();
  const { datos: usuarios, cargando, error, recargar } = useCargar(
    () => usuariosApi.listar(),
    [],
  );

  return (
    <SafeAreaView style={estilos.pantalla}>
      <View style={estilos.encabezado}>
        <View style={estilos.logo}>
          <Text style={estilos.logoTexto}>AI</Text>
        </View>
        <Text style={estilos.titulo}>
          Ticket <Text style={estilos.tituloVerde}>It</Text>
        </Text>
        <Text style={estilos.subtitulo}>ENTRADAS A UN CLICK</Text>
      </View>

      <Text style={estilos.instruccion}>¿Quién usa la app?</Text>

      {cargando ? (
        <Cargando texto="Buscando usuarios..." />
      ) : error ? (
        <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(u) => String(u.id)}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => seleccionarUsuario(item)}
              style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
            >
              <View style={estilos.avatar}>
                <Text style={estilos.avatarTexto}>{iniciales(item)}</Text>
              </View>
              <View style={estilos.info}>
                <Text style={estilos.nombre}>{nombreCompleto(item)}</Text>
                <Text style={estilos.detalle}>Usuario #{item.id}</Text>
              </View>
              <Text style={estilos.flecha}>›</Text>
            </Pressable>
          )}
        />
      )}

      <Text style={estilos.pie}>Backend: {API_URL}</Text>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  encabezado: { alignItems: "center", paddingTop: espaciado.xl, paddingBottom: espaciado.l },
  logo: {
    width: 72,
    height: 48,
    borderRadius: radio.m,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado.m,
  },
  logoTexto: { color: "#FFFFFF", fontSize: 26, fontWeight: "900" },
  titulo: { fontSize: 36, fontWeight: "800", color: colores.texto },
  tituloVerde: { color: colores.primario },
  subtitulo: { letterSpacing: 3, color: colores.textoSecundario, fontSize: 12, marginTop: 4 },
  instruccion: {
    fontSize: 18,
    fontWeight: "700",
    color: colores.texto,
    paddingHorizontal: espaciado.m,
    marginBottom: espaciado.s,
  },
  lista: { paddingHorizontal: espaciado.m },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    padding: espaciado.m,
    marginBottom: espaciado.s,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionada: { backgroundColor: colores.primarioClaro },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.primarioClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: colores.primarioOscuro, fontWeight: "800" },
  info: { flex: 1, marginLeft: espaciado.m },
  nombre: { fontSize: 16, fontWeight: "700", color: colores.texto },
  detalle: { color: colores.textoSecundario, fontSize: 12 },
  flecha: { fontSize: 24, color: colores.textoSecundario },
  error: { marginHorizontal: espaciado.m },
  pie: {
    textAlign: "center",
    color: colores.textoSecundario,
    fontSize: 11,
    padding: espaciado.s,
  },
});
