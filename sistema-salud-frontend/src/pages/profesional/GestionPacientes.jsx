import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { formatearFecha } from '../../utils/fechas';

export default function GestionPacientes() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    api.get('/solicitudes/profesional/todas').then(r => setSolicitudes(r.data || [])).catch(() => {});
  }, []);

  const pacientesMap = {};
  solicitudes.forEach(s => {
    const id = s.idPaciente;
    if (!id) return;
    if (!pacientesMap[id]) {
      pacientesMap[id] = {
        id,
        nombrePaciente: s.nombrePaciente,
        tipoDocumento: s.tipoDocumento,
        numDocumento: s.numDocumento,
        obraSocial: s.nombreObraSocial,
        solicitudes: [],
      };
    }
    pacientesMap[id].solicitudes.push(s);
  });
  const pacientes = Object.values(pacientesMap);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Mis Pacientes</h1>
            <p className="text-sm text-slate-500 mt-0.5">Pacientes con los que ha tenido consulta</p>
          </div>
          <span className="text-xs text-slate-500">{pacientes.length} pacientes</span>
        </div>

        {pacientes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tiene pacientes asignados aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pacientes.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.nombrePaciente}</p>
                      <p className="text-xs text-slate-500">
                        {p.tipoDocumento} {p.numDocumento} &middot; {p.obraSocial || 'Sin cobertura'}
                      </p>
                    </div>
                  </div>
                  <Link to={`/profesional/solicitudes?paciente=${p.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                    Ver Solicitudes
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Historial de Solicitudes</p>
                  <div className="space-y-1.5">
                    {p.solicitudes.slice().reverse().map(s => (
                      <Link key={s.id} to={`/profesional/solicitudes/${s.id}`}
                        className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 transition-colors">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="flex-1 truncate">{s.titulo}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          s.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' :
                          s.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{s.estado}</span>
                        <span className="text-slate-400">{formatearFecha(s.fechaCreacion)}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
