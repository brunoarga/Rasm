import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Building2, Mail, Phone, Award, FileText, Check, Loader2, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function PerfilProfesional() {
  const [perfil, setPerfil] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [asignando, setAsignando] = useState(null);
  const [centroSel, setCentroSel] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/profesionales/perfil').then(r => {
      setPerfil(r.data);
      setCentroSel(r.data.centroActual?.id ?? null);
    }).catch(() => toast.error('Error al cargar perfil'));
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await api.put('/profesionales/perfil/foto', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPerfil(prev => ({ ...prev, fotoPerfil: r.data.fotoPerfil }));
      toast.success('Foto actualizada');
    } catch {
      toast.error('Error al subir foto');
    } finally {
      setSubiendo(false);
    }
  };

  const handleAsignarCentro = async (idCentro) => {
    setAsignando(idCentro);
    try {
      await api.put('/profesionales/centro', { idCentro });
      const r = await api.get('/profesionales/perfil');
      setPerfil(r.data);
      toast.success('Centro asignado correctamente');
    } catch {
      toast.error('Error al asignar centro');
    } finally {
      setAsignando(null);
    }
  };

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C44536] border-t-transparent rounded-full" />
      </div>
    );
  }

  const fotoUrl = perfil.fotoPerfil
    ? `${api.defaults.baseURL}/uploads/perfil/${perfil.fotoPerfil}`
    : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#1E293B' }}>
            Mi Perfil
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#7C7F85' }}>Datos profesionales y centros de salud</p>
        </div>

        <div className="bg-white rounded-xl border p-6 flex items-center gap-5" style={{ borderColor: '#E8E4DF' }}>
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#E8E4DF] flex items-center justify-center">
              {fotoUrl ? (
                <img src={fotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: '#7C7F85', fontFamily: "'Inter', sans-serif" }}>
                  {perfil.nombreCompleto?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={subiendo}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white transition-colors"
              style={{ backgroundColor: '#C44536' }}>
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: '#1E293B' }}>
              {perfil.nombreCompleto}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#7C7F85' }}>
              {perfil.tipoProfesional?.replace('_', ' ')} {perfil.especialidad && `· ${perfil.especialidad}`}
            </p>
            {perfil.numeroLicencia && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#7C7F85' }}>
                <Award className="w-3 h-3" /> Matrícula: {perfil.numeroLicencia}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#1E293B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Información de contacto
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4" style={{ color: '#7C7F85' }} />
              <span style={{ color: '#1E293B' }}>{perfil.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4" style={{ color: '#7C7F85' }} />
              <span style={{ color: '#1E293B' }}>{perfil.telefono || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4" style={{ color: '#7C7F85' }} />
              <span style={{ color: '#1E293B' }}>{perfil.direccion || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText className="w-4 h-4" style={{ color: '#7C7F85' }} />
              <span style={{ color: '#1E293B' }}>{perfil.horarioAtencion || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#1E293B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Centro de salud actual
          </h3>
          {perfil.centroActual ? (
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F6F4F0' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8E4DF' }}>
                <Building2 className="w-5 h-5" style={{ color: '#7C7F85' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{perfil.centroActual.nombre}</p>
                <p className="text-xs mt-0.5" style={{ color: '#7C7F85' }}>{perfil.centroActual.direccion}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: '#FEF3E9', border: '1px solid #F0D6C4' }}>
              <p style={{ color: '#8B4A2B', fontWeight: 500 }}>Aún no tienes un centro asignado</p>
              <p className="text-xs mt-1" style={{ color: '#A06B50' }}>
                Seleccioná un centro de la red para comenzar a operar.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#1E293B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Centros de la red
          </h3>
          {perfil.centrosDisponibles?.length === 0 ? (
            <p className="text-sm" style={{ color: '#7C7F85' }}>No hay centros registrados en el sistema.</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1E293B' }}>
                  Centro de Atención Asignado:
                </label>
                <div ref={dropdownRef} className="relative">
                  <button type="button" onClick={() => setDropdownOpen(o => !o)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm text-left transition-all"
                    style={{
                      borderColor: dropdownOpen ? '#C44536' : '#E8E4DF',
                      color: '#1E293B', backgroundColor: '#FFFFFF',
                      boxShadow: dropdownOpen ? '0 0 0 3px rgba(196,69,54,0.08)' : 'none',
                    }}>
                    <span className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 shrink-0" style={{ color: '#7C7F85' }} />
                      <span className="truncate">
                        {(() => {
                          const sel = perfil.centrosDisponibles.find(c => c.id === centroSel);
                          return sel ? sel.nombre : 'Seleccioná un centro de la red';
                        })()}
                      </span>
                      {perfil.centroActual?.id === centroSel && centroSel !== null && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: '#3A7D5C20', color: '#3A7D5C' }}>
                          <Check className="w-3 h-3" /> Asignado
                        </span>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      style={{ color: '#7C7F85' }} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 rounded-xl border bg-white shadow-lg overflow-hidden"
                      style={{ borderColor: '#E8E4DF' }}>
                      {perfil.centrosDisponibles.map(c => {
                        const esSel = c.id === centroSel;
                        const esActual = perfil.centroActual?.id === c.id;
                        return (
                          <button key={c.id} type="button" onClick={() => { setCentroSel(c.id); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[#F6F4F0]"
                            style={{ backgroundColor: esSel ? '#FEF6F4' : 'white' }}>
                            <Building2 className="w-4 h-4 shrink-0" style={{ color: esActual ? '#3A7D5C' : '#7C7F85' }} />
                            <span className="flex-1 min-w-0">
                              <span className="block truncate font-medium" style={{ color: '#1E293B' }}>{c.nombre}</span>
                              <span className="block truncate text-xs" style={{ color: '#7C7F85' }}>{c.direccion}</span>
                            </span>
                            {esActual ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: '#3A7D5C20', color: '#3A7D5C' }}>
                                <Check className="w-3 h-3" /> Asignado
                              </span>
                            ) : esSel ? (
                              <Check className="w-4 h-4 shrink-0" style={{ color: '#C44536' }} />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button onClick={() => {
                if (centroSel === null || centroSel === perfil.centroActual?.id) return;
                handleAsignarCentro(centroSel);
              }}
                disabled={asignando !== null || centroSel === null || centroSel === perfil.centroActual?.id}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                style={{ backgroundColor: '#C44536' }}>
                {asignando !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Cambiar Centro
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
