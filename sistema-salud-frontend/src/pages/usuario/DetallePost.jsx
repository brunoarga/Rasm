import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  ArrowLeft, MessageCircle, Send, Loader2, ShieldCheck,
  MessageSquare, Inbox,
} from 'lucide-react';
import { categoriaMeta, formatearFecha, formatearFechaRelativa } from '../../constants/foro';
import Avatar from '../../components/common/Avatar';
import ReaccionesComentario from '../../components/foro/ReaccionesComentario';

export default function DetallePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reacciones, setReacciones] = useState(() => new Map());

  const datosReaccion = (clave) => {
    const datos = reacciones.get(clave);
    const activos = datos?.activos || new Set();
    return {
      activo: activos.size ? [...activos][0] : null,
      conteos: datos?.conteos || {},
    };
  };

  const cambiarReaccion = (clave, tipo) => {
    setReacciones(prev => {
      const nuevos = new Map(prev);
      const actual = nuevos.get(clave) || { activos: new Set(), conteos: {} };
      const activos = new Set(actual.activos);
      const conteos = { ...actual.conteos };

      if (activos.has(tipo)) {
        activos.delete(tipo);
        conteos[tipo] = Math.max(0, (conteos[tipo] || 0) - 1);
      } else {
        for (const ant of activos) {
          conteos[ant] = Math.max(0, (conteos[ant] || 0) - 1);
        }
        activos.clear();
        activos.add(tipo);
        conteos[tipo] = (conteos[tipo] || 0) + 1;
      }

      nuevos.set(clave, { activos, conteos });
      return nuevos;
    });
  };

  useEffect(() => {
    api.get(`/foro/posts/${id}`)
      .then(r => setPost(r.data))
      .catch(() => toast.error('No se pudo cargar la publicación'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setEnviando(true);
    try {
      const r = await api.post(`/foro/posts/${id}/comentarios`, {
        contenido: comentario.trim(),
        esAnonimo: anonimo,
      });
      setPost(prev => ({
        ...prev,
        cantidadComentarios: (prev.cantidadComentarios || 0) + 1,
        comentarios: [...(prev.comentarios || []), r.data],
      }));
      setComentario('');
      setAnonimo(false);
      toast.success('Respuesta publicada');
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al enviar la respuesta';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-medico animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-slate-500 dark:text-slate-400 mb-4">La publicación no existe o fue eliminada.</p>
        <button onClick={() => navigate('/foro')}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-medico/90 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al foro
        </button>
      </div>
    );
  }

  const cat = categoriaMeta(post.categoria);
  const CatIcon = cat.icon;
  const esAnonimoPost = post.autorNombre === 'Anónimo';

  return (
    <div className="min-h-screen font-body">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Volver */}
        <button onClick={() => navigate('/foro')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-medico transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" /> Volver al foro
        </button>

        {/* ── Publicación ── */}
        <article className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 sm:px-8 pt-6 sm:pt-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cat.cls}`}>
                <CatIcon className="w-3 h-3" /> {cat.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-4">
              {post.titulo}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-5">
              {post.contenido}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 px-6 sm:px-8 py-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Avatar foto={post.autorAvatar} nombre={post.autorNombre} anonimo={esAnonimoPost} size={36} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{post.autorNombre}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatearFecha(post.fechaCreacion)}</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <ReaccionesComentario
                activo={datosReaccion('post').activo}
                conteos={datosReaccion('post').conteos}
                onCambiar={tipo => cambiarReaccion('post', tipo)}
              />
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <MessageSquare className="w-4 h-4" />
                {post.cantidadComentarios} {post.cantidadComentarios === 1 ? 'respuesta' : 'respuestas'}
              </span>
            </div>
          </div>
        </article>

        {/* ── Respuestas ── */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-teal-medico" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Respuestas
              <span className="ml-1 text-sm font-semibold text-slate-400">({post.cantidadComentarios || 0})</span>
            </h2>
          </div>

          {(!post.comentarios || post.comentarios.length === 0) ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-10 text-center">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay respuestas.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Sé el primero en apoyar a esta persona.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {post.comentarios.map(c => {
                const esAnonimo = c.autorNombre === 'Anónimo';
                return (
                  <div key={c.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Avatar foto={c.autorAvatar} nombre={c.autorNombre} anonimo={esAnonimo} size={32} />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.autorNombre}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatearFechaRelativa(c.fechaCreacion)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-[42px]">
                      {c.contenido}
                    </p>

                    {/* Reacciones al comentario */}
                    <div className="pl-[42px] mt-3">
                      <ReaccionesComentario
                        activo={datosReaccion(c.id).activo}
                        conteos={datosReaccion(c.id).conteos}
                        onCambiar={tipo => cambiarReaccion(c.id, tipo)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Formulario de respuesta ── */}
        <section className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Responder a esta publicación</h3>
          <form onSubmit={handleComentar} className="space-y-3">
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Escribí tu respuesta con respeto y empatía..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 resize-none"
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={anonimo} onChange={e => setAnonimo(e.target.checked)}
                  className="w-4 h-4 accent-teal-medico" />
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-medico" /> Responder como anónimo
                </span>
              </label>
              <button type="submit" disabled={enviando || !comentario.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-medico/90 disabled:opacity-40 disabled:cursor-not-allowed">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {enviando ? 'Enviando...' : 'Enviar respuesta'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
