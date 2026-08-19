import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1';

export default function ContactoInstitucionalModal({ centro, onClose, onGuardado }) {
  const [emailInstitucional, setEmailInstitucional] = useState(centro.emailInstitucional || '');
  const [telefonoInstitucional, setTelefonoInstitucional] = useState(centro.telefonoInstitucional || '');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.put(`/centros/${centro.id}/contacto-institucional`, {
        emailInstitucional: emailInstitucional.trim() || null,
        telefonoInstitucional: telefonoInstitucional.trim() || null,
      });
      toast.success('Contacto institucional actualizado');
      onGuardado();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al actualizar el contacto');
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-teal-medico" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Contacto institucional</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[280px]">{centro.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Email institucional</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={emailInstitucional}
                onChange={e => setEmailInstitucional(e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="derivaciones@hospital.com.ar"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Recibirá las notificaciones institucionales de nuevas derivaciones.
            </p>
          </div>

          <div>
            <label className={labelCls}>Teléfono institucional (WhatsApp)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={telefonoInstitucional}
                onChange={e => setTelefonoInstitucional(e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="+54 9 11 5555-0000"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Se usa para enviar el aviso de derivación por WhatsApp.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-medico/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}