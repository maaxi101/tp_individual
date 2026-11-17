import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { UsuarioProvider } from "./src/context/UsuarioContext";
import { NavegacionPrincipal } from "./src/navigation/NavegacionPrincipal";
import { temaNavegacion } from "./src/theme";

export default function App() {
  return (
    <SafeAreaProvider>
      <UsuarioProvider>
        <NavigationContainer theme={temaNavegacion}>
          <NavegacionPrincipal />
        </NavigationContainer>
      </UsuarioProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
