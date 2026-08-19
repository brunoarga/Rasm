import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import {
  X, Stethoscope, Calendar, Clock, Building2, User,
  FileText, CalendarPlus, ListChecks, Loader2, Download, QrCode
} from 'lucide-react';
import api from '../../services/api';
import { parsearFechaLocal } from '../../utils/fechas';

function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatearFechaLarga(iso) {
  const d = parsearFechaLocal(iso);
  if (!d) return '—';
  return capitalizar(d.toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }));
}

function formatearHora(iso) {
  const d = parsearFechaLocal(iso);
  if (!d) return '—';
  return `${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`;
}

function pad(n) { return String(n).padStart(2, '0'); }

const PDF_BLUE = [0, 64, 133];
const PDF_INK = [33, 37, 41];
const PDF_LABEL = [108, 117, 125];
const PDF_BG = [248, 249, 250];
const PDF_BORDER = [222, 226, 230];

function Fila({ icon: Icon, label, valor }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-teal-medico" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900">{valor || '—'}</p>
      </div>
    </div>
  );
}

export default function DetalleTurnoModal({ solicitudId, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    if (!solicitudId) return;
    setLoading(true);
    setError(false);
    api.get(`/solicitudes/${solicitudId}`)
      .then(r => setS(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [solicitudId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const abrirGoogleCalendar = () => {
    if (!s?.fechaTurno) return;
    const inicio = parsearFechaLocal(s.fechaTurno);
    if (!inicio) return;
    const fin = new Date(inicio.getTime() + (s.duracionTurno || 60) * 60000);
    const fmt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const texto = s.titulo || s.nombreCategoria || 'Cita asignada';
    const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + `&text=${encodeURIComponent(texto)}`
      + `&dates=${fmt(inicio)}/${fmt(fin)}`
      + `&details=${encodeURIComponent(`${s.nombreCategoria || ''} · ${s.nombreProfesional || 'Profesional asignado'}`)}`
      + `&location=${encodeURIComponent(s.nombreCentroSalud || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const irAMisSolicitudes = () => {
    onClose();
    const destino = user?.tipoUsuario === 'PACIENTE'
      ? '/mis-solicitudes'
      : '/profesional/solicitudes';
    navigate(destino);
  };

  const descargarComprobante = () => {
    if (!s || descargando) return;
    setDescargando(true);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setProperties({ title: `Comprobante T-${s.id}`, subject: 'Turno asignado', author: 'RASM NexiaLink', creator: 'RASM NexiaLink' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const contentW = pageW - marginX * 2;

    const txt = (str) => (str == null ? '' : String(str));
    const limpiar = (str) => txt(str).replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u00A0]/g, ' ');

    const ahora = new Date();
    const fechaEmision = capitalizar(ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }))
      + ' · ' + ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

    // ── Encabezado institucional ──
    doc.setFillColor(...PDF_BG);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setFillColor(...PDF_BLUE);
    doc.rect(0, 32, pageW, 0.8, 'F');
    doc.setFillColor(...PDF_BLUE);
    doc.roundedRect(marginX, 7.5, 10, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('RN', marginX + 5, 14.6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...PDF_BLUE);
    doc.text('RASM NexiaLink', marginX + 14, 13.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_LABEL);
    doc.text('Plataforma de salud mental', marginX + 14, 19.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BLUE);
    doc.text(`N° de Folio: T-${s.id}`, pageW - marginX, 13.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_LABEL);
    doc.text(`Emisión: ${fechaEmision}`, pageW - marginX, 19.5, { align: 'right' });

    // ── Título ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF_INK);
    doc.text('Comprobante de Turno Asignado', pageW / 2, 44, { align: 'center' });
    doc.setDrawColor(...PDF_BLUE);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - 18, 47.5, pageW / 2 + 18, 47.5);

    let y = 56;
    const PAD_CARD = 6;

    const tituloSeccion = (titulo) => {
      doc.setFillColor(...PDF_BLUE);
      doc.roundedRect(marginX, y - 4.2, 2.2, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...PDF_BLUE);
      doc.text(titulo, marginX + 5, y);
      doc.setDrawColor(...PDF_BORDER);
      doc.setLineWidth(0.2);
      doc.line(marginX, y + 2.6, pageW - marginX, y + 2.6);
      y += 6;
    };

    const altoTarjeta = (label, valor, w) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const lineas = doc.splitTextToSize(limpiar(txt(valor)), w - PAD_CARD * 2);
      const altoTexto = lineas.length * 10 * 0.3528 * 1.15;
      return Math.max(16, 4.5 + altoTexto + 5.5);
    };

    const dibujarTarjeta = (label, valor, x, yCard, w) => {
      const alto = altoTarjeta(label, valor, w);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...PDF_BORDER);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, yCard, w, alto, 1.6, 1.6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...PDF_LABEL);
      doc.text(txt(label).toUpperCase(), x + PAD_CARD, yCard + 4.8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...PDF_INK);
      const lineas = doc.splitTextToSize(limpiar(txt(valor)), w - PAD_CARD * 2);
      doc.text(lineas, x + PAD_CARD, yCard + 11);
      return yCard + alto;
    };

    const filaDeTarjetas = (izq, der) => {
      const wCard = (contentW - 4) / 2;
      const alto = Math.max(altoTarjeta(izq.label, izq.valor, wCard), altoTarjeta(der.label, der.valor, wCard));
      dibujarTarjeta(izq.label, izq.valor, marginX, y, wCard);
      dibujarTarjeta(der.label, der.valor, marginX + wCard + 4, y, wCard);
      y += alto + 4;
    };

    // ── 1. Datos del Paciente ──
    tituloSeccion('Datos del Paciente');
    filaDeTarjetas(
      { label: 'Paciente', valor: s.nombrePaciente || '—' },
      { label: 'Expediente', valor: `P-${s.idPaciente ?? s.id}` }
    );
    filaDeTarjetas(
      { label: 'Documento', valor: (s.numDocumento ? `${s.tipoDocumento || 'DNI'} ${s.numDocumento}` : '—') },
      { label: 'Obra social', valor: s.nombreObraSocial || '—' }
    );

    // ── 2. Datos del Turno ──
    tituloSeccion('Datos del Turno');
    filaDeTarjetas(
      { label: 'Profesional', valor: s.nombreProfesional || '—' },
      { label: 'Motivo / Tipo de atención', valor: s.nombreCategoria || '—' }
    );
    filaDeTarjetas(
      { label: 'Fecha', valor: formatearFechaLarga(s.fechaTurno) },
      { label: 'Hora', valor: formatearHora(s.fechaTurno) }
    );
    filaDeTarjetas(
      { label: 'Modalidad', valor: s.modalidad === 'VIRTUAL' ? 'Telemedicina (Virtual)' : 'Presencial' },
      { label: 'Duración', valor: s.duracionTurno ? `${s.duracionTurno} min` : '—' }
    );
    filaDeTarjetas(
      { label: 'Centro / Institución', valor: s.nombreCentroSalud || '—' },
      { label: 'Dirección', valor: s.direccionCentroSalud || '—' }
    );

    // ── Pie ──
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_LABEL);
    doc.text(
      limpiar('Este documento es un comprobante digital válido del turno asignado en la plataforma RASM NexiaLink.'),
      pageW / 2, pageH - 10, { align: 'center' }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_LABEL);
    doc.text(`Generado automáticamente · Folio T-${s.id}`, pageW / 2, pageH - 6, { align: 'center' });

    const nombreArchivo = `Comprobante_Turno_${s.id}_${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}.pdf`;
    doc.save(nombreArchivo);
    toast.success('Comprobante de turno descargado correctamente');
    setDescargando(false);
  };

  const tieneTurno = !!s?.fechaTurno;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-medico/10 text-teal-medico border border-teal-medico/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-medico" />
              Turno Confirmado
            </span>
            <h2 className="text-lg font-bold mt-3">Detalle de la Cita Asignada</h2>
            <p className="text-xs text-slate-500 mt-0.5">{s?.nombreCategoria || ''}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-medico animate-spin" />
          </div>
        ) : error || !s ? (
          <div className="text-center py-14">
            <p className="text-sm text-slate-600">No se pudo cargar el detalle del turno.</p>
            <button onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <Fila icon={Stethoscope} label="Profesional Asignado" valor={s.nombreProfesional || 'Por asignar'} />
              <Fila icon={Calendar} label="Fecha" valor={formatearFechaLarga(s.fechaTurno)} />
              <Fila icon={Clock} label="Hora" valor={formatearHora(s.fechaTurno)} />
              <Fila icon={Building2} label="Centro / Institución de Atención" valor={s.nombreCentroSalud || '—'} />
              <Fila icon={User} label="Paciente" valor={s.nombrePaciente
                ? `${s.nombrePaciente} (Expediente: P-${s.idPaciente ?? s.id})`
                : '—'} />
              <Fila icon={FileText} label="Tipo de atención" valor={s.nombreCategoria || '—'} />
            </div>

            {/* ── Acciones ── */}
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-2.5">
              <button onClick={onClose}
                className="w-full rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2">
                <ListChecks className="w-4 h-4" />
                Aceptar / Entendido
              </button>
              <button onClick={descargarComprobante} disabled={!tieneTurno || descargando}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {descargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {descargando ? 'Generando PDF...' : 'Descargar Comprobante de Turno'}
              </button>
              {s.codigoPase && (
                <button onClick={() => navigate(`/pase/${s.codigoPase}`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-medico px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-colors">
                  <QrCode className="w-4 h-4" />
                  Pase de guardia / Ver QR
                </button>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={abrirGoogleCalendar} disabled={!tieneTurno}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <CalendarPlus className="w-4 h-4" />
                  Mi Calendario
                </button>
                <button onClick={irAMisSolicitudes}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Ver en "Mis Solicitudes"
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
