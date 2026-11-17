import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { comprasApi } from "../api/comprasApi";
import { Boton, Cargando, EstadoBadge, MensajeError, Pantalla, Seccion } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado } from "../theme";
import { infoEstado } from "../utils/estados";
import {
  formatearFechaLarga,
  formatearPrecio,
  nombreCompleto,
  textoDiasParaEvento,
} from "../utils/formato";

// Detalle de una compra con su historial y las acciones que permite su estado
export function CompraDetalleScreen({ route, navigation }) {
  const { id, recienCreada } = route.params;
  const { usuario } = useUsuario();
  const [accionando, setAccionando] = useState(false);
  const [errorAccion, setErrorAccion] = useState(null);

  const { datos: compra, cargando, error, recargar } = useCargar(
    () => comprasApi.obtener(id),
    [id],
  );

  const ejecutar = async (accion) => {
    setAccionando(true);
    setErrorAccion(null);
    try {
      await accion();
      await recargar({ silencioso: true });
    } catch (e) {
      setErrorAccion(e.message);
    } finally {
      setAccionando(false);
    }
  };

  const confirmarCancelacion = () => {
    const reembolso = compra.estado === "CONFIRMADA";
    Alert.alert(
      "Cancelar compra",
      reembolso
        ? "Se cancelará la compra y se reembolsará el total. ¿Continuar?"
        : "Se cancelará la compra. ¿Continuar?",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar compra",
          style: "destructive",
          onPress: () => ejecutar(() => comprasApi.cancelar(id)),
        },
      ],
    );
  };

  if (cargando && !compra) return <Cargando />;
  if (error && !compra) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  const esComprador = compra.comprador.id === usuario.id;
  const esOrganizador = compra.evento.organizador.id === usuario.id;
  const dias = textoDiasParaEvento(compra.diasParaEvento);
  const chatTitulo = esComprador ? nombreCompleto(compra.evento.organizador) : nombreCompleto(compra.comprador);

  return (
    <Pantalla scroll>
      {recienCreada ? (
        <View style={estilos.exito}>
          <Text style={estilos.exitoTexto}>¡Compra registrada! Completá el pago para confirmarla.</Text>
        </View>
      ) : null}

      <View style={estilos.encabezado}>
        <Text style={estilos.nombre}>{compra.evento.nombre}</Text>
        <EstadoBadge estado={compra.estado} grande />
      </View>
      <Text style={estilos.fecha}>{formatearFechaLarga(compra.evento.fecha)}</Text>
      {dias ? <Text style={estilos.dias}>{dias}</Text> : null}

      <Seccion titulo="Detalle" style={estilos.seccion}>
        <Fila etiqueta="Comprador" valor={nombreCompleto(compra.comprador)} />
        <Fila etiqueta="Organizador" valor={nombreCompleto(compra.evento.organizador)} />
        <Fila etiqueta="Entrada" valor={`${compra.tipoEntrada.nombre} × ${compra.cantidad}`} />
        <Fila etiqueta="Precio unitario" valor={formatearPrecio(compra.tipoEntrada.precio)} />
        <Fila etiqueta="Total" valor={formatearPrecio(compra.total)} destacado />
      </Seccion>

      <MensajeError mensaje={errorAccion} />

      <View style={estilos.acciones}>
        {esComprador && compra.estado === "PENDIENTE" ? (
          <Boton
            titulo={`Pagar ${formatearPrecio(compra.total)}`}
            cargando={accionando}
            onPress={() => ejecutar(() => comprasApi.confirmar(id))}
          />
        ) : null}
        {esOrganizador && compra.estado === "CONFIRMADA" ? (
          <Boton
            titulo="Marcar entrada como utilizada"
            cargando={accionando}
            onPress={() => ejecutar(() => comprasApi.utilizar(id))}
          />
        ) : null}
        {esComprador && compra.puedeSerReseniada ? (
          <Boton
            titulo="Reseñar el evento"
            variante="secundario"
            onPress={() =>
              navigation.navigate("Reseniar", { compraId: id, eventoNombre: compra.evento.nombre })
            }
          />
        ) : null}
        <Boton
          titulo={`Chat con ${chatTitulo}`}
          variante="secundario"
          onPress={() => navigation.navigate("Chat", { compraId: id, titulo: chatTitulo })}
        />
        {esComprador && compra.puedeCancelarse ? (
          <Boton
            titulo="Cancelar compra"
            variante="peligro"
            deshabilitado={accionando}
            onPress={confirmarCancelacion}
          />
        ) : null}
      </View>

      <Seccion titulo="Historial">
        {compra.historial.map((cambio, i) => {
          const info = infoEstado(cambio.estado);
          return (
            <View key={i} style={estilos.historialFila}>
              <View style={[estilos.punto, { backgroundColor: info.color }]} />
              <View style={estilos.historialTexto}>
                <Text style={[estilos.historialEstado, { color: info.color }]}>{info.etiqueta}</Text>
                <Text style={estilos.historialDetalle}>
                  {nombreCompleto(cambio.quien)} · {formatearFechaLarga(cambio.fechaHora)}
                </Text>
              </View>
            </View>
          );
        })}
      </Seccion>
    </Pantalla>
  );
}

function Fila({ etiqueta, valor, destacado }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.filaValor, destacado && estilos.filaDestacada]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  exito: {
    backgroundColor: colores.primarioClaro,
    padding: espaciado.m,
    borderRadius: 12,
    marginBottom: espaciado.m,
  },
  exitoTexto: { color: colores.primarioOscuro, fontWeight: "600" },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  nombre: { fontSize: 22, fontWeight: "800", color: colores.texto, flex: 1, marginRight: espaciado.s },
  fecha: { color: colores.textoSecundario, marginTop: 4 },
  dias: { color: colores.primarioOscuro, fontWeight: "700", fontSize: 16, marginTop: 4 },
  seccion: { marginTop: espaciado.m },
  fila: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  filaEtiqueta: { color: colores.textoSecundario },
  filaValor: { color: colores.texto, fontWeight: "500" },
  filaDestacada: { fontWeight: "800", fontSize: 16 },
  acciones: { gap: espaciado.s, marginBottom: espaciado.m },
  historialFila: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 6 },
  punto: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: espaciado.s },
  historialTexto: { flex: 1 },
  historialEstado: { fontWeight: "700" },
  historialDetalle: { color: colores.textoSecundario, fontSize: 12 },
  error: { margin: espaciado.m },
});
