import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import {
  X, BookOpen, Stethoscope, Calendar, User, FileText,
  Loader2, Download, FolderOpen
} from 'lucide-react';
import api from '../../services/api';
import { parsearFechaLocal } from '../../utils/fechas';

const PDF_BLUE = [0, 64, 133];
const PDF_INK = [33, 37, 41];
const PDF_LABEL = [108, 117, 125];
const PDF_BG = [248, 249, 250];
const PDF_BORDER = [222, 226, 230];

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

export default function HistoriaClinicaModal({ onClose }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    api.get('/historia-clinica/mia')
      .then(r => setRegistros(r.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const nombrePaciente = () => {
    const r = registros[0];
    return r?.nombrePaciente || '';
  };

  const formatearFechaPdf = (iso) => {
    const d = parsearFechaLocal(iso);
    if (!d) return '—';
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadPDF = () => {
    if (registros.length === 0 || descargando) return;
    setDescargando(true);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setProperties({ title: 'Historia Clínica', subject: 'Historia clínica del paciente', author: 'SistemaSalud', creator: 'SistemaSalud' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const contentW = pageW - marginX * 2;

    const txt = (str) => (str == null ? '' : String(str));
    const limpiar = (str) => txt(str).replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u00A0]/g, ' ');

    const pie = () => {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_LABEL);
      doc.text(
        limpiar('Documento de historia clínica generado desde el Portal del Paciente de SistemaSalud.'),
        pageW / 2, pageH - 10, { align: 'center' }
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...PDF_LABEL);
      doc.text(`Generado automáticamente · ${new Date().toLocaleDateString('es-AR')}`, pageW / 2, pageH - 6, { align: 'center' });
    };

    const ahora = new Date();
    const fechaEmision = capitalizar(ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }))
      + ' · ' + ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

    doc.setFillColor(...PDF_BG);
    doc.rect(0, 0, pageW, 32, 'F');
    doc.setFillColor(...PDF_BLUE);
    doc.rect(0, 32, pageW, 0.8, 'F');

    doc.setFillColor(...PDF_BLUE);
    doc.roundedRect(marginX, 7.5, 10, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('SS', marginX + 5, 14.6, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...PDF_BLUE);
    doc.text('SistemaSalud', marginX + 14, 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_LABEL);
    doc.text('Red de Salud Mental', marginX + 14, 19.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_BLUE);
    doc.text('Historia Clínica', pageW - marginX, 13.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_LABEL);
    doc.text(`Emisión: ${fechaEmision}`, pageW - marginX, 19.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF_INK);
    doc.text(nombrePaciente() ? `Historia Clínica de ${limpiar(nombrePaciente())}` : 'Historia Clínica', pageW / 2, 44, { align: 'center' });
    doc.setDrawColor(...PDF_BLUE);
    doc.setLineWidth(0.6);
    doc.line(pageW / 2 - 18, 47.5, pageW / 2 + 18, 47.5);

    let y = 56;

    registros.forEach((r, idx) => {
      if (y > pageH - 50) {
        doc.addPage();
        y = 20;
        pie();
      }
      doc.setFillColor(...PDF_BLUE);
      doc.roundedRect(marginX, y - 4.2, 2.2, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...PDF_BLUE);
      doc.text(`Registro ${idx + 1} · ${r.fechaCreacion ? formatearFechaPdf(r.fechaCreacion) : '—'}`, marginX + 5, y);
      doc.setDrawColor(...PDF_BORDER);
      doc.setLineWidth(0.2);
      doc.line(marginX, y + 2.6, pageW - marginX, y + 2.6);
      y += 6;

      const info = [
        { label: 'Motivo de consulta', valor: r.tituloSolicitud || '—' },
        { label: 'Profesional', valor: r.nombreProfesional || '—' },
      ];
      info.forEach((c) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_LABEL);
        doc.text(txt(c.label).toUpperCase(), marginX, y);
        y += 3.5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...PDF_INK);
        const lineas = doc.splitTextToSize(limpiar(txt(c.valor)), contentW);
        doc.text(lineas, marginX, y);
        y += lineas.length * 4.5 + 4;
      });

      const seccion = (titulo, valor) => {
        if (y > pageH - 50) {
          doc.addPage();
          y = 20;
          pie();
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...PDF_LABEL);
        doc.text(titulo, marginX, y);
        y += 3.5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...PDF_INK);
        const lineas = doc.splitTextToSize(limpiar(txt(valor)), contentW);
        doc.text(lineas, marginX, y);
        y += lineas.length * 4.5 + 4;
      };

      if (r.diagnostico) seccion('DIAGNÓSTICO', r.diagnostico);
      if (r.tratamiento) seccion('TRATAMIENTO', r.tratamiento);
      if (r.observaciones) seccion('OBSERVACIONES', r.observaciones);
      y += 4;
    });

    pie();

    const nombreArchivo = `Historia_Clinica_${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}.pdf`;
    doc.save(nombreArchivo);
    toast.success('Historia clínica descargada correctamente');
    setDescargando(false);
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-teal-medico" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-snug">Mi Historia Clínica</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {registros.length === 1 ? '1 registro clínico' : `${registros.length} registros clínicos`}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-medico animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-14">
            <p className="text-sm text-slate-600">No se pudo cargar tu historia clínica.</p>
            <button onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              Cerrar
            </button>
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Aún no tenés registros</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Cuando un profesional registre una consulta, tu historia clínica aparecerá acá.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registros.map((r, idx) => (
              <div key={r.id || idx}
                className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-teal-medico" />
                    {r.fechaCreacion ? formatearFechaHora(r.fechaCreacion) : '—'}
                  </div>
                  {r.tipoPlantilla && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-medico bg-teal-medico/10 px-2 py-0.5 rounded-full">
                      {r.tipoPlantilla}
                    </span>
                  )}
                </div>

                {r.tituloSolicitud && (
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <p className="text-sm font-semibold text-slate-800">{r.tituloSolicitud}</p>
                  </div>
                )}
                {r.nombreProfesional && (
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500">
                      <Stethoscope className="w-3 h-3 inline -mt-0.5 mr-1" />
                      {r.nombreProfesional}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5">
                  {r.diagnostico && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diagnóstico</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{r.diagnostico}</p>
                    </div>
                  )}
                  {r.tratamiento && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tratamiento</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{r.tratamiento}</p>
                    </div>
                  )}
                  {r.observaciones && (
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Observaciones</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{r.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Acciones ── */}
        {!loading && !error && registros.length > 0 && (
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button onClick={onClose}
              className="flex-1 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2">
              Cerrar
            </button>
            <button onClick={handleDownloadPDF} disabled={descargando}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60">
              {descargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {descargando ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
