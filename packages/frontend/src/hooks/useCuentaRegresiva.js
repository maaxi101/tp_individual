import { useEffect, useState } from "react";

// Milisegundos que faltan para `venceEn` (fecha ISO que manda el backend).
// Siempre se calcula contra esa fecha y no con un timer propio de N minutos:
// si el usuario cierra la app y vuelve, el tiempo mostrado sigue siendo correcto.
// Devuelve null si no hay fecha.
export function useCuentaRegresiva(venceEn) {
  const calcular = () => (venceEn ? new Date(venceEn) - Date.now() : null);
  const [restante, setRestante] = useState(calcular);

  useEffect(() => {
    if (!venceEn) {
      setRestante(null);
      return undefined;
    }
    setRestante(calcular());
    const timer = setInterval(() => setRestante(calcular()), 1000);
    return () => clearInterval(timer);
  }, [venceEn]);

  return restante;
}
