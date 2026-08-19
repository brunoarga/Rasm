import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import InsightsEmocionales from '../../components/diario/InsightsEmocionales';
import HistoriaClinicaModal from '../../components/usuario/HistoriaClinicaModal';
import { toast } from 'react-toastify';
import { parsearFechaLocal } from '../../utils/fechas';
import {
  Calendar, Clock, MapPin, ShieldCheck, User, Stethoscope,
  ChevronRight, FileText, AlertTriangle,
  Moon, Brain, Heart,
  Phone, Save, Trash2,
  Smile, Meh, Frown, Camera, Mail, BadgeCheck, BookOpen,
  PhoneCall, Activity, MessageSquare, QrCode
} from 'lucide-react';
const optsFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const optsHora = { hour: '2-digit', minute: '2-digit' };

function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatearFecha(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return capitalizar(d.toLocaleDateString('es-AR', optsFecha));
}

function formatearHora(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return d.toLocaleTimeString('es-AR', optsHora);
}

function formatoFechaCorto(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return capitalizar(d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
}

const ESTADO_MAP = {
  CREADA:     { label: 'En revisión',   cls: 'bg-slate-100 text-slate-600' },
  REVISADA:   { label: 'En revisión',   cls: 'bg-slate-100 text-slate-600' },
  ASIGNADA:   { label: 'Turno asignado', cls: 'bg-teal-medico/10 text-teal-medico' },
  EN_PROCESO: { label: 'En proceso',    cls: 'bg-slate-100 text-slate-600' },
  DERIVADA:   { label: 'Derivado',      cls: 'bg-slate-100 text-slate-600' },
  COMPLETADA: { label: 'Finalizada',    cls: 'bg-slate-100 text-slate-500' },
};

const animos = [
  { value: 'EXCELENTE', label: 'Excelente',        color: 'bg-emerald-100 text-emerald-700', icon: Smile },
  { value: 'ESTABLE',   label: 'Estable',          color: 'bg-slate-100 text-slate-600', icon: Meh },
  { value: 'ANSIOSO',   label: 'Ansioso / Estresado', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  { value: 'TRISTE',    label: 'Triste / Desanimado', color: 'bg-indigo-100 text-indigo-700', icon: Frown },
  { value: 'IRRITABLE', label: 'Irritable',        color: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
];

const animoMap = Object.fromEntries(animos.map(a => [a.value, a]));

const disparadoresList = [
  { value: 'SUENIO',   label: 'Sueño' },
  { value: 'TRABAJO',  label: 'Trabajo / Estudios' },
  { value: 'FAMILIA',  label: 'Familia' },
  { value: 'RELACIONES', label: 'Relaciones' },
  { value: 'SALUD',    label: 'Salud Física' },
];

function EscalaClinica({ label, icon: Icon, valor, onChange, descBajo, descAlto }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <span className="text-sm font-bold text-teal-medico min-w-[2ch] text-right">{valor}</span>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all border ${
              valor === n
                ? 'bg-teal-medico border-teal-medico text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{descBajo}</span>
        <span>{descAlto}</span>
      </div>
    </div>
  );
}

function TurnoCard({ turno, compact }) {
  const navigate = useNavigate();
  if (!turno) {
    if (compact) {
      return (
        <div className="text-center py-4">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">Sin turnos agendados</p>
          <button onClick={() => navigate('/pedir-ayuda')}
            className="rounded-lg bg-teal-medico px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-colors">
            Solicitar atención
          </button>
        </div>
      );
    }
    return (
      <div className="card-blanca p-5 h-full flex flex-col items-center justify-center text-center">
        <Calendar className="w-10 h-10 text-slate-300 mb-3" />
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Sin turnos agendados</h3>
        <p className="text-xs text-slate-500 mb-5 max-w-xs leading-relaxed">
          Si necesitás atención, podés solicitar una consulta ahora.
        </p>
        <button onClick={() => navigate('/pedir-ayuda')}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-colors">
          Solicitar atención
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">{formatearHora(turno.fechaTurno)}</span>
          <span className="text-xs text-slate-500">hs</span>
          <span className="text-xs text-slate-400">&middot;</span>
          <span className="text-xs text-slate-600">{formatearFecha(turno.fechaTurno)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-slate-500" />
          </div>
          <span className="text-sm text-slate-700">{turno.nombreProfesional || 'Profesional'}</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          turno.modalidad === 'VIRTUAL'
            ? 'bg-sky-100 text-sky-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {turno.modalidad === 'VIRTUAL' ? 'Telemedicina' : 'Presencial'}
        </span>
      </div>
    );
  }

  return (
    <div className="card-blanca p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-teal-medico uppercase tracking-wider">Próximo Turno</h3>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          turno.modalidad === 'VIRTUAL'
            ? 'bg-sky-100 text-sky-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {turno.modalidad === 'VIRTUAL' ? 'Telemedicina' : 'Presencial'}
        </span>
      </div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-slate-900">{formatearHora(turno.fechaTurno)}</span>
        <span className="text-sm text-slate-500">hs</span>
        <span className="text-sm text-slate-400">&middot;</span>
        <span className="text-sm text-slate-600">{formatearFecha(turno.fechaTurno)}</span>
      </div>
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{turno.nombreProfesional || 'Profesional'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-sm text-slate-700">
            {turno.nombreCentroSalud || 'Centro de Salud'}
            {turno.direccionCentroSalud && <span className="text-slate-500 block text-xs">{turno.direccionCentroSalud}</span>}
          </p>
        </div>
        {turno.duracionTurno && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">Duración estimada: {turno.duracionTurno} min</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {turno.modalidad === 'VIRTUAL' && (
          <button className="flex-1 rounded-lg bg-teal-medico px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-colors">
            Ingresar a Sala Virtual
          </button>
        )}
        {turno.direccionCentroSalud && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(turno.direccionCentroSalud)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            Ubicación
          </a>
        )}
        {turno.codigoPase && (
          <button onClick={() => navigate(`/pase/${turno.codigoPase}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-medico px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-colors">
            <QrCode className="w-3.5 h-3.5" />
            Pase de guardia
          </button>
        )}
      </div>
    </div>
  );
}

function PlanTerapeutico({ sols }) {
  const activas = sols.filter(s => s.estado !== 'COMPLETADA');
  const completadas = sols.filter(s => s.estado === 'COMPLETADA');
  const total = activas.length + completadas.length;
  const pct = total > 0 ? Math.round((completadas.length / total) * 100) : 0;
  return (
    <div>
      <h3 className="text-xs font-semibold text-teal-medico uppercase tracking-wider mb-3">Plan Terapéutico</h3>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-200" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="0"
              className="text-teal-medico transition-all duration-1000" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{pct}%</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Progreso de sesiones</p>
          <p className="text-[11px] text-slate-500">{completadas.length} de {total} {total === 1 ? 'sesión' : 'sesiones'} completadas</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicaciones activas</p>
        <ul className="space-y-1">
          <li className="flex items-start gap-2 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-medico mt-1 shrink-0" />
            Completar registro diario de sintomatología
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-medico mt-1 shrink-0" />
            Registrar observaciones para la próxima consulta
          </li>
          {activas.length > 0 && (
            <li className="flex items-start gap-2 text-xs text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-medico mt-1 shrink-0" />
              {activas.length} {activas.length === 1 ? 'solicitud' : 'solicitudes'} en seguimiento activo
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function MiEspacio() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [sols, setSols] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [edit, setEdit] = useState({ telefono: '' });
  const [historial, setHistorial] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [historiaAbierta, setHistoriaAbierta] = useState(false);

  const [form, setForm] = useState({
    estadoAnimo: '',
    disparadores: [],
    horasSuenio: 0,
    calidadSuenio: 5,
    estresAnsiedad: 5,
    adherencia: 5,
    reflexion: '',
  });

  useEffect(() => {
    api.get('/solicitudes').then(r => setSols(r.data || [])).catch(() => {});
    api.get('/usuarios/perfil').then(r => {
      setPerfil(r.data);
      setEdit({ telefono: r.data.telefono || '' });
    }).catch(() => {});
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const [sintoRes, diarioRes] = await Promise.all([
        api.get('/sintomatologia/historial'),
        api.get('/diario'),
      ]);
      const porFecha = new Map();
      const upsert = (fecha) => {
        if (!porFecha.has(fecha)) {
          porFecha.set(fecha, {
            fecha,
            estadoAnimo: null,
            horasSuenio: null,
            disparadores: [],
            calidadSuenio: null,
            estresAnsiedad: null,
            adherencia: null,
            nota: '',
            rawIdSinto: null,
            rawIdDiario: null,
          });
        }
        return porFecha.get(fecha);
      };
      (sintoRes.data || []).forEach(r => {
        const e = upsert(r.fecha);
        e.calidadSuenio = r.calidadSuenio;
        e.estresAnsiedad = r.estresAnsiedad;
        e.adherencia = r.adherencia;
        if (r.notas) e.nota = r.notas;
        e.rawIdSinto = r.id;
      });
      (diarioRes.data || []).forEach(r => {
        const e = upsert(r.fecha);
        e.estadoAnimo = r.estadoAnimo;
        if (r.horasSuenio) e.horasSuenio = r.horasSuenio;
        let disparadores = [];
        try {
          if (r.observaciones) {
            const parsed = JSON.parse(r.observaciones);
            disparadores = parsed.disparadores || [];
          }
        } catch {}
        if (disparadores.length) e.disparadores = disparadores;
        if (r.sintomasTexto) e.nota = r.sintomasTexto;
        e.rawIdDiario = r.id;
      });
      const merged = Array.from(porFecha.values());
      merged.sort((a, b) => (parsearFechaLocal(b.fecha)?.getTime() || 0) - (parsearFechaLocal(a.fecha)?.getTime() || 0));
      setHistorial(merged);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const toggleDisparador = (val) => {
    setForm(p => ({
      ...p,
      disparadores: p.disparadores.includes(val)
        ? p.disparadores.filter(d => d !== val)
        : [...p.disparadores, val],
    }));
  };

  const resetForm = () => {
    setForm({
      estadoAnimo: '',
      disparadores: [],
      horasSuenio: 0,
      calidadSuenio: 5,
      estresAnsiedad: 5,
      adherencia: 5,
      reflexion: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let saved = false;
    try {
      await api.post('/sintomatologia', {
        calidadSuenio: form.calidadSuenio,
        estresAnsiedad: form.estresAnsiedad,
        adherencia: form.adherencia,
        notas: form.reflexion || null,
      });
      saved = true;
      await api.post('/diario', {
        estadoAnimo: form.estadoAnimo,
        sintomasTexto: form.reflexion,
        horasSuenio: form.horasSuenio,
        intensidadDolor: 0,
        medicacionTomada: false,
        observaciones: JSON.stringify({ disparadores: form.disparadores }),
      });
      resetForm();
      toast.success('Registro diario guardado correctamente');
      await cargarHistorial();
    } catch (err) {
      const errDetail = err.response?.data?.mensaje || err.message;
      console.error('Error en handleSubmit:', errDetail, err.response?.data);
      if (saved) {
        toast.warning('Indicadores guardados, pero el registro emocional falló: ' + errDetail);
      } else {
        const msg = err.response?.data?.mensaje || 'Error al guardar el registro';
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (entry) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      const deletes = [];
      if (entry.rawIdSinto != null) deletes.push(api.delete(`/sintomatologia/${entry.rawIdSinto}`));
      if (entry.rawIdDiario != null) deletes.push(api.delete(`/diario/${entry.rawIdDiario}`));
      await Promise.all(deletes);
      toast.success('Registro eliminado');
      setHistorial(prev => prev.filter(r => r.fecha !== entry.fecha));
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al eliminar el registro';
      toast.error(msg);
    }
  };

  const handleGuardarPerfil = async () => {
    try {
      const r = await api.put('/usuarios/perfil', {
        nombreCompleto: perfil?.nombreCompleto,
        telefono: edit.telefono,
        direccion: perfil?.direccion || '',
      });
      setPerfil(r.data);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error('Error al actualizar perfil');
    }
  };

  const handleSubirFoto = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await api.post('/usuarios/perfil/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPerfil(p => ({ ...p, fotoPerfil: r.data.fotoPerfil }));
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error('Error al subir foto');
    }
  };

  const fotoUrl = perfil?.fotoPerfil
    ? `${api.defaults.baseURL}/uploads/perfil/${perfil.fotoPerfil}`
    : null;

  const proxTurno = sols
    .filter(s => s.fechaTurno && (parsearFechaLocal(s.fechaTurno)?.getTime() || 0) > Date.now())
    .sort((a, b) => (parsearFechaLocal(a.fechaTurno)?.getTime() || 0) - (parsearFechaLocal(b.fechaTurno)?.getTime() || 0))[0];

  const horaAcceso = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayMood = (m) => animoMap[m] || { label: m, color: 'bg-slate-100 text-slate-600', icon: Meh };

  const hoyStr = capitalizar(
    new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  return (
    <div className="relative min-h-screen w-full font-body">
      {/* Fondo corporativo/clínico */}

      {/* ═══ CABECERA INSTITUCIONAL ═══ */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-medico flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">SistemaSalud</p>
                <p className="text-[10px] text-slate-500 font-medium">Portal del Paciente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-500">Conexión segura</span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <span className="text-[11px] text-slate-500 hidden sm:block">
                {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ INFO PACIENTE ═══ */}
      <div className="relative bg-white/70 backdrop-blur-md border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">
                {perfil?.nombreCompleto || authUser?.nombreCompleto || 'Paciente'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              <span>Expediente: P-{authUser?.idPaciente || authUser?.idUsuario || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 font-medium">Plan vigente</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Último acceso: hoy {horaAcceso} hs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CUERPO PRINCIPAL — 2 columnas ═══ */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">

          {/* ═══ COLUMNA IZQUIERDA (70%) ═══ */}
          <div className="space-y-6">

            {/* ─── REGISTRO DE HOY ─── */}
            <div className="card-registro shadow-xl overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="px-6 sm:px-8 py-6 sm:py-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-medico/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teal-medico" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Registro de Hoy</h2>
                      <p className="text-xs text-slate-500">{hoyStr}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Estado de Ánimo + Horas de Sueño */}
                    <div className="grid sm:grid-cols-5 gap-4">
                      <div className="sm:col-span-3 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-900">Estado de Ánimo</label>
                        <select value={form.estadoAnimo} onChange={e => setForm({ ...form, estadoAnimo: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 appearance-none cursor-pointer"
                          required>
                          <option value="">Seleccionar...</option>
                          {animos.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-sm font-semibold text-slate-900">Horas de Sueño</label>
                        <div className="relative">
                          <Moon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="number" step="0.5" min="0" max="24" value={form.horasSuenio}
                            onChange={e => setForm({ ...form, horasSuenio: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20"
                            placeholder="8" />
                        </div>
                      </div>
                    </div>

                    {/* Disparadores */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-900">¿Qué influyó en tu día?</label>
                      <div className="flex flex-wrap gap-2">
                        {disparadoresList.map(d => (
                          <label key={d.value}
                            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 cursor-pointer transition-all text-sm ${
                              form.disparadores.includes(d.value)
                                ? 'border-teal-medico bg-teal-medico/5 text-teal-medico font-semibold'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                            }`}>
                            <input type="checkbox" checked={form.disparadores.includes(d.value)}
                              onChange={() => toggleDisparador(d.value)} className="hidden" />
                            {d.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Indicadores clínicos</p>
                    </div>

                    {/* Escalas */}
                    <EscalaClinica label="Calidad del Sueño" icon={Moon} valor={form.calidadSuenio}
                      onChange={v => setForm({ ...form, calidadSuenio: v })}
                      descBajo="Muy mala" descAlto="Excelente" />
                    <EscalaClinica label="Estrés / Ansiedad" icon={Brain} valor={form.estresAnsiedad}
                      onChange={v => setForm({ ...form, estresAnsiedad: v })}
                      descBajo="Sin estrés" descAlto="Muy alto" />
                    <EscalaClinica label="Adherencia al tratamiento" icon={Heart} valor={form.adherencia}
                      onChange={v => setForm({ ...form, adherencia: v })}
                      descBajo="No adherencia" descAlto="Total adherencia" />

                    {/* Notas del día */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-900">Notas del día</label>
                      <p className="text-xs text-slate-500 -mt-1">¿Qué estás pasando o sintiendo hoy?</p>
                      <textarea value={form.reflexion}
                        onChange={e => setForm({ ...form, reflexion: e.target.value })}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 resize-none"
                        placeholder="Escribí cómo te sentís hoy..."
                        required />
                    </div>

                    <button type="submit" disabled={submitting || !form.estadoAnimo || !form.reflexion}
                      className="w-full rounded-xl bg-teal-medico px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {submitting ? 'Guardando...' : 'Guardar Registro Diario'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ─── HISTORIAL DE BIENESTAR ─── */}
            <div className="card-pastel shadow-xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-5 h-5 text-teal-medico" />
                <h3 className="text-sm font-bold text-slate-900">Historial de Bienestar</h3>
              </div>

              {historial.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Aún no tenés registros.</p>
                  <p className="text-xs text-slate-500 mt-1">Completá el formulario de hoy para comenzar tu historial.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {historial.map(entry => {
                    const mood = entry.estadoAnimo ? displayMood(entry.estadoAnimo) : null;
                    const MoodIcon = mood?.icon;
                    const tieneIndicadores =
                      entry.calidadSuenio != null ||
                      entry.estresAnsiedad != null ||
                      entry.adherencia != null ||
                      entry.horasSuenio > 0 ||
                      entry.disparadores.length > 0;
                    return (
                      <div key={entry.fecha}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {formatoFechaCorto(entry.fecha)}
                            </span>
                            {mood ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${mood.color}`}>
                                <MoodIcon className="w-3 h-3" />
                                {mood.label}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">Sin ánimo registrado</span>
                            )}
                          </div>
                          {(entry.rawIdSinto != null || entry.rawIdDiario != null) && (
                            <button onClick={() => handleEliminar(entry)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                              title="Eliminar registro">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {tieneIndicadores && (
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            {entry.calidadSuenio != null && (
                              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Moon className="w-3 h-3 text-slate-500" /></span> Sueño: <strong className="text-slate-800">{entry.calidadSuenio}</strong>/10</span>
                            )}
                            {entry.estresAnsiedad != null && (
                              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Brain className="w-3 h-3 text-slate-500" /></span> Ansiedad: <strong className="text-slate-800">{entry.estresAnsiedad}</strong>/10</span>
                            )}
                            {entry.adherencia != null && (
                              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Heart className="w-3 h-3 text-slate-500" /></span> Adherencia: <strong className="text-slate-800">{entry.adherencia}</strong>/10</span>
                            )}
                            {entry.horasSuenio > 0 && (
                              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Moon className="w-3 h-3 text-slate-500" /></span> {entry.horasSuenio}h de sueño</span>
                            )}
                            {entry.disparadores.length > 0 && (
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-3 h-3 text-slate-500" /></span>
                                {entry.disparadores.map(d => disparadoresList.find(dl => dl.value === d)?.label || d).join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        {tieneIndicadores && entry.nota && (
                          <div className="border-t border-slate-200 my-3" />
                        )}
                        {entry.nota && (
                          <p className="text-xs text-slate-500 italic leading-relaxed whitespace-pre-wrap">{entry.nota}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── SOLICITUDES RECIENTES ─── */}
            <div className="card-blanca shadow-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-teal-medico uppercase tracking-wider">Solicitudes Recientes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Historial de tus solicitudes de atención</p>
                </div>
                {sols.length > 0 && (
                  <button onClick={() => navigate('/mis-solicitudes')}
                    className="text-xs font-semibold text-teal-medico hover:text-teal-medico-dark flex items-center gap-1">
                    Ver todas <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {sols.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-3">Sin solicitudes registradas.</p>
                  <button onClick={() => navigate('/pedir-ayuda')}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-colors">
                    Solicitar atención
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="text-left py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                        <th className="text-left py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                        <th className="text-right py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sols.slice(0, 5).map(s => {
                        const est = ESTADO_MAP[s.estado] || { label: s.estado, cls: 'bg-slate-100 text-slate-600' };
                        return (
                          <tr key={s.id}
                            onClick={() => navigate('/mis-solicitudes')}
                            className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                            <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">{formatearFecha(s.fechaCreacion)}</td>
                            <td className="py-2.5 px-2 font-medium text-slate-900">{s.titulo || '—'}</td>
                            <td className="py-2.5 px-2 text-slate-500 hidden sm:table-cell">{s.nombreCategoria || '—'}</td>
                            <td className="py-2.5 px-2 text-right">
                              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${est.cls}`}>{est.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {sols.length > 5 && (
                    <div className="mt-3 text-center">
                      <button onClick={() => navigate('/mis-solicitudes')}
                        className="text-xs font-semibold text-teal-medico hover:text-teal-medico-dark">
                        Ver todas las solicitudes ({sols.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═══ COLUMNA DERECHA (30%) ═══ */}
          <div className="space-y-5">

            {/* ─── MI PERFIL ─── */}
            <div className="card-perfil shadow-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-teal-medico" />
                <h3 className="text-sm font-bold text-slate-900">Mi Perfil</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="foto perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-medico flex items-center justify-center cursor-pointer shadow-md hover:bg-teal-medico-dark transition-colors">
                    <Camera className="w-2.5 h-2.5 text-white" />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files[0]; if (f) handleSubirFoto(f); }} />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {perfil?.nombreCompleto || authUser?.nombreCompleto || 'Usuario'}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                      <BadgeCheck className="w-2.5 h-2.5" /> Paciente Activo
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{authUser?.email || 'email@correo.com'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                    <input value={edit.telefono}
                      onChange={e => setEdit({ ...edit, telefono: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      className="flex-1 text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20" />
                  </div>
                </div>
              </div>
              <button onClick={handleGuardarPerfil}
                className="mt-4 w-full rounded-xl bg-teal-medico px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md">
                Guardar Cambios
              </button>
            </div>

            {/* ─── HISTORIA CLÍNICA ─── */}
            <div className="card-blanca shadow-xl p-5">
              <button onClick={() => setHistoriaAbierta(true)}
                className="w-full flex items-center gap-3 text-left group">
                <div className="w-11 h-11 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0 group-hover:bg-teal-medico/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-teal-medico" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-teal-medico transition-colors">Mi Historia Clínica</p>
                  <p className="text-[11px] text-slate-500">Consultá y descargá tus registros clínicos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-medico transition-colors" />
              </button>
            </div>

            {/* ─── PRÓXIMA CONSULTA ─── */}
            <div className="card-consulta shadow-xl p-5">
              <h3 className="text-xs font-semibold text-teal-medico uppercase tracking-wider mb-3">Próxima Consulta</h3>
              <TurnoCard turno={proxTurno} compact />
              {proxTurno && (proxTurno.idProfesional || proxTurno.nombreProfesional) && (
                <button onClick={() => navigate(`/mensajes?solicitud=${proxTurno.id}`)}
                  className="mt-3 w-full rounded-xl border px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-teal-medico/5"
                  style={{ borderColor: '#E8E4DF', color: '#E07A5F' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Mensaje con tu profesional
                </button>
              )}
            </div>

            {/* ─── PLAN TERAPÉUTICO ─── */}
            <div className="card-plan shadow-xl p-5">
              <PlanTerapeutico sols={sols} />
            </div>

            {/* ─── PATRONES EMOCIONALES ─── */}
            <InsightsEmocionales />

            {/* ─── AYUDA / SOS ─── */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              crisisOpen
                ? 'border-red-300'
                : 'border-slate-200'
            }`}>
              <button onClick={() => setCrisisOpen(!crisisOpen)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  crisisOpen
                    ? 'bg-red-50'
                    : 'bg-white hover:bg-red-50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-700">Ayuda Urgente</p>
                    <p className="text-[11px] text-red-500">Protocolo de crisis y emergencias</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-red-400 transition-transform ${crisisOpen ? 'rotate-90' : ''}`} />
              </button>
              {crisisOpen && (
                <div className="p-4 bg-red-50 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-800">Línea de Crisis 24/7</p>
                      <a href="tel:08007777711" className="text-lg font-bold text-red-600 hover:underline">0800-777-7711</a>
                    </div>
                  </div>
                  <div className="text-xs text-red-700 leading-relaxed space-y-1">
                    <p>Ante una emergencia o crisis, no dudes en llamar. Atención inmediata y contención profesional.</p>
                    <p className="font-semibold mt-2">
                      Si es una emergencia médica, comunicate al <a href="tel:107" className="underline">107 (SAME)</a> o dirigite a la guardia más cercana.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative border-t border-white/40 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} SistemaSalud. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Conexión segura (HTTPS)
            </span>
            <span>Términos y condiciones</span>
            <span>Privacidad</span>
          </div>
        </div>
      </footer>

      {historiaAbierta && <HistoriaClinicaModal onClose={() => setHistoriaAbierta(false)} />}
    </div>
  );
}
