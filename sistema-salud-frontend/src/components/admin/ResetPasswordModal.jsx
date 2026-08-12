import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export default function ResetPasswordModal({ usuario, onClose, onRestablecida }) {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clave = nuevaPassword.trim();
    if (clave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await api.put(`/admin/usuarios/${usuario.id}/password`, { nuevaPassword: clave });
      toast.success('Contraseña restablecida correctamente');
      onRestablecida();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al restablecer la contraseña');
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 py-8 px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-medico/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-teal-medico" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Restablecer contraseña</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[300px]">{usuario.nombreCompleto}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-700/50 px-3.5 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El usuario deberá ingresar con la nueva contraseña que definas. Recibirá una notificación informándole del cambio.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nueva contraseña</label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={e => setNuevaPassword(e.target.value)}
              minLength={8}
              required
              placeholder="Mínimo 8 caracteres"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmacion}
              onChange={e => setConfirmacion(e.target.value)}
              required
              placeholder="Repetí la contraseña"
              className={inputCls}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-medico/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Restablecer
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}