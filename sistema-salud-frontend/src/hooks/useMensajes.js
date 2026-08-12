import { useState, useEffect, useCallback, useRef } from 'react';
import { obtenerConversaciones, contarNoLeidos } from '../services/mensajes';

export default function useMensajes() {
  const [conversaciones, setConversaciones] = useState([]);
  const [noLeidos, setNoLeidos] = useState(0);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const [data, noLeidosData] = await Promise.all([
        obtenerConversaciones(),
        contarNoLeidos(),
      ]);
      setConversaciones(data || []);
      setNoLeidos(noLeidosData || 0);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 30000);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  return { conversaciones, noLeidos, refresh };
}
