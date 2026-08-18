import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle,
  UserPlus, FileText, Activity, Send, CalendarDays,
  Phone, Stethoscope, Pill, Loader2,
  CheckCircle2, Moon, Gauge, Smile
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { parsearFechaLocal, formatearFecha, aCadenaLocal } from '../../utils/fechas';
import RegistrarPacienteModal from '../../components/profesional/RegistrarPacienteModal';

const TAB_FILTROS = ['Todos', 'En Espera', 'En Consulta', 'Completados'];
const TAB_FICHA = ['Evolución Actual', 'Historial de Derivación', 'Antecedentes'];

export default function DashboardProfesional() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [citas, setCitas] = useState([]);
  const [monitoreo, setMonitoreo] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [selId, setSelId] = useState(null);
  const [tabFicha, setTabFicha] = useState('Evolución Actual');
  const [notasClinicas, setNotasClinicas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [registrarModal, setRegistrarModal] = useState(false);
  const [enConsulta, setEnConsulta] = useState(new Set());
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [proxFecha, setProxFecha] = useState('');
  const [proxDuracion, setProxDuracion] = useState(30);
  const [agendando, setAgendando] = useState(false);

  useEffect(() => {
    api.get('/profesionales/perfil').then(r => setPerfil(r.data)).catch(() => {});
  }, []);

  const cargarCitas = useCallback((fecha) => {
    const ini = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0);
    const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59);
    api.get(`/citas/centro/mias?desde=${aCadenaLocal(ini)}&hasta=${aCadenaLocal(fin)}`)
      .then(r => {
        const data = r.data || [];
        setCitas(data);
        if (selId && !data.find(c => c.id === selId)) setSelId(null);
      })
      .catch(() => setCitas([]));
  }, [selId]);

  useEffect(() => { cargarCitas(selectedDate); }, [selectedDate, cargarCitas]);

  const selCita = citas.find(c => c.id === selId) || null;

  useEffect(() => {
    if (selCita) {
      setNotasClinicas(selCita.notas || '');
      setDiagnostico('');
      setIndicaciones('');
      setMonitoreo([]);
      if (selCita.idSolicitud) {
        api.get(`/solicitudes/${selCita.idSolicitud}/detalle-completo`)
          .then(r => setMonitoreo(r.data?.diario || []))
          .catch(() => setMonitoreo([]));
      }
    }
  }, [selCita]);

  const citasFiltradas = useMemo(() => {
    return citas.filter(c => {
      if (filtroEstado === 'Todos') return true;
      if (filtroEstado === 'En Espera') return c.estado === 'PROGRAMADA' && !enConsulta.has(c.id);
      if (filtroEstado === 'En Consulta') return enConsulta.has(c.id);
      if (filtroEstado === 'Completados') return c.estado === 'ATENDIDA';
      return true;
    });
  }, [citas, filtroEstado, enConsulta]);

  const handleIniciarAtencion = (id) => {
    setEnConsulta(prev => new Set([...prev, id]));
    setSelId(id);
    setFiltroEstado('En Consulta');
  };

  const handleFinalizar = async () => {
    if (!selCita) return;
    setGuardando(true);
    try {
      const texto = [
        `=== Motivo y Examen Mental ===\n${notasClinicas}`,
        diagnostico ? `=== Diagnóstico Presuntivo ===\n${diagnostico}` : null,
        indicaciones ? `=== Indicaciones / Plan Terapéutico ===\n${indicaciones}` : null,
      ].filter(Boolean).join('\n\n');

      const r = await api.put(`/citas/${selCita.id}/atender`, { notas: texto });
      setCitas(prev => prev.map(c => c.id === selCita.id ? r.data : c));
      setEnConsulta(prev => { const n = new Set(prev); n.delete(selCita.id); return n; });
      toast.success('Consulta finalizada. Notas guardadas.');
      setSelId(null);
      setNotasClinicas('');
      setDiagnostico('');
      setIndicaciones('');
    } catch {
      toast.error('Error al guardar las notas.');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarNota = async () => {
    if (!selCita) return;
    if (!notasClinicas.trim()) {
      toast.info('Escribí una nota antes de guardarla.');
      return;
    }
    try {
      await api.put(`/citas/${selCita.id}/notas`, { notas: notasClinicas });
      toast.success('Nota clínica guardada.');
    } catch {
      toast.error('Error al guardar la nota.');
    }
  };

  const handleAgendarProximo = async () => {
    if (!selCita || !proxFecha) {
      toast.info('Seleccioná fecha y hora para el próximo control.');
      return;
    }
    setAgendando(true);
    try {
      const body = {
        idProfesional: selCita.idProfesional,
        idCentroSalud: selCita.idCentroSalud || null,
        fechaHora: proxFecha.length === 16 ? `${proxFecha}:00` : proxFecha,
        duracion: proxDuracion,
        modalidad: selCita.modalidad || 'PRESENCIAL',
        notas: `Próximo control de ${selCita.nombrePaciente}.`,
      };
      await api.post(`/turnos/${selCita.id}/proximo-turno`, body);
      toast.success('Próximo control agendado.');
      setAgendarOpen(false);
      setProxFecha('');
      cargarCitas(selectedDate);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al agendar el próximo control.');
    } finally {
      setAgendando(false);
    }
  };

  const cambiarFecha = (dias) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dias);
    setSelectedDate(d);
    setSelId(null);
  };

  const fechaFormateada = selectedDate.toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const generarCalendario = useCallback((fecha) => {
    const y = fecha.getFullYear();
    const m = fecha.getMonth();
    const totalDias = daysInMonth(y, m);
    const startDay = firstDayOfMonth(y, m);
    const celdas = [];
    for (let i = 0; i < startDay; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) celdas.push(d);
    return { year: y, month: m, celdas };
  }, []);

  const cal = useMemo(() => generarCalendario(selectedDate), [selectedDate, generarCalendario]);

  const handleSelectCalDay = (dia) => {
    if (!dia) return;
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dia);
    setSelectedDate(d);
    setSelId(null);
  };

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C44536] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!perfil.centroActual) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border p-10 shadow-sm" style={{ borderColor: '#E8E4DF' }}>
          <div className="w-14 h-14 rounded-full bg-[#FEF3E9] flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-6 h-6" style={{ color: '#C44536' }} />
          </div>
          <h2 className="text-xl mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#1E293B' }}>
            Centro no asignado
          </h2>
          <p className="text-sm mb-6" style={{ color: '#7C7F85', lineHeight: 1.6 }}>
            Debes seleccionar un Centro de Salud para comenzar a recibir la agenda de turnos.
          </p>
          <button onClick={() => navigate('/profesional/perfil')}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: '#C44536' }}>
            <Building2 className="w-4 h-4" /> Ir a Mi Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── A. Header Operativo ── */}
      <div className="shrink-0 bg-white border-b px-6 py-3 flex items-center justify-between flex-wrap gap-3" style={{ borderColor: '#E8E4DF' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: '#7C7F85' }}>Centro:</span>
            <span className="font-semibold" style={{ color: '#1E293B' }}>{perfil.centroActual.nombre}</span>
            <button onClick={() => navigate('/profesional/perfil')}
              className="text-xs underline-offset-2 hover:underline" style={{ color: '#C44536' }}>
              [Cambiar]
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm" style={{ color: '#7C7F85' }}>
            <button onClick={() => cambiarFecha(-1)} className="p-1 rounded hover:bg-[#F6F4F0] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium min-w-[130px] text-center" style={{ color: '#1E293B' }}>
              {fechaFormateada}
            </span>
            <button onClick={() => cambiarFecha(1)} className="p-1 rounded hover:bg-[#F6F4F0] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => { setSelectedDate(new Date()); setSelId(null); }}
              className="ml-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F6F4F0', color: '#7C7F85' }}>
              Hoy
            </button>
          </div>
          <button onClick={() => setRegistrarModal(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#C44536' }}>
            <UserPlus className="w-4 h-4" /> Registrar Paciente
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── B. Lateral: Lista de Turnos (35%) ── */}
        <div className="w-[35%] min-w-[320px] border-r flex flex-col bg-white" style={{ borderColor: '#E8E4DF' }}>
          <div className="shrink-0 px-4 pt-4 pb-2 border-b" style={{ borderColor: '#E8E4DF' }}>
            <div className="flex gap-1">
              {TAB_FILTROS.map(t => (
                <button key={t} onClick={() => { setFiltroEstado(t); setSelId(null); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    filtroEstado === t
                      ? 'text-white'
                      : 'hover:bg-[#F6F4F0]'
                  }`}
                  style={{
                    backgroundColor: filtroEstado === t ? '#C44536' : 'transparent',
                    color: filtroEstado === t ? 'white' : '#7C7F85',
                  }}>
                  {t}
                  {t !== 'Todos' && (
                    <span className="ml-1 opacity-70">
                      ({t === 'En Espera' ? citas.filter(c => c.estado === 'PROGRAMADA' && !enConsulta.has(c.id)).length
                        : t === 'En Consulta' ? enConsulta.size
                        : t === 'Completados' ? citas.filter(c => c.estado === 'ATENDIDA').length
                        : 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {citasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: '#D0CCC6' }} />
                <p className="text-sm" style={{ color: '#7C7F85' }}>
                  {filtroEstado === 'Todos' ? 'No hay turnos para esta fecha.' :
                   `No hay turnos en "${filtroEstado}".`}
                </p>
              </div>
            ) : citasFiltradas.map(c => {
              const enAtencion = enConsulta.has(c.id);
              const completada = c.estado === 'ATENDIDA';
              const urgente = c.prioridad === 'URGENTE' || c.prioridad === 'ALTA';
              const esSel = selId === c.id;

              return (
                <div key={c.id}
                  onClick={() => setSelId(c.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                    esSel ? 'ring-1' : 'hover:bg-[#FAF9F7]'
                  }`}
                  style={{
                    borderColor: esSel ? '#C44536' : '#E8E4DF',
                    backgroundColor: completada ? '#F6F9F7' : esSel ? '#FEF6F4' : 'white',
                  }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#1E293B', fontWeight: 600 }}>
                        {parsearFechaLocal(c.fechaHora)?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) || ''}
                      </span>
                      <span className="text-[11px]" style={{ color: '#7C7F85' }}>{c.duracion || 30} min</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {urgente && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF0EE', color: '#C44536' }}>
                          Urgente
                        </span>
                      )}
                      {completada && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E8F0EC', color: '#3A7D5C' }}>
                          Listo
                        </span>
                      )}
                      {enAtencion && !completada && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF3E9', color: '#D49A5A' }}>
                          Consulta
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold truncate" style={{ color: '#1E293B', fontFamily: "'Inter', sans-serif" }}>
                    {c.nombrePaciente}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#7C7F85' }}>
                    <span>{c.tipoDocumento} {c.numDocumento}</span>
                    {c.edad && <><span className="w-1 h-1 rounded-full bg-[#D0CCC6]" /><span>{c.edad} años</span></>}
                  </div>

                  {c.titulo && (
                    <p className="text-xs mt-1.5 line-clamp-1" style={{ color: '#7C7F85' }}>
                      {c.titulo}
                    </p>
                  )}

                  {!completada && !enAtencion && (
                    <button onClick={(e) => { e.stopPropagation(); handleIniciarAtencion(c.id); }}
                      className="mt-2.5 w-full rounded-lg py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#3A7D5C' }}>
                      Llamar a Consulta
                    </button>
                  )}

                  {(completada || enAtencion) && (
                    <button onClick={(e) => { e.stopPropagation(); setSelId(c.id); }}
                      className="mt-2.5 w-full rounded-lg py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ backgroundColor: '#FEF6F4', color: '#C44536' }}>
                      Ver Ficha
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mini Calendario */}
          <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: '#E8E4DF' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#1E293B' }}>
                {meses[cal.month]} {cal.year}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d); }}
                  className="p-0.5 rounded hover:bg-[#F6F4F0]"><ChevronLeft className="w-3 h-3" style={{ color: '#7C7F85' }} /></button>
                <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d); }}
                  className="p-0.5 rounded hover:bg-[#F6F4F0]"><ChevronRight className="w-3 h-3" style={{ color: '#7C7F85' }} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0 text-center">
              {diasSemana.map(d => (
                <span key={d} className="text-[10px] py-1" style={{ color: '#7C7F85' }}>{d}</span>
              ))}
              {cal.celdas.map((dia, i) => {
                const hoy = new Date();
                const esHoy = dia === hoy.getDate() && cal.month === hoy.getMonth() && cal.year === hoy.getFullYear();
                const esSel = dia === selectedDate.getDate() && cal.month === selectedDate.getMonth() && cal.year === selectedDate.getFullYear();
                return (
                  <button key={i} disabled={!dia}
                    onClick={() => handleSelectCalDay(dia)}
                    className={`text-xs py-1 rounded transition-colors ${
                      !dia ? '' : esSel ? 'text-white font-semibold' : esHoy ? 'font-semibold' : 'hover:bg-[#F6F4F0]'
                    }`}
                    style={{
                      backgroundColor: esSel ? '#C44536' : 'transparent',
                      color: !dia ? 'transparent' : esSel ? 'white' : esHoy ? '#C44536' : '#1E293B',
                    }}>
                    {dia || ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── C. Área Principal: Ficha Clínica (65%) ── */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F6F4F0' }}>
          {!selCita ? (
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-full bg-[#E8E4DF] flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6" style={{ color: '#7C7F85' }} />
                </div>
                <p className="text-base" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#1E293B' }}>
                  Seleccioná un turno de la lista
                </p>
                <p className="text-sm mt-1.5" style={{ color: '#7C7F85' }}>
                  La ficha clínica se abre automáticamente al elegir un paciente.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Encabezado del paciente */}
              <div className="shrink-0 bg-white border-b px-6 py-4" style={{ borderColor: '#E8E4DF' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#1E293B' }}>
                      {selCita.nombrePaciente}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs" style={{ color: '#7C7F85' }}>
                      <span>{selCita.tipoDocumento} {selCita.numDocumento}</span>
                      {selCita.edad && <><span className="w-1 h-1 rounded-full bg-[#D0CCC6]" /><span>{selCita.edad} años</span></>}
                      <span className="w-1 h-1 rounded-full bg-[#D0CCC6]" />
                      <span>{selCita.nombreObraSocial}</span>
                      {selCita.telefonoContacto && (
                        <><span className="w-1 h-1 rounded-full bg-[#D0CCC6]" /><Phone className="w-2.5 h-2.5" /> {selCita.telefonoContacto}</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1E293B' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: '#7C7F85' }} />
                      {parsearFechaLocal(selCita.fechaHora)?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) || ''}
                    </span>
                    {selCita.prioridad === 'URGENTE' && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold" style={{ color: '#C44536' }}>
                        <AlertTriangle className="w-3 h-3" /> Alerta médica
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs de ficha */}
                <div className="flex gap-1 mt-4 items-center justify-between">
                  <div className="flex gap-1">
                    {TAB_FICHA.map(t => (
                      <button key={t} onClick={() => setTabFicha(t)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          tabFicha === t
                            ? 'text-white'
                            : 'hover:bg-[#F6F4F0]'
                        }`}
                        style={{
                          backgroundColor: tabFicha === t ? '#C44536' : 'transparent',
                          color: tabFicha === t ? 'white' : '#7C7F85',
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {selCita.estado !== 'ATENDIDA' && (
                    <button onClick={handleFinalizar} disabled={guardando}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: guardando ? '#7C7F85' : '#C44536' }}>
                      <CheckCircle2 className="w-4 h-4" /> Finalizar Consulta
                    </button>
                  )}
                </div>
              </div>

              {/* Cuerpo de la ficha */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {tabFicha === 'Evolución Actual' && (
                  <div className="space-y-5">
                    {/* Monitoreo Diario del paciente */}
                    <div className="rounded-xl border p-5" style={{ borderColor: '#E8E4DF', backgroundColor: 'white' }}>
                      <label className="flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: '#1E293B' }}>
                        <Activity className="w-4 h-4" style={{ color: '#3A7D5C' }} />
                        Monitoreo Diario del Paciente
                      </label>
                      {monitoreo.length === 0 ? (
                        <p className="text-xs" style={{ color: '#7C7F85' }}>Sin registros recientes cargados por el paciente.</p>
                      ) : (
                        <div className="space-y-2">
                          {monitoreo.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center gap-4 text-xs rounded-lg px-3 py-2" style={{ backgroundColor: '#F6F4F0' }}>
                              <span className="shrink-0 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#7C7F85' }}>
                                {formatearFecha(m.fecha, { day: 'numeric', month: 'short' })}
                              </span>
                              {m.calidadSuenio != null && (
                                <span className="flex items-center gap-1 shrink-0" style={{ color: '#1E293B' }}>
                                  <Moon className="w-3.5 h-3.5" style={{ color: '#3A7D5C' }} /> Sueño {m.calidadSuenio}/5
                                </span>
                              )}
                              {m.estresAnsiedad && (
                                <span className="flex items-center gap-1 shrink-0" style={{ color: '#1E293B' }}>
                                  <Gauge className="w-3.5 h-3.5" style={{ color: '#D49A5A' }} /> Ansiedad: {m.estresAnsiedad}
                                </span>
                              )}
                              {m.estadoAnimo && (
                                <span className="flex items-center gap-1 shrink-0" style={{ color: '#1E293B' }}>
                                  <Smile className="w-3.5 h-3.5" style={{ color: '#C44536' }} /> Ánimo: {m.estadoAnimo}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notas de Evolución */}
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                        <FileText className="w-4 h-4" style={{ color: '#C44536' }} />
                        Notas de Evolución
                      </label>
                      <textarea value={notasClinicas} onChange={e => setNotasClinicas(e.target.value)}
                        placeholder="Registrá lo conversado en la sesión, observaciones del examen mental y estado de ánimo..."
                        rows={6}
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all"
                        style={{
                          borderColor: '#E8E4DF', color: '#1E293B',
                          backgroundColor: '#FFFFFF',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#C44536'; e.target.style.boxShadow = '0 0 0 3px rgba(196,69,54,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                        <Stethoscope className="w-4 h-4" style={{ color: '#3A7D5C' }} />
                        Diagnóstico Presuntivo / Observaciones
                      </label>
                      <textarea value={diagnostico} onChange={e => setDiagnostico(e.target.value)}
                        placeholder="Impresión diagnóstica, hallazgos relevantes y observaciones clínicas..."
                        rows={3}
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all"
                        style={{
                          borderColor: '#E8E4DF', color: '#1E293B',
                          backgroundColor: '#FFFFFF',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#C44536'; e.target.style.boxShadow = '0 0 0 3px rgba(196,69,54,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                        <Pill className="w-4 h-4" style={{ color: '#D49A5A' }} />
                        Indicaciones / Plan Terapéutico
                      </label>
                      <textarea value={indicaciones} onChange={e => setIndicaciones(e.target.value)}
                        placeholder="Medicación prescripta, frecuencia de sesiones, ejercicios, pautas de alarma..."
                        rows={3}
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-all"
                        style={{
                          borderColor: '#E8E4DF', color: '#1E293B',
                          backgroundColor: '#FFFFFF',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#C44536'; e.target.style.boxShadow = '0 0 0 3px rgba(196,69,54,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E8E4DF'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  </div>
                )}

                {tabFicha === 'Historial de Derivación' && (
                  <div style={{ color: '#7C7F85' }}>
                    <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: '#E8E4DF', backgroundColor: 'white' }}>
                      <div className="flex items-start gap-3">
                        <Send className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7C7F85' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1E293B' }}>Motivo de derivación</p>
                          <p className="text-sm mt-0.5">{selCita.titulo || 'Sin especificar'}</p>
                          {selCita.descripcion && <p className="text-xs mt-1" style={{ color: '#7C7F85' }}>{selCita.descripcion}</p>}
                        </div>
                      </div>
                      {selCita.anamnesis && (
                        <div className="flex items-start gap-3 pt-3 border-t" style={{ borderColor: '#E8E4DF' }}>
                          <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7C7F85' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#1E293B' }}>Anamnesis</p>
                            <p className="text-sm mt-0.5">{selCita.anamnesis}</p>
                          </div>
                        </div>
                      )}
                      {selCita.resumenBreve && (
                        <div className="pt-3 border-t text-xs" style={{ borderColor: '#E8E4DF', color: '#7C7F85' }}>
                          <span className="font-medium" style={{ color: '#1E293B' }}>Resumen: </span>
                          {selCita.resumenBreve}
                        </div>
                      )}
                      <div className="pt-3 border-t flex items-center gap-2 text-xs" style={{ borderColor: '#E8E4DF', color: '#7C7F85' }}>
                        <span className="font-medium" style={{ color: '#1E293B' }}>Categoría:</span>
                        {selCita.nombreCategoria}
                        <span className="w-1 h-1 rounded-full bg-[#D0CCC6]" />
                        <span className="font-medium" style={{ color: '#1E293B' }}>Prioridad:</span>
                        <span style={{ color: selCita.prioridad === 'URGENTE' ? '#C44536' : '#1E293B' }}>
                          {selCita.prioridad}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {tabFicha === 'Antecedentes' && (
                  <HistorialPaciente pacienteId={selCita.idPaciente} />
                )}

                {/* Botonera */}
                {tabFicha === 'Evolución Actual' && (
                  <div className="mt-6 pb-4 flex flex-wrap items-center gap-3">
                    <button onClick={handleGuardarNota}
                      className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                      style={{ color: '#3A7D5C', backgroundColor: '#E8F0EC' }}>
                      <FileText className="w-4 h-4" /> Guardar Nota Clínica
                    </button>
                    <button onClick={handleFinalizar} disabled={guardando || !notasClinicas.trim()}
                      className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
                      style={{ backgroundColor: guardando ? '#7C7F85' : '#C44536' }}>
                      {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                        : <><FileText className="w-4 h-4" /> Guardar y Finalizar Consulta</>}
                    </button>
                    <button onClick={() => navigate(`/profesional/derivar/${selCita.idSolicitud}`)}
                      className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                      style={{ color: '#C44536', backgroundColor: '#FEF6F4' }}>
                      <Send className="w-4 h-4" /> Solicitar Re-derivación
                    </button>
                    <button onClick={() => setAgendarOpen(o => !o)}
                      className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                      style={{ color: '#3A7D5C', backgroundColor: '#E8F0EC' }}>
                      <CalendarDays className="w-4 h-4" /> Agendar Próximo Control
                    </button>

                    {agendarOpen && (
                      <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5"
                        style={{ borderColor: '#E8E4DF', backgroundColor: 'white' }}>
                        <input type="datetime-local" value={proxFecha} onChange={e => setProxFecha(e.target.value)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs outline-none"
                          style={{ borderColor: '#E8E4DF', color: '#1E293B' }} />
                        <select value={proxDuracion} onChange={e => setProxDuracion(Number(e.target.value))}
                          className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                          style={{ borderColor: '#E8E4DF', color: '#1E293B' }}>
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                        </select>
                        <button onClick={handleAgendarProximo} disabled={agendando}
                          className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                          style={{ backgroundColor: '#3A7D5C' }}>
                          {agendando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Agendar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {registrarModal && <RegistrarPacienteModal onClose={() => setRegistrarModal(false)} centroSaludId={perfil.centroActual?.id} />}
    </div>
  );
}

function HistorialPaciente({ pacienteId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!pacienteId) return;
    api.get('/solicitudes/profesional/todas')
      .then(r => setItems((r.data || []).filter(s => s.idPaciente === pacienteId)))
      .catch(() => {});
  }, [pacienteId]);

  if (items.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: '#7C7F85' }}>
        <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#D0CCC6' }} />
        <p className="text-sm">Sin antecedentes registrados</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold mb-3" style={{ color: '#1E293B' }}>
        Historial de sesiones ({items.length})
      </p>
      <div className="space-y-2">
        {items.slice().reverse().map(s => (
          <div key={s.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm border"
            style={{ backgroundColor: 'white', borderColor: '#E8E4DF' }}>
            <span style={{ color: '#7C7F85', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>
              {formatearFecha(s.fechaCreacion, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium" style={{ color: '#1E293B' }}>{s.titulo}</p>
              <p className="text-xs truncate" style={{ color: '#7C7F85' }}>{s.descripcion}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              s.estado === 'COMPLETADA' ? 'text-[#3A7D5C] bg-[#E8F0EC]' : 'text-[#D49A5A] bg-[#FEF3E9]'
            }`}>
              {s.estado === 'COMPLETADA' ? 'Completada' : 'Activa'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder icon import for Building2 used in empty state
function Building2(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
      <path d="M12 10h.01" /><path d="M12 14h.01" />
      <path d="M16 10h.01" /><path d="M16 14h.01" />
      <path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  );
}
