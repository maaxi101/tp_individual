import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { categoriasApi } from "../api/categoriasApi";
import { eventosApi } from "../api/eventosApi";
import { Cargando, ChipCategoria, EventoCard, MensajeError, Vacio } from "../components";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";

const ORDENES = [
  { clave: "fecha", etiqueta: "Fecha" },
  { clave: "precio", etiqueta: "Precio" },
  { clave: "puntaje", etiqueta: "Puntaje" },
];

// Búsqueda textual, filtro por categoría y orden por precio/fecha/puntaje
export function ExplorarScreen({ navigation }) {
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState(null);
  const [orden, setOrden] = useState(null);
  const [dir, setDir] = useState("asc");

  // espera a que el usuario deje de escribir antes de consultar
  useEffect(() => {
    const timer = setTimeout(() => setBusqueda(texto.trim()), 400);
    return () => clearTimeout(timer);
  }, [texto]);

  const categorias = useCargar(() => categoriasApi.listar(), []);
  const eventos = useCargar(
    () =>
      eventosApi.buscar({
        q: busqueda || undefined,
        categoria: categoriaId ?? undefined,
        orden: orden ?? undefined,
        dir: orden ? dir : undefined,
      }),
    [busqueda, categoriaId, orden, dir],
  );

  // tocar un orden inactivo lo activa; tocarlo activo invierte la dirección;
  // tocarlo en desc lo apaga
  const alternarOrden = (clave) => {
    if (orden !== clave) {
      setOrden(clave);
      setDir("asc");
    } else if (dir === "asc") {
      setDir("desc");
    } else {
      setOrden(null);
      setDir("asc");
    }
  };

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.buscador}>
        <Ionicons name="search" size={18} color={colores.textoSecundario} />
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Buscar eventos..."
          placeholderTextColor={colores.textoSecundario}
          style={estilos.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={estilos.chipsScroll}
        contentContainerStyle={estilos.chips}
      >
        <ChipCategoria
          etiqueta="Todas"
          activa={categoriaId === null}
          onPress={() => setCategoriaId(null)}
        />
        {(categorias.datos ?? []).map((c) => (
          <ChipCategoria
            key={c.id}
            etiqueta={c.nombre}
            activa={categoriaId === c.id}
            onPress={() => setCategoriaId(categoriaId === c.id ? null : c.id)}
          />
        ))}
      </ScrollView>

      <View style={estilos.ordenFila}>
        <Text style={estilos.ordenEtiqueta}>Ordenar:</Text>
        {ORDENES.map((o) => (
          <ChipCategoria
            key={o.clave}
            etiqueta={orden === o.clave ? `${o.etiqueta} ${dir === "asc" ? "↑" : "↓"}` : o.etiqueta}
            activa={orden === o.clave}
            onPress={() => alternarOrden(o.clave)}
          />
        ))}
      </View>

      {eventos.cargando && !eventos.datos ? (
        <Cargando texto="Buscando eventos..." />
      ) : eventos.error ? (
        <MensajeError mensaje={eventos.error} onReintentar={eventos.recargar} style={estilos.error} />
      ) : (
        <FlatList
          data={eventos.datos}
          keyExtractor={(e) => String(e.id)}
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl refreshing={eventos.cargando} onRefresh={eventos.recargar} />
          }
          ListEmptyComponent={
            <Vacio titulo="No hay eventos" detalle="Probá con otra búsqueda o categoría" />
          }
          renderItem={({ item }) => (
            <EventoCard
              evento={item}
              onPress={() => navigation.navigate("EventoDetalle", { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.superficie,
    marginHorizontal: espaciado.m,
    marginTop: espaciado.m,
    paddingHorizontal: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  input: { flex: 1, paddingVertical: 12, paddingLeft: espaciado.s, fontSize: 16, color: colores.texto },
  // sin esto el ScrollView toma flex: se estira con pocos eventos y se aplasta con muchos
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: espaciado.m, paddingVertical: espaciado.m, alignItems: "center" },
  ordenFila: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espaciado.m,
    paddingBottom: espaciado.s,
  },
  ordenEtiqueta: { color: colores.textoSecundario, marginRight: espaciado.s, fontSize: 13 },
  lista: { padding: espaciado.m, paddingTop: espaciado.s },
  error: { marginHorizontal: espaciado.m },
});
