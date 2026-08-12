import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { Search, Loader2, Building2, Inbox, Plus } from 'lucide-react';
import NuevoCentroModal from '../../components/admin/NuevoCentroModal';

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-9 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function GestionCentros() {
  const [centros, setCentros] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = () => {
    setCentros(null);
    api.get('/centros').then(r => setCentros(r.data || [])).catch(() => setCentros([]));
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    if (!centros) return [];
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return centros;
    return centros.filter(c => {
      return (c.nombre || '').toLowerCase().includes(termino)
        || (c.direccion || '').toLowerCase().includes(termino)
        || (c.tipoCentro || '').toLowerCase().includes(termino);
    });
  }, [centros, busqueda]);

  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Centros de Salud</h1>
          <p className="dashboard-header__greeting">Buscá, consultá y agregá centros de salud a la red.</p>
        </div>
        <button onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-teal-medico-dark hover:opacity-90">
          <Plus className="w-4 h-4" /> Nuevo Centro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative sm:max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, dirección o tipo..."
            className={inputCls}
          />
        </div>
      </div>

      {!centros ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-teal-medico" />
          <p className="text-sm">Cargando centros...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 mt-6">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="empty-state__text">
            {centros.length === 0 ? 'Aún no hay centros de salud registrados.' : 'No hay centros que coincidan con tu búsqueda.'}
          </p>
          {centros.length > 0 && (
            <button onClick={() => setBusqueda('')}
              className="mt-4 text-sm font-semibold text-teal-medico hover:text-teal-medico-dark transition-colors">
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="table-salud__responsive">
          <div className="flex items-center gap-2 mb-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5" /> {filtrados.length} {filtrados.length === 1 ? 'centro' : 'centros'}
          </div>
          <table className="table-salud">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Direccion</th>
                <th>Tipo</th>
                <th>Publico</th>
                <th>Emergencias</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.direccion}</td>
                  <td>{c.tipoCentro}</td>
                  <td>{c.esPublico ? 'Si' : 'No'}</td>
                  <td>{c.tieneEmergencias ? 'Si' : 'No'}</td>
                  <td><span className={`badge-salud ${c.activo ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <NuevoCentroModal
          onClose={() => setModalAbierto(false)}
          onCreado={cargar}
        />
      )}
    </div>
  );
}
