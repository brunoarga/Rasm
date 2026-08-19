import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { formatearFecha } from '../../utils/fechas';
import { Search, KeyRound, UserX, UserCheck, RefreshCw, Loader2, Users, Inbox, Building2 } from 'lucide-react';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal';
import ConfirmarEstadoModal from '../../components/admin/ConfirmarEstadoModal';
import AsignarCentroModal from '../../components/admin/AsignarCentroModal';

const ROL_LABEL = {
  PACIENTE: 'Paciente',
  PROFESIONAL: 'Profesional',
  SECRETARIO: 'Secretaría',
  ADMIN: 'Admin',
};

const ROL_BADGE = {
  PACIENTE: 'badge-salud--pine',
  PROFESIONAL: 'badge-salud--copper',
  SECRETARIO: 'badge-salud--warning',
  ADMIN: 'badge-salud--stone',
};

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-9 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function detalleUsuario(u) {
  if (u.tipoUsuario === 'PACIENTE') {
    const doc = [u.tipoDocumento, u.numDocumento].filter(Boolean).join(' ');
    return doc ? `${doc} · ${u.obraSocial || 'Sin cobertura'}` : u.obraSocial || 'Sin cobertura';
  }
  if (u.tipoUsuario === 'PROFESIONAL') {
    return [u.tipoProfesional, u.especialidad].filter(Boolean).join(' · ') || 'Profesional';
  }
  if (u.tipoUsuario === 'SECRETARIO')
    return u.nombreCentroSalud ? `Referente · ${u.nombreCentroSalud}` : 'Personal sin centro asignado';
  return 'Administrador';
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [centros, setCentros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState('TODOS');
  const [error, setError] = useState(false);
  const [resetDe, setResetDe] = useState(null);
  const [estadoDe, setEstadoDe] = useState(null);
  const [centroDe, setCentroDe] = useState(null);
  const [activar, setActivar] = useState(true);

  const cargar = () => {
    setError(false);
    setUsuarios(null);
    api.get('/admin/usuarios')
      .then(r => setUsuarios(r.data || []))
      .catch(() => setError(true));
  };

  useEffect(() => {
    cargar();
    api.get('/centros').then(r => setCentros(r.data || [])).catch(() => setCentros([]));
  }, []);

  const roles = useMemo(() => {
    if (!usuarios) return [];
    const conteo = {};
    usuarios.forEach(u => { conteo[u.tipoUsuario] = (conteo[u.tipoUsuario] || 0) + 1; });
    return ['PACIENTE', 'PROFESIONAL', 'SECRETARIO', 'ADMIN']
      .filter(r => conteo[r])
      .map(r => ({ rol: r, cantidad: conteo[r] }));
  }, [usuarios]);

  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const termino = busqueda.trim().toLowerCase();
    return usuarios.filter(u => {
      if (rol !== 'TODOS' && u.tipoUsuario !== rol) return false;
      if (!termino) return true;
      return (u.nombreCompleto || '').toLowerCase().includes(termino)
        || (u.email || '').toLowerCase().includes(termino);
    });
  }, [usuarios, busqueda, rol]);

  const abrirDesactivar = (u) => { setEstadoDe(u); setActivar(false); };
  const abrirActivar = (u) => { setEstadoDe(u); setActivar(true); };

  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Usuarios del Sistema</h1>
          <p className="dashboard-header__greeting">Gestioná accesos, restablecé contraseñas y administrá el estado de cada cuenta.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative sm:max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className={inputCls}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setRol('TODOS')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              rol === 'TODOS' ? 'bg-pizarra text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-medico/40'
            }`}>
            <Users className="w-3.5 h-3.5" /> Todos {usuarios && `(${usuarios.length})`}
          </button>
          {roles.map(r => (
            <button key={r.rol} onClick={() => setRol(r.rol === rol ? 'TODOS' : r.rol)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                rol === r.rol ? 'bg-pizarra text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-medico/40'
              }`}>
              {ROL_LABEL[r.rol]} ({r.cantidad})
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="empty-state border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 mt-6">
          <p className="empty-state__text">No se pudieron cargar los usuarios. Verificá tu conexión e intentá de nuevo.</p>
          <button onClick={cargar}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2 text-sm font-bold text-white hover:bg-teal-medico/90 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      ) : !usuarios ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-teal-medico" />
          <p className="text-sm">Cargando usuarios...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 mt-6">
          <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="empty-state__text">
            {usuarios.length === 0 ? 'Aún no hay usuarios registrados en el sistema.' : 'No hay usuarios que coincidan con tu búsqueda o filtro.'}
          </p>
          {usuarios.length > 0 && (
            <button onClick={() => { setBusqueda(''); setRol('TODOS'); }}
              className="mt-4 text-sm font-semibold text-teal-medico hover:text-teal-medico-dark transition-colors">
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="table-salud__responsive">
          <table className="table-salud">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Detalle</th>
                <th>Centro</th>
                <th>Registro</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id}>
                  <td><span className={`badge-salud ${ROL_BADGE[u.tipoUsuario] || 'badge-salud--stone'}`}>{ROL_LABEL[u.tipoUsuario] || u.tipoUsuario}</span></td>
                  <td className="font-medium">{u.nombreCompleto}</td>
                  <td>{u.email}</td>
                  <td className="text-xs text-warm-gray">{detalleUsuario(u)}</td>
                  <td className="text-xs">
                    {u.tipoUsuario === 'SECRETARIO' ? (
                      u.nombreCentroSalud
                        ? <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-teal-medico" /> {u.nombreCentroSalud}</span>
                        : <span className="text-slate-400">Sin asignar</span>
                    ) : '—'}
                  </td>
                  <td className="text-xs">{u.fechaRegistro ? formatearFecha(u.fechaRegistro) : '—'}</td>
                  <td><span className={`badge-salud ${u.activo ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      {u.tipoUsuario === 'SECRETARIO' && (
                        <button onClick={() => setCentroDe(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-teal-medico/40 hover:text-teal-medico transition-colors">
                          <Building2 className="w-3.5 h-3.5" /> {u.nombreCentroSalud ? 'Cambiar centro' : 'Vincular centro'}
                        </button>
                      )}
                      <button onClick={() => setResetDe(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-teal-medico/40 hover:text-teal-medico transition-colors">
                        <KeyRound className="w-3.5 h-3.5" /> Resetear clave
                      </button>
                      {u.activo ? (
                        <button onClick={() => abrirDesactivar(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 transition-colors">
                          <UserX className="w-3.5 h-3.5" /> Desactivar
                        </button>
                      ) : (
                        <button onClick={() => abrirActivar(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resetDe && (
        <ResetPasswordModal
          usuario={resetDe}
          onClose={() => setResetDe(null)}
          onRestablecida={cargar}
        />
      )}

      {estadoDe && (
        <ConfirmarEstadoModal
          usuario={estadoDe}
          activar={activar}
          onClose={() => setEstadoDe(null)}
          onConfirmado={cargar}
        />
      )}

      {centroDe && (
        <AsignarCentroModal
          usuario={centroDe}
          centros={centros}
          onClose={() => setCentroDe(null)}
          onGuardado={cargar}
        />
      )}
    </div>
  );
}