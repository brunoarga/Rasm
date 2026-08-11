import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Bienvenido ${data.nombreCompleto}`);
      const r = { PACIENTE: '/mi-espacio', PROFESIONAL: '/profesional/dashboard', ADMIN: '/admin/dashboard' };
      navigate(r[data.tipoUsuario] || '/');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al iniciar sesion');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center py-8">

      <div className="relative w-full max-w-4xl mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-stone/30 overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone/30">

            {/* ---- LEFT COLUMN — Form ---- */}
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              <div className="max-w-sm mx-auto space-y-8">
                {/* Logo */}
                <div>
                  <span className="text-2xl font-bold tracking-tight text-pizarra">RASM</span>
                  <span className="text-2xl font-light text-teal-medico"> NexiaLink</span>
                  <p className="text-xs text-pizarra-light/60 mt-1">Red de Atención en Salud Mental</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-pizarra">Nombre de usuario</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="correo electrónico"
                      className="w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra placeholder:text-pizarra-light/40 outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-pizarra">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra placeholder:text-pizarra-light/40 outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-pizarra px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-pizarra/90 hover:shadow-lg disabled:opacity-60"
                  >
                    {loading ? 'Accediendo...' : 'Acceder'}
                  </button>
                </form>

                <div className="space-y-2 text-center text-sm">
                  <Link to="/" className="block text-pizarra-light/60 hover:text-teal-medico transition-colors">
                    ¿Olvidó su contraseña?
                  </Link>
                  <Link to="/registro" className="block text-teal-medico font-semibold hover:text-teal-medico-dark transition-colors">
                    ¿No tiene cuenta? Crear nueva cuenta
                  </Link>
                </div>
              </div>
            </div>

            {/* ---- RIGHT COLUMN — Help Desk ---- */}
            <div className="px-8 py-10 sm:px-12 sm:py-12 flex items-center justify-center">
              <div className="max-w-xs text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-medico/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-medico" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 11-12.728 0 9 9 0 0112.728 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 11-7.072 0 5 5 0 017.072 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v.01" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-pizarra">
                  Mesa de Ayuda
                </h3>
                <p className="text-sm text-pizarra-light leading-relaxed">
                  Ante cualquier duda comuníquese con la Mesa de Ayuda
                </p>
                <p className="text-sm font-bold text-pizarra">
                  soporte.nexialink@gmail.com
                </p>

                <div className="pt-4">
                  <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-pizarra-light/50 hover:text-teal-medico transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Términos y Condiciones
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
