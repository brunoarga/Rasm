import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, CheckCircle, TrendingUp, TrendingDown, ChevronRight, ExternalLink, Calendar, Inbox, CalendarDays, UserPlus, Clock, ArrowRightLeft, Siren, Activity, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useSecretarioPerfil from '../../hooks/useSecretarioPerfil';
import { formatearFechaHora } from '../../utils/fechas';
import NuevaSolicitudPresencialModal from '../../components/secretaria/NuevaSolicitudPresencialModal';
import ReasignarCentroModal from '../../components/secretaria/ReasignarCentroModal';

const ESTADO_LABEL = {
  CREADA: 'Pendiente',
  REVISADA: 'Revisada',
  RECIBIDA: 'Recibida',
  DERIVADA: 'Derivado',
  ASIGNADA: 'Turno Asignado',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
};

const ESTADO_BADGE = {
  CREADA: 'bg-slate-100 text-slate-600',
  REVISADA: 'bg-amber-100 text-amber-700',
  RECIBIDA: 'bg-sky-100 text-sky-700',
  DERIVADA: 'bg-violet-100 text-violet-700',
  ASIGNADA: 'bg-emerald-100 text-emerald-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-slate-100 text-slate-500',
};

export default function DashboardSecretaria() {
  const { perfil } = useSecretarioPerfil();
  const [todas, setTodas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [modalNueva, setModalNueva] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [resolviendo, setResolviendo] = useState(false);
  const [triaje, setTriaje] = useState([]);
  const [activando, setActivando] = useState(false);
  const [auditoria, setAuditoria] = useState([]);

  const referente = !!perfil?.referente;

  const recargar = () => {
    api.get('/solicitudes').then(r => {
      setTodas(r.data || []);
    }).catch(() => {});
  };

  const cargarAlertas = () => {
    api.get('/central/alertas').then(r => {
      setAlertas(r.data || []);
    }).catch(() => {});
  };

  const cargarTriaje = () => {
    api.get('/central/triaje').then(r => {
      setTriaje(r.data || []);
    }).catch(() => {});
  };

  const cargarAuditoria = () => {
    api.get('/central/auditoria').then(r => {
      setAuditoria(r.data || []);
    }).catch(() => {});
  };

  useEffect(() => {
    recargar();
    cargarAlertas();
    cargarTriaje();
    cargarAuditoria();
  }, []);

  const activarProtocolo = async (id) => {
    setActivando(true);
    try {
      await api.post(`/solicitudes/${id}/emergencia`);
      toast.success('Protocolo de emergencia activado');
      cargarTriaje();
      recargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al activar el protocolo');
    } finally {
      setActivando(false);
    }
  };

  const resolverAlerta = async (id) => {
    setResolviendo(true);
    try {
      await api.post(`/central/alertas/${id}/resolver`);
      toast.success('Alerta resuelta');
      cargarAlertas();
      recargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al resolver la alerta');
    } finally {
      setResolviendo(false);
    }
  };

  const urg = s => s.prioridad?.toUpperCase();
  const est = s => s.estado?.toUpperCase();

  const urgentes = todas.filter(s =>
    (urg(s) === 'URGENTE' || urg(s) === 'ALTA') &&
    (est(s) === 'CREADA' || est(s) === 'REVISADA' || est(s) === 'RECIBIDA')
  );

  const porDerivar = todas.filter(s =>
    est(s) === 'CREADA' || est(s) === 'REVISADA'
  );

  const recibidas = todas.filter(s =>
    est(s) === 'RECIBIDA'
  );

  const derivadas = todas.filter(s =>
    est(s) === 'DERIVADA' || (est(s) === 'ASIGNADA' && s.idCentroSalud && !s.fechaTurno)
  );

  const conTurno = todas.filter(s =>
    est(s) === 'ASIGNADA' || est(s) === 'EN_PROCESO' || est(s) === 'COMPLETADA'
  );

  const completadas = todas.filter(s => est(s) === 'COMPLETADA');

  const tieneUrgentes = urgentes.length > 0;

  const filtroSelReferente = filtro === 'recibidas' ? recibidas : filtro === 'con-turno' ? conTurno : todas;
  const filtroSelCentral =
    filtro === 'por-derivar' ? porDerivar :
    filtro === 'derivadas' ? derivadas :
    filtro === 'con-turno' ? conTurno :
    todas;

  const filtradas = referente ? filtroSelReferente : filtroSelCentral;

  const TituloPanel = referente ? 'Panel del Centro de Salud' : 'Centro de Comando';
  const SubtituloPanel = referente
    ? `Bandeja de referencia · ${perfil?.nombreCentroSalud}`
    : 'Gestión central de derivaciones a centros';

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{TituloPanel}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{SubtituloPanel}</p>
            {referente && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                <Building2 className="w-3 h-3" /> Referente de {perfil?.nombreCentroSalud}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Alertas por Demora — solo central */}
        {!referente && alertas.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alertas por Demora ({alertas.length})
              </h2>
              <span className="text-[11px] font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                Derivaciones sin turno asignado
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {alertas.map(a => (
                <div key={a.id} className="bg-white border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{a.nombrePaciente}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {a.titulo}
                        {a.folio ? ` · Folio ${a.folio}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      {a.horasDemora}h
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p><span className="font-semibold text-slate-700">Centro:</span> {a.nombreCentroSalud || '—'}</p>
                    <p>
                      <span className="font-semibold text-slate-700">Contacto:</span>{' '}
                      {a.telefonoPaciente || '—'}
                      {a.emailPaciente ? ` · ${a.emailPaciente}` : ''}
                    </p>
                    <p>
                      {a.edadPaciente ? `${a.edadPaciente} años` : ''}
                      {a.edadPaciente && a.direccionPaciente ? ' · ' : ''}
                      {a.direccionPaciente || ''}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setAlertaSeleccionada(a)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors">
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Reasignar
                    </button>
                    <button onClick={() => resolverAlerta(a.id)} disabled={resolviendo}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Triaje de Urgencias — solo central */}
        {!referente && triaje.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Siren className="w-4 h-4" />
                Triaje de Urgencias ({triaje.length})
              </h2>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Prioridad URGENTE / ALTA · sin turno asignado
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {triaje.map(t => (
                <div key={t.id} className={`bg-white rounded-lg p-4 space-y-2 border ${t.emergencia ? 'border-red-400' : 'border-amber-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{t.nombrePaciente}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {t.nombreCategoria} · {t.titulo}
                        {t.folio ? ` · Folio ${t.folio}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${t.emergencia ? 'text-white bg-red-600' : t.prioridad === 'URGENTE' ? 'text-red-700 bg-red-100' : 'text-amber-800 bg-amber-100'}`}>
                        {t.emergencia ? 'EMERGENCIA' : t.prioridad}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{t.estado}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p><span className="font-semibold text-slate-700">Obra social:</span> {t.nombreObraSocial}</p>
                    <p>
                      <span className="font-semibold text-slate-700">Contacto:</span>{' '}
                      {t.telefonoPaciente || '—'}
                      {t.emailPaciente ? ` · ${t.emailPaciente}` : ''}
                    </p>
                    <p>
                      {t.edadPaciente ? `${t.edadPaciente} años` : ''}
                      {t.edadPaciente && t.direccionPaciente ? ' · ' : ''}
                      {t.direccionPaciente || ''}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {t.emergencia ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white">
                        <Siren className="w-3.5 h-3.5" /> Protocolo activado
                      </span>
                    ) : (
                      <button onClick={() => activarProtocolo(t.id)} disabled={activando}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                        <Siren className="w-3.5 h-3.5" /> Activar Protocolo
                      </button>
                    )}
                    <Link to={`/secretaria/solicitudes/${t.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                      Ver Solicitud <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs Operativos */}
        {referente ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Inbox}
              label="Recibidas sin turno"
              value={recibidas.length}
              accent={recibidas.length > 0 ? 'sky' : 'slate'}
              trend={recibidas.length > 0 ? 'Aceptar y asignar turno' : 'Sin derivaciones'}
              trendUp={recibidas.length > 0}
            />
            <KpiCard
              icon={Clock}
              label="Con Turno Asignado"
              value={conTurno.length}
              accent={conTurno.length > 0 ? 'emerald' : 'slate'}
              trend={conTurno.length > 0 ? 'Gestionadas' : 'Sin turnos'}
              trendUp={conTurno.length > 0}
            />
            <KpiCard
              icon={Building2}
              label="Casos Derivados"
              value={derivadas.length}
              accent={derivadas.length > 0 ? 'violet' : 'slate'}
              trend={derivadas.length > 0 ? 'Con centro asignado' : 'Sin movimientos'}
              trendUp={derivadas.length > 0}
            />
            <KpiCard
              icon={CheckCircle}
              label="Completadas"
              value={completadas.length}
              accent="slate"
              trend={completadas.length > 0 ? 'Atendidas' : 'Sin completar'}
              trendUp={completadas.length > 0}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={AlertTriangle}
              label="Casos Urgentes"
              value={urgentes.length}
              accent={tieneUrgentes ? 'red' : 'slate'}
              trend={tieneUrgentes ? `Requieren derivación` : 'Sin novedades'}
              trendUp={tieneUrgentes}
            />
            <KpiCard
              icon={Inbox}
              label="Por Derivar"
              value={porDerivar.length}
              accent="slate"
              trend={porDerivar.length > 0 ? 'Esperando gestión' : 'Al día'}
              trendUp={false}
            />
            <KpiCard
              icon={Building2}
              label="Derivadas a Centro"
              value={derivadas.length + recibidas.length}
              accent={derivadas.length + recibidas.length > 0 ? 'violet' : 'slate'}
              trend={derivadas.length + recibidas.length > 0 ? 'Con centro asignado' : 'Sin movimientos'}
              trendUp={derivadas.length + recibidas.length > 0}
            />
            <KpiCard
              icon={CheckCircle}
              label="Con Turno Asignado"
              value={conTurno.length}
              accent={conTurno.length > 0 ? 'emerald' : 'slate'}
              trend={conTurno.length > 0 ? 'Gestionadas' : 'Sin turnos'}
              trendUp={conTurno.length > 0}
            />
          </div>
        )}

        {/* Main: Bandeja Operativa + Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Columna izquierda — Bandeja */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-600" />
                {referente ? 'Bandeja del Centro' : 'Bandeja Operativa de Solicitudes'}
              </h3>
              <span className="text-xs text-slate-400 font-medium">{filtradas.length} solicitudes</span>
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              {referente ? (
                <>
                  <button onClick={() => setFiltro('todas')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'todas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Todas
                  </button>
                  <button onClick={() => setFiltro('recibidas')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'recibidas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Recibidas ({recibidas.length})
                  </button>
                  <button onClick={() => setFiltro('con-turno')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'con-turno' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Con Turno ({conTurno.length})
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setFiltro('todas')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'todas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Todas
                  </button>
                  <button onClick={() => setFiltro('por-derivar')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'por-derivar' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Por Derivar
                  </button>
                  <button onClick={() => setFiltro('derivadas')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'derivadas' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Derivadas
                  </button>
                  <button onClick={() => setFiltro('con-turno')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filtro === 'con-turno' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    Con Turno
                  </button>
                </>
              )}
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
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Asignación</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(s => (
                      <SolicitudRow key={s.id} solicitud={s} referente={referente} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Columna derecha — Sidebar Operativa */}
          <div className="lg:col-span-4 space-y-4">

            {/* Accesos directos */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                {referente ? 'Gestión del Centro' : 'Gestión de Derivaciones'}
              </h3>
              <div className="space-y-2.5">
                <Link to="/secretaria/solicitudes"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Inbox className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="flex-1">{referente ? 'Bandeja del Centro' : 'Bandeja de Solicitudes'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/secretaria/agenda"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="flex-1">Agenda del Centro</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {!referente && (
                  <button onClick={() => setModalNueva(true)}
                    className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="flex-1">Registrar Paciente Presencial</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Estado del Flujo */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Estado del Flujo
              </h3>
              <div className="space-y-3">
                {referente ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Recibidas sin turno</span>
                      <span className="font-semibold text-sky-600">{recibidas.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Turnos asignados</span>
                      <span className="font-semibold text-emerald-600">{conTurno.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Atendidas / Completadas</span>
                      <span className="font-semibold text-slate-700">{completadas.length}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Solicitudes derivadas</span>
                      <span className="font-semibold text-violet-600">{derivadas.length + recibidas.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Turnos asignados</span>
                      <span className="font-semibold text-emerald-600">{conTurno.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Atendidas / Completadas</span>
                      <span className="font-semibold text-slate-700">{completadas.length}</span>
                    </div>
                  </>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Link to="/secretaria/agenda"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Ver agenda completa
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      {/* Red de Centros — solo central */}
        {!referente && auditoria.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Red de Centros · Auditoría de Calidad
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {auditoria.length} centros activos
              </span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {auditoria.map(cr => {
                const sem = semaforo(cr);
                const borderCls = sem === 'rojo' ? 'border-red-300 bg-red-50' : sem === 'ambar' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50';
                const dotCls = sem === 'rojo' ? 'bg-red-500' : sem === 'ambar' ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={cr.idCentroSalud} className={`border rounded-xl p-4 space-y-2 ${borderCls}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotCls}`} />
                          {cr.nombreCentroSalud}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{cr.direccion || 'Sin dirección'}</p>
                      </div>
                      {cr.tieneEmergencias && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Guardia
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <Metrica label="Derivadas" value={cr.totalDerivadas} />
                      <Metrica label="% Confirmado" value={cr.pctConfirmados} />
                      <Metrica label="Prom. turno" value={cr.promedioHorasTurno != null ? `${Math.round(cr.promedioHorasTurno)}h` : '—'} />
                      <Metrica label="Sin resp." value={cr.noRespuesta} alert={cr.noRespuesta > 0} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Alertas: <strong className={cr.alertasAbiertas > 0 ? 'text-red-600' : 'text-slate-700'}>{cr.alertasAbiertas}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Sin actividad: <strong className="text-slate-700">{cr.diasSinActividad != null ? `${cr.diasSinActividad}d` : '—'}</strong>
                      </span>
                    </div>
                    {cr.emailInstitucional && (
                      <p className="text-[11px] text-slate-500 truncate">✉ {cr.emailInstitucional}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {modalNueva && <NuevaSolicitudPresencialModal onClose={() => setModalNueva(false)} onCreated={recargar} />}
      {alertaSeleccionada && (
        <ReasignarCentroModal
          alerta={alertaSeleccionada}
          onClose={() => setAlertaSeleccionada(null)}
          onReasignado={() => { cargarAlertas(); recargar(); }}
        />
      )}
    </div>
  );
}

function semaforo(c) {
  if (c.alertasAbiertas > 0 || c.noRespuesta > 0 || c.pctConfirmados < 50) return 'rojo';
  if (c.pctConfirmados < 80 || (c.diasSinActividad != null && c.diasSinActividad > 7)) return 'ambar';
  return 'verde';
}

function Metrica({ label, value, alert }) {
  return (
    <div className="rounded-lg bg-white/80 border border-slate-200 py-1.5 px-1">
      <p className={`text-base font-bold ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
      <p className="text-[10px] text-slate-500 truncate">{label}</p>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent, trend, trendUp }) {
  const borderColor = accent === 'red' ? 'border-red-200' : accent === 'emerald' ? 'border-emerald-200' : accent === 'violet' ? 'border-violet-200' : accent === 'sky' ? 'border-sky-200' : 'border-slate-200';
  const iconBg = accent === 'red' ? 'bg-red-100 text-red-600' : accent === 'emerald' ? 'bg-emerald-100 text-emerald-600' : accent === 'violet' ? 'bg-violet-100 text-violet-600' : accent === 'sky' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600';
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

function SolicitudRow({ solicitud: s, referente }) {
  const estadoLabel = ESTADO_LABEL[s.estado] || s.estado || '—';
  const estadoBadge = ESTADO_BADGE[s.estado] || 'bg-slate-100 text-slate-600';
  const fecha = s.fechaCreacion ? formatearFechaHora(s.fechaCreacion, {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }) : '—';

  const asignacion = [];
  if (s.folio) asignacion.push(`Folio ${s.folio}`);
  if (s.nombreCentroSalud) asignacion.push(s.nombreCentroSalud);
  if (s.nombreProfesional) asignacion.push(s.nombreProfesional);
  if (s.fechaTurno) asignacion.push(formatearFechaHora(s.fechaTurno, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));

  const rowBorder = s.emergencia ? 'border-l-4 border-l-red-600' : s.prioridad === 'URGENTE' ? 'border-l-2 border-l-red-500' : '';
  const botonLabel = referente
    ? (s.estado === 'RECIBIDA' ? 'Aceptar y asignar turno' : s.fechaTurno ? 'Ver Turno' : 'Ver en detalle')
    : (s.idCentroSalud ? 'Ver Derivación' : 'Derivar a Centro');

  return (
    <tr className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${rowBorder}`}>
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">{fecha}</td>
      <td className="px-4 py-3.5">
        <div className="text-sm font-medium text-slate-700">{s.nombrePaciente || '—'}</div>
        <div className="text-[11px] text-slate-400">{s.folio ? <span className="font-medium text-slate-500">Folio {s.folio}</span> : `${s.tipoDocumento} ${s.numDocumento}`}</div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="text-sm text-slate-700">{s.nombreCategoria || '—'}</div>
        <div className="text-[11px] text-slate-400 line-clamp-1">{s.titulo}</div>
      </td>
      <td className="px-4 py-3.5 hidden xl:table-cell">
        {asignacion.length === 0 ? (
          <span className="text-[11px] text-slate-400">Sin asignar</span>
        ) : (
          <div className="text-xs text-slate-600 space-y-0.5">
            {asignacion.map((a, i) => (
              <div key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                {a}
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 flex-wrap">
          {s.emergencia && (
            <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">EMERGENCIA</span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${estadoBadge}`}>{estadoLabel}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <Link to={`/secretaria/solicitudes/${s.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
          {botonLabel}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
}