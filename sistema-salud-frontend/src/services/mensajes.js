import api from './api';

export async function obtenerConversaciones() {
  const r = await api.get('/mensajes/conversaciones');
  return r.data || [];
}

export async function obtenerConversacion(id) {
  const r = await api.get(`/mensajes/conversaciones/${id}`);
  return r.data;
}

export async function enviarMensaje(id, contenido) {
  const r = await api.post(`/mensajes/conversaciones/${id}/mensajes`, { contenido });
  return r.data;
}

export async function contarNoLeidos() {
  const r = await api.get('/mensajes/no-leidos');
  return r.data?.cantidad ?? 0;
}
