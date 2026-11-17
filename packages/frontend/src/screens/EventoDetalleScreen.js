import { Ionicons } from "@expo/vector-icons";
import { useLayoutEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { eventosApi } from "../api/eventosApi";
import { usuariosApi } from "../api/usuariosApi";
import {
  Boton,
  Cargando,
  Estrellas,
  MensajeError,
  Pantalla,
  ReseniaItem,
  Seccion,
  TipoEntradaItem,
} from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { useCargar } from "../hooks/useCargar";
import { colores, espaciado, radio } from "../theme";
import { formatearFechaLarga, nombreCompleto, yaPaso } from "../utils/formato";

export function EventoDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useUsuario();
  const [cambiandoFavorito, setCambiandoFavorito] = useState(false);

  const { datos, cargando, error, recargar } = useCargar(async () => {
    const [evento, favoritos] = await Promise.all([
      eventosApi.obtener(id),
      usuariosApi.favoritos(usuario.id),
    ]);
    return { evento, esFavorito: favoritos.some((f) => f.id === id) };
  }, [id, usuario.id]);

  const alternarFavorito = async () => {
    if (!datos) return;
    setCambiandoFavorito(true);
    try {
      if (datos.esFavorito) {
        await usuariosApi.quitarFavorito(usuario.id, id);
      } else {
        await usuariosApi.agregarFavorito(usuario.id, id);
      }
      await recargar({ silencioso: true });
    } finally {
      setCambiandoFavorito(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: datos?.evento.nombre ?? "Evento",
      headerRight: () => (
        <Pressable onPress={alternarFavorito} disabled={cambiandoFavorito} hitSlop={10}>
          <Ionicons
            name={datos?.esFavorito ? "heart" : "heart-outline"}
            size={26}
            color={datos?.esFavorito ? colores.peligro : colores.primarioOscuro}
          />
        </Pressable>
      ),
    });
  }, [navigation, datos, cambiandoFavorito]);

  if (cargando && !datos) return <Cargando />;
  if (error && !datos) return <MensajeError mensaje={error} onReintentar={recargar} style={estilos.error} />;

  const { evento } = datos;
  const pasado = yaPaso(evento.fecha);
  const esOrganizador = evento.organizador.id === usuario.id;
  const hayCupo = evento.tiposEntrada.some((t) => t.cupoDisponible > 0);
  const imagen = evento.multimedia?.[0];

  return (
    <Pantalla scroll sinPadding>
      {imagen ? <Image source={{ uri: imagen }} style={estilos.imagen} /> : null}
      <View style={estilos.contenido}>
        <Text style={estilos.categoria}>{evento.categoria.nombre}</Text>
        <Text style={estilos.nombre}>{evento.nombre}</Text>
        <Text style={estilos.fecha}>{formatearFechaLarga(evento.fecha)}</Text>
        <Text style={estilos.descripcion}>{evento.descripcion}</Text>

        <Seccion titulo="Organizador">
          <Text style={estilos.organizador}>{nombreCompleto(evento.organizador)}</Text>
          {evento.puntajeOrganizador != null ? (
            <View style={estilos.puntajeFila}>
              <Estrellas valor={evento.puntajeOrganizador} />
              <Text style={estilos.puntajeTexto}>
                {evento.puntajeOrganizador} · {evento.resenias.length} reseñas
              </Text>
            </View>
          ) : (
            <Text style={estilos.sinResenias}>Todavía no tiene reseñas</Text>
          )}
        </Seccion>

        <Seccion titulo="Entradas">
          {evento.tiposEntrada.map((tipo) => (
            <TipoEntradaItem key={tipo.id} tipo={tipo} />
          ))}
        </Seccion>

        {esOrganizador ? (
          <Boton
            titulo="Ver compras del evento"
            variante="secundario"
            onPress={() => navigation.navigate("ComprasDeEvento", { id })}
          />
        ) : pasado ? (
          <Text style={estilos.aviso}>Este evento ya se realizó</Text>
        ) : !hayCupo ? (
          <Text style={estilos.aviso}>Entradas agotadas</Text>
        ) : (
          <Boton
            titulo="Comprar entradas"
            onPress={() => navigation.navigate("Comprar", { evento })}
          />
        )}

        <Seccion titulo="Reseñas de eventos anteriores" style={estilos.resenias}>
          {evento.resenias.length === 0 ? (
            <Text style={estilos.sinResenias}>Este organizador aún no recibió reseñas</Text>
          ) : (
            evento.resenias.map((r) => <ReseniaItem key={r.id} resenia={r} />)
          )}
        </Seccion>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  imagen: { width: "100%", height: 220 },
  contenido: { padding: espaciado.m, paddingBottom: espaciado.xl },
  categoria: {
    color: colores.primarioOscuro,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  nombre: { fontSize: 26, fontWeight: "800", color: colores.texto, marginTop: 4 },
  fecha: { color: colores.textoSecundario, marginTop: 4, fontSize: 15 },
  descripcion: { color: colores.texto, marginVertical: espaciado.m, lineHeight: 22 },
  organizador: { fontSize: 16, fontWeight: "600", color: colores.texto },
  puntajeFila: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  puntajeTexto: { marginLeft: espaciado.s, color: colores.textoSecundario },
  sinResenias: { color: colores.textoSecundario },
  aviso: {
    textAlign: "center",
    color: colores.textoSecundario,
    padding: espaciado.m,
    backgroundColor: colores.superficie,
    borderRadius: radio.m,
  },
  resenias: { marginTop: espaciado.m },
  error: { margin: espaciado.m },
});
