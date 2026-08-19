import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import NotificationBell from './NotificationBell';
import MessagesBell from './MessagesBell';
import ThemeToggle from './ThemeToggle';
import RevisarSolicitudModal from '../profesional/RevisarSolicitudModal';
import DetalleTurnoModal from './DetalleTurnoModal';
import Avatar from '../common/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [solicitudEnRevision, setSolicitudEnRevision] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) { setFotoPerfil(null); return; }
    api.get('/usuarios/perfil')
      .then(r => setFotoPerfil(r.data?.fotoPerfil || null))
      .catch(() => setFotoPerfil(null));
  }, [user]);

  if (location.pathname === '/login' || location.pathname === '/registro') return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const userMenu = user?.tipoUsuario === 'PACIENTE' ? (
    <>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/mi-espacio" onClick={() => setOpen(false)}>Mi Espacio</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/pedir-ayuda" onClick={() => setOpen(false)}>Pedir Ayuda</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/mis-solicitudes" onClick={() => setOpen(false)}>Mis Solicitudes</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/foro" onClick={() => setOpen(false)}>Foro</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/soporte" onClick={() => setOpen(false)}>Soporte</Link>
    </>
  ) : user?.tipoUsuario === 'PROFESIONAL' ? (
    <>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/profesional/solicitudes" onClick={() => setOpen(false)}>Mis Solicitudes</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/profesional/dashboard" onClick={() => setOpen(false)}>Agenda</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/profesional/perfil" onClick={() => setOpen(false)}>Mi Perfil</Link>
    </>
  ) : user?.tipoUsuario === 'SECRETARIO' ? (
    <>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/secretaria/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/secretaria/agenda" onClick={() => setOpen(false)}>Agenda</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/secretaria/solicitudes" onClick={() => setOpen(false)}>Solicitudes</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/soporte" onClick={() => setOpen(false)}>Soporte</Link>
    </>
  ) : user?.tipoUsuario === 'ADMIN' ? (
    <>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/admin/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/admin/usuarios" onClick={() => setOpen(false)}>Usuarios</Link>
      <Link className="relative text-sm font-medium text-pizarra-light hover:text-teal-medico transition-colors duration-200 py-2 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-teal-medico after:transition-all after:duration-300 after:rounded-full hover:after:w-full hover:after:left-0" to="/admin/centros" onClick={() => setOpen(false)}>Centros</Link>
    </>
  ) : null;

  return (
    <>
    <nav className={`sticky top-0 z-50 font-body transition-all duration-500 ${
      location.pathname === '/' && !scrolled
        ? 'bg-crema/0 dark:bg-transparent backdrop-blur-0 border-b border-transparent'
        : 'bg-crema/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-stone/40 dark:border-slate-700/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-teal-medico">RASM</span>
                <span className="text-pizarra dark:text-slate-100">NexiaLink</span>
              </span>
          </Link>

          {/* Desktop Nav — User menu (sin enlaces públicos) */}
          <nav className="hidden md:flex items-center gap-8">
            {user && userMenu}
          </nav>

          {/* Desktop Right — Auth or User info */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <span className="flex items-center gap-2">
                {['PACIENTE', 'PROFESIONAL', 'SECRETARIO'].includes(user.tipoUsuario) && <MessagesBell />}
                <NotificationBell
                  onSolicitudClick={(id) => setSolicitudEnRevision(id)}
                  onTurnoClick={(id) => setTurnoSeleccionado(id)}
                />
                <Avatar foto={fotoPerfil} nombre={user.nombreCompleto} size={36} />
                <span className="text-sm font-medium text-pizarra dark:text-slate-100">{user.nombreCompleto}</span>
                <span className="text-[11px] font-bold tracking-wide uppercase bg-teal-medico/10 dark:bg-teal-medico/20 text-teal-medico-dark px-2.5 py-1 rounded-full">{user.tipoUsuario}</span>
                <button onClick={handleLogout} className="inline-flex items-center justify-center rounded-xl border border-pizarra/15 dark:border-slate-600/50 px-4 py-2 text-sm font-medium text-pizarra-light dark:text-slate-300 transition-all duration-200 hover:border-terracota/30 hover:text-terracota hover:bg-terracota/5 dark:hover:bg-terracota/10">
                  Salir
                </button>
              </span>
            ) : (
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-teal-medico px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:opacity-90">
                ACCEDER
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-pizarra dark:text-slate-100 hover:bg-stone/50 dark:hover:bg-slate-700/50 transition-colors" aria-label="Menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-5 border-t border-stone/30 dark:border-slate-700/50 pt-4 space-y-2 dark:bg-slate-900">
            {user ? (
              <>
                {userMenu}
                <div className="pt-3 border-t border-stone/30 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                {['PACIENTE', 'PROFESIONAL', 'SECRETARIO'].includes(user.tipoUsuario) && <MessagesBell />}
                <NotificationBell
                  onSolicitudClick={(id) => setSolicitudEnRevision(id)}
                  onTurnoClick={(id) => setTurnoSeleccionado(id)}
                />
                    <ThemeToggle />
                    <Avatar foto={fotoPerfil} nombre={user.nombreCompleto} size={32} />
                    <span className="text-sm font-semibold text-pizarra dark:text-slate-100">{user.nombreCompleto}</span>
                  </div>
                  <span className="text-[11px] font-bold tracking-wide uppercase bg-teal-medico/10 dark:bg-teal-medico/20 text-teal-medico-dark px-2.5 py-1 rounded-full">{user.tipoUsuario}</span>
                </div>
                <button onClick={handleLogout} className="w-full text-center rounded-xl border border-pizarra/15 dark:border-slate-600/50 px-4 py-2.5 text-sm font-medium text-pizarra-light dark:text-slate-300 hover:border-terracota/30 hover:text-terracota dark:hover:bg-terracota/10 mt-2">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <div className="pt-3 border-t border-stone/30 dark:border-slate-700/50 mt-3 flex items-center justify-between">
                  <ThemeToggle />
                  <Link to="/login" className="flex-1 ml-3 text-center rounded-xl bg-teal-medico px-4 py-2.5 text-sm font-semibold text-white" onClick={() => setOpen(false)}>ACCEDER</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>

      {solicitudEnRevision && (
        <RevisarSolicitudModal
          solicitudId={solicitudEnRevision}
          onClose={() => setSolicitudEnRevision(null)}
        />
      )}

      {turnoSeleccionado && (
        <DetalleTurnoModal
          solicitudId={turnoSeleccionado}
          onClose={() => setTurnoSeleccionado(null)}
        />
      )}
    </>
  );
}
