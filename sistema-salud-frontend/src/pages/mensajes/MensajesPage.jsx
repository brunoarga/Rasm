import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useMensajes from '../../hooks/useMensajes';
import { obtenerConversacion, enviarMensaje } from '../../services/mensajes';
import { timeAgo, formatearFechaHora } from '../../utils/fechas';
import Avatar from '../../components/common/Avatar';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Send, MessageSquare, ChevronRight, Stethoscope, User as UserIcon
} from 'lucide-react';

function horaMensaje(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function fechaDivisoria(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const mismo = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (mismo(d, hoy)) return 'Hoy';
  if (mismo(d, ayer)) return 'Ayer';
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

const rolLabel = {
  PACIENTE: 'Paciente',
  PROFESIONAL: 'Profesional',
};

export default function MensajesPage() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversaciones, noLeidos, refresh } = useMensajes();

  const solicitudParam = searchParams.get('solicitud');
  const [conversacionId, setConversacionId] = useState(paramId ? parseInt(paramId, 10) : null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoHilo, setCargandoHilo] = useState(false);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const hiloRef = useRef(null);
  const textoRef = useRef(null);

  const backLink = user?.tipoUsuario === 'PROFESIONAL' ? '/profesional/solicitudes' : user?.tipoUsuario === 'SECRETARIO' ? '/secretaria/solicitudes' : '/mi-espacio';

  const prevLenRef = useRef(null);
  const convRef = useRef(null);
  const scrollToBottomRef = useRef(false);

  const cargarHilo = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await obtenerConversacion(id);
      const nuevaLongitud = data.mensajes?.length ?? 0;
      const esNuevaConv = convRef.current !== id;
      const crecio = prevLenRef.current != null && nuevaLongitud > prevLenRef.current;
      scrollToBottomRef.current = esNuevaConv || crecio;
      prevLenRef.current = nuevaLongitud;
      convRef.current = id;
      setDetalle(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (paramId) setConversacionId(parseInt(paramId, 10));
  }, [paramId]);

  useEffect(() => {
    if (!conversacionId) { setDetalle(null); return; }
    setCargandoHilo(true);
    cargarHilo(conversacionId).finally(() => setCargandoHilo(false));
    const iv = setInterval(() => {
      if (!document.hidden) cargarHilo(conversacionId);
    }, 5000);
    return () => clearInterval(iv);
  }, [conversacionId, cargarHilo]);

  const seleccionar = useCallback((c) => {
    setConversacionId(c.id);
    navigate(`/mensajes/${c.id}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!conversacionId && solicitudParam && conversaciones.length) {
      const match = conversaciones.find(c => String(c.idSolicitud) === String(solicitudParam));
      if (match) seleccionar(match);
    }
  }, [conversaciones, solicitudParam, conversacionId, seleccionar]);

  useEffect(() => {
    if (hiloRef.current && scrollToBottomRef.current) {
      hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
      scrollToBottomRef.current = false;
    }
  }, [detalle, conversacionId]);

  const handleEnviar = async (e) => {
    e?.preventDefault();
    const contenido = texto.trim();
    if (!contenido || !conversacionId || enviando) return;
    setEnviando(true);
    try {
      await enviarMensaje(conversacionId, contenido);
      setTexto('');
      await cargarHilo(conversacionId);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
      textoRef.current?.focus();
    }
  };

  const hiloAbierto = Boolean(conversacionId && detalle);
  const conv = detalle?.conversacion || null;
  const mensajes = detalle?.mensajes || [];

  let diaAnterior = null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <Link to={backLink}
          className="inline-flex items-center gap-1.5 text-sm hover:underline mb-4"
          style={{ color: '#7C7F85' }}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="lg:h-[calc(100vh-11rem)] lg:grid lg:grid-cols-[330px_1fr] rounded-2xl overflow-hidden border"
          style={{ borderColor: '#E8E4DF', backgroundColor: 'white' }}>

          {/* ─── BANDEJA DE CONVERSACIONES ─── */}
          <aside className={`${hiloAbierto ? 'hidden lg:flex' : 'flex'} flex-col border-r bg-white`}
            style={{ borderColor: '#E8E4DF' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#F0EEE9' }}>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" style={{ color: '#C44536' }} />
                <h2 className="text-sm font-bold" style={{ color: '#1E293B' }}>Mensajes</h2>
              </div>
              {noLeidos > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: '#C44536' }}>
                  {noLeidos} sin leer
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversaciones.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5" style={{ color: '#9A9CA1' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>Sin conversaciones</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#7C7F85' }}>
                    {user?.tipoUsuario === 'PROFESIONAL'
                      ? 'Cuando asignes un caso, se abre un chat con el paciente.'
                      : user?.tipoUsuario === 'SECRETARIO'
                        ? 'Acá podés atender dudas de pacientes relacionadas con las solicitudes de la red.'
                        : 'Cuando te asignen un profesional, se abre un chat para tu consulta.'}
                  </p>
                </div>
              ) : conversaciones.map(c => {
                const activa = c.id === conversacionId;
                return (
                  <button key={c.id} onClick={() => seleccionar(c)}
                    className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors"
                    style={{
                      backgroundColor: activa ? 'color-mix(in srgb, #E07A5F 6%, white)' : 'transparent',
                      borderLeft: activa ? '3px solid #E07A5F' : '3px solid transparent',
                    }}>
                    <Avatar foto={c.interlocutorAvatar} nombre={c.interlocutorNombre} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold truncate" style={{ color: '#1E293B' }}>
                          {c.interlocutorNombre}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: '#9A9CA1' }}>
                          {c.fechaUltimoMensaje ? timeAgo(c.fechaUltimoMensaje) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5"
                        style={{ color: '#E07A5F' }}>
                        {c.solicitudTitulo}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs truncate" style={{ color: c.noLeidos > 0 ? '#1E293B' : '#7C7F85' }}>
                          {c.ultimoMensaje || (user?.tipoUsuario === 'PROFESIONAL'
                            ? 'Nuevo caso asignado — presentate'
                            : user?.tipoUsuario === 'SECRETARIO'
                              ? 'Seguimiento del caso desde soporte'
                              : 'Tu profesional está esperando tu mensaje')}
                        </p>
                        {c.noLeidos > 0 && (
                          <span className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 shrink-0"
                            style={{ backgroundColor: '#E07A5F' }}>
                            {c.noLeidos > 99 ? '99+' : c.noLeidos}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ─── HILO DE MENSAJES ─── */}
          <section className={`${hiloAbierto ? 'flex' : 'hidden lg:flex'} flex-col bg-[#FBF9F7] min-h-[60vh]`}>
            {!hiloAbierto ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white border flex items-center justify-center mb-4"
                  style={{ borderColor: '#E8E4DF' }}>
                  <MessageSquare className="w-6 h-6" style={{ color: '#C44536' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>Elegí una conversación</p>
                <p className="text-xs mt-1" style={{ color: '#7C7F85' }}>
                  El chat se abre automáticamente cuando se asigna un profesional a tu consulta.
                </p>
              </div>
            ) : (
              <>
                {/* Cabecera del hilo */}
                <div className="px-4 sm:px-5 py-3 border-b bg-white flex items-center gap-3"
                  style={{ borderColor: '#F0EEE9' }}>
                  <button onClick={() => { setConversacionId(null); navigate('/mensajes'); }}
                    className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Volver a conversaciones">
                    <ArrowLeft className="w-4 h-4" style={{ color: '#7C7F85' }} />
                  </button>
                  <Avatar foto={conv.interlocutorAvatar} nombre={conv.interlocutorNombre} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate" style={{ color: '#1E293B' }}>
                        {conv.interlocutorNombre}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: conv.rolInterlocutor === 'PROFESIONAL' ? '#E8F0EC' : '#FEF0EE',
                          color: conv.rolInterlocutor === 'PROFESIONAL' ? '#3A7D5C' : '#C44536',
                        }}>
                        {rolLabel[conv.rolInterlocutor] || conv.rolInterlocutor}
                      </span>
                    </div>
                    <Link to={user?.tipoUsuario === 'PROFESIONAL'
                        ? `/profesional/solicitudes/${conv.idSolicitud}`
                        : user?.tipoUsuario === 'SECRETARIO'
                          ? `/secretaria/solicitudes/${conv.idSolicitud}`
                          : '/mis-solicitudes'}
                      className="text-[11px] font-semibold hover:underline inline-flex items-center gap-0.5"
                      style={{ color: '#E07A5F' }}>
                      {conv.solicitudTitulo} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Cuerpo del chat */}
                <div ref={hiloRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1">
                  {cargandoHilo && mensajes.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#9A9CA1' }}>Cargando conversación...</p>
                  ) : mensajes.length === 0 ? (
                    <p className="text-xs text-center py-8" style={{ color: '#9A9CA1' }}>
                      Todavía no hay mensajes. Escribí para comenzar la conversación.
                    </p>
                  ) : mensajes.map(m => {
                    const nuevoDia = diaAnterior !== fechaDivisoria(m.fechaEnvio);
                    diaAnterior = fechaDivisoria(m.fechaEnvio);
                    return (
                      <React.Fragment key={m.id}>
                        {nuevoDia && (
                          <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px" style={{ backgroundColor: '#E8E4DF' }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#9A9CA1' }}>
                              {fechaDivisoria(m.fechaEnvio)}
                            </span>
                            <div className="flex-1 h-px" style={{ backgroundColor: '#E8E4DF' }} />
                          </div>
                        )}
                        <div className={`flex ${m.propio ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] sm:max-w-[65%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            m.propio ? 'rounded-br-md' : 'rounded-bl-md'
                          }`}
                            style={{
                              backgroundColor: m.propio ? '#E07A5F' : '#ffffff',
                              color: m.propio ? '#fff' : '#1E293B',
                              border: m.propio ? 'none' : '1px solid #E8E4DF',
                              whiteSpace: 'pre-wrap',
                            }}>
                            {m.contenido}
                            <div className={`text-[10px] mt-1 ${m.propio ? 'text-white/70' : 'text-slate-400'} text-right`}>
                              {horaMensaje(m.fechaEnvio)}
                              {m.propio && m.leido && <span style={{ marginLeft: 4 }}>&#10003;&#10003;</span>}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Composer */}
                <form onSubmit={handleEnviar}
                  className="px-3 sm:px-5 py-3 border-t bg-white flex items-end gap-2"
                  style={{ borderColor: '#F0EEE9' }}>
                  <textarea ref={textoRef} value={texto} rows={1}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar(); }
                    }}
                    placeholder="Escribí un mensaje..."
                    maxLength={2000}
                    className="flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{
                      borderColor: '#E8E4DF', color: '#1E293B', backgroundColor: 'white',
                      maxHeight: 140,
                      boxShadow: 'none',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#E07A5F'}
                    onBlur={e => e.currentTarget.style.borderColor = '#E8E4DF'} />
                  <button type="submit" disabled={enviando || !texto.trim()}
                    className="rounded-xl px-4 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-2 shrink-0"
                    style={{ backgroundColor: '#E07A5F' }}
                    aria-label="Enviar mensaje">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
