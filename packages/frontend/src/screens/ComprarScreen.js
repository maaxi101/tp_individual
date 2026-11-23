import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { comprasApi } from "../api/comprasApi";
import { Boton, MensajeError, Pantalla, Seccion, TipoEntradaItem } from "../components";
import { colores, espaciado, radio } from "../theme";
import { formatearFechaLarga, formatearPrecio } from "../utils/formato";

// Elegir tipo de entrada y cantidad (sin superar el cupo) y confirmar la compra
export function ComprarScreen({ route, navigation }) {
  const { evento } = route.params;
  const primeroConCupo = evento.tiposEntrada.find((t) => t.cupoDisponible > 0);
  const [tipoId, setTipoId] = useState(primeroConCupo?.id ?? null);
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const tipo = evento.tiposEntrada.find((t) => t.id === tipoId);
  const maximo = tipo?.cupoDisponible ?? 0;
  const total = (tipo?.precio ?? 0) * cantidad;

  const elegirTipo = (nuevo) => {
    setTipoId(nuevo.id);
    setCantidad((c) => Math.min(c, nuevo.cupoDisponible));
    setError(null);
  };

  const comprar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const compra = await comprasApi.comprar({
        eventoId: evento.id,
        tipoEntradaId: tipoId,
        cantidad,
      });
      navigation.replace("CompraDetalle", { id: compra.id, recienCreada: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla scroll>
      <Text style={estilos.nombre}>{evento.nombre}</Text>
      <Text style={estilos.fecha}>{formatearFechaLarga(evento.fecha)}</Text>

      <Seccion titulo="Tipo de entrada" style={estilos.seccion}>
        {evento.tiposEntrada.map((t) => (
          <TipoEntradaItem
            key={t.id}
            tipo={t}
            seleccionado={t.id === tipoId}
            onPress={() => elegirTipo(t)}
          />
        ))}
      </Seccion>

      <Seccion titulo="Cantidad">
        <View style={estilos.stepper}>
          <Pressable
            onPress={() => setCantidad((c) => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            style={[estilos.stepperBoton, cantidad <= 1 && estilos.stepperInactivo]}
          >
            <Text style={estilos.stepperTexto}>−</Text>
          </Pressable>
          <Text style={estilos.cantidad}>{cantidad}</Text>
          <Pressable
            onPress={() => setCantidad((c) => Math.min(maximo, c + 1))}
            disabled={cantidad >= maximo}
            style={[estilos.stepperBoton, cantidad >= maximo && estilos.stepperInactivo]}
          >
            <Text style={estilos.stepperTexto}>+</Text>
          </Pressable>
        </View>
        <Text style={estilos.ayuda}>
          {maximo > 0 ? `Máximo ${maximo} para este tipo de entrada` : "Sin cupo disponible"}
        </Text>
      </Seccion>

      <View style={estilos.resumen}>
        <Text style={estilos.resumenTexto}>
          {tipo?.nombre} × {cantidad}
        </Text>
        <Text style={estilos.total}>{formatearPrecio(total)}</Text>
      </View>

      <MensajeError mensaje={error} />

      <Boton
        titulo="Confirmar compra"
        onPress={comprar}
        cargando={enviando}
        deshabilitado={!tipo || maximo === 0}
      />
      <Text style={estilos.nota}>
        Las entradas quedan reservadas por unos minutos hasta que pagues. Si no pagás a
        tiempo, la reserva vence y las entradas se liberan.
      </Text>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  nombre: { fontSize: 22, fontWeight: "800", color: colores.texto },
  fecha: { color: colores.textoSecundario, marginBottom: espaciado.m },
  seccion: { marginTop: espaciado.s },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  stepperBoton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colores.primarioClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperInactivo: { opacity: 0.4 },
  stepperTexto: { fontSize: 26, color: colores.primarioOscuro, fontWeight: "700" },
  cantidad: { fontSize: 28, fontWeight: "800", marginHorizontal: espaciado.l, color: colores.texto },
  ayuda: { textAlign: "center", color: colores.textoSecundario, marginTop: espaciado.s, fontSize: 12 },
  resumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colores.superficie,
    borderRadius: radio.m,
    padding: espaciado.m,
    marginBottom: espaciado.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  resumenTexto: { fontSize: 16, color: colores.texto },
  total: { fontSize: 22, fontWeight: "800", color: colores.texto },
  nota: { textAlign: "center", color: colores.textoSecundario, fontSize: 12, marginTop: espaciado.m },
});
