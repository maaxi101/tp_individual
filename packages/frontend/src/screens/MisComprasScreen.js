import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { usuariosApi } from "../api/usuariosApi";
import { Cargando, EstadoBadge, MensajeError, Vacio } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { formatearFecha, formatearPrecio, textoDiasParaEvento, yaPaso } from "../utils/formato";

// Los eventos por venir primero (del más cercano al más lejano), después los pasados
function ordenarCompras(compras) {
  return [...compras].sort((a, b) => {
    const pasoA = yaPaso(a.evento.fecha);
    const pasoB = yaPaso(b.evento.fecha);
    if (pasoA !== pasoB) return pasoA ? 1 : -1;
    return new Date(a.evento.fecha) - new Date(b.evento.fecha);
  });
}

export function MisComprasScreen({ navigation }) {
  const { usuario } = useUsuario();
  const { datos, cargando, error, recargar } = useCargar(
    () => usuariosApi.compras(usuario.id),
    [usuario.id],
  );

  if (cargando && !datos) return <Cargando texto="Cargando tus compras..." />;
  if (error && !datos) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  return (
    <FlatList
      data={ordenarCompras(datos)}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={estilos.lista}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      ListEmptyComponent={
        <Vacio titulo="Todavía no compraste entradas" detalle="Explorá los eventos y elegí el tuyo" />
      }
      renderItem={({ item }) => (
        <CompraCard compra={item} onPress={() => navigation.navigate("CompraDetalle", { id: item.id })} />
      )}
    />
  );
}

function CompraCard({ compra, onPress }) {
  const dias = textoDiasParaEvento(compra.diasParaEvento);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
      <View style={estilos.fila}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {compra.evento.nombre}
        </Text>
        <EstadoBadge estado={compra.estado} />
      </View>
      <Text style={estilos.fecha}>{formatearFecha(compra.evento.fecha)}</Text>
      <View style={estilos.fila}>
        <Text style={estilos.detalle}>
          {compra.tipoEntrada.nombre} × {compra.cantidad}
        </Text>
        <Text style={estilos.total}>{formatearPrecio(compra.total)}</Text>
      </View>
      {dias ? <Text style={estilos.dias}>{dias}</Text> : null}
      {compra.estado === "PENDIENTE" ? (
        <Text style={estilos.pendiente}>Tocá para completar el pago</Text>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
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
  nombre: { fontSize: 17, fontWeight: "700", color: colores.texto, flex: 1, marginRight: espaciado.s },
  fecha: { color: colores.textoSecundario, marginTop: 4, marginBottom: espaciado.s },
  detalle: { color: colores.texto },
  total: { fontWeight: "700", color: colores.texto },
  dias: { marginTop: espaciado.s, color: colores.primarioOscuro, fontWeight: "700" },
  pendiente: { marginTop: espaciado.s, color: colores.advertencia, fontWeight: "600", fontSize: 13 },
  error: { margin: espaciado.m },
});
