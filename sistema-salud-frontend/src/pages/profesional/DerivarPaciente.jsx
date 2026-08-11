import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, User, Search, Send, Loader2, MapPin } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function DerivarPaciente() {
  const { idSolicitud } = useParams();
  const navigate = useNavigate();
  const [sol, setSol] = useState(null);
  const [profs, setProfs] = useState([]);
  const [centros, setCentros] = useState([]);
  const [oss, setOss] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [f, setF] = useState({ tipoDerivacion: 'profesional', idProfesional: '', idCentroSalud: '', tipoPractica: 'CONSULTA_AMBULATORIA', motivoDerivacion: '', notas: '', lat: -34.6, lon: -58.4, radio: 50, idObraSocial: '' });

  useEffect(() => {
    api.get(`/solicitudes/${idSolicitud}`).then(r => setSol(r.data)).catch(() => {});
    api.get('/profesionales').then(r => setProfs(r.data)).catch(() => {});
    api.get('/obras-sociales').then(r => setOss(r.data)).catch(() => {});
  }, [idSolicitud]);

  const buscarCentros = async () => {
    setBuscando(true);
    try {
      const p = new URLSearchParams({ lat: f.lat, lon: f.lon, radio: f.radio });
      if (f.idObraSocial) p.append('idObraSocial', f.idObraSocial);
      if (f.tipoPractica) p.append('tipoPractica', f.tipoPractica);
      const r = await api.get(`/centros/cercanos?${p}`);
      setCentros(r.data);
    } catch (err) { toast.error('Error al buscar centros'); }
    finally { setBuscando(false); }
  };

  const handleDerivar = async () => {
    try {
      await api.put(`/solicitudes/${idSolicitud}/derivar`, { idProfesional: f.idProfesional ? parseInt(f.idProfesional) : null, idCentroSalud: f.idCentroSalud ? parseInt(f.idCentroSalud) : null, tipoPractica: f.tipoPractica, motivoDerivacion: f.motivoDerivacion, notas: f.notas });
      toast.success('Derivación exitosa');
      navigate(`/profesional/solicitudes/${idSolicitud}`);
    } catch (err) { toast.error('Error al derivar'); }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        <Link to={`/profesional/solicitudes/${idSolicitud}`}
          className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: '#7C7F85' }}>
          <ArrowLeft className="w-4 h-4" /> Volver al caso
        </Link>

        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>Derivar Solicitud</h1>
          {sol && (
            <p className="text-sm mt-1" style={{ color: '#7C7F85' }}>
              Derivando: <strong style={{ color: '#1E293B' }}>{sol.titulo}</strong> — Paciente: {sol.nombrePaciente}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-white" style={{ borderColor: '#E8E4DF' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
              <h3 className="text-sm font-bold" style={{ color: '#1E293B' }}>Tipo de Derivación</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Derivar a</label>
                <div className="flex gap-2">
                  {[['profesional', 'Otro Profesional'], ['centro', 'Centro de Salud']].map(([val, label]) => (
                    <button key={val} onClick={() => setF({ ...f, tipoDerivacion: val })}
                      className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: f.tipoDerivacion === val ? '#C44536' : '#F6F4F0',
                        color: f.tipoDerivacion === val ? 'white' : '#7C7F85',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {f.tipoDerivacion === 'profesional' && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                    <User className="w-3.5 h-3.5" style={{ color: '#7C7F85' }} /> Seleccionar Profesional
                  </label>
                  <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                    value={f.idProfesional} onChange={e => setF({ ...f, idProfesional: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {profs.filter(p => sol?.idProfesional !== p.id).map(p => (
                      <option key={p.id} value={p.id}>{p.usuario?.nombreCompleto} - {p.usuario?.tipoProfesional}</option>
                    ))}
                  </select>
                </div>
              )}

              {f.tipoDerivacion === 'centro' && (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                      <Building2 className="w-3.5 h-3.5" style={{ color: '#7C7F85' }} /> Práctica
                    </label>
                    <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      value={f.tipoPractica} onChange={e => setF({ ...f, tipoPractica: e.target.value })}>
                      <option value="CONSULTA_AMBULATORIA">Consulta</option>
                      <option value="SALUD_MENTAL">Salud Mental</option>
                      <option value="INTERNACION">Internación</option>
                      <option value="GUARDIA_EMERGENCIA">Guardia</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#7C7F85' }} /> Obra Social
                    </label>
                    <select className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                      value={f.idObraSocial} onChange={e => setF({ ...f, idObraSocial: e.target.value })}>
                      <option value="">Sin filtrar</option>
                      <option value="1">Sin Cobertura</option>
                      {oss.filter(o => o.id !== 1).map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Latitud</label>
                      <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                        value={f.lat} onChange={e => setF({ ...f, lat: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Longitud</label>
                      <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                        value={f.lon} onChange={e => setF({ ...f, lon: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#5B5F66' }}>Radio (km)</label>
                      <input className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                        value={f.radio} onChange={e => setF({ ...f, radio: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <button onClick={buscarCentros} disabled={buscando}
                    className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#C44536' }}>
                    {buscando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Buscar Centros
                  </button>
                  {centros.length > 0 && (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto">
                      {centros.map(c => (
                        <div key={c.id} role="button" tabIndex={0}
                          onClick={() => setF({ ...f, idCentroSalud: c.id })}
                          onKeyDown={(e) => { if (e.key === 'Enter') setF({ ...f, idCentroSalud: c.id }); }}
                          className="rounded-xl border px-4 py-3 cursor-pointer transition-all"
                          style={{
                            borderColor: parseInt(f.idCentroSalud) === c.id ? '#3A7D5C' : '#E8E4DF',
                            backgroundColor: parseInt(f.idCentroSalud) === c.id ? '#F2F8F4' : 'white',
                          }}>
                          <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{c.nombre}</p>
                          <p className="text-xs" style={{ color: '#7C7F85' }}>{c.direccion} | {c.esPublico ? 'Público' : 'Privado'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: '#5B5F66' }}>
                  <Send className="w-3.5 h-3.5" style={{ color: '#7C7F85' }} /> Motivo de Derivación
                </label>
                <textarea rows={3} className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none resize-none" style={{ borderColor: '#E8E4DF', color: '#1E293B' }}
                  value={f.motivoDerivacion} onChange={e => setF({ ...f, motivoDerivacion: e.target.value })} />
              </div>

              <button onClick={handleDerivar} disabled={!f.idProfesional && !f.idCentroSalud}
                className="inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#3A7D5C' }}>
                <Send className="w-4 h-4" /> Derivar
              </button>
            </div>
          </div>

          {/* Info del paciente */}
          <div className="rounded-2xl border bg-white h-fit" style={{ borderColor: '#E8E4DF' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#F0EEE9' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C7F85' }}>Info del Paciente</h3>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {sol && (
                <>
                  <InfoLine label="Nombre" value={sol.nombrePaciente} />
                  <InfoLine label="Categoría" value={sol.nombreCategoria} />
                  <InfoLine label="Prioridad" value={sol.prioridad} />
                  <div>
                    <p className="text-[11px]" style={{ color: '#9A9CA1' }}>Descripción</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#1E293B' }}>{sol.descripcion}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: '#9A9CA1' }}>{label}</p>
      <p className="font-medium text-xs" style={{ color: '#1E293B' }}>{value}</p>
    </div>
  );
}
