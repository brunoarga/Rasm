import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  MessageSquare, Heart, PenLine, ShieldCheck, Users,
  ChevronLeft, ChevronRight, Loader2, Inbox,
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import { CATEGORIAS, categoriaMeta, formatearFecha } from '../../constants/foro';

const SIZE = 8;

export default function ForoPacientes() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(true);
  const [apoyados, setApoyados] = useState(() => new Set());
  const [apoyando, setApoyando] = useState(null);

  const cargar = useCallback(async (pag, cat) => {
    setLoading(true);
    try {
      const params = { page: pag, size: SIZE };
      if (cat) params.categoria = cat;
      const r = await api.get('/foro/posts', { params });
      setPosts(r.data.content || []);
      setPage(r.data.page);
      setTotalPages(r.data.totalPages);
      setTotalElements(r.data.totalElements);
    } catch (err) {
      toast.error('Error al cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(0, categoria);
  }, [categoria, cargar]);

  const cambiarCategoria = (cat) => {
    setCategoria(cat);
    setPage(0);
  };

  const handleApoyo = async (e, post) => {
    e.stopPropagation();
    if (apoyando === post.id || apoyados.has(post.id)) return;
    setApoyando(post.id);
    try {
      const r = await api.post(`/foro/posts/${post.id}/apoyo`);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, cantidadApoyos: r.data.cantidadApoyos } : p));
      setApoyados(prev => new Set(prev).add(post.id));
      toast.success('Gracias por tu apoyo');
    } catch {
      toast.error('No se pudo registrar el apoyo');
    } finally {
      setApoyando(null);
    }
  };

  const irPagina = (pag) => {
    if (pag < 0 || pag >= totalPages) return;
    cargar(pag, categoria);
  };

  return (
    <div className="min-h-screen font-body">
      {/* Encabezado */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-teal-medico uppercase tracking-wider mb-1">Comunidad</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Foro de Pacientes</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Un espacio seguro para compartir, apoyarse y aprender entre pacientes.
              </p>
            </div>
            <button onClick={() => navigate('/foro/nueva-publicacion')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-teal-medico/90 hover:shadow-lg">
              <PenLine className="w-4 h-4" />
              Nueva Publicación
            </button>
          </div>

          {/* Banner de anonimato */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-medico/20 bg-teal-medico/5 px-4 py-3">
            <ShieldCheck className="w-5 h-5 text-teal-medico shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-100">Tu privacidad primero.</strong>{' '}
              Podés publicar con tu nombre o de forma <strong>anónima</strong>. Lo que compartas queda protegido y solo se muestra tu pseudónimo elegido.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Filtros por categoría */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button onClick={() => cambiarCategoria('')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              categoria === '' ? 'bg-pizarra text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-medico/40'
            }`}>
            <Users className="w-3.5 h-3.5" /> Todos
          </button>
          {CATEGORIAS.map(c => (
            <button key={c.value} onClick={() => cambiarCategoria(c.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                categoria === c.value ? 'bg-pizarra text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-medico/40'
              }`}>
              <c.icon className="w-3.5 h-3.5" /> {c.label}
            </button>
          ))}
        </div>

        {/* Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Cargando publicaciones...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-16 text-center">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aún no hay publicaciones</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">Sé el primero en compartir tu experiencia.</p>
            <button onClick={() => navigate('/foro/nueva-publicacion')}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-medico px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-medico/90 transition-colors">
              <PenLine className="w-4 h-4" /> Crear la primera publicación
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => {
              const cat = categoriaMeta(post.categoria);
              const CatIcon = cat.icon;
              const esAnonimo = post.autorNombre === 'Anónimo';
              const apoyado = apoyados.has(post.id);
              return (
                <article
                  key={post.id}
                  onClick={() => navigate(`/foro/${post.id}`)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-teal-medico/40 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar del autor */}
                    <Avatar foto={post.autorAvatar} nombre={post.autorNombre} anonimo={esAnonimo} size={40} />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cat.cls}`}>
                          <CatIcon className="w-3 h-3" /> {cat.label}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{post.autorNombre}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatearFecha(post.fechaCreacion)}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">{post.titulo}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {post.contenido}
                      </p>

                      <div className="flex items-center gap-5 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.cantidadComentarios} {post.cantidadComentarios === 1 ? 'respuesta' : 'respuestas'}
                        </span>
                        <button onClick={e => handleApoyo(e, post)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${apoyado ? 'text-teal-medico' : 'text-slate-500 dark:text-slate-400 hover:text-teal-medico'}`}>
                          {apoyando === post.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Heart className={`w-3.5 h-3.5 ${apoyado ? 'fill-teal-medico' : ''}`} />}
                          {post.cantidadApoyos} {post.cantidadApoyos === 1 ? 'apoyo' : 'apoyos'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {!loading && posts.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <button onClick={() => irPagina(page - 1)} disabled={page === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Página {page + 1} de {Math.max(totalPages, 1)} · {totalElements} {totalElements === 1 ? 'publicación' : 'publicaciones'}
            </span>
            <button onClick={() => irPagina(page + 1)} disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
