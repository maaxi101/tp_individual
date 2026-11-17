import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { categoriasApi } from "../api/categoriasApi";
import { eventosApi } from "../api/eventosApi";
import { Boton, Campo, ChipCategoria, MensajeError, Pantalla, Seccion } from "../components";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { formatearFechaLarga } from "../utils/formato";

const tipoVacio = () => ({ nombre: "", descripcion: "", precio: "", cupo: "" });

function maniana21hs() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  fecha.setHours(21, 0, 0, 0);
  return fecha;
}

// Alta de un evento con sus tipos de entrada (precio y cupo por tipo)
export function CrearEventoScreen({ navigation }) {
  const categorias = useCargar(() => categoriasApi.listar(), []);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState(null);
  const [fecha, setFecha] = useState(maniana21hs);
  const [imagen, setImagen] = useState("");
  const [tipos, setTipos] = useState([tipoVacio()]);
  const [picker, setPicker] = useState(null); // "date" | "time" | null (Android)
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const alCambiarFecha = (evento, elegida) => {
    if (Platform.OS === "android") setPicker(null);
    if (evento.type === "dismissed" || !elegida) return;
    const nueva = new Date(fecha);
    if (Platform.OS === "ios" || picker === "date") {
      nueva.setFullYear(elegida.getFullYear(), elegida.getMonth(), elegida.getDate());
    }
    if (Platform.OS === "ios" || picker === "time") {
      nueva.setHours(elegida.getHours(), elegida.getMinutes(), 0, 0);
    }
    setFecha(nueva);
    // en Android se eligen fecha y hora en dos pasos
    if (Platform.OS === "android" && picker === "date") setPicker("time");
  };

  const actualizarTipo = (indice, campo, valor) => {
    setTipos((previos) => previos.map((t, i) => (i === indice ? { ...t, [campo]: valor } : t)));
  };

  const quitarTipo = (indice) => {
    setTipos((previos) => previos.filter((_, i) => i !== indice));
  };

  const crear = async () => {
    setEnviando(true);
    setError(null);
    try {
      await eventosApi.crear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        fecha: fecha.toISOString(),
        multimedia: imagen.trim() ? [imagen.trim()] : [],
        tiposEntrada: tipos.map((t) => ({
          nombre: t.nombre.trim(),
          descripcion: t.descripcion.trim(),
          precio: t.precio === "" ? undefined : Number(t.precio),
          cupo: t.cupo === "" ? undefined : Number(t.cupo),
        })),
      });
      Alert.alert("Evento creado", "Ya está publicado y a la venta.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla scroll>
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Noche de Rock Nacional" />
      <Campo
        etiqueta="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Contá de qué se trata el evento"
        multiline
      />

      <Text style={estilos.etiqueta}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.chips}>
        {(categorias.datos ?? []).map((c) => (
          <ChipCategoria
            key={c.id}
            etiqueta={c.nombre}
            activa={categoriaId === c.id}
            onPress={() => setCategoriaId(c.id)}
          />
        ))}
      </ScrollView>

      <Text style={estilos.etiqueta}>Fecha y hora</Text>
      {Platform.OS === "ios" ? (
        <View style={estilos.pickerIos}>
          <DateTimePicker value={fecha} mode="datetime" display="spinner" onChange={alCambiarFecha} />
        </View>
      ) : (
        <Pressable onPress={() => setPicker("date")} style={estilos.fechaBoton}>
          <Text style={estilos.fechaTexto}>{formatearFechaLarga(fecha)}</Text>
          <Text style={estilos.fechaCambiar}>Cambiar</Text>
        </Pressable>
      )}
      {Platform.OS === "android" && picker ? (
        <DateTimePicker value={fecha} mode={picker} is24Hour onChange={alCambiarFecha} />
      ) : null}

      <Campo
        etiqueta="Imagen (URL)"
        value={imagen}
        onChangeText={setImagen}
        placeholder="https://..."
        autoCapitalize="none"
        keyboardType="url"
        style={estilos.imagen}
      />

      <Seccion titulo="Tipos de entrada">
        {tipos.map((tipo, i) => (
          <View key={i} style={estilos.tipo}>
            <View style={estilos.tipoEncabezado}>
              <Text style={estilos.tipoTitulo}>Entrada {i + 1}</Text>
              {tipos.length > 1 ? (
                <Pressable onPress={() => quitarTipo(i)} hitSlop={8}>
                  <Text style={estilos.quitar}>Quitar</Text>
                </Pressable>
              ) : null}
            </View>
            <Campo
              placeholder="Nombre (General, Platea, VIP...)"
              value={tipo.nombre}
              onChangeText={(v) => actualizarTipo(i, "nombre", v)}
            />
            <Campo
              placeholder="Descripción (opcional)"
              value={tipo.descripcion}
              onChangeText={(v) => actualizarTipo(i, "descripcion", v)}
            />
            <View style={estilos.filaNumeros}>
              <Campo
                placeholder="Precio"
                value={tipo.precio}
                onChangeText={(v) => actualizarTipo(i, "precio", v)}
                keyboardType="numeric"
                style={estilos.numero}
              />
              <Campo
                placeholder="Cupo"
                value={tipo.cupo}
                onChangeText={(v) => actualizarTipo(i, "cupo", v)}
                keyboardType="numeric"
                style={[estilos.numero, estilos.numeroDerecha]}
              />
            </View>
          </View>
        ))}
        <Boton
          titulo="+ Agregar otro tipo de entrada"
          variante="texto"
          chico
          onPress={() => setTipos((previos) => [...previos, tipoVacio()])}
        />
      </Seccion>

      <MensajeError mensaje={error} />

      <Boton titulo="Publicar evento" onPress={crear} cargando={enviando} />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { fontSize: 14, fontWeight: "600", color: colores.texto, marginBottom: espaciado.xs },
  chips: { marginBottom: espaciado.m, flexGrow: 0 },
  pickerIos: {
    backgroundColor: colores.superficie,
    borderRadius: radio.m,
    marginBottom: espaciado.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  fechaBoton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: espaciado.m,
    marginBottom: espaciado.m,
  },
  fechaTexto: { fontSize: 16, color: colores.texto },
  fechaCambiar: { color: colores.primarioOscuro, fontWeight: "700" },
  imagen: { marginTop: 0 },
  tipo: {
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingBottom: espaciado.s,
    marginBottom: espaciado.m,
  },
  tipoEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: espaciado.s,
  },
  tipoTitulo: { fontWeight: "700", color: colores.texto },
  quitar: { color: colores.peligro, fontWeight: "600" },
  filaNumeros: { flexDirection: "row" },
  numero: { flex: 1, marginBottom: 0 },
  numeroDerecha: { marginLeft: espaciado.s },
});
