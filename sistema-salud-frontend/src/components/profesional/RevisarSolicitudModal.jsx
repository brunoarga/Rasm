import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, User, Phone, Mail, Calendar,
  FileText, Activity, Moon, Brain, Heart, Send,
  Shield, BookOpen, Loader2, CheckCircle,
  PhoneCall, BadgeCheck
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { parsearFechaLocal } from '../../utils/fechas';

const ANIMO_BADGE = {
  EXCELENTE: { label: 'Excelente', cls: 'bg-emerald-100 text-emerald-700' },
  ESTABLE:   { label: 'Estable',   cls: 'bg-blue-100 text-blue-700' },
  ANSIOSO:   { label: 'Ansioso',   cls: 'bg-amber-100 text-amber-700' },
  TRISTE:    { label: 'Triste',    cls: 'bg-indigo-100 text-indigo-700' },
  IRRITABLE: { label: 'Irritable', cls: 'bg-rose-100 text-rose-700' },
};

const TABS = ['Datos y Motivo', 'SuDiario', 'Historial'];

function formatearFecha(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatearFechaCorta(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short'
  });
}

function DatosPacienteCard({ p }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Documento</p>
          <p className="text-sm font-medium text-slate-800">{p.tipoDocumento} {p.numDocumento}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Edad</p>
          <p className="text-sm font-medium text-slate-800">{p.edad || '—'} años</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
          <p className="text-sm text-slate-600 truncate">{p.email || '—'}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Obra Social</p>
          <p className="text-sm font-medium text-slate-800">{p.nombreObraSocial || 'Sin cobertura'}</p>
          {p.planCobertura && <p className="text-xs text-slate-500">Plan: {p.planCobertura}</p>}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Contacto</p>
          <a href={`tel:${p.telefono}`} className="text-sm font-medium text-[#C44536] hover:underline flex items-center gap-1">
            <Phone className="w-3 h-3" /> {p.telefono || '—'}
          </a>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Consentimiento</p>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${p.consentimientoOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <Shield className="w-3 h-3" /> {p.consentimientoOk ? 'Aceptado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
}

function MotivoCard({ s }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3E9] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#C44536]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{s.titulo}</p>
            <p className="text-[11px] text-slate-400">
              {s.nombreCategoria} &middot; {formatearFecha(s.fechaCreacion)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            s.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' :
            s.prioridad === 'ALTA' ? 'bg-amber-100 text-amber-700' :
            s.prioridad === 'MEDIA' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {s.prioridad}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            s.estado === 'CREADA' ? 'bg-slate-100 text-slate-600' :
            s.estado === 'REVISADA' ? 'bg-blue-100 text-blue-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {s.estado}
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descripción del paciente</p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{s.descripcion}</p>
        </div>
      </div>

      {s.anamnesis && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Anamnesis</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">{s.anamnesis}</p>
          </div>
        </div>
      )}

      {s.resumenBreve && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resumen breve</p>
          <p className="text-sm text-slate-600 italic">{s.resumenBreve}</p>
        </div>
      )}

      {s.archivoAdjunto && (
        <a href={`${api.defaults.baseURL}/uploads/adjuntos/${s.archivoAdjunto}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C44536] hover:underline">
          <FileText className="w-4 h-4" /> Ver archivo adjunto
        </a>
      )}
    </div>
  );
}

function DiarioPaciente({ entradas }) {
  if (!entradas || entradas.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">El paciente aún no ha registrado entradas en su diario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {entradas.map((e, i) => {
        const animo = ANIMO_BADGE[e.estadoAnimo] || { label: e.estadoAnimo, cls: 'bg-slate-100 text-slate-600' };
        return (
          <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{formatearFechaCorta(e.fecha)}</span>
              </div>
              {e.estadoAnimo && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${animo.cls}`}>
                  {animo.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 rounded-lg bg-slate-50">
                <Moon className="w-3.5 h-3.5 text-indigo-500 mx-auto mb-1" />
                <p className="text-[11px] text-slate-500">Sueño</p>
                <p className="text-sm font-bold text-slate-700">
                  {e.horasSuenio ? `${e.horasSuenio}h` : '—'}
                  {e.calidadSuenio && <span className="text-[10px] text-slate-400 font-normal"> /{e.calidadSuenio}</span>}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50">
                <Brain className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
                <p className="text-[11px] text-slate-500">Estrés</p>
                <p className="text-sm font-bold text-slate-700">{e.estresAnsiedad || '—'}<span className="text-[10px] text-slate-400 font-normal">/10</span></p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50">
                <Heart className="w-3.5 h-3.5 text-rose-500 mx-auto mb-1" />
                <p className="text-[11px] text-slate-500">Adherencia</p>
                <p className="text-sm font-bold text-slate-700">{e.adherencia || '—'}<span className="text-[10px] text-slate-400 font-normal">/10</span></p>
              </div>
            </div>

            {e.sintomasTexto && (
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 border-t border-slate-100 pt-2 mt-1">
                {e.sintomasTexto}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DerivarSubModal({ onClose, onConfirm, solicitudId }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.put(`/solicitudes/${solicitudId}/derivar`, {
        idProfesional: null,
        idCentroSalud: null,
        tipoPractica: 'CONSULTA_AMBULATORIA',
        motivoDerivacion: motivo,
        notas: motivo,
      });
      toast.success('Solicitud derivada correctamente');
      onConfirm();
    } catch {
      toast.error('Error al derivar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Derivar / Rechazar Solicitud</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-600 mb-4">Indicá el motivo de la derivación o rechazo. Esta información será registrada.</p>
        <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
          placeholder="Motivo de la derivación..."
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-all focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={!motivo.trim() || loading}
            className="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Derivando...' : 'Confirmar Derivación'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RevisarSolicitudModal({ solicitudId, onClose }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Datos y Motivo');
  const [derivarOpen, setDerivarOpen] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [historial, setHistorial] = useState(null);

  useEffect(() => {
    if (!solicitudId) return;
    setLoading(true);
    api.get(`/solicitudes/${solicitudId}/detalle-completo`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Error al cargar datos de la solicitud'))
      .finally(() => setLoading(false));
  }, [solicitudId]);

  useEffect(() => {
    if (!solicitudId) return;
    setHistorial(null);
    api.get(`/historia-clinica/solicitud/${solicitudId}`)
      .then(r => setHistorial(r.data || []))
      .catch(() => setHistorial([]));
  }, [solicitudId]);

  const handleAceptarAgendar = () => {
    setAccionando(true);
    navigate(`/profesional/solicitudes/${solicitudId}`);
  };

  const handleContactar = () => {
    if (!data?.paciente?.telefono) return;
    window.open(`tel:${data.paciente.telefono}`);
  };

  if (!solicitudId) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center overflow-y-auto py-8 px-4" onClick={onClose}>
        <div className="w-full max-w-3xl bg-[#F6F4F0] rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* ── Header ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#C44536] animate-spin" />
            </div>
          ) : !data ? (
            <div className="text-center py-16 text-slate-500">Error al cargar los datos</div>
          ) : (
            <>
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FEF3E9] flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-[#C44536]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {data.paciente.nombreCompleto}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" /> {data.paciente.tipoDocumento} {data.paciente.numDocumento}</span>
                        {data.paciente.edad && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span>{data.paciente.edad} años</span></>}
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.paciente.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                        tab === t ? 'text-white' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      style={{ backgroundColor: tab === t ? '#C44536' : 'transparent' }}>
                      {t}
                      {t === 'SuDiario' && data.diario?.length > 0 && (
                        <span className="ml-1.5 opacity-70">({data.diario.length})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Body ── */}
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

                {tab === 'Datos y Motivo' && (
                  <>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#C44536]" /> Datos Personales
                      </h3>
                      <DatosPacienteCard p={data.paciente} />
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#C44536]" /> Motivo de Consulta
                      </h3>
                      <MotivoCard s={data.solicitud} />
                    </div>
                  </>
                )}

                {tab === 'SuDiario' && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#C44536]" /> Registro Emocional del Paciente
                    </h3>
                    <DiarioPaciente entradas={data.diario} />
                  </div>
                )}

                {tab === 'Historial' && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#C44536]" /> Historial Clínico
                    </h3>
                    {historial === null ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-[#C44536] animate-spin" />
                      </div>
                    ) : historial.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm">Sin registros clínicos previos para esta solicitud.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {historial.map((h, i) => (
                          <div key={h.id || i} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatearFecha(h.fechaCreacion)}
                              </span>
                              {h.tipoPlantilla && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3E9] text-[#C44536]">
                                  {h.tipoPlantilla}
                                </span>
                              )}
                            </div>
                            {h.diagnostico && (
                              <div className="mb-2">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Diagnóstico</p>
                                <p className="text-sm text-slate-700">{h.diagnostico}</p>
                              </div>
                            )}
                            {h.tratamiento && (
                              <div className="mb-2">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tratamiento</p>
                                <p className="text-sm text-slate-700">{h.tratamiento}</p>
                              </div>
                            )}
                            {h.observaciones && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Observaciones</p>
                                <p className="text-sm text-slate-600">{h.observaciones}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Acciones ── */}
              <div className="bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center gap-3">
                <button onClick={handleAceptarAgendar}
                  className="flex items-center gap-2 rounded-xl bg-[#3A7D5C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2E6B4D] transition-colors">
                  {accionando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Aceptar y Agendar Turno
                </button>
                <button onClick={() => setDerivarOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                  <Send className="w-4 h-4" />
                  Derivar / Rechazar
                </button>
                {data?.paciente?.telefono && (
                  <button onClick={handleContactar}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <PhoneCall className="w-4 h-4" />
                    Contactar Paciente
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {derivarOpen && (
        <DerivarSubModal
          solicitudId={solicitudId}
          onClose={() => setDerivarOpen(false)}
          onConfirm={() => { setDerivarOpen(false); onClose(); }}
        />
      )}
    </>
  );
}
