import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Users, Building2, CheckCircle, TrendingUp, TrendingDown, ChevronRight, ExternalLink, Phone, Shield, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { esMismoDia, formatearFechaHora } from '../../utils/fechas';

const PRIORIDAD_CLS = {
  URGENTE: 'bg-red-100 text-red-700 border-red-200',
  ALTA: 'bg-amber-100 text-amber-700 border-amber-200',
  MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
  BAJA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ESTADO_LABEL = {
  CREADA: 'Sin Atender',
  REVISADA: 'Revisada',
  ASIGNADA: 'En Proceso',
  EN_PROCESO: 'En Proceso',
  DERIVADA: 'Derivado',
  COMPLETADA: 'Completada',
};

export default function DashboardSecretaria() {
  const { user } = useAuth();
  const [todas, setTodas] = useState([]);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    api.get('/solicitudes').then(r => {
      setTodas(r.data || []);
    }).catch(() => {});
  }, []);

  const urg = s => s.prioridad?.toUpperCase();
  const est = s => s.estado?.toUpperCase();

  const urgentes = todas.filter(s =>
    (urg(s) === 'URGENTE' || urg(s) === 'ALTA') &&
    (est(s) === 'CREADA' || est(s) === 'REVISADA')
  );

  const pendientes = todas.filter(s =>
    (est(s) === 'CREADA' || est(s) === 'REVISADA' || est(s) === 'EN_PROCESO') &&
    !s.idCentroSalud && !s.fechaTurno
  );

  const hoy = new Date();
  const esHoy = fecha => esMismoDia(fecha, hoy);
  const hoyDerivadas = todas.filter(s =>
    (est(s) === 'DERIVADA' || est(s) === 'ASIGNADA' || est(s) === 'COMPLETADA') &&
    esHoy(s.fechaActualizacion)
  ).length;

  const pacientesUnicos = new Set(todas.map(s => s.idPaciente).filter(Boolean)).size;
  const tieneUrgentes = urgentes.length > 0;

  const filtradas = filtro === 'urgentes' ? urgentes : filtro === 'pendientes' ? pendientes : todas;

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Centro de Comando</h1>
            <p className="text-sm text-slate-500 mt-0.5">Bienvenido, {user?.nombreCompleto?.split(' ')[0] || 'Secretario'}</p>
          </div>
          <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* KPIs Operativos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={AlertTriangle}
            label="Casos Urgentes"
            value={urgentes.length}
            accent={tieneUrgentes ? 'red' : 'slate'}
            trend={tieneUrgentes ? `Requieren triaje` : 'Sin novedades'}
            trendUp={tieneUrgentes}
          />
          <KpiCard
            icon={Users}
            label="Pendientes de Asignación"
            value={pendientes.length}
            accent="slate"
            trend={pendientes.length > 0 ? 'Esperando gestión' : 'Al día'}
            trendUp={false}
          />
          <KpiCard
            icon={CheckCircle}
            label="Derivaciones Completadas Hoy"
            value={hoyDerivadas}
            accent={hoyDerivadas > 0 ? 'emerald' : 'slate'}
            trend={hoyDerivadas > 0 ? 'Gestionadas' : 'Sin movimientos'}
            trendUp={hoyDerivadas > 0}
          />
          <KpiCard
            icon={Building2}
            label="Total Pacientes Registrados"
            value={pacientesUnicos}
            accent="slate"
            trend="En el sistema"
            trendUp={null}
          />
        </div>

        {/* Main: Bandeja Operativa + Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Columna izquierda — Bandeja */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                Bandeja Operativa de Solicitudes
              </h3>
              <span className="text-xs text-slate-400 font-medium">{filtradas.length} solicitudes</span>
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              {(['todas', 'urgentes', 'pendientes']).map(k => (
                <button key={k} onClick={() => setFiltro(k)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    filtro === k
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}>
                  {k === 'todas' ? 'Todas' : k === 'urgentes' ? `Solo Urgentes (${urgentes.length})` : `Pendientes (${pendientes.length})`}
                </button>
              ))}
            </div>

            {filtradas.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay solicitudes que mostrar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Categoría / Motivo</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Urgencia</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(s => (
                      <SolicitudRow key={s.id} solicitud={s} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Columna derecha — Sidebar Operativa */}
          <div className="lg:col-span-4 space-y-4">

            {/* Centro de Derivación Rápida */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Centro de Derivación Rápida
              </h3>
              <div className="space-y-2.5">
                <Link to="/secretaria/solicitudes"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="flex-1">Buscar Centros de Salud</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/secretaria/solicitudes"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="flex-1">Crear Nueva Solicitud</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Agenda / Estado del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Profesionales disponibles</span>
                  <span className="font-semibold text-emerald-600">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Centros activos</span>
                  <span className="font-semibold text-emerald-600">—</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Turnos asignados hoy</span>
                  <span className="font-semibold text-slate-700">{todas.filter(s => s.fechaTurno).length}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Link to="/secretaria/solicitudes"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Ver agenda completa
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* SOS / Protocolos de Crisis */}
            <div className="bg-white border border-red-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Acceso Directo a Crisis
              </h3>
              <div className="space-y-2.5">
                <button className="w-full flex items-center gap-3 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  Activar Protocolo de Crisis
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed px-1">
                  Línea de emergencia: <strong className="text-slate-600">(011) 5050-0147</strong> | 
                  Activación inmediata de equipos de intervención.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent, trend, trendUp }) {
  const borderColor = accent === 'red' ? 'border-red-200' : accent === 'emerald' ? 'border-emerald-200' : 'border-slate-200';
  const iconBg = accent === 'red' ? 'bg-red-100 text-red-600' : accent === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600';
  return (
    <div className={`bg-white border ${borderColor} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendUp ? 'text-emerald-600' : trendUp === false ? 'text-amber-600' : 'text-slate-400'}`}>
            {trendUp === true && <TrendingUp className="w-3 h-3" />}
            {trendUp === false && <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function SolicitudRow({ solicitud: s }) {
  const pCls = PRIORIDAD_CLS[s.prioridad] || PRIORIDAD_CLS.MEDIA;
  const pLabel = s.prioridad || '—';
  const estadoLabel = ESTADO_LABEL[s.estado] || s.estado || '—';
  const fecha = s.fechaCreacion ? formatearFechaHora(s.fechaCreacion, {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }) : '—';

  const rowBorder = s.prioridad === 'URGENTE' ? 'border-l-2 border-l-red-500' : '';

  return (
    <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${rowBorder}`}>
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">{fecha}</td>
      <td className="px-4 py-3.5">
        <div className="text-sm font-medium text-slate-700">{s.nombrePaciente || '—'}</div>
        <div className="text-[11px] text-slate-400">{s.tipoDocumento} {s.numDocumento}</div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="text-sm text-slate-700">{s.nombreCategoria || '—'}</div>
        <div className="text-[11px] text-slate-400 line-clamp-1">{s.titulo}</div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pCls}`}>{pLabel}</span>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          s.estado === 'CREADA' ? 'bg-slate-100 text-slate-600' :
          s.estado === 'DERIVADA' ? 'bg-violet-100 text-violet-700' :
          s.estado === 'ASIGNADA' || s.estado === 'EN_PROCESO' ? 'bg-emerald-100 text-emerald-700' :
          'bg-amber-100 text-amber-700'
        }`}>{estadoLabel}</span>
      </td>
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <Link to={`/secretaria/solicitudes/${s.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          Gestionar
          <ChevronRight className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
}
