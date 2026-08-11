import React, { useState } from 'react';
import { X, Send, Loader2, ShieldCheck, PenLine } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CATEGORIAS } from '../../constants/foro';

export default function NuevoPostModal({ onClose, onCreado }) {
  const [form, setForm] = useState({ titulo: '', categoria: '', contenido: '', esAnonimo: false });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.categoria || !form.contenido.trim()) return;
    setEnviando(true);
    try {
      const r = await api.post('/foro/posts', {
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        contenido: form.contenido.trim(),
        esAnonimo: form.esAnonimo,
      });
      toast.success('Publicación creada correctamente');
      onCreado(r.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al crear la publicación';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 py-8 px-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-medico/10 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-teal-medico" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nueva Publicación</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compartí tu historia o pedí consejo a la comunidad</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título</label>
            <input
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              maxLength={200}
              placeholder="Ej: ¿Cómo manejás los ataques de pánico?"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoría</label>
            <select
              value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 appearance-none cursor-pointer"
              required
            >
              <option value="">Seleccioná una categoría...</option>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contenido</label>
            <textarea
              value={form.contenido}
              onChange={e => setForm({ ...form, contenido: e.target.value })}
              rows={5}
              placeholder="Contanos qué te está pasando, sin miedo. La comunidad está para escucharte..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 resize-none"
              required
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 px-4 py-3 cursor-pointer transition-colors hover:border-teal-medico/40">
            <input
              type="checkbox"
              checked={form.esAnonimo}
              onChange={e => setForm({ ...form, esAnonimo: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-teal-medico"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-medico" /> Publicar como anónimo
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tu nombre no aparecerá: se mostrará como "Anónimo".
              </span>
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando || !form.titulo.trim() || !form.categoria || !form.contenido.trim()}
              className="flex-1 rounded-xl bg-teal-medico px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-medico/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {enviando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
