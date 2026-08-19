import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useSecretarioPerfil from '../../hooks/useSecretarioPerfil';
import { AlertTriangle, ChevronRight, QrCode, BellRing, CalendarClock, Inbox } from 'lucide-react';
import { parsearFechaLocal, formatearFecha, formatearFechaHora } from '../../utils/fechas';

const PRIORIDAD_CLS = {
  URGENTE: 'bg-red-100 text-red-700 border-red-200',
  ALTA: 'bg-amber-100 text-amber-700 border-amber-200',
  MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
  BAJA: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ESTADO_CLS = {
  RECIBIDA: 'bg-sky-100 text-sky-700',
  ASIGNADA: 'bg-emerald-100 text-emerald-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-slate-100 text-slate-500',
};

function sonarAlerta() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export default function ReceptionMesaPage() {
  const { perfil } = useSecretarioPerfil();
  const navigate = useNavigate();
  const [sols, setSols] = useState([]);
  const [nuevas, setNuevas] = useState(0);
  const [destello, setDestello] = useState(false);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');

  const centroNombre = perfil?.nombreCentroSalud || 'tu centro';
  const prevIdsRef = useRef(new Set());
  const primerCargaRef = useRef(true);

  const cargar = useCallback(() => {
    api.get('/solicitudes')
      .then(r => {
        const lista = r.data || [];
        setSols(lista);
        const ids = new Set(lista.filter(s => s.estado === 'RECIBIDA').map(s => s.id));
        if (primerCargaRef.current) {
          primerCargaRef.current = false;
          prevIdsRef.current = ids;
          return;
        }
        const nuevos = [...ids].filter(id => !prevIdsRef.current.has(id));
        if (nuevos.length > 0) {
          setNuevas(n => n + nuevos.length);
          setDestello(true);
          sonarAlerta();
          setTimeout(() => setDestello(false), 6000);
        }
        prevIdsRef.current = ids;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 20000);
    return () => clearInterval(iv);
  }, [cargar]);

  const buscarPase = () => {
    const codigo = codigoBusqueda.trim();
    if (!codigo) return;
    navigate(`/pase/${encodeURIComponent(codigo)}`);
  };

  const est = s => (s.estado || '').toUpperCase();
  const esNueva = s => s.fechaCreacion ? (Date.now() - (parsearFechaLocal(s.fechaCreacion)?.getTime() || 0)) < 28800000 : false;

  const recibidas = sols
    .filter(s => est(s) === 'RECIBIDA')
    .sort((a, b) => (a.fechaCreacion || '').localeCompare(b.fechaCreacion || ''));

  const conTurno = sols
    .filter(s => ['ASIGNADA', 'EN_PROCESO', 'COMPLETADA'].includes(est(s)) && s.fechaTurno)
    .sort((a, b) => (a.fechaTurno || '').localeCompare(b.fechaTurno || ''));

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Mesa de Entrada</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Secretario receptor de {centroNombre} · acepta derivaciones y asigna turno a sus profesionales
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {recibidas.length} en espera · {conTurno.length} con turno
          </span>
        </div>

        <div className={`rounded-xl border bg-white transition-all ${destello ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]' : 'border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-medico/10 flex items-center justify-center">
                <BellRing className="w-4 h-4 text-teal-medico" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Portal Receptor</p>
                <p className="text-xs text-slate-500">Aviso sonoro y visual ante nuevas derivaciones de la red</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {nuevas > 0 && (
                <button onClick={() => setNuevas(0)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white transition-all ${destello ? 'bg-amber-500 animate-pulse' : 'bg-red-600'}`}>
                  <BellRing className="w-3.5 h-3.5" />
                  {nuevas} {nuevas === 1 ? 'nueva derivación' : 'nuevas derivaciones'}
                </button>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={codigoBusqueda}
                  onChange={e => setCodigoBusqueda(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') buscarPase(); }}
                  placeholder="Código de pase / QR"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-teal-medico/40"
                />
                <button onClick={buscarPase}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-medico px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-colors">
                  <QrCode className="w-4 h-4" />
                  Verificar pase
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-sky-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Derivaciones recibidas</h2>
                <p className="text-xs text-slate-500">Aceptarlas para luego asignar turno con un profesional de {centroNombre}</p>
              </div>
            </div>
            {recibidas.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-400">No hay derivaciones en espera.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recibidas.map(s => (
                  <RecibidaCard key={s.id} solicitud={s} nueva={esNueva(s)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Turnos del centro</h2>
                <p className="text-xs text-slate-500">Agenda activa: profesional, fecha y código de pase generado</p>
              </div>
            </div>
            {conTurno.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-400">Aún no hay turnos asignados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conTurno.map(s => (
                  <TurnoCard key={s.id} solicitud={s} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function RecibidaCard({ solicitud: s, nueva }) {
  const pCls = PRIORIDAD_CLS[s.prioridad] || PRIORIDAD_CLS.MEDIA;
  const eCls = ESTADO_CLS.RECIBIDA;

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all hover:shadow-sm ${s.prioridad === 'URGENTE' ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-800">{s.titulo}</h3>
            {s.emergencia && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />
                EMERGENCIA
              </span>
            )}
            {!s.emergencia && s.prioridad === 'URGENTE' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />
                URGENTE
              </span>
            )}
            {nueva && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">NUEVA</span>
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{s.descripcion}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{s.nombrePaciente}</span>
            {s.folio && <span className="text-sky-700 font-semibold">Folio {s.folio}</span>}
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">{s.nombreCategoria}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>{formatearFecha(s.fechaCreacion)}</span>
            <span>&middot;</span>
            <strong>Obra Social:</strong> {s.nombreObraSocial || 'Sin cobertura'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pCls}`}>{s.prioridad}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${eCls}`}>Recibida</span>
          </div>
          <Link to={`/secretaria/solicitudes/${s.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            Asignar turno
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TurnoCard({ solicitud: s }) {
  const eCls = ESTADO_CLS[s.estado] || 'bg-slate-100 text-slate-600';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-800">{s.nombrePaciente}</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${eCls}`}>
              {s.estado === 'ASIGNADA' ? 'Turno Asignado' : s.estado === 'EN_PROCESO' ? 'En Proceso' : 'Completada'}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-1 mb-2">{s.titulo}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>{s.nombreCategoria}</span>
            <span>&middot;</span>
            <strong>Profesional:</strong> {s.nombreProfesional || 'Sin asignar'}
            <span>&middot;</span>
            <strong>Turno:</strong>
            <span className="font-semibold text-slate-700">{formatearFechaHora(s.fechaTurno)}</span>
            <span>&middot;</span>
            <strong>Pase:</strong>
            <span className="text-teal-medico font-mono font-bold">{s.codigoPase || '—'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {s.codigoPase ? (
            <Link to={`/pase/${encodeURIComponent(s.codigoPase)}`}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
              <QrCode className="w-3 h-3" />
              Ver pase / QR
            </Link>
          ) : null}
          <Link to={`/secretaria/solicitudes/${s.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
            Ver solicitud
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}