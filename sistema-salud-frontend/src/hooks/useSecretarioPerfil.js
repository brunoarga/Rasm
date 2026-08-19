import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useSecretarioPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const recargar = useCallback(() => {
    setLoading(true);
    api.get('/solicitudes/perfil-secretario')
      .then(r => setPerfil(r.data || null))
      .catch(() => setPerfil(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { perfil, loading, recargar };
}