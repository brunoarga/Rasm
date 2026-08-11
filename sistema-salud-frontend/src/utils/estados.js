export const ESTADO_SOLICITUD_LABEL = {
  CREADA: 'Nueva',
  REVISADA: 'Revisada',
  ASIGNADA: 'Asignado',
  EN_PROCESO: 'En consulta',
  DERIVADA: 'Derivado',
  COMPLETADA: 'Completado',
  CANCELADA: 'Cancelada',
};

export function estadoSolicitudHumano(estado) {
  return ESTADO_SOLICITUD_LABEL[estado] || estado || '—';
}

export function estadoSolicitudColor(estado) {
  switch (estado) {
    case 'ASIGNADA': return { bg: '#E8F0EC', color: '#3A7D5C' };
    case 'EN_PROCESO': return { bg: '#FEF3E9', color: '#D49A5A' };
    case 'COMPLETADA': return { bg: '#E8F0EC', color: '#3A7D5C' };
    case 'DERIVADA': return { bg: '#F0EBFA', color: '#7C3AED' };
    case 'CREADA':
    case 'REVISADA': return { bg: '#EEF2F7', color: '#64748B' };
    case 'CANCELADA': return { bg: '#FEF0EE', color: '#C44536' };
    default: return { bg: '#EEF2F7', color: '#64748B' };
  }
}
