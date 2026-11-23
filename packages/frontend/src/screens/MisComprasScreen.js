import { useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { usuariosApi } from "../api/usuariosApi";
import { Cargando, ChipCategoria, EstadoBadge, MensajeError, Vacio } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { ESTADOS } from "../utils/estados";
import {
  formatearFecha,
  formatearPrecio,
  minutosRestantes,
  textoDiasParaEvento,
  yaPaso,
} from "../utils/formato";

// Los eventos por venir primero (del más cercano al más lejano), después los pasados
function ordenarCompras(compras) {
  return [...compras].sort((a, b) => {
    const pasoA = yaPaso(a.evento.fecha);
    const pasoB = yaPaso(b.evento.fecha);
    if (pasoA !== pasoB) return pasoA ? 1 : -1;
    return new Date(a.evento.fecha) - new Date(b.evento.fecha);
  });
}

// Cuántas compras hay en cada estado, en el orden de ESTADOS (solo los presentes)
function contarPorEstado(compras) {
  return Object.keys(ESTADOS)
    .map((estado) => ({ estado, cantidad: compras.filter((c) => c.estado === estado).length }))
    .filter(({ cantidad }) => cantidad > 0);
}

export function MisComprasScreen({ navigation }) {
  const { usuario } = useUsuario();
  // estados que el usuario eligió ocultar (ej: las ya utilizadas)
  const [ocultos, setOcultos] = useState(() => new Set());
  const { datos, cargando, error, recargar } = useCargar(
    () => usuariosApi.compras(usuario.id),
    [usuario.id],
  );

  if (cargando && !datos) return <Cargando texto="Cargando tus compras..." />;
  if (error && !datos) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  const alternarEstado = (estado) => {
    setOcultos((previo) => {
      const nuevo = new Set(previo);
      if (nuevo.has(estado)) nuevo.delete(estado);
      else nuevo.add(estado);
      return nuevo;
    });
  };

  const conteo = contarPorEstado(datos);
  const visibles = ordenarCompras(datos.filter((c) => !ocultos.has(c.estado)));

  return (
    <View style={estilos.pantalla}>
      {conteo.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={estilos.filtrosScroll}
          contentContainerStyle={estilos.filtros}
        >
          {conteo.map(({ estado, cantidad }) => (
            <ChipCategoria
              key={estado}
              etiqueta={`${ESTADOS[estado].etiqueta} (${cantidad})`}
              activa={!ocultos.has(estado)}
              onPress={() => alternarEstado(estado)}
            />
          ))}
        </ScrollView>
      ) : null}

      <FlatList
        data={visibles}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={estilos.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
        ListEmptyComponent={
          datos.length === 0 ? (
            <Vacio titulo="Todavía no compraste entradas" detalle="Explorá los eventos y elegí el tuyo" />
          ) : (
            <Vacio
              titulo="No hay compras con los estados seleccionados"
              detalle="Tocá los filtros de arriba para volver a mostrarlas"
            />
          )
        }
        renderItem={({ item }) => (
          <CompraCard compra={item} onPress={() => navigation.navigate("CompraDetalle", { id: item.id })} />
        )}
      />
    </View>
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
      <Text style={estilos.fecha}>
        <Text style={estilos.numero}>#{compra.id} · </Text>
        {formatearFecha(compra.evento.fecha)}
      </Text>
      <View style={estilos.fila}>
        <Text style={estilos.detalle}>
          {compra.tipoEntrada.nombre} × {compra.cantidad}
        </Text>
        <Text style={estilos.total}>{formatearPrecio(compra.total)}</Text>
      </View>
      {dias ? <Text style={estilos.dias}>{dias}</Text> : null}
      {compra.estado === "PENDIENTE" && compra.venceEn ? (
        <Text style={estilos.pendiente}>
          Vence en {minutosRestantes(compra.venceEn)} min · Tocá para pagar
        </Text>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  // flexGrow/flexShrink 0: que la fila de filtros no se estire ni se aplaste
  filtrosScroll: { flexGrow: 0, flexShrink: 0 },
  filtros: { paddingHorizontal: espaciado.m, paddingTop: espaciado.m, alignItems: "center" },
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
  numero: { fontWeight: "700" },
  detalle: { color: colores.texto },
  total: { fontWeight: "700", color: colores.texto },
  dias: { marginTop: espaciado.s, color: colores.primarioOscuro, fontWeight: "700" },
  pendiente: { marginTop: espaciado.s, color: colores.advertencia, fontWeight: "600", fontSize: 13 },
  error: { margin: espaciado.m },
});
