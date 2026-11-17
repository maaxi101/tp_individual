import axios from "axios";
import Constants from "expo-constants";

const PUERTO_BACKEND = 8000;

// En desarrollo, Expo conoce la IP de la PC que corre Metro: el backend
// corre en esa misma máquina, así que el celular puede apuntar ahí.
function urlBase() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(":")[0] ?? "localhost";
  return `http://${host}:${PUERTO_BACKEND}`;
}

export const API_URL = urlBase();

export const cliente = axios.create({ baseURL: API_URL, timeout: 10000 });

// No hay login: el usuario elegido viaja en el header x-user-id
let usuarioActualId = null;
export function establecerUsuarioActual(id) {
  usuarioActualId = id;
}

cliente.interceptors.request.use((config) => {
  if (usuarioActualId) {
    config.headers["x-user-id"] = String(usuarioActualId);
  }
  return config;
});

// Devuelve directamente el body y convierte los errores en Error(mensaje)
cliente.interceptors.response.use(
  (respuesta) => respuesta.data,
  (error) => {
    let mensaje;
    if (error.response) {
      mensaje = error.response.data?.error ?? `Error ${error.response.status}`;
    } else {
      mensaje = `No se pudo conectar con el servidor (${API_URL}). ¿Está corriendo el backend y el celular en la misma red?`;
    }
    const errorApi = new Error(mensaje);
    errorApi.status = error.response?.status;
    return Promise.reject(errorApi);
  },
);
