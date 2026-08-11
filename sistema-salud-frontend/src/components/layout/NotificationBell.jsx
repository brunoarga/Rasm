import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/fechas';

function getInitial(n) {
  if (n.titulo?.includes('Turno')) return 'T';
  if (n.titulo?.includes('Estado')) return 'E';
  if (n.titulo?.includes('Deriv')) return 'D';
  if (n.pacienteNombre) return n.pacienteNombre.charAt(0).toUpperCase();
  return 'N';
}

function esCita(n) {
  return n.titulo?.toLowerCase().includes('turno')
    || n.titulo?.toLowerCase().includes('cita')
    || n.titulo?.toLowerCase().includes('deriv');
}

function esSolicitud(n) {
  return n.titulo?.toLowerCase().includes('solicitud')
    || (n.solicitudId && !esCita(n));
}

export default function NotificationBell({ onSolicitudClick, onTurnoClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notificaciones, noLeidas, marcarComoLeida } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ultimas = notificaciones.slice(0, 8);

  const handleClick = (n) => {
    if (!n.leida) marcarComoLeida(n.id);
    setOpen(false);

    if (esCita(n) && n.solicitudId) {
      if (user?.tipoUsuario === 'PROFESIONAL') {
        const esDerivacion = n.titulo?.toLowerCase().includes('deriv');
        navigate(esDerivacion ? `/profesional/solicitudes/${n.solicitudId}` : '/profesional/dashboard');
        return;
      }
      if (onTurnoClick) {
        onTurnoClick(n.solicitudId);
        return;
      }
    }

    if (esSolicitud(n) && n.solicitudId) {
      if (onSolicitudClick) {
        onSolicitudClick(n.solicitudId);
      } else {
        navigate(`/profesional/solicitudes/${n.solicitudId}`);
      }
      return;
    }

    if (n.solicitudId) {
      if (onSolicitudClick) {
        onSolicitudClick(n.solicitudId);
      } else {
        navigate(`/profesional/solicitudes/${n.solicitudId}`);
      }
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notificaciones"
        style={{
          position: 'relative', padding: 8, borderRadius: 10,
          border: '1px solid var(--color-stone)', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          transition: 'all 0.2s', color: 'var(--color-ink-light)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-stone)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 16, height: 16, borderRadius: 8,
            background: 'var(--color-brick)', color: '#fff',
            fontSize: 10, fontWeight: 700, lineHeight: '16px',
            textAlign: 'center', padding: '0 4px'
          }}>
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360, maxHeight: 440,
          background: '#fff', borderRadius: 14, zIndex: 9999,
          border: '1px solid var(--color-stone)',
          boxShadow: '0 8px 30px rgba(0,0,0,.12)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--color-stone)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>
              Notificaciones
            </span>
            {noLeidas > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--color-brick)',
                background: 'var(--color-brick-light)',
                padding: '2px 8px', borderRadius: 10
              }}>
                {noLeidas} no leídas
              </span>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 340 }}>
            {ultimas.length === 0 ? (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                fontSize: 13, color: 'var(--color-warm-gray)'
              }}>
                Sin notificaciones
              </div>
            ) : ultimas.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(n); } }}
                className="cursor-pointer hover:bg-slate-700/50 transition-colors"
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-stone)',
                  background: n.leida ? 'transparent' : 'color-mix(in srgb, var(--color-copper) 5%, transparent)'
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: n.leida ? 'var(--color-stone)' : 'var(--color-copper)',
                    color: n.leida ? 'var(--color-warm-gray)' : '#fff'
                  }}>
                    {getInitial(n)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {n.titulo}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--color-warm-gray)',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: 1.3, marginTop: 1
                    }}>
                      {n.mensaje}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-warm-gray)', marginTop: 3 }}>
                      {timeAgo(n.fechaEnvio)}
                    </div>
                  </div>
                  {!n.leida && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--color-copper)', marginTop: 6, flexShrink: 0
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {notificaciones.length > 0 && (
            <Link to="/notificaciones"
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '10px 16px', textAlign: 'center',
                borderTop: '1px solid var(--color-stone)',
                fontSize: 13, fontWeight: 600, color: 'var(--color-copper)',
                textDecoration: 'none', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-stone)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Ver todas las notificaciones
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
