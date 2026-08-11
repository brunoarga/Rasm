import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Sparkles, Lightbulb, Wand2, Plus, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const CATEGORIAS = [
  {
    grupo: 'Trastornos del Ánimo y Ansiedad',
    items: [
      { id: 6, label: 'Depresión', desc: 'Episodio depresivo mayor o distimia' },
      { id: 7, label: 'Pánico', desc: 'Crisis de pánico recurrente o trastorno de pánico' },
      { id: 8, label: 'Fobias', desc: 'Fobia específica o social' },
    ],
  },
  {
    grupo: 'Problemáticas Psicosociales y Violencia',
    items: [
      { id: 9, label: 'Conflictos familiares', desc: 'Problemáticas vinculares, comunicación, parentalidad' },
      { id: 10, label: 'Violencia de género / intrafamiliar', desc: 'Violencia por razones de género o violencia doméstica' },
    ],
  },
  {
    grupo: 'Adicciones y Conductas',
    items: [
      { id: 11, label: 'Consumo Problemático y Adicciones', desc: 'Sustancias o adicciones comportamentales' },
      { id: 14, label: 'Trastornos de la Conducta Alimentaria (TCA)', desc: 'Anorexia, bulimia, trastorno por atracón' },
    ],
  },
  {
    grupo: 'Crisis y Duelo',
    items: [
      { id: 12, label: 'Crisis Vitales, Duelo y Pérdidas', desc: 'Procesos de duelo, crisis vitales, pérdidas significativas' },
    ],
  },
  {
    grupo: 'Salud Sexual y Reproductiva',
    items: [
      { id: 13, label: 'Salud Sexual, Reproductiva y Procesos IVE/ILE', desc: 'Asesoramiento y acompañamiento integral' },
    ],
  },
  {
    grupo: 'Estrés Ocupacional',
    items: [
      { id: 15, label: 'Burnout y Estrés Ocupacional Severo', desc: 'Síndrome de desgaste profesional, estrés laboral crónico' },
    ],
  },
  {
    grupo: 'Otros',
    items: [
      { id: 16, label: 'Otro motivo clínico especificado', desc: 'Consulta de salud mental no contemplada en las categorías anteriores' },
    ],
  },
];

const NIVELES_RIESGO = [
  { value: 'BAJA', label: 'Baja', desc: 'Consulta de rutina o seguimiento programado' },
  { value: 'MEDIA', label: 'Moderada', desc: 'Requiere atención en el corto plazo' },
  { value: 'ALTA', label: 'Alta — Requiere Intervención Prioritaria', desc: 'Riesgo significativo que amerita evaluación temprana' },
];

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const CHIPS_DESCRIPCION = [
  'Siento ansiedad diaria',
  'Afecta mi descanso',
  'Necesito acompañamiento urgente',
  'Me siento abrumado/a',
  'Tengo dificultad para concentrarme',
];

const PREGUNTAS_GUIA = [
  '¿Desde cuándo experimentas estos síntomas?',
  '¿Cómo afecta tu vida personal, familiar o laboral?',
  '¿Cuál es tu objetivo principal con esta consulta?',
];

function categoriaLabel(id) {
  for (const grupo of CATEGORIAS) {
    const item = grupo.items.find(i => i.id === id);
    if (item) return item.label;
  }
  return null;
}

function tituloSugeridoPara(id) {
  const label = categoriaLabel(id);
  return label ? `Solicitud de orientación sobre ${label}` : '';
}

function generarResumen(texto) {
  const limpio = (texto || '').replace(/\s+/g, ' ').trim();
  if (!limpio) return '';
  const oraciones = limpio.match(/[^.!?]+[.!?]+/g) || [limpio];
  let resumen = oraciones.slice(0, 2).join(' ').trim();
  if (resumen.length > 180) resumen = `${resumen.slice(0, 180).trim()}…`;
  return resumen;
}

export default function PedirAyuda() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const motivoInicial = location.state?.motivo || '';
  const necesitaConsentimiento = !!user && !user.consentimientoOk;
  const [f, setF] = useState({
    idCategoria: location.state?.categoriaId || '',
    titulo: motivoInicial,
    descripcion: '',
    resumenBreve: '',
    nivelRiesgo: '',
    anamnesis: '',
  });
  const [adjuntoFile, setAdjuntoFile] = useState(null);
  const [adjuntoPreview, setAdjuntoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const tituloAnteriorRef = useRef('');
  const [tituloSugerido, setTituloSugerido] = useState('');
  const [autoResumen, setAutoResumen] = useState(false);
  const [errores, setErrores] = useState({});
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false);

  useEffect(() => {
    const sugerido = tituloSugeridoPara(parseInt(f.idCategoria));
    if (!sugerido) return;
    setTituloSugerido(sugerido);
    setF(prev => {
      const actual = prev.titulo;
      if (actual === '' || actual === tituloAnteriorRef.current) {
        tituloAnteriorRef.current = sugerido;
        return { ...prev, titulo: sugerido };
      }
      return prev;
    });
  }, [f.idCategoria]);

  useEffect(() => {
    if (autoResumen && f.descripcion) {
      setF(prev => ({ ...prev, resumenBreve: generarResumen(prev.descripcion) }));
    }
  }, [autoResumen, f.descripcion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!f.idCategoria) nuevosErrores.idCategoria = 'Selecciona el motivo principal de tu consulta para continuar.';
    if (!f.titulo?.trim()) nuevosErrores.titulo = 'Por favor, cuéntanos brevemente qué te sucede para poder orientarte mejor.';
    if (!f.descripcion?.trim()) nuevosErrores.descripcion = 'Por favor, cuéntanos con tus palabras qué estás atravesando. Cada detalle nos ayuda a acompañarte mejor.';
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    setSubmitting(true);
    try {
      if (necesitaConsentimiento) {
        if (!aceptaConsentimiento) {
          toast.error('Debe aceptar el consentimiento informado para enviar la solicitud');
          setSubmitting(false);
          return;
        }
        await api.put('/pacientes/consentimiento');
        updateUser({ consentimientoOk: true });
      }
      const r = await api.post('/solicitudes', {
        ...f,
        idCategoria: parseInt(f.idCategoria),
        nivelRiesgo: f.nivelRiesgo || null,
        anamnesis: f.anamnesis || null,
      });
      if (adjuntoFile) {
        const fd = new FormData();
        fd.append('file', adjuntoFile);
        await api.post(`/solicitudes/${r.data.id}/adjunto`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Solicitud de admisión registrada. Un profesional evaluará su caso.');
      navigate('/mis-solicitudes');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || `Error (${err.response?.status || 'red'})`);
    } finally {
      setSubmitting(false);
    }
  };

  const usarTituloSugerido = () => {
    if (!tituloSugerido) return;
    tituloAnteriorRef.current = tituloSugerido;
    setF(prev => ({ ...prev, titulo: tituloSugerido }));
  };

  const alternarChip = (texto) => {
    setF(prev => {
      const actual = prev.descripcion;
      const yaPresente = actual.split(/\s+/).filter(Boolean).join(' ').includes(texto);
      if (yaPresente) {
        return {
          ...prev,
          descripcion: actual.split(texto).join('').replace(/\s{2,}/g, ' ').trim(),
        };
      }
      return { ...prev, descripcion: actual.trim() ? `${actual.trim()} ${texto}` : texto };
    });
  };

  const handleAdjuntoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdjuntoFile(file);
      setAdjuntoPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-6 md:px-8 py-6">

            {/* Título */}
            <div className="pb-5 border-b border-slate-200 mb-6">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Ficha de Admisión Médica</h1>
              <p className="text-sm text-slate-500 mt-1">Complete el formulario de admisión para que su solicitud sea evaluada por el equipo de salud mental.</p>
            </div>

            {necesitaConsentimiento && (
              <div className="mb-7 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <h2 className="text-sm font-bold text-slate-800">Consentimiento Informado</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                  Para iniciar tu proceso de admisión necesitamos que aceptes el consentimiento informado. Esto autoriza al equipo de salud a evaluar tu solicitud y gestionar tus datos de forma confidencial conforme a la normativa vigente.
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input type="checkbox" checked={aceptaConsentimiento}
                    onChange={e => setAceptaConsentimiento(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500/30 accent-blue-600" />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Acepto el <strong>consentimiento informado</strong> y el tratamiento de mis datos personales para la gestión de mi solicitud de admisión en salud mental.
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* ═══ I. MOTIVO DE CONSULTA ═══ */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">I</span>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Motivo de Consulta</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">Seleccione el motivo principal de su consulta.</p>
                <div className="space-y-4">
                  {CATEGORIAS.map(grupo => (
                    <div key={grupo.grupo}>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{grupo.grupo}</p>
                      <div className="space-y-1.5">
                        {grupo.items.map(item => {
                          const selected = parseInt(f.idCategoria) === item.id;
                          return (
                            <label key={item.id}
                              className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all text-sm ${
                                selected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                              }`}>
                              <input type="radio" name="categoria" checked={selected}
                                onChange={() => { setF({ ...f, idCategoria: item.id }); setErrores(prev => ({ ...prev, idCategoria: undefined })); }}
                                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500/30 accent-blue-600 shrink-0" />
                              <div>
                                <span className={`font-semibold ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</span>
                                <span className="block text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {errores.idCategoria && (
                  <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errores.idCategoria}
                  </p>
                )}
              </section>

              {/* ═══ II. NIVEL DE URGENCIA / RIESGO ═══ */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">II</span>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nivel de Urgencia / Riesgo</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">Indique el nivel de urgencia que usted percibe para su consulta.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {NIVELES_RIESGO.map(nr => {
                    const selected = f.nivelRiesgo === nr.value;
                    const colorMap = {
                      BAJA: { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
                      MEDIA: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
                      ALTA: { border: 'border-red-400', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
                    };
                    const c = colorMap[nr.value];
                    return (
                      <label key={nr.value}
                        className={`rounded-lg border px-4 py-3.5 cursor-pointer transition-all ${
                          selected
                            ? `${c.border} ${c.bg} ring-1 ring-offset-1 ${c.border.replace('border-', 'ring-')}`
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}>
                        <input type="radio" name="nivelRiesgo" checked={selected}
                          onChange={() => setF({ ...f, nivelRiesgo: nr.value })}
                          className="sr-only" />
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${selected ? c.dot : 'bg-slate-300'}`} />
                          <span className={`text-xs font-bold ${selected ? c.text : 'text-slate-700'}`}>{nr.label}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${selected ? 'text-slate-600' : 'text-slate-400'}`}>{nr.desc}</p>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* ═══ III. ANAMNESIS ═══ */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">III</span>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Anamnesis y Antecedentes</h2>
                </div>
                <p className="text-xs text-slate-500 mb-3">Describa los antecedentes relevantes, historia del motivo de consulta, tratamientos previos y toda información que considere importante para la evaluación.</p>
                <textarea
                  value={f.anamnesis}
                  onChange={e => setF({ ...f, anamnesis: e.target.value })}
                  rows={6}
                  className={`${inputCls} min-h-[160px] resize-y`}
                  placeholder="Ej: Inicio de los síntomas, antecedentes personales y familiares, tratamientos anteriores, medicación actual, derivaciones previas..."
                />
              </section>

              {/* ═══ IV. DATOS DE LA CONSULTA ═══ */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">IV</span>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Datos de la Consulta</h2>
                </div>

                {/* Banner empático */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-orange-50/60 px-4 py-3 mb-5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Escribe a tu ritmo. No necesitas usar términos médicos; el equipo profesional leerá tus palabras para brindarte la mejor atención confidencial.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* Título auto-asistido */}
                  <div className="space-y-1.5">
                    <label htmlFor="campo-titulo" className="text-sm font-semibold text-slate-700">Título de la consulta</label>
                    <input id="campo-titulo" className={`${inputCls} ${errores.titulo ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      value={f.titulo}
                      onChange={e => { setF({ ...f, titulo: e.target.value }); setErrores(prev => ({ ...prev, titulo: undefined })); }}
                      placeholder="Ej: Quiero orientación para manejar la ansiedad en mi trabajo" />
                    {tituloSugerido && (
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-[11px] text-slate-400">Sugerencia automática según el motivo seleccionado.</p>
                        <button type="button" onClick={usarTituloSugerido}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          <Wand2 className="w-3.5 h-3.5" /> Usar título sugerido
                        </button>
                      </div>
                    )}
                    {errores.titulo && (
                      <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errores.titulo}
                      </p>
                    )}
                  </div>

                  {/* Descripción con guía y chips */}
                  <div className="space-y-1.5">
                    <label htmlFor="campo-descripcion" className="text-sm font-semibold text-slate-700">Descripción detallada</label>
                    <div className="grid md:grid-cols-[1fr_240px] gap-3 items-start">
                      <div className="space-y-2">
                        <textarea id="campo-descripcion" rows={5}
                          className={`${inputCls} min-h-[120px] resize-y ${errores.descripcion ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          value={f.descripcion}
                          onChange={e => { setF({ ...f, descripcion: e.target.value }); setErrores(prev => ({ ...prev, descripcion: undefined })); }}
                          placeholder="Cuéntanos qué te sucede, cómo te sentís y qué expectativas tenés de esta consulta..." />
                        {errores.descripcion && (
                          <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errores.descripcion}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {CHIPS_DESCRIPCION.map(texto => {
                            const activo = f.descripcion.replace(/\s+/g, ' ').trim().split(' ').join(' ').includes(texto);
                            return (
                              <button key={texto} type="button" onClick={() => alternarChip(texto)}
                                aria-pressed={activo}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                                  activo
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-600'
                                }`}>
                                {activo ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {texto}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <aside aria-label="Preguntas guía para la descripción"
                        className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                          <Lightbulb className="w-3.5 h-3.5" /> Si no sabés por dónde empezar
                        </p>
                        <ul className="space-y-2">
                          {PREGUNTAS_GUIA.map((pregunta, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              {pregunta}
                            </li>
                          ))}
                        </ul>
                      </aside>
                    </div>
                  </div>

                  {/* Resumen breve */}
                  <div className="space-y-1.5">
                    <label htmlFor="campo-resumen" className="text-sm font-semibold text-slate-700">Resumen breve <span className="text-slate-400 font-normal">(opcional)</span></label>
                    <p className="text-[11px] text-slate-400">Breve síntesis en una o dos oraciones para la ficha rápida del especialista.</p>
                    <textarea id="campo-resumen" rows={2} className={`${inputCls} min-h-[60px] resize-y ${autoResumen ? 'bg-slate-50' : ''}`}
                      value={f.resumenBreve}
                      onChange={e => { setF({ ...f, resumenBreve: e.target.value }); setAutoResumen(false); }}
                      placeholder="Síntesis para el profesional..." />
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={autoResumen}
                        onChange={e => setAutoResumen(e.target.checked)}
                        className="h-4 w-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500/30 accent-blue-600" />
                      <span className="text-xs text-slate-600">Generar resumen automáticamente desde mi descripción</span>
                    </label>
                  </div>

                  {/* Adjunto */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Archivo adjunto <span className="text-slate-400 font-normal">(opcional)</span></label>
                    <div onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3.5 cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/30">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        {adjuntoFile ? adjuntoFile.name : 'Haga clic para seleccionar un archivo (imagen o PDF)'}
                      </span>
                    </div>
                    <input type="file" ref={fileRef} accept="image/*,.pdf" onChange={handleAdjuntoSelect} className="hidden" />
                    {adjuntoPreview && <img src={adjuntoPreview} alt="preview" className="max-h-32 rounded-lg mt-2 border border-slate-200" />}
                  </div>

                </div>
              </section>

              {/* ═══ BOTÓN ═══ */}
              <div className="pt-4 border-t border-slate-200">
                <button type="submit" disabled={submitting || (necesitaConsentimiento && !aceptaConsentimiento)}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Registrando solicitud...' : 'Enviar Solicitud de Admisión'}
                </button>
                {necesitaConsentimiento && !aceptaConsentimiento && (
                  <p className="text-[11px] text-slate-500 text-center mt-3">
                    Debe aceptar el consentimiento informado para poder enviar su solicitud.
                  </p>
                )}
                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Al enviar, su solicitud será evaluada por el equipo de admisión. Recibirá una notificación cuando sea asignada a un profesional.
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
