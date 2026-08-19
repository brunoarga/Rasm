import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import useSecretarioPerfil from '../../hooks/useSecretarioPerfil';
import {
  AlertTriangle, ArrowLeft, CheckCircle, User, Building2, Calendar,
  MapPin, Pencil, Copy, Mail, Phone
} from 'lucide-react';
import { parsearFechaLocal, formatearFechaHora, hoyISO } from '../../utils/fechas';

export default function DetalleSolicitudSecretaria() {
  const { id } = useParams();
  const { perfil } = useSecretarioPerfil();
  const [sol, setSol] = useState(null);
  const [step, setStep] = useState('info');
  const [centros, setCentros] = useState([]);
  const [centroSel, setCentroSel] = useState('');
  const [profesionales, setProfesionales] = useState([]);
  const [cambiandoCentro, setCambiandoCentro] = useState(false);
  const [loadingProf, setLoadingProf] = useState(false);
  const [profSel, setProfSel] = useState('');
  const [profSelInfo, setProfSelInfo] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [fecha, setFecha] = useState('');
  const [turno, setTurno] = useState({ fechaHora: '', duracion: 30, modalidad: 'PRESENCIAL' });
  const [copiado, setCopiado] = useState(false);

  const referente = !!perfil?.referente;
  const centroReferente = perfil?.idCentroSalud;

  const fetchProfesionales = async (idCentro) => {
    setLoadingProf(true);
    try {
      const r = await api.get(`/profesionales/centro/${idCentro}`);
      setProfesionales(r.data || []);
    } catch {
      toast.error('Error al cargar profesionales del centro');
    } finally {
      setLoadingProf(false);
    }
  };

  const handleBuscarCentros = async () => {
    try {
      const r = await api.get(`/solicitudes/${id}/centros-disponibles`);
      setCentros(r.data);
      if (r.data.length === 0) toast.warning('No hay centros disponibles para esta obra social');
      return r.data;
    } catch {
      toast.error('Error al buscar centros');
      return [];
    }
  };

  useEffect(() => {
    api.get(`/solicitudes/${id}`).then(async r => {
      setSol(r.data);
      if (r.data.idCentroSalud) setCentroSel(r.data.idCentroSalud);

      // Referente: solo gestiona solicitudes de su centro
      if (referente) {
        if (r.data.estado === 'RECIBIDA' && !r.data.fechaTurno) {
          setStep('profesional');
          await fetchProfesionales(centroReferente);
        } else if (r.data.fechaTurno || r.data.estado === 'ASIGNADA') {
          setStep('asignado');
        }
        return;
      }

      // Secretaría central: solo deriva
      if (r.data.fechaTurno) { setStep('asignado'); return; }
      if (r.data.idCentroSalud) { setStep('derivado'); return; }
      const disponibles = await handleBuscarCentros();
      if (disponibles.length > 0) setStep('info');
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, referente, centroReferente]);

  const handleDerivarCentro = async (idCentro) => {
    try {
      const r = await api.put(`/solicitudes/${id}/derivar-centro/${idCentro}`);
      setSol(r.data);
      setCentroSel(idCentro);
      toast.success('Solicitud derivada al centro');
      setStep(referente ? 'profesional' : 'derivado');
      if (referente) await fetchProfesionales(idCentro);
    } catch {
      toast.error('Error al derivar');
    }
  };

  const handleCambiarCentro = async (idCentro) => {
    if (parseInt(centroSel) === idCentro) { setCambiandoCentro(false); return; }
    try {
      const r = await api.put(`/solicitudes/${id}/centro`, { idCentroSalud: idCentro });
      setSol(r.data);
      setCentroSel(idCentro);
      setProfSel('');
      setProfSelInfo(null);
      toast.success('Centro actualizado');
      await fetchProfesionales(idCentro);
      setCambiandoCentro(false);
    } catch {
      toast.error('Error al cambiar centro');
    }
  };

  const handleSeleccionarProfesional = (idProf) => {
    setProfSel(idProf);
    setProfSelInfo(profesionales.find(p => p.id === idProf) || null);
    setStep('turno');
  };

  const handleBuscarDisponibilidad = async () => {
    if (!fecha || !profSel) return;
    try {
      const r = await api.get(`/profesionales/${profSel}/disponibilidad?idCentro=${centroSel}&fecha=${fecha}`);
      setDisponibilidad(r.data);
    } catch {
      toast.error('Error al consultar disponibilidad');
    }
  };

  const handleAsignarTurno = async (horaSlot) => {
    try {
      const r = await api.post(`/solicitudes/${id}/asignar-turno`, {
        idCentroSalud: parseInt(centroSel),
        idProfesional: parseInt(profSel),
        fechaHora: `${fecha}T${horaSlot}`,
        duracion: turno.duracion,
        modalidad: turno.modalidad,
      });
      setSol(r.data);
      setStep('confirmado');
      toast.success('Turno asignado correctamente. El paciente fue notificado.');
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al asignar turno';
      toast.error(typeof msg === 'string' ? msg : 'Error al asignar turno');
    }
  };

  const handleDevolverCentral = async () => {
    try {
      const r = await api.post(`/solicitudes/${id}/devolver-central`);
      setSol(r.data);
      setStep('devuelto');
      toast.success('Solicitud devuelta a la central');
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al devolver a la central';
      toast.error(typeof msg === 'string' ? msg : 'Error al devolver a la central');
    }
  };

  const copiarFolio = () => {
    if (!sol?.folio) return;
    navigator.clipboard?.writeText(sol.folio);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  if (!sol) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <Link to={referente ? '/secretaria/recepcion' : '/secretaria/solicitudes'}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {referente ? 'Volver a la Mesa de Entrada' : 'Volver a solicitudes'}
        </Link>

        {/* Solicitud Header */}
        <div className={`bg-white border rounded-xl p-6 ${sol.prioridad === 'URGENTE' ? 'border-red-200' : 'border-slate-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {sol.folio && (
                  <button onClick={copiarFolio}
                    title="Copiar folio"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full hover:bg-sky-100 transition-colors">
                    <Copy className="w-3 h-3" /> {sol.folio} {copiado && '✓'}
                  </button>
                )}
                <h1 className="text-lg font-bold text-slate-800">{sol.titulo}</h1>
                {sol.prioridad === 'URGENTE' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-2.5 h-2.5" /> URGENTE
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                <span className="font-medium text-slate-700">{sol.nombrePaciente}</span>
                <span className="text-slate-300">&middot;</span>
                <span>{sol.nombreCategoria}</span>
                <span className="text-slate-300">&middot;</span>
                <span>{formatearFechaHora(sol.fechaCreacion)}</span>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{sol.descripcion}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                sol.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>{sol.prioridad}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                sol.estado === 'RECIBIDA' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
              }`}>{sol.estado}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Estado RECIBIDA para el referente: botón de aceptar */}
            {referente && sol.estado === 'RECIBIDA' && step === 'profesional' && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sky-900">Derivación recibida en {sol.nombreCentroSalud}</p>
                    <p className="text-xs text-sky-700">Seleccioná el profesional y asigná el turno para confirmar la aceptación.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-sky-200">
                  <p className="text-xs text-sky-700">
                    Si el profesional no puede atender la solicitud, devolvela a la central para que la reasigne.
                  </p>
                  <button onClick={handleDevolverCentral}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shrink-0">
                    Devolver a la central
                  </button>
                </div>
              </div>
            )}

            {step === 'info' && !referente && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Derivar a Centro de Salud</h3>
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-slate-50 text-sm">
                  <span className="text-slate-500">Obra Social del Paciente</span>
                  <span className="font-semibold text-slate-700">{sol.nombreObraSocial || 'Sin cobertura'}</span>
                </div>
                <button onClick={handleBuscarCentros}
                  className={`w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors ${centros.length > 0 ? 'hidden' : ''}`}>
                  Buscar Centros Disponibles
                </button>
                {centros.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Centros Disponibles ({centros.length})</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {centros.map(c => (
                        <div key={c.id} role="button" tabIndex={0}
                          onClick={() => handleDerivarCentro(c.id)}
                          onKeyDown={e => { if (e.key === 'Enter') handleDerivarCentro(c.id); }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            parseInt(centroSel) === c.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}>
                          <p className="text-sm font-semibold text-slate-700">{c.nombre}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.direccion} | {c.esPublico ? 'Público' : 'Privado'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'derivado' && !referente && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-sky-600" />
                </div>
                <p className="text-lg font-bold text-slate-800">Derivada al centro</p>
                <p className="text-sm text-slate-500">
                  {sol.nombreCentroSalud || 'Centro'} &middot; {sol.folio ? `Folio ${sol.folio}` : ''}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  El referente del centro aceptará la derivación y asignará el turno. El paciente será notificado.
                </p>
                <Link to="/secretaria/solicitudes"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Volver a Solicitudes
                </Link>
              </div>
            )}

            {step === 'profesional' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700">Seleccionar Profesional</h3>
                  {!referente && sol.nombreCentroSalud && !cambiandoCentro && (
                    <button onClick={() => { setCambiandoCentro(true); if (centros.length === 0) handleBuscarCentros(); }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      <Pencil className="w-3 h-3" /> Cambiar Centro
                    </button>
                  )}
                </div>
                {!cambiandoCentro && sol.nombreCentroSalud && (
                  <p className="text-xs text-slate-500 mb-4">Centro: <strong className="text-slate-700">{sol.nombreCentroSalud}</strong></p>
                )}
                {cambiandoCentro && !referente && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seleccionar otro centro</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {centros.map(c => (
                        <div key={c.id} role="button" tabIndex={0}
                          onClick={() => handleCambiarCentro(c.id)}
                          onKeyDown={e => { if (e.key === 'Enter') handleCambiarCentro(c.id); }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            parseInt(centroSel) === c.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}>
                          <p className="text-sm font-semibold text-slate-700">{c.nombre}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.direccion} | {c.esPublico ? 'Público' : 'Privado'}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCambiandoCentro(false)}
                      className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                      Cancelar
                    </button>
                  </div>
                )}
                {!cambiandoCentro && (loadingProf ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                  </div>
                ) : profesionales.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-slate-400">No hay profesionales en este centro</p>
                    {referente && (
                      <p className="text-xs text-slate-400">Contactá con la administración del centro para cargar profesionales.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profesionales.map(p => (
                      <div key={p.id} role="button" tabIndex={0}
                        onClick={() => handleSeleccionarProfesional(p.id)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSeleccionarProfesional(p.id); }}
                        className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{p.usuario?.nombreCompleto}</p>
                            <p className="text-xs text-slate-500">{p.usuario?.tipoProfesional?.replace('_', ' ')} &middot; {p.usuario?.especialidad}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {step === 'turno' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700">Cuaderno Digital de Turnos</h3>
                </div>
                {profSelInfo && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {profSelInfo.usuario?.nombreCompleto?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{profSelInfo.usuario?.nombreCompleto}</p>
                      <p className="text-xs text-slate-500">{profSelInfo.usuario?.tipoProfesional?.replace('_', ' ')} &middot; {profSelInfo.usuario?.especialidad}</p>
                    </div>
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Seleccionar Fecha</label>
                      <input type="date" value={fecha}
                        onChange={e => { setFecha(e.target.value); setDisponibilidad(null); }}
                        min={hoyISO()}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <button onClick={handleBuscarDisponibilidad} disabled={!fecha}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Consultar
                    </button>
                  </div>

                  {disponibilidad && disponibilidad.length === 0 && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      Sin horarios disponibles para esta fecha
                    </div>
                  )}

                  {disponibilidad && disponibilidad.length > 0 && (() => {
                    const slotMap = {};
                    disponibilidad.forEach(s => { slotMap[s.hora] = s; });
                    const SLOTS_MANANA = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
                    const SLOTS_TARDE = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];
                    return (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                          <span>{parsearFechaLocal(fecha)?.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || ''}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponible</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Ocupado</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-600" /> Seleccionado</span>
                          </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          <div>
                            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider">Turno Mañana</div>
                            <div className="grid grid-cols-4 gap-2 p-3">
                              {SLOTS_MANANA.map(hora => {
                                const slot = slotMap[hora];
                                const libre = slot?.estado === 'DISPONIBLE';
                                const ocupado = slot && !libre;
                                const sel = turno.fechaHora === `${fecha}T${hora}`;
                                return (
                                  <button key={hora} disabled={!libre}
                                    onClick={() => libre && setTurno({ ...turno, fechaHora: `${fecha}T${hora}` })}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded px-2 py-3 text-xs font-semibold transition-all ${
                                      sel ? 'bg-blue-600 text-white shadow-sm' :
                                      libre ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border border-emerald-200' :
                                      'bg-red-50 text-red-400 cursor-not-allowed opacity-60 border border-red-200'
                                    }`}>
                                    <span>{hora}</span>
                                    {ocupado && slot.paciente && (
                                      <span className="text-[9px] font-normal leading-tight truncate max-w-full">{slot.paciente}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-[11px] font-bold text-blue-800 uppercase tracking-wider">Turno Tarde</div>
                            <div className="grid grid-cols-4 gap-2 p-3">
                              {SLOTS_TARDE.map(hora => {
                                const slot = slotMap[hora];
                                const libre = slot?.estado === 'DISPONIBLE';
                                const ocupado = slot && !libre;
                                const sel = turno.fechaHora === `${fecha}T${hora}`;
                                return (
                                  <button key={hora} disabled={!libre}
                                    onClick={() => libre && setTurno({ ...turno, fechaHora: `${fecha}T${hora}` })}
                                    className={`flex flex-col items-center justify-center gap-0.5 rounded px-2 py-3 text-xs font-semibold transition-all ${
                                      sel ? 'bg-blue-600 text-white shadow-sm' :
                                      libre ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer border border-emerald-200' :
                                      'bg-red-50 text-red-400 cursor-not-allowed opacity-60 border border-red-200'
                                    }`}>
                                    <span>{hora}</span>
                                    {ocupado && slot.paciente && (
                                      <span className="text-[9px] font-normal leading-tight truncate max-w-full">{slot.paciente}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {turno.fechaHora && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-blue-800">Turno seleccionado</p>
                          <p className="text-xs text-blue-600">
                            {parsearFechaLocal(`${fecha}T${turno.fechaHora.split('T')[1]}`)?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) || ''}
                            {' — Complete los detalles para confirmar'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Duración</label>
                          <select value={turno.duracion}
                            onChange={e => setTurno({ ...turno, duracion: parseInt(e.target.value) })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                            <option value={30}>30 min</option>
                            <option value={20}>20 min</option>
                            <option value={15}>15 min</option>
                            <option value={10}>10 min</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">Modalidad</label>
                          <select value={turno.modalidad}
                            onChange={e => setTurno({ ...turno, modalidad: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                            <option value="PRESENCIAL">Presencial</option>
                            <option value="VIRTUAL">Virtual</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={() => handleAsignarTurno(turno.fechaHora.split('T')[1])}
                        className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                        Aceptar Derivación y Asignar Turno
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'asignado' && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-slate-800">Turno Asignado</p>
                <p className="text-sm text-slate-500">
                  {sol.nombreProfesional || 'Profesional'} &middot; {sol.fechaTurno ? formatearFechaHora(sol.fechaTurno) : ''}
                </p>
                <Link to={referente ? '/secretaria/recepcion' : '/secretaria/agenda'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  {referente ? 'Volver a la Mesa de Entrada' : 'Ver en Agenda'}
                </Link>
              </div>
            )}

            {step === 'devuelto' && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                  <ArrowLeft className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-lg font-bold text-slate-800">Devuelta a la central</p>
                <p className="text-sm text-slate-500">
                  {sol.nombrePaciente} &middot; Folio {sol.folio}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  La solicitud volvió a la central de derivaciones, que la reasignará a otro centro. El paciente sigue sin turno.
                </p>
                <Link to="/secretaria/recepcion"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Volver a la Mesa de Entrada
                </Link>
              </div>
            )}

            {step === 'confirmado' && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-slate-800">Turno Asignado Exitosamente</p>
                <p className="text-sm text-slate-500">
                  {sol.nombreProfesional || 'Profesional'} &middot; {sol.fechaTurno ? formatearFechaHora(sol.fechaTurno) : ''}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  El paciente fue notificado con todos los detalles del turno por email y WhatsApp.
                </p>
                <Link to={referente ? '/secretaria/recepcion' : '/secretaria/solicitudes'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  {referente ? 'Volver a la Mesa de Entrada' : 'Volver a Solicitudes'}
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Información del Paciente</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Nombre</p>
                  <p className="font-medium text-slate-700">{sol.nombrePaciente}</p>
                </div>
              </div>
              {(sol.tipoDocumento || sol.numDocumento) && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Documento</p>
                    <p className="font-medium text-slate-700">{sol.tipoDocumento && `${sol.tipoDocumento}:`} {sol.numDocumento}</p>
                  </div>
                </div>
              )}
              {sol.edadPaciente != null && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Edad</p>
                    <p className="font-medium text-slate-700">{sol.edadPaciente} años</p>
                  </div>
                </div>
              )}
              {sol.direccionPaciente && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Dirección</p>
                    <p className="font-medium text-slate-700">{sol.direccionPaciente}</p>
                  </div>
                </div>
              )}
              {sol.emailPaciente && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium text-slate-700 break-all">{sol.emailPaciente}</p>
                  </div>
                </div>
              )}
              {sol.telefonoPaciente && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="font-medium text-slate-700">{sol.telefonoPaciente}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Obra Social</p>
                  <p className="font-medium text-slate-700">{sol.nombreObraSocial || 'Sin cobertura'}</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              {sol.folio && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 shrink-0">Folio</span>
                  <span className="font-semibold text-sky-700">{sol.folio}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 shrink-0">Categoría</span>
                <span className="font-medium text-slate-700">{sol.nombreCategoria}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 shrink-0">Prioridad</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  sol.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>{sol.prioridad}</span>
              </div>
              {sol.idCentroSalud && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Centro</p>
                    <p className="font-medium text-slate-700">{sol.nombreCentroSalud}</p>
                  </div>
                </div>
              )}
              {sol.nombreProfesional && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Profesional</p>
                    <p className="font-medium text-slate-700">{sol.nombreProfesional}</p>
                  </div>
                </div>
              )}
              {sol.fechaTurno && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Turno</p>
                    <p className="font-medium text-slate-700">{sol.fechaTurno ? formatearFechaHora(sol.fechaTurno) : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}