import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, ChevronRight,
  FileText, Stethoscope, Pill, Send, Trash2, User, Building2, MapPin, ClipboardList, MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatearFechaHora, formatearFecha } from '../../utils/fechas';
import { estadoSolicitudHumano, estadoSolicitudColor } from '../../utils/estados';

const PRIORIDAD_STYLE = {
  URGENTE: { bg: '#FEF0EE', color: '#C44536' },
  ALTA: { bg: '#FEF3E9', color: '#D49A5A' },
  MEDIA: { bg: '#E8F0EC', color: '#3A7D5C' },
  BAJA: { bg: '#EEF2F7', color: '#64748B' },
};

const PASOS = ['Asignado', 'En consulta', 'Completado'];

function indicePaso(estado) {
  if (estado === 'ASIGNADA' || estado === 'CREADA' || estado === 'REVISADA') return 0;
  if (estado === 'EN_PROCESO') return 1;
  if (estado === 'COMPLETADA') return 2;
  return -1;
}

export default function DetalleSolicitud() {
  const { id } = useParams();
  const [sol, setSol] = useState(null);
  const [hist, setHist] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);
  const [nr, setNr] = useState({ diagnostico: '', tratamiento: '', observaciones: '', tipoPlantilla: '' });
  const [saving, setSaving] = useState(false);
  const [showAgendar, setShowAgendar] = useState(false);
  const [cita, setCita] = useState({ fechaHora: '', duracion: 45, modalidad: 'PRESENCIAL', notas: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/solicitudes/${id}`).then(r => setSol(r.data)).catch(() => {});
    setLoadingHist(true);
    api.get(`/historia-clinica/solicitud/${id}`).then(r => setHist(r.data)).catch(() => {}).finally(() => setLoadingHist(false));
  }, [id]);

  const handleEstado = async (est) => {
    try { const res = await api.put(`/solicitudes/${id}/estado?estado=${est}`); setSol(res.data); toast.success(`Estado actualizado: ${estadoSolicitudHumano(est)}`); } catch (err) { toast.error(err.response?.data?.mensaje || 'Error'); }
  };

  const handleHist = async (e) => {
    e.preventDefault();
    if (!sol?.idPaciente) { toast.error('La solicitud aún no tiene un paciente asignado'); return; }
    if (!nr.diagnostico && !nr.tratamiento && !nr.observaciones) { toast.error('Completá al menos un campo del registro'); return; }
    setSaving(true);
    try {
      await api.post('/historia-clinica', { ...nr, idSolicitud: parseInt(id, 10), idPaciente: sol.idPaciente });
      toast.success('Registro guardado');
      setNr({ diagnostico: '', tratamiento: '', observaciones: '', tipoPlantilla: '' });
      api.get(`/historia-clinica/solicitud/${id}`).then(r => setHist(r.data));
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar el registro');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/historia-clinica/${deleteTarget.id}`);
      toast.success('Registro eliminado');
      setHist(prev => prev.filter(h => h.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al eliminar el registro');
    } finally { setDeleting(false); }
  };

  const handleAgendar = async (e) => {
    e.preventDefault();
    if (!sol.idProfesional) { toast.error('No hay profesional asignado a esta solicitud'); return; }
    if (!cita.fechaHora) { toast.error('Seleccioná una fecha y hora'); return; }
    try {
      const fechaHora = cita.fechaHora.length === 16 ? `${cita.fechaHora}:00` : cita.fechaHora;
      await api.post('/citas', {
        idSolicitud: parseInt(id, 10),
        idProfesional: sol.idProfesional,
        fechaHora,
        duracion: cita.duracion === '' || isNaN(cita.duracion) ? 30 : parseInt(cita.duracion, 10),
        modalidad: cita.modalidad,
        notas: cita.notas || '',
      });
      toast.success('Turno agendado correctamente');
      setShowAgendar(false);
      setCita({ fechaHora: '', duracion: 45, modalidad: 'PRESENCIAL', notas: '' });
      api.get(`/solicitudes/${id}`).then(r => setSol(r.data));
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al agendar turno'); }
  };

  if (!sol) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C44536] border-t-transparent rounded-full" />
      </div>
    );
  }

  const pStyle = PRIORIDAD_STYLE[sol.prioridad] || PRIORIDAD_STYLE.MEDIA;
  const eStyle = estadoSolicitudColor(sol.estado);
  const urgente = sol.prioridad === 'URGENTE' || sol.prioridad === 'ALTA';
  const paso = indicePaso(sol.estado);
  const esPreAsignacion = sol.estado === 'CREADA' || sol.estado === 'REVISADA';
  const esDerivada = sol.estado === 'DERIVADA';
  const completada = sol.estado === 'COMPLETADA';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        <Link to="/profesional/solicitudes"
          className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: '#7C7F85' }}>
          <ArrowLeft className="w-4 h-4" /> Volver a Mis Solicitudes
        </Link>

        {/* Encabezado del caso */}
        <div className="rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: urgente ? '#F1B8AC' : '#E8E4DF' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>{sol.titulo}</h1>
                {urgente && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#FEF0EE', color: '#C44536' }}>
                    <AlertTriangle className="w-2.5 h-2.5" /> URGENTE
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: '#7C7F85' }}>
                <span className="font-semibold" style={{ color: '#1E293B' }}>{sol.nombrePaciente}</span>
                <span>·</span><span>{sol.nombreCategoria}</span>
                <span>·</span><span>{formatearFechaHora(sol.fechaCreacion)}</span>
              </div>
              {sol.descripcion && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: '#5B5F66' }}>{sol.descripcion}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex gap-1">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={pStyle}>{sol.prioridad}</span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={eStyle}>{estadoSolicitudHumano(sol.estado)}</span>
              </div>
              {sol.fechaTurno && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#E8F0EC', color: '#3A7D5C' }}>
                  <CalendarClock className="w-3.5 h-3.5" />
                  {formatearFechaHora(sol.fechaTurno)} · {sol.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                </span>
              )}
            </div>
          </div>

          {/* Stepper de estados */}
          {paso >= 0 && (
            <div className="mt-6 pt-5 border-t" style={{ borderColor: '#F0EEE9' }}>
              {esPreAsignacion ? (
                <p className="text-sm font-semibold" style={{ color: '#64748B' }}>
                  Caso sin asignar aún — asignátelo para iniciar el seguimiento
                </p>
              ) : esDerivada ? (
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#7C3AED' }}>
                  <Send className="w-4 h-4" /> Caso derivado a otro profesional o centro
                </p>
              ) : (
                <div className="flex items-center gap-3 max-w-xl">
                  {PASOS.map((label, i) => {
                    const done = i < paso || (completada && i === paso);
                    const current = i === paso && !done;
                    return (
                      <React.Fragment key={label}>
                        {i > 0 && <div className="flex-1 h-px" style={{ backgroundColor: i <= paso ? '#3A7D5C' : '#E0DDD7' }} />}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{
                              backgroundColor: done ? '#3A7D5C' : current ? '#C44536' : '#EEF2F7',
                              color: done || current ? 'white' : '#9A9CA1',
                            }}>
                            {done ? '✓' : i + 1}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: done || current ? '#1E293B' : '#9A9CA1' }}>{label}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna principal: ficha */}
          <div className="lg:col-span-2 space-y-5">

            {/* Historia clínica */}
            <div className="rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#F0EEE9' }}>
                <FileText className="w-4 h-4" style={{ color: '#C44536' }} />
                <h3 className="text-sm font-bold" style={{ color: '#1E293B' }}>Historia Clínica</h3>
                <span className="ml-auto text-xs" style={{ color: '#7C7F85' }}>{hist.length} registros</span>
              </div>
              <div className="p-5 space-y-3">
                {loadingHist ? (
                  <p className="text-sm" style={{ color: '#9A9CA1' }}>Cargando...</p>
                ) : hist.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: '#9A9CA1' }}>Sin registros todavía</p>
                ) : hist.map(h => (
                  <div key={h.id} className="rounded-xl border p-4" style={{ borderColor: '#E8E4DF', backgroundColor: '#FBF9F7' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF2F7', color: '#64748B' }}>
                        {formatearFechaHora(h.fechaCreacion)}
                      </span>
                      <button onClick={() => setDeleteTarget(h)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-black/5"
                        title="Eliminar registro">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#9A9CA1' }} />
                      </button>
                    </div>
                    {h.diagnostico && (
                      <div className="text-sm mb-1">
                        <span className="font-semibold" style={{ color: '#C44536' }}>Diagnóstico:</span>{' '}
                        <span style={{ color: '#5B5F66' }}>{h.diagnostico}</span>
                      </div>
                    )}
                    {h.tratamiento && (
                      <div className="text-sm mb-1">
                        <span className="font-semibold" style={{ color: '#3A7D5C' }}>Tratamiento:</span>{' '}
                        <span style={{ color: '#5B5F66' }}>{h.tratamiento}</span>
                      </div>
                    )}
                    {h.observaciones && (
                      <div className="text-sm">
                        <span className="font-semibold" style={{ color: '#D49A5A' }}>Observaciones:</span>{' '}
                        <span style={{ color: '#5B5F66' }}>{h.observaciones}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nuevo registro */}
            <div className="rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
                <h3 className="text-sm font-bold" style={{ color: '#1E293B' }}>Nuevo Registro de Evolución</h3>
              </div>
              <form onSubmit={handleHist} className="p-5 space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                    <Stethoscope className="w-3.5 h-3.5" style={{ color: '#3A7D5C' }} /> Diagnóstico
                  </label>
                  <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B', backgroundColor: 'white' }}
                    placeholder="Ej: Ansiedad generalizada" value={nr.diagnostico} onChange={e => setNr({ ...nr, diagnostico: e.target.value })} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                    <Pill className="w-3.5 h-3.5" style={{ color: '#D49A5A' }} /> Tratamiento
                  </label>
                  <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B', backgroundColor: 'white' }}
                    placeholder="Ej: Terapia cognitivo-conductual" value={nr.tratamiento} onChange={e => setNr({ ...nr, tratamiento: e.target.value })} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                    <FileText className="w-3.5 h-3.5" style={{ color: '#C44536' }} /> Observaciones
                  </label>
                  <textarea className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none resize-none" rows={3} style={{ borderColor: '#E8E4DF', color: '#1E293B', backgroundColor: 'white' }}
                    placeholder="Notas adicionales sobre la sesión" value={nr.observaciones} onChange={e => setNr({ ...nr, observaciones: e.target.value })} />
                </div>
                <button type="submit" disabled={saving}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#3A7D5C' }}>
                  {saving ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </form>
            </div>
          </div>

          {/* Columna derecha: acciones + info */}
          <div className="space-y-5">
            <div className="rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#1E293B' }}>
                  <ClipboardList className="w-4 h-4" style={{ color: '#C44536' }} /> Acciones
                </h3>
              </div>
              <div className="p-5 space-y-2.5">
                {sol.idProfesional && (
                  <Link to={`/mensajes?solicitud=${id}`}
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                    style={{ backgroundColor: '#FEF0EE', color: '#C44536' }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Enviar mensaje
                  </Link>
                )}

                {esPreAsignacion && (
                  <>
                    {sol.estado === 'CREADA' && (
                      <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#F6F4F0', color: '#1E293B' }}
                        onClick={() => handleEstado('REVISADA')}>
                        Marcar como Revisada
                      </button>
                    )}
                    <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#C44536' }}
                      onClick={() => handleEstado('ASIGNADA')}>
                      Asignarme el caso
                    </button>
                  </>
                )}

                {sol.estado === 'ASIGNADA' && (
                  <>
                    <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#C44536' }}
                      onClick={() => handleEstado('EN_PROCESO')}>
                      Iniciar Consulta
                    </button>
                    {!sol.fechaTurno && (
                      <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#F6F4F0', color: '#1E293B' }}
                        onClick={() => setShowAgendar(o => !o)}>
                        Programar Turno
                      </button>
                    )}
                  </>
                )}

                {sol.estado === 'EN_PROCESO' && (
                  <>
                    <Link to={`/profesional/derivar/${id}`}
                      className="flex items-center justify-center gap-1 w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                      style={{ backgroundColor: '#F0EBFA', color: '#7C3AED' }}>
                      Derivar a otro profesional / centro <ChevronRight className="w-3 h-3" />
                    </Link>
                    {!sol.fechaTurno && (
                      <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#F6F4F0', color: '#1E293B' }}
                        onClick={() => setShowAgendar(o => !o)}>
                        Programar Turno
                      </button>
                    )}
                    <button className="flex items-center justify-center gap-1.5 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#3A7D5C' }}
                      onClick={() => handleEstado('COMPLETADA')}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar Consulta
                    </button>
                  </>
                )}

                {esDerivada && (
                  <>
                    <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                      style={{ backgroundColor: '#F6F4F0', color: '#1E293B' }}
                      onClick={() => handleEstado('ASIGNADA')}>
                      Reasignarme el caso
                    </button>
                    <button className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#3A7D5C' }}
                      onClick={() => handleEstado('COMPLETADA')}>
                      Cerrar caso
                    </button>
                  </>
                )}

                {completada && (
                  <p className="text-sm text-center py-2" style={{ color: '#3A7D5C' }}>
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Caso completado
                  </p>
                )}

                {sol.fechaTurno && (
                  <Link to="/profesional/dashboard"
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors"
                    style={{ backgroundColor: '#E8F0EC', color: '#3A7D5C' }}>
                    <CalendarClock className="w-3.5 h-3.5" /> Ver en la Agenda
                  </Link>
                )}
              </div>
            </div>

            {showAgendar && (
              <div className="rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
                  <h3 className="text-sm font-bold" style={{ color: '#1E293B' }}>Programar Turno</h3>
                </div>
                <form onSubmit={handleAgendar} className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Fecha y hora</label>
                    <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" type="datetime-local" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      value={cita.fechaHora} onChange={e => setCita({ ...cita, fechaHora: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Duración (minutos)</label>
                    <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" type="number" min={15} max={120} step={5} style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      value={cita.duracion || ''} onChange={e => setCita({ ...cita, duracion: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Modalidad</label>
                    <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      value={cita.modalidad} onChange={e => setCita({ ...cita, modalidad: e.target.value })}>
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="VIRTUAL">Virtual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Notas</label>
                    <textarea className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none resize-none" rows={2} style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      placeholder="Indicaciones para el turno" value={cita.notas} onChange={e => setCita({ ...cita, notas: e.target.value })} />
                  </div>
                  <button type="submit" className="w-full rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#3A7D5C' }}>
                    Confirmar Turno
                  </button>
                </form>
              </div>
            )}

            {/* Info del paciente */}
            <div className="rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C7F85' }}>Información del Paciente</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <InfoRow icon={<User className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Nombre" value={sol.nombrePaciente} />
                {(sol.tipoDocumento || sol.numDocumento) && <InfoRow icon={<User className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Documento" value={`${sol.tipoDocumento ? sol.tipoDocumento + ': ' : ''}${sol.numDocumento}`} />}
                <InfoRow icon={<Building2 className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Obra Social" value={sol.nombreObraSocial || 'Sin cobertura'} />
                <InfoRow icon={<ClipboardList className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Categoría" value={sol.nombreCategoria} />
                <InfoRow icon={<AlertTriangle className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Prioridad" value={sol.prioridad} />
                <InfoRow icon={<CalendarClock className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Creada" value={formatearFecha(sol.fechaCreacion)} />
                {sol.nombreCentroSalud && <InfoRow icon={<Building2 className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Centro" value={sol.nombreCentroSalud} />}
                {sol.nombreProfesional && <InfoRow icon={<User className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Profesional" value={sol.nombreProfesional} />}
                {sol.fechaTurno && <InfoRow icon={<CalendarClock className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Turno" value={formatearFechaHora(sol.fechaTurno)} />}
                {sol.direccionPaciente && <InfoRow icon={<MapPin className="w-4 h-4" style={{ color: '#7C7F85' }} />} label="Dirección" value={sol.direccionPaciente} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar registro */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }} onClick={() => !deleting && setDeleteTarget(null)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', padding: '1.5rem',
            maxWidth: '420px', width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h4 style={{ margin: '0 0 0.5rem', fontFamily: "'Inter', sans-serif", fontSize: '1.125rem', color: '#1E293B' }}>
              Eliminar registro
            </h4>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#7C7F85' }}>
              ¿Estás seguro de eliminar este registro de la historia clínica?
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button className="rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                style={{ backgroundColor: '#F6F4F0', color: '#1E293B' }} onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancelar
              </button>
              <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C44536' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px]" style={{ color: '#9A9CA1' }}>{label}</p>
        <p className="font-medium text-xs" style={{ color: '#1E293B' }}>{value}</p>
      </div>
    </div>
  );
}
