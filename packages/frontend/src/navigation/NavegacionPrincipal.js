import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Cargando } from "../components";
import { useUsuario } from "../context/UsuarioContext";
import { SeleccionarUsuarioScreen } from "../screens/SeleccionarUsuarioScreen";
import { Tabs } from "./Tabs";

const Stack = createNativeStackNavigator();

// Sin usuario elegido se muestra la pantalla de selección; con usuario, las tabs
export function NavegacionPrincipal() {
  const { usuario, restaurando } = useUsuario();

  if (restaurando) {
    return <Cargando texto="Iniciando..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <Stack.Screen name="Principal" component={Tabs} />
      ) : (
        <Stack.Screen name="SeleccionarUsuario" component={SeleccionarUsuarioScreen} />
      )}
    </Stack.Navigator>
  );
}
