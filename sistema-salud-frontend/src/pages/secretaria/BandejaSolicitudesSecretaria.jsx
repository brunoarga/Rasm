import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { parsearFechaLocal, formatearFecha } from '../../utils/fechas';

const PRIORIDAD_CLS = {
  URGENTE: 'bg-red-100 text-red-700 border-red-200',
  ALTA: 'bg-amber-100 text-amber-700 border-amber-200',
  MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
  BAJA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ESTADO_CLS = {
  CREADA: 'bg-slate-100 text-slate-600',
  REVISADA: 'bg-amber-100 text-amber-700',
  ASIGNADA: 'bg-emerald-100 text-emerald-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  DERIVADA: 'bg-violet-100 text-violet-700',
  COMPLETADA: 'bg-slate-100 text-slate-500',
};

const ESTADO_LABEL = {
  CREADA: 'Pendiente',
  REVISADA: 'Revisada',
  ASIGNADA: 'Turno Asignado',
  EN_PROCESO: 'En Proceso',
  DERIVADA: 'Derivado',
  COMPLETADA: 'Completada',
};

const FILTROS = [
  { label: 'Todas', value: 'todas', estados: null },
  { label: 'Creadas / Pendientes', value: 'pendientes', estados: ['CREADA', 'REVISADA'] },
  { label: 'Derivadas', value: 'derivadas', estados: ['DERIVADA'] },
  { label: 'Turno Asignado', value: 'asignadas', estados: ['ASIGNADA'] },
  { label: 'En Proceso', value: 'proceso', estados: ['EN_PROCESO'] },
];

export default function BandejaSolicitudesSecretaria() {
  const [sols, setSols] = useState([]);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    api.get('/solicitudes').then(r => setSols(r.data || [])).catch(() => {});
  }, []);

  const filtroSel = FILTROS.find(f => f.value === filtro);
  const fs = filtroSel?.estados ? sols.filter(s => filtroSel.estados.includes(s.estado)) : sols;

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Bandeja de Solicitudes</h1>
            <p className="text-sm text-slate-500 mt-0.5">Derive cada solicitud a un centro de salud</p>
          </div>
          <span className="text-xs text-slate-500">{fs.length} solicitudes</span>
        </div>

        <div className="flex gap-3">
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
            {FILTROS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {fs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm text-slate-400">No hay solicitudes para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fs.map(s => (
              <SolicitudCard key={s.id} solicitud={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SolicitudCard({ solicitud: s }) {
  const pCls = PRIORIDAD_CLS[s.prioridad] || PRIORIDAD_CLS.MEDIA;
  const eCls = ESTADO_CLS[s.estado] || 'bg-slate-100 text-slate-600';
  const estadoLabel = ESTADO_LABEL[s.estado] || s.estado;
  const diff = s.fechaCreacion ? Math.floor((Date.now() - (parsearFechaLocal(s.fechaCreacion)?.getTime() || Date.now())) / 3600000) : null;

  return (
    <div className={`bg-white border rounded-xl transition-all hover:shadow-sm ${
      s.prioridad === 'URGENTE' ? 'border-red-200' : 'border-slate-200'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-800">{s.titulo}</h3>
              {s.prioridad === 'URGENTE' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  URGENTE
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 mb-2">{s.descripcion}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{s.nombrePaciente}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">{s.nombreCategoria}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>{formatearFecha(s.fechaCreacion)}</span>
              <span>&middot;</span>
              <strong>Obra Social:</strong> {s.nombreObraSocial || 'Sin cobertura'}
              {diff !== null && (
                <>
                  <span className="hidden sm:inline">&middot;</span>
                  <span className={diff > 48 ? 'text-red-600 font-semibold' : ''}>{diff}h en espera</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pCls}`}>{s.prioridad}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${eCls}`}>
                {estadoLabel}
              </span>
            </div>
            <Link to={`/secretaria/solicitudes/${s.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              {s.fechaTurno ? 'Ver Turno' : s.idCentroSalud ? 'Asignar Profesional' : 'Derivar a Centro'}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
