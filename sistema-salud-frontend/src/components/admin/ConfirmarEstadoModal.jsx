import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, UserX, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ConfirmarEstadoModal({ usuario, activar, onClose, onConfirmado }) {
  const [enviando, setEnviando] = useState(false);

  const handleConfirmar = async () => {
    setEnviando(true);
    try {
      await api.put(`/admin/usuarios/${usuario.id}/estado`, { activo: activar });
      toast.success(activar ? 'Usuario activado' : 'Usuario desactivado');
      onConfirmado();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al actualizar el estado');
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${activar ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {activar ? <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {activar ? 'Activar usuario' : 'Desactivar usuario'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Confirmá que querés {activar ? 'activar' : 'desactivar'} a{' '}
            <strong>{usuario.nombreCompleto}</strong>
            {!activar && ' . Si continúa, no podrá acceder al sistema hasta que sea reactivado.'}
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
          <button onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirmar} disabled={enviando}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              activar ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {activar ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}