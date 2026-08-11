import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export default function useNotifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        api.get('/notificaciones'),
        api.get('/notificaciones/contar-no-leidas')
      ]);
      setNotificaciones(r1.data || []);
      setNoLeidas(r2.data?.cantidad ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  const marcarComoLeida = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return { notificaciones, noLeidas, marcarComoLeida, refresh: fetchAll };
}
