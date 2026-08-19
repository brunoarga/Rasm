import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Building2, UserX } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function AsignarCentroModal({ usuario, centros, onClose, onGuardado }) {
  const [idCentroSalud, setIdCentroSalud] = useState(usuario.idCentroSalud || '');
  const [enviando, setEnviando] = useState(false);

  const guardar = async (centro) => {
    setEnviando(true);
    try {
      await api.put(`/admin/usuarios/${usuario.id}/centro`, { idCentroSalud: centro || null });
      toast.success(centro ? 'Centro asignado al secretario' : 'Secretario desvinculado del centro');
      onGuardado();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al asignar el centro');
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await guardar(idCentroSalud || null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-teal-medico" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Vincular al centro</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[280px]">{usuario.nombreCompleto}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Centro de salud (referente del centro)
            </label>
            <select
              value={idCentroSalud}
              onChange={e => setIdCentroSalud(e.target.value ? Number(e.target.value) : '')}
              className={inputCls}
            >
              <option value="">Sin centro asignado</option>
              {(centros || []).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              El secretario pasará a ser referente del centro y recibirá las derivaciones en su bandeja.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            {(usuario.idCentroSalud) && (
              <button type="button" onClick={() => guardar(null)} disabled={enviando}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Desvincular
              </button>
            )}
            <button type="submit" disabled={enviando}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-medico/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}