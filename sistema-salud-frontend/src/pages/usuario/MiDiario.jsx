import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Brain, Moon, Frown, Meh, Smile, AlertCircle, BookOpen, ChevronDown, ChevronUp, Camera, Mail, Phone, User, BadgeCheck } from 'lucide-react';
import { parsearFechaLocal } from '../../utils/fechas';

const inputCls = "w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra placeholder:text-pizarra-light/40 outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20";
const labelCls = "text-sm font-semibold text-pizarra";
const selCls = "w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 appearance-none cursor-pointer";

const animos = [
  { value: 'EXCELENTE', label: 'Excelente', color: 'bg-emerald-100 text-emerald-700', icon: Smile },
  { value: 'ESTABLE', label: 'Estable', color: 'bg-blue-100 text-blue-700', icon: Meh },
  { value: 'ANSIOSO', label: 'Ansioso / Estresado', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  { value: 'TRISTE', label: 'Triste / Desanimado', color: 'bg-indigo-100 text-indigo-700', icon: Frown },
  { value: 'IRRITABLE', label: 'Irritable', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
];

const disparadoresList = [
  { value: 'SUENIO', label: 'Sueño' },
  { value: 'TRABAJO', label: 'Trabajo / Estudios' },
  { value: 'FAMILIA', label: 'Familia' },
  { value: 'RELACIONES', label: 'Relaciones' },
  { value: 'SALUD', label: 'Salud Física' },
];

const animoMap = Object.fromEntries(animos.map(a => [a.value, a]));

export default function MiDiario() {
  const { user: authUser } = useAuth();
  const [entradas, setEntradas] = useState([]);
  const [n, setN] = useState({ estadoAnimo: '', disparadores: [], horasSuenio: 0, reflexion: '' });
  const [expanded, setExpanded] = useState({});
  const [perfil, setPerfil] = useState(null);
  const [edit, setEdit] = useState({ telefono: '' });
  const [fotoFile, setFotoFile] = useState(null);

  useEffect(() => {
    api.get('/diario').then(r => setEntradas(r.data)).catch(() => {});
    api.get('/usuarios/perfil').then(r => {
      setPerfil(r.data);
      setEdit({ telefono: r.data.telefono || '' });
    }).catch(() => {});
  }, []);

  const handleGuardarPerfil = async () => {
    try {
      const r = await api.put('/usuarios/perfil', { nombreCompleto: perfil?.nombreCompleto, telefono: edit.telefono, direccion: perfil?.direccion || '' });
      setPerfil(r.data);
      toast.success('Perfil actualizado');
    } catch (err) { toast.error('Error al actualizar perfil'); }
  };

  const handleSubirFoto = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await api.post('/usuarios/perfil/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPerfil(p => ({ ...p, fotoPerfil: r.data.fotoPerfil }));
      setFotoFile(null);
      toast.success('Foto actualizada');
    } catch (err) { toast.error('Error al subir foto'); }
  };

  const fotoUrl = perfil?.fotoPerfil ? `${api.defaults.baseURL}/uploads/perfil/${perfil.fotoPerfil}` : null;

  const toggleDisparador = (val) => {
    setN(p => ({
      ...p,
      disparadores: p.disparadores.includes(val)
        ? p.disparadores.filter(d => d !== val)
        : [...p.disparadores, val],
    }));
  };

  const hs = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        estadoAnimo: n.estadoAnimo,
        sintomasTexto: n.reflexion,
        horasSuenio: n.horasSuenio,
        intensidadDolor: 0,
        medicacionTomada: false,
        observaciones: JSON.stringify({ disparadores: n.disparadores }),
      };
      const r = await api.post('/diario', payload);
      setEntradas([r.data, ...entradas]);
      setN({ estadoAnimo: '', disparadores: [], horasSuenio: 0, reflexion: '' });
      toast.success('Guardado en tu historial');
    } catch (err) { toast.error('Error al guardar'); }
  };

  const previewLen = 100;

  const displayMood = (m) => animoMap[m] || { label: m, color: 'bg-stone-100 text-stone-600', icon: Meh };

  const displayDate = (fecha) => {
    const d = parsearFechaLocal(fecha);
    if (!d) return '';
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-pizarra">Mi Diario Personal</h1>
        <p className="text-base text-pizarra-light mt-1">Registra tus emociones para hacerles seguimiento junto a tu terapeuta.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* ===== LEFT COLUMN — Form (3/5) ===== */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl border border-stone/30 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-medico/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-medico" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-pizarra">Registro de Hoy</h2>
                  <p className="text-xs text-pizarra-light/60">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <form onSubmit={hs} className="space-y-5">
                {/* Estado de Ánimo */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Estado de Ánimo</label>
                  <select className={selCls} value={n.estadoAnimo} onChange={e => setN({ ...n, estadoAnimo: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {animos.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>

                {/* Disparadores */}
                <div className="space-y-1.5">
                  <label className={labelCls}>¿Qué influyó en tu día?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {disparadoresList.map(d => (
                      <label
                        key={d.value}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-all duration-200 text-sm ${n.disparadores.includes(d.value) ? 'border-teal-medico bg-teal-medico/5 text-teal-medico font-semibold' : 'border-stone/40 bg-crema text-pizarra-light hover:border-stone/60'}`}
                      >
                        <input
                          type="checkbox"
                          checked={n.disparadores.includes(d.value)}
                          onChange={() => toggleDisparador(d.value)}
                          className="hidden"
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horas de Sueño */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Horas de Sueño</label>
                  <div className="relative">
                    <Moon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pizarra-light/50" />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={n.horasSuenio}
                      onChange={e => setN({ ...n, horasSuenio: parseFloat(e.target.value) || 0 })}
                      className={`${inputCls} pl-10`}
                      placeholder="8"
                    />
                  </div>
                </div>

                {/* Reflexión */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Tu Reflexión</label>
                  <p className="text-xs text-pizarra-light/50 -mt-1">¿Qué estás pasando o sintiendo hoy?</p>
                  <textarea
                    className={`${inputCls} min-h-[120px] resize-y`}
                    rows="4"
                    value={n.reflexion}
                    onChange={e => setN({ ...n, reflexion: e.target.value })}
                    placeholder="Escribí cómo te sentís hoy..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!n.estadoAnimo || !n.reflexion}
                  className="w-full rounded-xl bg-teal-medico px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-teal-medico/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Guardar en mi Historial
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN — Profile + History (2/5) ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ---- Profile Card ---- */}
          <div className="bg-white rounded-2xl shadow-md border border-stone/30 overflow-hidden">
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-teal-medico" />
                <h2 className="text-base font-bold text-pizarra">Mi Perfil</h2>
              </div>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone/20 shadow-sm">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="foto perfil" className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-medico flex items-center justify-center cursor-pointer shadow-md hover:bg-teal-medico-dark transition-colors"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) { setFotoFile(file); handleSubirFoto(file); }
                    }}
                  />
                </div>

                {/* Info + editable fields */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-pizarra truncate">{perfil?.nombreCompleto || authUser?.nombreCompleto || 'Usuario'}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                      <BadgeCheck className="w-3 h-3" /> Paciente Activo
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-pizarra-light/70">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{authUser?.email || 'email@correo.com'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-pizarra-light/70" />
                    <input
                      value={edit.telefono}
                      onChange={e => setEdit({ ...edit, telefono: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      className="flex-1 text-xs rounded-lg border border-stone/40 bg-crema px-2.5 py-1.5 text-pizarra placeholder:text-pizarra-light/40 outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGuardarPerfil}
                className="mt-4 w-full rounded-xl bg-teal-medico px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:bg-teal-medico/90 hover:shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </div>

          {/* ---- History ---- */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-teal-medico" />
              <h2 className="text-base font-bold text-pizarra">Historial de Bienestar</h2>
            </div>

            {entradas.length === 0 ? (
              <div className="rounded-xl bg-white border border-stone/30 px-6 py-10 text-center">
                <Brain className="w-10 h-10 text-pizarra-light/30 mx-auto mb-3" />
                <p className="text-sm text-pizarra-light/60">Aún no tenés registros.</p>
                <p className="text-xs text-pizarra-light/40 mt-1">Completá el formulario de hoy para comenzar tu historial.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entradas.map(e => {
                  const m = displayMood(e.estadoAnimo);
                  const Icon = m.icon;
                  const isExpanded = expanded[e.id];
                  const text = e.sintomasTexto || '';
                  const preview = text.length > previewLen ? text.slice(0, previewLen) + '…' : text;
                  return (
                    <div key={e.id} className="rounded-xl bg-white border border-stone/30 px-5 py-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-pizarra">{displayDate(e.fecha)}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.color}`}>
                          <Icon className="w-3 h-3" />
                          {m.label}
                        </span>
                      </div>

                      {text && (
                        <p className="text-sm text-pizarra-light leading-relaxed">
                          {isExpanded ? text : preview}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-pizarra-light/50">
                        {e.horasSuenio > 0 && (
                          <span className="flex items-center gap-1">
                            <Moon className="w-3 h-3" /> {e.horasSuenio}h
                          </span>
                        )}
                        {text.length > previewLen && (
                          <button
                            type="button"
                            onClick={() => setExpanded(p => ({ ...p, [e.id]: !isExpanded }))}
                            className="flex items-center gap-1 text-teal-medico font-semibold hover:text-teal-medico-dark transition-colors"
                          >
                            {isExpanded ? 'Ver menos' : 'Leer más'}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
