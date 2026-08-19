import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import useSecretarioPerfil from '../../hooks/useSecretarioPerfil';
import { formatearFechaHora } from '../../utils/fechas';
import { ArrowLeft, CheckCircle2, Download, MapPin, Phone, AlertTriangle, CalendarCheck } from 'lucide-react';

const PRIORIDAD_CLS = {
  URGENTE: 'bg-red-100 text-red-700 border-red-200',
  ALTA: 'bg-amber-100 text-amber-700 border-amber-200',
  MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
  BAJA: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function PaseGuardiaPage() {
  const { codigo } = useParams();
  const { user } = useAuth();
  const { perfil } = useSecretarioPerfil();
  const [pase, setPase] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    if (!codigo) { setError(true); setCargando(false); return; }
    setCargando(true);
    api.get(`/turnos/pase/${codigo}`)
      .then(r => setPase(r.data || null))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [codigo]);

  const esSecretarioDelCentro = user?.tipoUsuario === 'SECRETARIO'
    && perfil?.idCentroSalud && pase?.idCentro && perfil.idCentroSalud === pase.idCentro;
  const puedeMarcar = user?.tipoUsuario === 'ADMIN' || esSecretarioDelCentro;

  const marcarPresentado = () => {
    setMarcando(true);
    api.post(`/turnos/pase/${codigo}/presentado`)
      .then(r => { setPase(r.data); toast.success('Llegada registrada en recepción'); })
      .catch(() => toast.error('No se pudo registrar la llegada'))
      .finally(() => setMarcando(false));
  };

  const descargarPdf = () => {
    if (!pase) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, W, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('RASM NexiaLink', 14, 15);
    doc.setFontSize(9);
    doc.text('Pase de Guardia / Admisión', 14, 22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(pase.codigoPase || '', W - 14, 22, { align: 'right' });

    const y = 46;
    const lineas = [
      ['Paciente', pase.nombrePaciente],
      ['Documento', `${pase.tipoDocumento || 'DNI'} ${pase.numDocumento || ''}`.trim()],
      ['Obra Social', pase.obraSocial || 'Sin cobertura'],
      ['Folio', pase.folio],
      ['Motivo de consulta', pase.titulo],
      ['Descripción', pase.descripcion],
      ['Prioridad', pase.prioridad],
      ['Profesional', pase.nombreProfesional],
      ['Fecha y hora', formatearFechaHora(pase.fechaTurno)],
      ['Centro', pase.nombreCentro],
      ['Dirección', pase.direccionCentro],
      ['Teléfono', pase.telefonoCentro],
      ['Modalidad', pase.modalidad],
      ['Duración', `${pase.duracionTurno || '-'} minutos`],
    ];
    let yy = y;
    lineas.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text((k || '').toUpperCase() + ':', 14, yy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const vueltas = doc.splitTextToSize(String(v ?? ''), W - 50);
      doc.text(vueltas, 14 + 42, yy);
      yy += 10 + (vueltas.length - 1) * 4.5;
    });

    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.6);
    doc.line(14, yy + 4, W - 14, yy + 4);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(pase.indicaciones || '', 14, yy + 14, { maxWidth: W - 28 });

    doc.save(`Pase_${pase.codigoPase || pase.folio || 'Guardia'}.pdf`);
    toast.success('Comprobante descargado');
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Cargando pase de guardia...</p>
      </div>
    );
  }

  if (error || !pase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-800">Pase no encontrado</h1>
          <p className="text-sm text-slate-500 mt-1">Verificá el código e intentá nuevamente.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-medico hover:underline">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const pCls = PRIORIDAD_CLS[pase.prioridad] || PRIORIDAD_CLS.MEDIA;
  const linkQr = pase.linkPase || `${window.location.origin}/pase/${pase.codigoPase}`;

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to={user ? '/mi-espacio' : '/'}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-teal-medico transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <span className="text-xs text-slate-400">RASM NexiaLink · Pase de Guardia</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-teal-medico px-6 py-5 text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Comprobante digital de admisión</p>
              <h1 className="text-2xl font-extrabold tracking-wide">{pase.codigoPase}</h1>
              <p className="text-sm opacity-90 mt-0.5">{pase.nombreCentro}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <QRCode value={linkQr} size={96} bgColor="transparent" fgColor="#ffffff" />
              <div className="text-sm">
                <p className="font-bold">{pase.nombrePaciente}</p>
                <p className="opacity-90">{pase.tipoDocumento || 'DNI'} {pase.numDocumento}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-teal-medico">
                  {pase.estadoCita || 'PROGRAMADA'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            <section className="p-6 border-b md:border-b-0 md:border-r border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Turno asignado</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Profesional</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.nombreProfesional || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Fecha y hora</dt>
                  <dd className="font-semibold text-slate-800 text-right">
                    {formatearFechaHora(pase.fechaTurno)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Modalidad</dt>
                  <dd className="font-semibold text-slate-800 text-right capitalize">{pase.modalidad?.toLowerCase() || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Duración</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.duracionTurno || '—'} minutos</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Prioridad</dt>
                  <dd className="text-right"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pCls}`}>{pase.prioridad}</span></dd>
                </div>
                {pase.emergencia && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Triaje</dt>
                    <dd className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> EMERGENCIA
                      </span>
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Teléfono</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.telefonoCentro || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Dirección</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.direccionCentro || '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Ficha de admisión</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Folio</dt>
                  <dd className="font-semibold text-slate-800">{pase.folio || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Paciente</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.nombrePaciente}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Documento</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.tipoDocumento || 'DNI'} {pase.numDocumento}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Edad</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.edadPaciente != null ? `${pase.edadPaciente} años` : '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Obra Social</dt>
                  <dd className="font-semibold text-slate-800 text-right">{pase.obraSocial || 'Sin cobertura'}</dd>
                </div>
              </dl>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-6 mb-2">Motivo de consulta</h3>
              <p className="text-sm font-semibold text-slate-800">{pase.titulo}</p>
              {pase.descripcion && <p className="text-sm text-slate-600 mt-1">{pase.descripcion}</p>}
              {pase.anamnesis && (
                <>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1">Anamnesis</h4>
                  <p className="text-sm text-slate-600">{pase.anamnesis}</p>
                </>
              )}

              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <CalendarCheck className="w-4 h-4 text-teal-medico mt-0.5 shrink-0" />
                  {pase.indicaciones}
                </p>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3 justify-end">
            <button onClick={descargarPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              <Download className="w-4 h-4" /> Descargar comprobante (PDF)
            </button>
            {pase.fechaPresentacion ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Presentado el {formatearFechaHora(pase.fechaPresentacion)}
              </span>
            ) : puedeMarcar ? (
              <button onClick={marcarPresentado} disabled={marcando}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-60">
                <CheckCircle2 className="w-4 h-4" /> {marcando ? 'Registrando...' : 'Marcar llegada en recepción'}
              </button>
            ) : (
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Ingresar para gestionar el pase
              </Link>
            )}
            <Link to="/secretaria/solicitudes"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Ir a la bandeja del centro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}