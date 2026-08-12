import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, User, Building2, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { parsearFechaLocal, esMismoDia, formatearFecha } from '../../utils/fechas';

const ESTADO_BADGE = {
  CREADA: 'bg-slate-100 text-slate-600',
  REVISADA: 'bg-amber-100 text-amber-700',
  ASIGNADA: 'bg-emerald-100 text-emerald-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  DERIVADA: 'bg-violet-100 text-violet-700',
  COMPLETADA: 'bg-slate-100 text-slate-500',
};

export default function AgendaSecretaria() {
  const [sols, setSols] = useState([]);
  const [dia, setDia] = useState(new Date());
  const [centro, setCentro] = useState('');

  useEffect(() => {
    api.get('/solicitudes').then(r => setSols(r.data || [])).catch(() => {});
  }, []);

  const hoy = new Date();
  const cambiarDia = (delta) => {
    const d = new Date(dia);
    d.setDate(d.getDate() + delta);
    setDia(d);
  };
  const isoDia = () => {
    const p = n => String(n).padStart(2, '0');
    return `${dia.getFullYear()}-${p(dia.getMonth() + 1)}-${p(dia.getDate())}`;
  };
  const seleccionarDia = (iso) => {
    if (!iso) return;
    const [y, m, d] = iso.split('-').map(Number);
    setDia(new Date(y, m - 1, d));
  };

  const centros = [...new Set(
    sols.filter(s => s.fechaTurno && s.nombreCentroSalud).map(s => s.nombreCentroSalud)
  )].sort();

  const turnos = sols
    .filter(s => s.fechaTurno && esMismoDia(s.fechaTurno, dia))
    .filter(s => !centro || s.nombreCentroSalud === centro)
    .sort((a, b) => (parsearFechaLocal(a.fechaTurno)?.getTime() || 0) - (parsearFechaLocal(b.fechaTurno)?.getTime() || 0));

  const proximasHoy = sols.filter(s => s.fechaTurno && esMismoDia(s.fechaTurno, hoy)).length;
  const completadas = turnos.filter(s => s.estado === 'COMPLETADA').length;
  const conTurno = turnos.length;

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Agenda de Turnos</h1>
            <p className="text-sm text-slate-500 mt-0.5">Cuadro de turnos por día</p>
          </div>
          <span className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            {conTurno} turnos &middot; {completadas} completados
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-1">
            <button onClick={() => cambiarDia(-1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setDia(new Date())}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${esMismoDia(dia, hoy) ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Hoy
            </button>
            <button onClick={() => cambiarDia(1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <input type="date" value={isoDia()} onChange={e => seleccionarDia(e.target.value)}
              className="rounded-lg border border-transparent bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer" />
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-xs text-slate-500">Centro:</span>
            <select value={centro} onChange={e => setCentro(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">Todos</option>
              {centros.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">
              {formatearFecha(dia, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Próximos hoy: <strong className="text-slate-700">{proximasHoy}</strong></span>
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {centro || 'Todos los centros'}</span>
            </div>
          </div>

          {turnos.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Sin turnos para este día.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {turnos.map(s => (
                <Link key={s.id} to={`/secretaria/solicitudes/${s.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-base font-bold text-slate-800">
                      {parsearFechaLocal(s.fechaTurno)?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-[10px] text-slate-400">hs</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{s.nombrePaciente}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.nombreProfesional || 'Profesional'}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {s.nombreCentroSalud || 'Centro'}</span>
                      {s.modalidad === 'VIRTUAL' && <span className="text-sky-600 font-semibold">Telemedicina</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.duracionTurno && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 hidden sm:flex">
                        <Clock className="w-3 h-3" /> {s.duracionTurno} min
                      </span>
                    )}
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ESTADO_BADGE[s.estado] || 'bg-slate-100 text-slate-600'}`}>
                      {s.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}