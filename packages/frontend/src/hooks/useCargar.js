import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

// Carga datos async cada vez que la pantalla toma foco (así al volver de
// "Comprar" o "Pagar" la lista ya está actualizada) y expone recargar().
// recargar({ silencioso: true }) actualiza sin mostrar el estado de carga.
export function useCargar(cargador, dependencias = []) {
  const [estado, setEstado] = useState({
    datos: null,
    cargando: true,
    error: null,
  });

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) {
        setEstado((previo) => ({ ...previo, cargando: true, error: null }));
      }
      try {
        const datos = await cargador();
        setEstado({ datos, cargando: false, error: null });
      } catch (error) {
        setEstado((previo) => ({
          ...previo,
          cargando: false,
          error: error.message,
        }));
      }
    },
    dependencias,
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  return { ...estado, recargar: cargar };
}
