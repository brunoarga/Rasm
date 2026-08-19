import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import EmergencyButton from './components/layout/EmergencyButton';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import Terminos from './pages/public/Terminos';
import Privacidad from './pages/public/Privacidad';
import MiEspacio from './pages/usuario/MiEspacio';
import PedirAyuda from './pages/usuario/PedirAyuda';
import MisSolicitudes from './pages/usuario/MisSolicitudes';
import ForoPacientes from './pages/usuario/ForoPacientes';
import NuevaPublicacionPage from './pages/usuario/NuevaPublicacionPage';
import DetallePost from './pages/usuario/DetallePost';
import DashboardProfesional from './pages/profesional/DashboardProfesional';
import BandejaSolicitudes from './pages/profesional/BandejaSolicitudes';
import DetalleSolicitud from './pages/profesional/DetalleSolicitud';
import DerivarPaciente from './pages/profesional/DerivarPaciente';
import GestionPacientes from './pages/profesional/GestionPacientes';
import PerfilProfesional from './pages/profesional/PerfilProfesional';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionCentros from './pages/admin/GestionCentros';
import DashboardSecretaria from './pages/secretaria/DashboardSecretaria';
import AgendaSecretaria from './pages/secretaria/AgendaSecretaria';
import BandejaSolicitudesSecretaria from './pages/secretaria/BandejaSolicitudesSecretaria';
import DetalleSolicitudSecretaria from './pages/secretaria/DetalleSolicitudSecretaria';
import NotificacionesPage from './pages/notificaciones/NotificacionesPage';
import MensajesPage from './pages/mensajes/MensajesPage';
import SoportePage from './pages/soporte/SoportePage';
import fondoBg from './assets/fondo.png';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.tipoUsuario)) return <Navigate to="/" />;
  return children;
};

function AppLayout({ home }) {
  const { user } = useAuth();
  const location = useLocation();
  const ocultarNavbar = location.pathname === '/foro/nueva-publicacion';
  return (
    <>
      {!ocultarNavbar && <Navbar />}
      {user?.tipoUsuario === 'PACIENTE' && <EmergencyButton />}
      <div className="watermark-bg" style={{ backgroundImage: `url(${fondoBg})` }} aria-hidden="true" />
      <div className="page">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/mi-espacio" element={<PrivateRoute roles={['PACIENTE']}><MiEspacio /></PrivateRoute>} />
          <Route path="/pedir-ayuda" element={<PrivateRoute roles={['PACIENTE']}><PedirAyuda /></PrivateRoute>} />
          <Route path="/mis-solicitudes" element={<PrivateRoute roles={['PACIENTE']}><MisSolicitudes /></PrivateRoute>} />
          <Route path="/foro" element={<PrivateRoute roles={['PACIENTE']}><ForoPacientes /></PrivateRoute>} />
          <Route path="/foro/nueva-publicacion" element={<PrivateRoute roles={['PACIENTE']}><NuevaPublicacionPage /></PrivateRoute>} />
          <Route path="/foro/:id" element={<PrivateRoute roles={['PACIENTE']}><DetallePost /></PrivateRoute>} />
          <Route path="/mi-diario" element={<Navigate to="/mi-espacio" />} />
          <Route path="/profesional/dashboard" element={<PrivateRoute roles={['PROFESIONAL']}><DashboardProfesional /></PrivateRoute>} />
          <Route path="/profesional/solicitudes" element={<PrivateRoute roles={['PROFESIONAL']}><BandejaSolicitudes /></PrivateRoute>} />
          <Route path="/profesional/solicitudes/:id" element={<PrivateRoute roles={['PROFESIONAL']}><DetalleSolicitud /></PrivateRoute>} />
          <Route path="/profesional/derivar/:idSolicitud" element={<PrivateRoute roles={['PROFESIONAL']}><DerivarPaciente /></PrivateRoute>} />
          <Route path="/profesional/pacientes" element={<PrivateRoute roles={['PROFESIONAL']}><GestionPacientes /></PrivateRoute>} />
          <Route path="/profesional/perfil" element={<PrivateRoute roles={['PROFESIONAL']}><PerfilProfesional /></PrivateRoute>} />
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN']}><DashboardAdmin /></PrivateRoute>} />
          <Route path="/admin/usuarios" element={<PrivateRoute roles={['ADMIN']}><GestionUsuarios /></PrivateRoute>} />
          <Route path="/admin/centros" element={<PrivateRoute roles={['ADMIN']}><GestionCentros /></PrivateRoute>} />
          <Route path="/secretaria/dashboard" element={<PrivateRoute roles={['SECRETARIO']}><DashboardSecretaria /></PrivateRoute>} />
          <Route path="/secretaria/agenda" element={<PrivateRoute roles={['SECRETARIO']}><AgendaSecretaria /></PrivateRoute>} />
          <Route path="/secretaria/solicitudes" element={<PrivateRoute roles={['SECRETARIO']}><BandejaSolicitudesSecretaria /></PrivateRoute>} />
          <Route path="/secretaria/solicitudes/:id" element={<PrivateRoute roles={['SECRETARIO']}><DetalleSolicitudSecretaria /></PrivateRoute>} />
          <Route path="/notificaciones" element={<PrivateRoute><NotificacionesPage /></PrivateRoute>} />
          <Route path="/mensajes" element={<PrivateRoute roles={['PACIENTE', 'PROFESIONAL', 'SECRETARIO']}><MensajesPage /></PrivateRoute>} />
          <Route path="/mensajes/:id" element={<PrivateRoute roles={['PACIENTE', 'PROFESIONAL', 'SECRETARIO']}><MensajesPage /></PrivateRoute>} />
          <Route path="/soporte" element={<PrivateRoute roles={['PACIENTE', 'PROFESIONAL', 'SECRETARIO', 'ADMIN']}><SoportePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={home} />} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const home = !user ? '/' : user.tipoUsuario === 'PACIENTE' ? '/mi-espacio' : user.tipoUsuario === 'PROFESIONAL' ? '/profesional/solicitudes' : user.tipoUsuario === 'SECRETARIO' ? '/secretaria/dashboard' : '/admin/dashboard';
  return (
    <BrowserRouter>
      <AppLayout home={home} />
    </BrowserRouter>
  );
}

export default function App() {
  return <AuthProvider><ThemeProvider><ErrorBoundary><AppRoutes /></ErrorBoundary></ThemeProvider></AuthProvider>;
}
