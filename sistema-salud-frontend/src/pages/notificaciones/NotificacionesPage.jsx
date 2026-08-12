import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import { parsearFechaLocal } from '../../utils/fechas';

function iconoNotificacion(n) {
  if (n.postId) return 'F';
  if (n.titulo?.includes('Turno')) return 'T';
  if (n.titulo?.includes('Deriv')) return 'D';
  if (n.titulo?.includes('Estado')) return 'E';
  return 'N';
}

export default function NotificacionesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notificaciones, noLeidas, marcarComoLeida } = useNotifications();

  const backLink = !user ? '/' :
    user.tipoUsuario === 'PACIENTE' ? '/mi-espacio' :
    user.tipoUsuario === 'PROFESIONAL' ? '/profesional/dashboard' :
    user.tipoUsuario === 'SECRETARIO' ? '/secretaria/dashboard' : '/';

  const abrirNotificacion = (n) => {
    if (!n.leida) marcarComoLeida(n.id);
    if (n.postId && user?.tipoUsuario === 'PACIENTE') navigate(`/foro/${n.postId}`);
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <Link to={backLink} className="back-link" style={{ marginBottom: '0.5rem' }}>&larr; Volver</Link>

      <div className="dashboard-header" style={{ marginBottom: '0.25rem' }}>
        <h1 className="dashboard-header__title">Notificaciones</h1>
        {noLeidas > 0 && (
          <span className="badge-salud badge-salud--brick" style={{ fontSize: 12 }}>
            {noLeidas} no leídas
          </span>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <p className="empty-state__text">No tenés notificaciones</p>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {notificaciones.map(n => (
            <div
              key={n.id}
              onClick={() => abrirNotificacion(n)}
              style={{
                display: 'flex', gap: 14, padding: '14px 18px',
                borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                background: n.leida ? '#fff' : 'color-mix(in srgb, var(--color-teal) 5%, transparent)',
                border: n.leida
                  ? '1px solid var(--color-stone)'
                  : '1px solid color-mix(in srgb, var(--color-teal) 20%, transparent)',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <span style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700,
                background: n.leida ? 'var(--color-stone)' : 'var(--color-teal)',
                color: n.leida ? 'var(--color-warm-gray)' : '#fff'
              }}>
                {iconoNotificacion(n)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>
                    {n.titulo}
                    {!n.leida && (
                      <span style={{
                        display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--color-teal)', marginLeft: 6, verticalAlign: 'middle'
                      }}></span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-warm-gray)', whiteSpace: 'nowrap' }}>
                    {parsearFechaLocal(n.fechaEnvio)?.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}
                  </span>
                </div>
                <p style={{
                  fontSize: 13, color: 'var(--color-ink-light)', margin: '4px 0 0',
                  lineHeight: 1.4
                }}>
                  {n.mensaje}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
