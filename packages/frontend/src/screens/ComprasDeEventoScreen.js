import { useLayoutEffect } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { eventosApi } from "../api/eventosApi";
import { Cargando, EstadoBadge, MensajeError, Seccion, TipoEntradaItem, Vacio } from "../components";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { formatearFechaLarga, formatearPrecio, nombreCompleto } from "../utils/formato";

// Vista del organizador: compras del evento con su estado y cupo restante por tipo
export function ComprasDeEventoScreen({ route, navigation }) {
  const { id } = route.params;
  const { datos, cargando, error, recargar } = useCargar(
    () => eventosApi.comprasDeEvento(id),
    [id],
  );

  useLayoutEffect(() => {
    if (datos) navigation.setOptions({ title: datos.evento.nombre });
  }, [navigation, datos]);

  if (cargando && !datos) return <Cargando />;
  if (error && !datos) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  const totalRecaudado = datos.compras
    .filter((c) => ["CONFIRMADA", "UTILIZADA"].includes(c.estado))
    .reduce((suma, c) => suma + c.total, 0);

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
    >
      <Text style={estilos.fecha}>{formatearFechaLarga(datos.evento.fecha)}</Text>

      <Seccion titulo="Disponibilidad por tipo de entrada">
        {datos.disponibilidad.map((tipo) => (
          <TipoEntradaItem key={tipo.id} tipo={tipo} vendidas={tipo.vendidas} />
        ))}
        <Text style={estilos.recaudado}>Cobrado: {formatearPrecio(totalRecaudado)}</Text>
      </Seccion>

      <Seccion titulo={`Compras (${datos.compras.length}) · más nuevas primero`}>
        {datos.compras.length === 0 ? (
          <Vacio titulo="Todavía no hay compras" />
        ) : (
          datos.compras.map((compra) => (
            <Pressable
              key={compra.id}
              onPress={() => navigation.navigate("CompraDetalle", { id: compra.id })}
              style={({ pressed }) => [estilos.compra, pressed && estilos.presionada]}
            >
              <View style={estilos.compraInfo}>
                <Text style={estilos.comprador}>
                  <Text style={estilos.numero}>#{compra.id} </Text>
                  {nombreCompleto(compra.comprador)}
                </Text>
                <Text style={estilos.detalle}>
                  {compra.tipoEntrada.nombre} × {compra.cantidad} · {formatearPrecio(compra.total)}
                </Text>
              </View>
              <EstadoBadge estado={compra.estado} />
            </Pressable>
          ))
        )}
      </Seccion>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espaciado.m, paddingBottom: espaciado.xl },
  fecha: { color: colores.textoSecundario, marginBottom: espaciado.m, fontSize: 15 },
  recaudado: { marginTop: espaciado.s, fontWeight: "700", color: colores.texto, textAlign: "right" },
  compra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: espaciado.s,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    borderRadius: radio.s,
  },
  presionada: { backgroundColor: colores.fondo },
  compraInfo: { flex: 1, marginRight: espaciado.s },
  comprador: { fontWeight: "700", color: colores.texto },
  numero: { color: colores.textoSecundario, fontWeight: "600" },
  detalle: { color: colores.textoSecundario, fontSize: 13, marginTop: 2 },
  error: { margin: espaciado.m },
});
