import { FlatList, RefreshControl, StyleSheet } from "react-native";

import { usuariosApi } from "../api/usuariosApi";
import { Cargando, EventoCard, MensajeError, Vacio } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { espaciado } from "../theme";

export function FavoritosScreen({ navigation }) {
  const { usuario } = useUsuario();
  const { datos, cargando, error, recargar } = useCargar(
    () => usuariosApi.favoritos(usuario.id),
    [usuario.id],
  );

  if (cargando && !datos) return <Cargando />;
  if (error && !datos) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  return (
    <FlatList
      data={datos}
      keyExtractor={(e) => String(e.id)}
      contentContainerStyle={estilos.lista}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      ListEmptyComponent={
        <Vacio
          titulo="No tenés favoritos"
          detalle="Tocá el corazón en un evento para guardarlo acá"
        />
      }
      renderItem={({ item }) => (
        <EventoCard evento={item} onPress={() => navigation.navigate("EventoDetalle", { id: item.id })} />
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espaciado.m, flexGrow: 1 },
  error: { margin: espaciado.m },
});
