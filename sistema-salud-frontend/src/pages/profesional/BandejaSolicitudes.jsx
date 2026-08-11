import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, CalendarClock, ClipboardList, Info, X } from 'lucide-react';
import api from '../../services/api';
import { parsearFechaLocal, formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { estadoSolicitudHumano, estadoSolicitudColor } from '../../utils/estados';

const PRIORIDAD_STYLE = {
  URGENTE: { bg: '#FEF0EE', color: '#C44536' },
  ALTA: { bg: '#FEF3E9', color: '#D49A5A' },
  MEDIA: { bg: '#E8F0EC', color: '#3A7D5C' },
  BAJA: { bg: '#EEF2F7', color: '#64748B' },
};

const FILTROS = ['Pendientes', 'Hoy', 'Completadas', 'Todas'];

const TERMINADA = ['COMPLETADA', 'DERIVADA', 'CANCELADA'];

function esHoy(fecha) {
  if (!fecha) return false;
  const d = parsearFechaLocal(fecha);
  if (!d) return false;
  const hoy = new Date();
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
}

export default function BandejaSolicitudes() {
  const [sols, setSols] = useState([]);
  const [filtro, setFiltro] = useState('Pendientes');
  const [guiaVisible, setGuiaVisible] = useState(() => localStorage.getItem('guia-profesional') !== 'oculta');

  useEffect(() => {
    api.get('/solicitudes/profesional/todas').then(r => setSols(r.data || [])).catch(() => {});
  }, []);

  const cerrarGuia = () => { setGuiaVisible(false); localStorage.setItem('guia-profesional', 'oculta'); };

  const contar = (f) => {
    if (f === 'Pendientes') return sols.filter(s => !TERMINADA.includes(s.estado)).length;
    if (f === 'Hoy') return sols.filter(s => esHoy(s.fechaTurno)).length;
    if (f === 'Completadas') return sols.filter(s => s.estado === 'COMPLETADA').length;
    return sols.length;
  };

  const filtradas = filtro === 'Pendientes' ? sols.filter(s => !TERMINADA.includes(s.estado))
    : filtro === 'Hoy' ? sols.filter(s => esHoy(s.fechaTurno))
    : filtro === 'Completadas' ? sols.filter(s => s.estado === 'COMPLETADA')
    : sols;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>
              Mis Solicitudes
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#7C7F85' }}>
              Pacientes derivados a su consulta
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F6F4F0', color: '#7C7F85' }}>
            {filtradas.length} solicitudes
          </span>
        </div>

        {/* Guía rápida de cómo funciona */}
        {guiaVisible && (
          <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: '#E4D8C4', backgroundColor: '#FBF6EC' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3E7D0' }}>
                <Info className="w-4 h-4" style={{ color: '#B07C2E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-1.5" style={{ color: '#1E293B' }}>Cómo funciona mi consultorio</p>
                <ol className="text-xs sm:text-sm space-y-1" style={{ color: '#5B5F66', lineHeight: 1.5 }}>
                  <li><strong style={{ color: '#1E293B' }}>1.</strong> La secretaría te asigna el turno del paciente y aparece en esta lista.</li>
                  <li><strong style={{ color: '#1E293B' }}>2.</strong> Abrís el caso, registrás la evolución y la ficha queda guardada.</li>
                  <li><strong style={{ color: '#1E293B' }}>3.</strong> Al finalizar la consulta el caso queda completado; si hace falta, lo derivás a otro profesional o centro.</li>
                </ol>
              </div>
              <button onClick={cerrarGuia} aria-label="Cerrar guía"
                className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: '#7C7F85' }} />
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
              style={{
                backgroundColor: filtro === f ? '#C44536' : 'white',
                color: filtro === f ? 'white' : '#7C7F85',
                border: filtro === f ? '1px solid #C44536' : '1px solid #E8E4DF',
              }}>
              {f}
              <span className="ml-1 opacity-70">({contar(f)})</span>
            </button>
          ))}
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: '#E8E4DF' }}>
            <ClipboardList className="w-9 h-9 mx-auto mb-3" style={{ color: '#D0CCC6' }} />
            <p className="text-sm" style={{ color: '#7C7F85' }}>
              {filtro === 'Pendientes' ? 'No tenés solicitudes pendientes.' :
               filtro === 'Hoy' ? 'No tenés turnos para hoy.' :
               filtro === 'Completadas' ? 'Todavía no completaste ninguna solicitud.' :
               'No hay solicitudes.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(s => <SolicitudCard key={s.id} solicitud={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SolicitudCard({ solicitud: s }) {
  const pStyle = PRIORIDAD_STYLE[s.prioridad] || PRIORIDAD_STYLE.MEDIA;
  const eStyle = estadoSolicitudColor(s.estado);
  const urgente = s.prioridad === 'URGENTE' || s.prioridad === 'ALTA';
  const diff = s.fechaCreacion ? Math.floor((Date.now() - (parsearFechaLocal(s.fechaCreacion)?.getTime() || Date.now())) / 3600000) : null;

  return (
    <div className="rounded-2xl border bg-white transition-all hover:shadow-sm" style={{ borderColor: urgente ? '#F1B8AC' : '#E8E4DF' }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>{s.titulo}</h3>
              {urgente && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FEF0EE', color: '#C44536' }}>
                  <AlertTriangle className="w-2.5 h-2.5" /> URGENTE
                </span>
              )}
            </div>
            <p className="text-sm line-clamp-2 mb-2" style={{ color: '#5B5F66' }}>{s.descripcion}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: '#7C7F85' }}>
              <span className="font-semibold" style={{ color: '#1E293B' }}>{s.nombrePaciente}</span>
              <span className="text-slate-300">·</span>
              <span>{s.nombreCategoria}</span>
              <span className="text-slate-300">·</span>
              <span>{formatearFecha(s.fechaCreacion)}</span>
              {diff !== null && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className={diff > 48 ? 'font-semibold' : ''} style={diff > 48 ? { color: '#C44536' } : undefined}>{diff}h</span>
                </>
              )}
              <span className="text-slate-300">·</span>
              {s.fechaTurno ? (
                <span className="inline-flex items-center gap-1 font-medium" style={{ color: '#3A7D5C' }}>
                  <CalendarClock className="w-3 h-3" />
                  {formatearFechaHora(s.fechaTurno)} · {s.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                </span>
              ) : (
                <span>Sin turno asignado</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex gap-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={pStyle}>{s.prioridad}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={eStyle}>{estadoSolicitudHumano(s.estado)}</span>
            </div>
            <Link to={`/profesional/solicitudes/${s.id}`}
              className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#3A7D5C' }}>
              Atender
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
