import React, { useState, useRef, useEffect } from 'react';
import { REACCIONES_FACEBOOK } from '../../constants/foro';

export default function ReaccionesComentario({ activo, conteos, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [hoverPopup, setHoverPopup] = useState(false);
  const timerRef = useRef(null);

  const reaccionActiva = REACCIONES_FACEBOOK.find(r => r.tipo === activo) || REACCIONES_FACEBOOK[0];
  const total = Object.values(conteos || {}).reduce((acc, n) => acc + (n || 0), 0);

  const mostrarPopup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHoverPopup(true);
    setAbierto(true);
  };

  const ocultarPopup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!hoverPopup) setAbierto(false);
    }, 250);
  };

  const entrarPopup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHoverPopup(true);
  };

  const salirPopup = () => {
    setHoverPopup(false);
    setAbierto(false);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const seleccionar = (tipo) => {
    setAbierto(false);
    setHoverPopup(false);
    onCambiar(tipo);
  };

  return (
    <div className="relative inline-flex items-center" onMouseLeave={ocultarPopup}>
      {/* Popup de reacciones */}
      <div
        className={`absolute bottom-full left-0 mb-2 z-20 origin-bottom transition-all duration-200 ${
          abierto ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        onMouseEnter={entrarPopup}
        onMouseLeave={salirPopup}
      >
        <div className="flex items-center gap-0.5 rounded-full bg-white dark:bg-slate-700 shadow-xl border border-slate-200 dark:border-slate-600 px-1.5 py-1.5">
          {REACCIONES_FACEBOOK.map(r => (
            <button
              key={r.tipo}
              type="button"
              onClick={() => seleccionar(r.tipo)}
              className="relative group flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-150 hover:scale-125 hover:-translate-y-1.5"
              aria-label={r.label}
            >
              <span className="text-[22px] leading-none">{r.emoji}</span>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-white bg-slate-800 rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
                {r.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex justify-center -mt-1">
          <div className="w-2.5 h-2.5 rotate-45 bg-white dark:bg-slate-700 border-r border-b border-slate-200 dark:border-slate-600 -mt-0.5" />
        </div>
      </div>

      {/* Botón principal */}
      <button
        type="button"
        onClick={() => onCambiar(reaccionActiva.tipo)}
        onMouseEnter={mostrarPopup}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
          activo
            ? 'border-teal-medico/30 bg-teal-medico/10'
            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-teal-medico/40 hover:text-teal-medico'
        }`}
      >
        <span className="text-sm leading-none">{reaccionActiva.emoji}</span>
        <span>{total}</span>
        <span className="hidden sm:inline" style={activo ? { color: reaccionActiva.color } : undefined}>
          {reaccionActiva.label}
        </span>
      </button>
    </div>
  );
}
