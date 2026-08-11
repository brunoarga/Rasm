import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Send, Loader2, ShieldCheck, PenLine, HeartHandshake,
} from 'lucide-react';
import { CATEGORIAS } from '../../constants/foro';

export default function NuevaPublicacionPage() {
  const navigate = useNavigate();
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
      navigate(`/foro/${r.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al crear la publicación';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen font-body bg-crema/50 dark:bg-slate-950">
      {/* ── Header contextual (reemplaza al Navbar) ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/foro" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-medico transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al foro
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="text-teal-medico">RASM</span>
            <span>NexiaLink</span>
          </div>
        </div>
      </header>

      {/* ── Formulario ── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          {/* Título de la página */}
          <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0">
              <PenLine className="w-5 h-5 text-teal-medico" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Publicación</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Compartí tu historia o pedí consejo a la comunidad.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
            {/* Título */}
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

            {/* Categoría */}
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

            {/* Contenido */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contenido</label>
              <textarea
                value={form.contenido}
                onChange={e => setForm({ ...form, contenido: e.target.value })}
                rows={7}
                placeholder="Contanos qué te está pasando, sin miedo. La comunidad está para escucharte..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 resize-none"
                required
              />
            </div>

            {/* Publicar como anónimo */}
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

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => navigate('/foro')}
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

        {/* ── Nota SOS ── */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-terracota/25 bg-terracota/5 px-4 py-3.5">
          <HeartHandshake className="w-5 h-5 text-terracota shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-terracota">¿Necesitás ayuda urgente?</strong>{' '}
            No estás solo. Llamá a la línea de crisis <strong className="text-slate-800 dark:text-slate-100">0800-777-7711</strong>{' '}
            (disponible 24hs).
          </p>
        </div>
      </main>
    </div>
  );
}
