import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { eventosApi } from "../api/eventosApi";
import { Boton, Cargando, MensajeError, Vacio } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { formatearFecha, yaPaso } from "../utils/formato";

// Eventos que organiza el usuario actual
export function MisEventosScreen({ navigation }) {
  const { usuario } = useUsuario();
  const { datos, cargando, error, recargar } = useCargar(
    () => eventosApi.listarPorOrganizador(usuario.id),
    [usuario.id],
  );

  return (
    <View style={estilos.pantalla}>
      <Boton
        titulo="+ Crear evento"
        onPress={() => navigation.navigate("CrearEvento")}
        style={estilos.crear}
      />
      {cargando && !datos ? (
        <Cargando />
      ) : error && !datos ? (
        <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
          ListEmptyComponent={
            <Vacio
              titulo="Todavía no organizás eventos"
              detalle="Creá el primero con sus tipos de entrada, precios y cupos"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("EventoDetalle", { id: item.id })}
              style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}
            >
              <View style={estilos.fila}>
                <Text style={estilos.nombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                {yaPaso(item.fecha) ? <Text style={estilos.finalizado}>Finalizado</Text> : null}
              </View>
              <Text style={estilos.fecha}>{formatearFecha(item.fecha)}</Text>
              <View style={estilos.tipos}>
                {item.tiposEntrada.map((t) => (
                  <Text key={t.id} style={estilos.tipo}>
                    {t.nombre}: {t.cupoDisponible} disp.
                  </Text>
                ))}
              </View>
              <Boton
                titulo="Ver compras"
                variante="secundario"
                chico
                onPress={() => navigation.navigate("ComprasDeEvento", { id: item.id })}
                style={estilos.verCompras}
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  crear: { margin: espaciado.m, marginBottom: 0 },
  lista: { padding: espaciado.m, flexGrow: 1 },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    padding: espaciado.m,
    marginBottom: espaciado.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionada: { opacity: 0.9 },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nombre: { fontSize: 17, fontWeight: "700", color: colores.texto, flex: 1 },
  finalizado: { color: colores.textoSecundario, fontSize: 12, fontWeight: "600" },
  fecha: { color: colores.textoSecundario, marginTop: 4 },
  tipos: { flexDirection: "row", flexWrap: "wrap", marginTop: espaciado.s },
  tipo: {
    backgroundColor: colores.primarioClaro,
    color: colores.primarioOscuro,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radio.completo,
    marginRight: 6,
    marginBottom: 6,
  },
  verCompras: { alignSelf: "flex-start", marginTop: espaciado.s },
  error: { margin: espaciado.m },
});
