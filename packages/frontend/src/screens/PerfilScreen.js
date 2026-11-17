import { Alert, StyleSheet, Text, View } from "react-native";

import { API_URL } from "../api/cliente";
import { Boton, Pantalla, Seccion } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { colores, espaciado } from "../theme";
import { iniciales, nombreCompleto } from "../utils/formato";

export function PerfilScreen() {
  const { usuario, salir } = useUsuario();

  const confirmarSalida = () => {
    Alert.alert("Cambiar de usuario", "¿Querés volver a la pantalla de selección?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cambiar", onPress: salir },
    ]);
  };

  return (
    <Pantalla>
      <View style={estilos.encabezado}>
        <View style={estilos.avatar}>
          <Text style={estilos.avatarTexto}>{iniciales(usuario)}</Text>
        </View>
        <Text style={estilos.nombre}>{nombreCompleto(usuario)}</Text>
        <Text style={estilos.detalle}>Usuario #{usuario.id}</Text>
      </View>

      <Seccion titulo="Cómo funciona">
        <Text style={estilos.texto}>
          Cualquier usuario puede comprar entradas y también organizar eventos. En “Explorar”
          buscás y comprás; en “Mis compras” seguís el estado de cada entrada y chateás con el
          organizador; en “Mis eventos” publicás eventos y ves sus ventas.
        </Text>
      </Seccion>

      <Seccion titulo="Conexión">
        <Text style={estilos.texto}>Backend: {API_URL}</Text>
      </Seccion>

      <Boton titulo="Cambiar de usuario" variante="secundario" onPress={confirmarSalida} />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { alignItems: "center", marginVertical: espaciado.l },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado.m,
  },
  avatarTexto: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  nombre: { fontSize: 22, fontWeight: "800", color: colores.texto },
  detalle: { color: colores.textoSecundario },
  texto: { color: colores.texto, lineHeight: 20 },
});
