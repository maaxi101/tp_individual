import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { establecerUsuarioActual } from "../api/cliente";

const CLAVE_USUARIO = "aiticketit.usuario";

const UsuarioContext = createContext(null);

// Guarda qué usuario está usando la app. No hay login real: el id viaja
// en el header x-user-id de cada request (ver api/cliente.js).
export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [restaurando, setRestaurando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_USUARIO)
      .then((guardado) => {
        if (guardado) {
          const restaurado = JSON.parse(guardado);
          establecerUsuarioActual(restaurado.id);
          setUsuario(restaurado);
        }
      })
      .catch(() => {})
      .finally(() => setRestaurando(false));
  }, []);

  const seleccionarUsuario = useCallback(async (elegido) => {
    establecerUsuarioActual(elegido.id);
    setUsuario(elegido);
    await AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(elegido));
  }, []);

  const salir = useCallback(async () => {
    establecerUsuarioActual(null);
    setUsuario(null);
    await AsyncStorage.removeItem(CLAVE_USUARIO);
  }, []);

  const valor = useMemo(
    () => ({ usuario, restaurando, seleccionarUsuario, salir }),
    [usuario, restaurando, seleccionarUsuario, salir],
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario debe usarse dentro de UsuarioProvider");
  }
  return contexto;
}
