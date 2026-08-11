import React, { useState } from 'react';
import api from '../../services/api';
import { ShieldCheck } from 'lucide-react';

function iniciales(nombre) {
  if (!nombre || nombre === 'Anónimo') return 'A';
  const partes = nombre.trim().split(/\s+/);
  const primer = partes[0]?.charAt(0) || '';
  const seg = partes.length > 1 ? partes[1].charAt(0) : '';
  return (primer + seg).toUpperCase();
}

export default function Avatar({ foto, nombre, anonimo = false, size = 36, className = '' }) {
  const [error, setError] = useState(false);
  const src = foto ? `${api.defaults.baseURL}/uploads/perfil/${foto}` : null;
  const mostrarImagen = !anonimo && src && !error;

  const base = `rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-black/10 dark:border-slate-600 ${className}`;
  const style = { width: size, height: size };

  if (mostrarImagen) {
    return (
      <span className={base} style={style}>
        <img
          src={src}
          alt={nombre || 'avatar'}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  if (anonimo) {
    return (
      <span className={`${base} bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400`} style={style}>
        <ShieldCheck style={{ width: size * 0.45, height: size * 0.45 }} />
      </span>
    );
  }

  return (
    <span className={`${base} bg-teal-medico/15 text-teal-medico`} style={style}>
      <span className="font-bold leading-none" style={{ fontSize: Math.max(11, Math.round(size * 0.36)) }}>
        {iniciales(nombre)}
      </span>
    </span>
  );
}
