import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ChatScreen } from "../screens/ChatScreen";
import { CompraDetalleScreen } from "../screens/CompraDetalleScreen";
import { ComprarScreen } from "../screens/ComprarScreen";
import { ComprasDeEventoScreen } from "../screens/ComprasDeEventoScreen";
import { CrearEventoScreen } from "../screens/CrearEventoScreen";
import { EventoDetalleScreen } from "../screens/EventoDetalleScreen";
import { ExplorarScreen } from "../screens/ExplorarScreen";
import { FavoritosScreen } from "../screens/FavoritosScreen";
import { MisComprasScreen } from "../screens/MisComprasScreen";
import { MisEventosScreen } from "../screens/MisEventosScreen";
import { ReseniarScreen } from "../screens/ReseniarScreen";
import { colores } from "../theme";

const Stack = createNativeStackNavigator();

const opcionesComunes = {
  headerTintColor: colores.primarioOscuro,
  headerTitleStyle: { color: colores.texto, fontWeight: "700" },
  headerBackButtonDisplayMode: "minimal",
};

// Pantallas a las que se llega desde más de una tab (detalle de evento,
// compra, chat...). Se registran en cada stack que las necesita.
function pantallasCompartidas() {
  return (
    <>
      <Stack.Screen
        name="EventoDetalle"
        component={EventoDetalleScreen}
        options={{ title: "Evento" }}
      />
      <Stack.Screen
        name="Comprar"
        component={ComprarScreen}
        options={{ title: "Comprar entradas" }}
      />
      <Stack.Screen
        name="CompraDetalle"
        component={CompraDetalleScreen}
        options={{ title: "Compra" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
      <Stack.Screen
        name="Reseniar"
        component={ReseniarScreen}
        options={{ title: "Reseñar evento" }}
      />
      <Stack.Screen
        name="ComprasDeEvento"
        component={ComprasDeEventoScreen}
        options={{ title: "Compras del evento" }}
      />
    </>
  );
}

export function ExplorarStack() {
  return (
    <Stack.Navigator screenOptions={opcionesComunes}>
      <Stack.Screen name="Explorar" component={ExplorarScreen} options={{ title: "Explorar eventos" }} />
      {pantallasCompartidas()}
    </Stack.Navigator>
  );
}

export function FavoritosStack() {
  return (
    <Stack.Navigator screenOptions={opcionesComunes}>
      <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: "Favoritos" }} />
      {pantallasCompartidas()}
    </Stack.Navigator>
  );
}

export function ComprasStack() {
  return (
    <Stack.Navigator screenOptions={opcionesComunes}>
      <Stack.Screen name="MisCompras" component={MisComprasScreen} options={{ title: "Mis compras" }} />
      {pantallasCompartidas()}
    </Stack.Navigator>
  );
}

export function EventosStack() {
  return (
    <Stack.Navigator screenOptions={opcionesComunes}>
      <Stack.Screen name="MisEventos" component={MisEventosScreen} options={{ title: "Mis eventos" }} />
      <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ title: "Nuevo evento" }} />
      {pantallasCompartidas()}
    </Stack.Navigator>
  );
}
