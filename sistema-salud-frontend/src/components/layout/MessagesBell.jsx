import React from 'react';
import { Link } from 'react-router-dom';
import useMensajes from '../../hooks/useMensajes';

export default function MessagesBell() {
  const { noLeidos } = useMensajes();

  return (
    <Link
      to="/mensajes"
      aria-label="Mensajes"
      title="Mensajes"
      style={{
        position: 'relative', padding: 8, borderRadius: 10,
        border: '1px solid var(--color-stone)', background: 'transparent',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        transition: 'all 0.2s', color: 'var(--color-ink-light)'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-stone)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {noLeidos > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2,
          minWidth: 16, height: 16, borderRadius: 8,
          background: 'var(--color-brick)', color: '#fff',
          fontSize: 10, fontWeight: 700, lineHeight: '16px',
          textAlign: 'center', padding: '0 4px'
        }}>
          {noLeidos > 99 ? '99+' : noLeidos}
        </span>
      )}
    </Link>
  );
}
