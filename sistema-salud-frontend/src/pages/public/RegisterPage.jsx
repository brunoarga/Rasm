import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function RegisterPage() {
  const [f, setF] = useState({ nombreCompleto: '', email: '', password: '', telefono: '', direccion: '', tipoUsuario: 'PACIENTE', tipoDocumento: 'DNI', numDocumento: '', fechaNacimiento: '', tipoProfesional: '', especialidad: '', numeroLicencia: '', idObraSocial: '', numeroAfiliado: '', planCobertura: '', consentimientoAceptado: false });
  const [os, setOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { api.get('/obras-sociales').then(r => setOs(r.data)).catch(() => {}); }, []);

  const hc = (e) => { const { name, value, type, checked } = e.target; setF(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };

  const hs = async (e) => {
    e.preventDefault();
    if (f.tipoUsuario === 'PACIENTE' && !f.consentimientoAceptado) { toast.error('Debe aceptar el consentimiento'); return; }
    setLoading(true);
    try {
      const p = { ...f, idObraSocial: f.idObraSocial ? parseInt(f.idObraSocial) : null };
      const d = await register(p);
      toast.success('Registro exitoso');
      navigate(d.tipoUsuario === 'PACIENTE' ? '/mi-espacio' : d.tipoUsuario === 'SECRETARIO' ? '/secretaria/dashboard' : '/profesional/dashboard');
    } catch (err) { toast.error(err.response?.data?.mensaje || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra placeholder:text-pizarra-light/40 outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20";
  const labelCls = "text-sm font-semibold text-pizarra";
  const selCls = "w-full rounded-xl border border-stone/60 bg-crema px-4 py-3 text-sm text-pizarra outline-none transition-all duration-200 focus:border-teal-medico focus:ring-2 focus:ring-teal-medico/20 appearance-none cursor-pointer";

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center -mt-20 py-8">

      <div className="relative w-full max-w-3xl mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-stone/30 overflow-hidden">
          <div className="px-8 py-10 sm:px-12 sm:py-12">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Logo */}
              <div className="text-center">
                <span className="text-2xl font-bold tracking-tight text-pizarra">RASM</span>
                <span className="text-2xl font-light text-teal-medico"> NexiaLink</span>
                <p className="text-xs text-pizarra-light/60 mt-1">Red de Atención en Salud Mental</p>
              </div>

              <form onSubmit={hs} className="space-y-5">
                {/* Nombre + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Nombre completo</label>
                    <input name="nombreCompleto" required value={f.nombreCompleto} onChange={hc} placeholder="Tu nombre" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Email</label>
                    <input name="email" type="email" required value={f.email} onChange={hc} placeholder="correo electrónico" className={inputCls} />
                  </div>
                </div>

                {/* Contraseña + Teléfono */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Contraseña</label>
                    <input name="password" type="password" required value={f.password} onChange={hc} placeholder="••••••••" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Teléfono</label>
                    <input name="telefono" value={f.telefono} onChange={hc} placeholder="+54 11 1234-5678" className={inputCls} />
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Dirección</label>
                  <input name="direccion" value={f.direccion} onChange={hc} placeholder="Calle y número" className={inputCls} />
                </div>

                {/* Tipo de Usuario */}
                <div className="space-y-1.5">
                  <label className={labelCls}>Tipo de usuario</label>
                  <select name="tipoUsuario" value={f.tipoUsuario} onChange={hc} className={selCls}>
                    <option value="PACIENTE">Paciente</option>
                    <option value="PROFESIONAL">Profesional</option>
                    <option value="SECRETARIO">Secretaria/o</option>
                  </select>
                </div>

                {/* ---- PACIENTE extra fields ---- */}
                {f.tipoUsuario === 'PACIENTE' && (
                  <div className="space-y-5 pt-2 border-t border-stone/30">
                    <h4 className="text-base font-bold text-pizarra">Datos del paciente</h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelCls}>Tipo de documento</label>
                        <select name="tipoDocumento" value={f.tipoDocumento} onChange={hc} className={selCls}>
                          <option>DNI</option>
                          <option>Pasaporte</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>Número</label>
                        <input name="numDocumento" value={f.numDocumento} onChange={hc} placeholder="12345678" className={inputCls} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Fecha de nacimiento</label>
                      <input name="fechaNacimiento" type="date" value={f.fechaNacimiento} onChange={hc} className={inputCls} />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelCls}>Obra social</label>
                        <select name="idObraSocial" value={f.idObraSocial} onChange={hc} className={selCls}>
                          <option value="">Sin Cobertura</option>
                          {os.filter(o => o.id !== 1).map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>Nro. Afiliado</label>
                        <input name="numeroAfiliado" value={f.numeroAfiliado} onChange={hc} placeholder="000-000000-0" className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>Plan</label>
                        <input name="planCobertura" value={f.planCobertura} onChange={hc} placeholder="Plan básico" className={inputCls} />
                      </div>
                    </div>

                    {/* Consentimiento */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="consentimientoAceptado"
                        checked={f.consentimientoAceptado}
                        onChange={hc}
                        className="mt-0.5 h-4 w-4 rounded border-stone/60 text-teal-medico focus:ring-teal-medico/30 accent-teal-medico"
                      />
                      <span className="text-sm text-pizarra-light leading-relaxed">
                        Acepto el Consentimiento Informado sobre el tratamiento de mis datos personales.
                      </span>
                    </label>
                  </div>
                )}

                {/* ---- PROFESIONAL extra fields ---- */}
                {f.tipoUsuario === 'PROFESIONAL' && (
                  <div className="space-y-5 pt-2 border-t border-stone/30">
                    <h4 className="text-base font-bold text-pizarra">Datos profesionales</h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={labelCls}>Tipo</label>
                        <select name="tipoProfesional" required value={f.tipoProfesional} onChange={hc} className={selCls}>
                          <option value="">Seleccionar...</option>
                          <option value="MEDICO">Médico</option>
                          <option value="PSICOLOGO">Psicólogo</option>
                          <option value="PSIQUIATRA">Psiquiatra</option>
                          <option value="TRABAJADOR_SOCIAL">Trabajador Social</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelCls}>Especialidad</label>
                        <input name="especialidad" value={f.especialidad} onChange={hc} placeholder="Ej: Clínica, Infantojuvenil" className={inputCls} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>Número de licencia</label>
                      <input name="numeroLicencia" value={f.numeroLicencia} onChange={hc} placeholder="Matrícula profesional" className={inputCls} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-teal-medico px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-teal-medico/90 hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>

              <p className="text-center text-sm text-pizarra-light/60">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-teal-medico font-semibold hover:text-teal-medico-dark transition-colors">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
