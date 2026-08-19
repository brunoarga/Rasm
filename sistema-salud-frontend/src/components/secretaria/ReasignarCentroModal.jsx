import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Building2, ArrowRightLeft } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function ReasignarCentroModal({ alerta, onClose, onReasignado }) {
  const [centros, setCentros] = useState(null);
  const [idCentroSalud, setIdCentroSalud] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);

  const buscarCentros = async () => {
    setCargando(true);
    try {
      const r = await api.get(`/solicitudes/${alerta.solicitudId}/centros-disponibles`);
      const disponibles = (r.data || []).filter(c => c.id !== alerta.idCentroSalud);
      setCentros(disponibles);
      if (disponibles.length === 0) toast.warning('No hay otros centros disponibles para esta obra social');
    } catch {
      toast.error('Error al buscar centros disponibles');
    } finally {
      setCargando(false);
    }
  };

  const reasignar = async (e) => {
    e.preventDefault();
    if (!idCentroSalud) return;
    setEnviando(true);
    try {
      await api.post(`/central/alertas/${alerta.id}/reasignar`, { idCentroSalud });
      toast.success('Solicitud reasignada a otro centro');
      onReasignado();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al reasignar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reasignar por demora</h3>
              <p className="text-sm text-slate-600 truncate max-w-[280px]">
                {alerta.nombrePaciente} · Folio {alerta.folio}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={reasignar} className="px-6 py-5 space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
            <p className="font-semibold">Centro actual: {alerta.nombreCentroSalud || 'Sin asignar'}</p>
            <p className="mt-0.5">Superó las {alerta.horasDemora}h sin asignar turno. Elegí otro centro para reenviar la derivación.</p>
          </div>

          {centros === null ? (
            <button type="button" onClick={buscarCentros} disabled={cargando}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
              {cargando ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Building2 className="w-4 h-4 inline mr-2" />}
              Buscar otros centros disponibles
            </button>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Centro de salud destino</label>
              <select value={idCentroSalud} onChange={e => setIdCentroSalud(e.target.value ? Number(e.target.value) : '')}
                className={inputCls} required>
                <option value="">Seleccionar centro…</option>
                {centros.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {centros.length === 0 && (
                <p className="text-[11px] text-slate-500">Por ahora podés marcar la alerta como resuelta para no perder el seguimiento.</p>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando || !idCentroSalud}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
              Reasignar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}