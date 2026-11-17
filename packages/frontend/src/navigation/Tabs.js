import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { PerfilScreen } from "../screens/PerfilScreen";
import { colores } from "../theme";
import { ComprasStack, EventosStack, ExplorarStack, FavoritosStack } from "./stacks";

const Tab = createBottomTabNavigator();

const ICONOS = {
  ExplorarTab: ["search", "search-outline"],
  FavoritosTab: ["heart", "heart-outline"],
  ComprasTab: ["ticket", "ticket-outline"],
  EventosTab: ["calendar", "calendar-outline"],
  PerfilTab: ["person", "person-outline"],
};

export function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name === "PerfilTab",
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarIcon: ({ focused, color, size }) => {
          const [activo, inactivo] = ICONOS[route.name];
          return <Ionicons name={focused ? activo : inactivo} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ExplorarTab" component={ExplorarStack} options={{ title: "Explorar" }} />
      <Tab.Screen name="FavoritosTab" component={FavoritosStack} options={{ title: "Favoritos" }} />
      <Tab.Screen name="ComprasTab" component={ComprasStack} options={{ title: "Mis compras" }} />
      <Tab.Screen name="EventosTab" component={EventosStack} options={{ title: "Mis eventos" }} />
      <Tab.Screen name="PerfilTab" component={PerfilScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}
