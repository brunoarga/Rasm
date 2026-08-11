import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  X, Calendar, Clock, Stethoscope, Building2, User,
  FileText, CheckCircle2, Circle, Loader2, Download, Ban, Pencil
} from 'lucide-react';
import api from '../../services/api';
import { parsearFechaLocal } from '../../utils/fechas';

const PDF_BLUE = [0, 64, 133];
const PDF_INK = [33, 37, 41];
const PDF_LABEL = [108, 117, 125];
const PDF_BG = [248, 249, 250];
const PDF_BORDER = [222, 226, 230];

const ESTADO_MAP = {
  CREADA:     { label: 'CREADA',        cls: 'bg-slate-100 text-slate-700' },
  REVISADA:   { label: 'REVISADA',      cls: 'bg-blue-100 text-blue-700' },
  ASIGNADA:   { label: 'ASIGNADA',      cls: 'bg-teal-medico/10 text-teal-medico' },
  EN_PROCESO: { label: 'EN PROCESO',    cls: 'bg-amber-100 text-amber-700' },
  DERIVADA:   { label: 'DERIVADA',      cls: 'bg-violet-100 text-violet-700' },
  COMPLETADA: { label: 'FINALIZADA',    cls: 'bg-emerald-100 text-emerald-700' },
  CANCELADA:  { label: 'CANCELADA',     cls: 'bg-red-100 text-red-700' },
};

const PRIORIDAD_MAP = {
  URGENTE: { label: 'URGENTE', cls: 'bg-red-100 text-red-700' },
  ALTA:    { label: 'ALTA',    cls: 'bg-amber-100 text-amber-700' },
  MEDIA:   { label: 'MEDIA',   cls: 'bg-slate-100 text-slate-700' },
  BAJA:    { label: 'BAJA',    cls: 'bg-emerald-100 text-emerald-700' },
};

const ESTADO_CHIP = {
  CREADA:     { bg: [241, 245, 249], fg: [51, 65, 85] },
  REVISADA:   { bg: [219, 234, 254], fg: [29, 78, 216] },
  ASIGNADA:   { bg: [204, 251, 241], fg: [15, 118, 110] },
  EN_PROCESO: { bg: [254, 243, 199], fg: [180, 83, 9] },
  DERIVADA:   { bg: [237, 233, 254], fg: [109, 40, 217] },
  COMPLETADA: { bg: [209, 250, 229], fg: [4, 120, 87] },
  CANCELADA:  { bg: [254, 226, 226], fg: [185, 28, 28] },
};

const PRIORIDAD_CHIP = {
  URGENTE: { bg: [254, 226, 226], fg: [185, 28, 28] },
  ALTA:    { bg: [254, 243, 199], fg: [180, 83, 9] },
  MEDIA:   { bg: [241, 245, 249], fg: [71, 85, 105] },
  BAJA:    { bg: [209, 250, 229], fg: [4, 120, 87] },
};

function capitalizar(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatearFechaHora(iso) {
  const d = parsearFechaLocal(iso);
  if (!d) return '—';
  return capitalizar(d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }))
    + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
}

function formatearFechaLarga(iso) {
  const d = parsearFechaLocal(iso);
  if (!d) return '—';
  return capitalizar(d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
}

export default function DetalleSolicitudModal({ solicitudId, onClose, onCancelada, onEditada }) {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cats, setCats] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', idCategoria: '', descripcion: '' });

  useEffect(() => {
    api.get('/categorias').then(r => setCats(r.data || [])).catch(() => setCats([]));
  }, []);

  useEffect(() => {
    if (!solicitudId) return;
    setLoading(true);
    setError(false);
    setIsEditing(false);
    setConfirmCancel(false);
    api.get(`/solicitudes/${solicitudId}`)
      .then(r => {
        setS(r.data);
        setFormData({
          titulo: r.data.titulo || '',
          idCategoria: r.data.idCategoria ?? '',
          descripcion: r.data.descripcion || '',
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [solicitudId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setConfirmCancel(false); onClose(); } };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const pasoEstado = (s) => {
    if (!s) return 1;
    switch (s.estado) {
      case 'CREADA': return 1;
      case 'REVISADA': return 2;
      case 'ASIGNADA': return s.fechaTurno ? 4 : 3;
      case 'EN_PROCESO': return 4;
      case 'DERIVADA': return s.fechaTurno ? 4 : 3;
      case 'COMPLETADA': return 4;
      case 'CANCELADA': return 1;
      default: return 1;
    }
  };

  const pasos = [
    { titulo: 'Solicitud Creada', detalle: s?.fechaCreacion ? formatearFechaHora(s.fechaCreacion) : '—', fecha: true },
    { titulo: 'En Evaluación por Triage', detalle: 'El equipo clínico está revisando tu solicitud' },
    { titulo: 'Profesional / Centro Asignado', detalle: s?.nombreProfesional || s?.nombreCentroSalud || 'A la espera de asignación' },
    { titulo: 'Turno / Contacto Programado', detalle: s?.fechaTurno ? formatearFechaLarga(s.fechaTurno) : 'Pendiente de programación', turno: true },
  ];

  const etapa = pasoEstado(s);
  const cancelada = s?.estado === 'CANCELADA';

  const handleCancelar = async () => {
    setCanceling(true);
    try {
      const r = await api.put(`/solicitudes/${s.id}/cancelar`);
      setS(r.data);
      toast.success('Solicitud cancelada correctamente');
      setConfirmCancel(false);
      if (onCancelada) onCancelada();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se pudo cancelar la solicitud');
    } finally {
      setCanceling(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const r = await api.put(`/solicitudes/${s.id}`, {
        idCategoria: parseInt(formData.idCategoria),
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
      });
      setS(r.data);
      setFormData({
        titulo: r.data.titulo || '',
        idCategoria: r.data.idCategoria ?? '',
        descripcion: r.data.descripcion || '',
      });
      setIsEditing(false);
      toast.success('Solicitud editada correctamente');
      if (onEditada) onEditada();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se pudo editar la solicitud');
    } finally {
      setGuardando(false);
    }
  };

  function formatearFechaPdf(iso) {
    const d = parsearFechaLocal(iso);
    if (!d) return '—';
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  const handleDownloadPDF = () => {
    if (!s || descargando) return;
    setDescargando(true);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setProperties({ title: `Comprobante S-${s.id}`, subject: 'Solicitud de admisión', author: 'RASM NexiaLink', creator: 'RASM NexiaLink' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const contentW = pageW - marginX * 2;

    const txt = (str) => (str == null ? '' : String(str));
    const limpiar = (str) => txt(str).replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u00A0]/g, ' ');

    // Pie institucional (se repite en todas las páginas)
    const pie = () => {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_LABEL);
      doc.text(
        limpiar('Este documento es un comprobante digital válido de la solicitud ingresada en la plataforma RASM NexiaLink.'),
        pageW / 2, pageH - 10, { align: 'center' }
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...PDF_LABEL);
      doc.text(`Generado automáticamente · Folio S-${s.id}`, pageW / 2, pageH - 6, { align: 'center' });
    };

    const ahora = new Date();
    const fechaEmision = capitalizar(ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }))
      + ' · ' + ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

    // ── Encabezado institucional (fondo claro + borde inferior azul) ──
    doc.setFillColor(...PDF_BG);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setFillColor(...PDF_BLUE);
    doc.rect(0, 32, pageW, 0.8, 'F');

    // Monograma / isotipo
    doc.setFillColor(...PDF_BLUE);
    doc.roundedRect(marginX, 7.5, 10, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('RN', marginX + 5, 14.6, { align: 'center' });

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...PDF_BLUE);
    doc.text('RASM NexiaLink', marginX + 14, 13.5);

    // Subtítulo / bajada
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_LABEL);
    doc.text('Plataforma de derivación', marginX + 14, 19.5);

    // Datos de emisión alineados a la derecha
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BLUE);
    doc.text(`N° de Folio: S-${s.id}`, pageW - marginX, 13.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_LABEL);
    doc.text(`Emisión: ${fechaEmision}`, pageW - marginX, 19.5, { align: 'right' });

    // Título del documento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF_INK);
    doc.text('Comprobante de Solicitud de Admisión', pageW / 2, 44, { align: 'center' });
    doc.setDrawColor(...PDF_BLUE);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - 18, 47.5, pageW / 2 + 18, 47.5);

    let y = 56;

    // ── Utilidades de maquetado ──
    const PAD_CARD = 6;

    const tituloSeccion = (titulo) => {
      if (y > pageH - 45) {
        doc.addPage();
        y = 20;
        pie();
      }
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

    const dibujarChip = (texto, x, yChip, bg, fg) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const ancho = doc.getTextWidth(txt(texto)) + 5.5;
      const alto = 5.5;
      doc.setFillColor(...bg);
      doc.roundedRect(x, yChip, ancho, alto, alto / 2, alto / 2, 'F');
      doc.setTextColor(...fg);
      doc.text(txt(texto), x + ancho / 2, yChip + alto - 1.8, { align: 'center' });
    };

    const altoTarjeta = (datos) => {
      if (datos.chip) return 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const lineas = doc.splitTextToSize(limpiar(txt(datos.valor)), datos.w - PAD_CARD * 2);
      const altoTexto = lineas.length * 10 * 0.3528 * 1.15;
      return Math.max(16, 4.5 + altoTexto + 5.5);
    };

    const dibujarTarjeta = (datos, x, yCard) => {
      const alto = altoTarjeta(datos);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...PDF_BORDER);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, yCard, datos.w, alto, 1.6, 1.6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...PDF_LABEL);
      doc.text(txt(datos.label).toUpperCase(), x + PAD_CARD, yCard + 4.8);

      if (datos.chip) {
        dibujarChip(datos.chip.texto, x + PAD_CARD, yCard + 7.8, datos.chip.bg, datos.chip.fg);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...PDF_INK);
        const lineas = doc.splitTextToSize(limpiar(txt(datos.valor)), datos.w - PAD_CARD * 2);
        doc.text(lineas, x + PAD_CARD, yCard + 11);
      }
      return yCard + alto;
    };

    const filaDeTarjetas = (izq, der) => {
      const wCard = (contentW - 4) / 2;
      izq.w = wCard;
      der.w = wCard;
      const alto = Math.max(altoTarjeta(izq), altoTarjeta(der));
      dibujarTarjeta(izq, marginX, y);
      dibujarTarjeta(der, marginX + wCard + 4, y);
      y += alto + 4;
    };

    // ── 1. Datos del Paciente (cuadrícula de tarjetas) ──
    tituloSeccion('Datos del Paciente');
    filaDeTarjetas(
      { label: 'Nombre', valor: s.nombrePaciente || '—' },
      { label: 'DNI / Expediente', valor: (s.numDocumento ? `${s.tipoDocumento || 'DNI'} ${s.numDocumento}` : '—') }
    );
    filaDeTarjetas(
      { label: 'Fecha de registro', valor: s.fechaCreacion ? formatearFechaPdf(s.fechaCreacion) : '—' },
      { label: 'Obra social', valor: s.nombreObraSocial || '—' }
    );

    // ── 2. Detalle de la Solicitud ──
    tituloSeccion('Detalle de la Solicitud');
    const chipEstado = ESTADO_CHIP[s.estado]
      ? { texto: ESTADO_MAP[s.estado]?.label || s.estado || '—', ...ESTADO_CHIP[s.estado] }
      : { texto: s.estado || '—', ...ESTADO_CHIP.CREADA };
    const chipPrioridad = PRIORIDAD_CHIP[s.prioridad]
      ? { texto: PRIORIDAD_MAP[s.prioridad]?.label || s.prioridad || '—', ...PRIORIDAD_CHIP[s.prioridad] }
      : { texto: s.prioridad || '—', ...PRIORIDAD_CHIP.MEDIA };
    filaDeTarjetas(
      { label: 'Motivo Clínico', valor: s.nombreCategoria || '—' },
      { label: 'Estado actual', chip: chipEstado }
    );
    filaDeTarjetas(
      { label: 'Prioridad', chip: chipPrioridad },
      { label: 'Título', valor: s.titulo || '—' }
    );

    // Resumen a ancho completo (sin recortar el texto)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PDF_LABEL);
    doc.text('RESUMEN', marginX, y);
    y += 3.5;
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: 'plain',
      styles: {
        font: 'helvetica', fontSize: 10, textColor: PDF_INK,
        cellPadding: { top: 4, bottom: 4, left: PAD_CARD, right: PAD_CARD },
        lineColor: PDF_BORDER, lineWidth: 0.2, fillColor: [255, 255, 255],
      },
      columnStyles: { 0: { cellWidth: contentW } },
      body: [[s.descripcion || '—']],
      didDrawPage: (data) => { if (data.pageNumber > 1) pie(); },
    });

    pie();

    const nombreArchivo = `Comprobante_Solicitud_${s.id}_${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}.pdf`;
    doc.save(nombreArchivo);
    toast.success('Comprobante PDF descargado correctamente');
    setDescargando(false);
  };

  const est = ESTADO_MAP[s?.estado] || { label: s?.estado || '—', cls: 'bg-slate-100 text-slate-700' };
  const prio = PRIORIDAD_MAP[s?.prioridad] || { label: s?.prioridad || '—', cls: 'bg-slate-100 text-slate-700' };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => { if (!canceling) { setConfirmCancel(false); onClose(); } }}>
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${est.cls}`}>{est.label}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${prio.cls}`}>{prio.label}</span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">S-{s?.id || '—'}</span>
            </div>
            <h2 className="text-lg font-bold leading-snug">{s?.titulo || 'Detalle de Solicitud'}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Creada: {s?.fechaCreacion ? formatearFechaHora(s.fechaCreacion) : '—'}
            </p>
            {isEditing && (
              <div className="mt-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Título</label>
                <input
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-medico focus:border-teal-medico"
                />
              </div>
            )}
          </div>
          <button onClick={() => { setConfirmCancel(false); onClose(); }} aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0">
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
            <p className="text-sm text-slate-600">No se pudo cargar el detalle de la solicitud.</p>
            <button onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Resumen clínico */}
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-medico" /> Resumen Clínico
              </h3>
              {isEditing ? (
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-medico focus:border-teal-medico"
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-xl bg-slate-50 border border-slate-200 p-4">
                  {s.descripcion || 'Sin descripción.'}
                </p>
              )}
            </section>

            {/* Motivo clínico */}
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Motivo Clínico</h3>
              {isEditing ? (
                <select
                  value={formData.idCategoria}
                  onChange={e => setFormData({ ...formData, idCategoria: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-medico focus:border-teal-medico"
                >
                  <option value="">Seleccioná un motivo</option>
                  {cats.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2">
                  <Stethoscope className="w-4 h-4 text-teal-medico" />
                  <span className="text-sm font-semibold text-slate-800">{s.nombreCategoria || '—'}</span>
                </div>
              )}
            </section>

            {/* Profesional / Centro */}
            {(s.nombreProfesional || s.nombreCentroSalud) && (
              <section className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Profesional Asignado / Centro</h3>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {s.nombreProfesional && (
                    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-medico/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-teal-medico" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Profesional</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.nombreProfesional}</p>
                      </div>
                    </div>
                  )}
                  {s.nombreCentroSalud && (
                    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-medico/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-teal-medico" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Centro</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.nombreCentroSalud}</p>
                        {s.direccionCentroSalud && (
                          <p className="text-[11px] text-slate-500 truncate">{s.direccionCentroSalud}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Timeline de trazabilidad */}
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-medico" /> Línea de Tiempo
              </h3>
              <ol className="relative border-l border-slate-200 ml-3 space-y-5">
                {pasos.map((p, i) => {
                  const n = i + 1;
                  const done = cancelada ? n === 1 : n <= etapa;
                  const active = n === etapa && !cancelada;
                  return (
                    <li key={p.titulo} className="relative pl-6">
                      <span className={`absolute -left-[9px] top-0.5 flex items-center justify-center ${
                        done ? 'bg-teal-medico' : 'bg-slate-200'
                      } ${active ? 'ring-4 ring-teal-medico/20' : ''} rounded-full`}>
                        {done ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                        ) : (
                          <Circle className="text-white" style={{ width: 18, height: 18 }} />
                        )}
                      </span>
                      <p className={`text-sm font-semibold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{p.titulo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.detalle}</p>
                    </li>
                  );
                })}
              </ol>
              {cancelada && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5">
                  <Ban className="w-4 h-4 text-red-600 shrink-0" />
                  <p className="text-xs font-medium text-red-700">
                    Esta solicitud fue cancelada el {s.fechaActualizacion ? formatearFechaHora(s.fechaActualizacion) : '—'}.
                  </p>
                </div>
              )}
            </section>

            {/* ── Acciones ── */}
            <div className="pt-5 border-t border-slate-200 space-y-2.5">
              {isEditing ? (
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <button onClick={() => setIsEditing(false)} disabled={guardando}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                    Cancelar Edición
                  </button>
                  <button onClick={handleGuardar} disabled={guardando || !formData.titulo.trim() || !formData.descripcion.trim() || !formData.idCategoria}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50">
                    {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              ) : confirmCancel ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800">¿Seguro que querés cancelar esta solicitud?</p>
                  <p className="text-xs text-red-600">Esta acción no se puede deshacer.</p>
                  <div className="flex gap-2.5">
                    <button onClick={() => setConfirmCancel(false)} disabled={canceling}
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      No, volver
                    </button>
                    <button onClick={handleCancelar} disabled={canceling}
                      className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
                      Sí, cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2.5">
                  <button onClick={onClose}
                    className="rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2">
                    Cerrar
                  </button>
                  <button onClick={handleDownloadPDF} disabled={descargando}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60">
                    {descargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {descargando ? 'Generando PDF...' : 'Descargar Comprobante'}
                  </button>
                  {!cancelada && s.estado === 'CREADA' && (
                    <div className="flex gap-2.5">
                      <button onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button onClick={() => setConfirmCancel(true)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors">
                        <Ban className="w-4 h-4" />
                        Cancelar
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
  );
}
