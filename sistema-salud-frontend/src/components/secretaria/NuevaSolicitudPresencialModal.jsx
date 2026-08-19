import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Users } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function NuevaSolicitudPresencialModal({ onClose, onCreated }) {
  const [cats, setCats] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSel, setPacienteSel] = useState(null);

  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombreCompleto: '', telefono: '', tipoDocumento: 'DNI', numDocumento: '', fechaNacimiento: '', obraSocialId: '',
  });

  const [sol, setSol] = useState({
    idCategoria: '', titulo: '', descripcion: '', esUrgente: false,
  });

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.get('/categorias').then(r => setCats(r.data || [])).catch(() => {});
  }, []);

  const handleBuscar = async () => {
    const q = busqueda.trim();
    if (q.length < 2) { toast.warning('Ingresá al menos 2 caracteres'); return; }
    setBuscando(true);
    try {
      const r = await api.get(`/pacientes/buscar?q=${encodeURIComponent(q)}`);
      setResultados(r.data || []);
      if ((r.data || []).length === 0) toast.info('No se encontró el paciente. Podés crearlo abajo.');
    } catch {
      toast.error('Error al buscar paciente');
    } finally {
      setBuscando(false);
    }
  };

  const handleCrearPaciente = async () => {
    if (!nuevoPaciente.nombreCompleto.trim()) { toast.warning('El nombre completo es obligatorio'); return; }
    try {
      const r = await api.post('/pacientes', {
        nombreCompleto: nuevoPaciente.nombreCompleto.trim(),
        telefono: nuevoPaciente.telefono || null,
        tipoDocumento: nuevoPaciente.tipoDocumento,
        numeroDocumento: nuevoPaciente.numDocumento || null,
        fechaNacimiento: nuevoPaciente.fechaNacimiento || null,
        obraSocialId: nuevoPaciente.obraSocialId ? parseInt(nuevoPaciente.obraSocialId, 10) : null,
      });
      setPacienteSel({ idPaciente: r.data.id, nombreCompleto: r.data.usuario?.nombreCompleto || nuevoPaciente.nombreCompleto.trim() });
      toast.success('Paciente registrado');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al registrar paciente';
      toast.error(typeof msg === 'string' ? msg : 'Error al registrar paciente');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteSel) { toast.warning('Seleccioná o creá un paciente'); return; }
    if (!sol.idCategoria) { toast.warning('Seleccioná la categoría'); return; }
    if (!sol.titulo.trim() || !sol.descripcion.trim()) { toast.warning('Título y descripción son obligatorios'); return; }

    setEnviando(true);
    try {
      const payload = {
        idPaciente: pacienteSel.idPaciente,
        idCategoria: parseInt(sol.idCategoria, 10),
        titulo: sol.titulo.trim(),
        descripcion: sol.descripcion.trim(),
        esUrgente: sol.esUrgente,
      };
      await api.post('/solicitudes/presencial', payload);
      toast.success('Solicitud presencial registrada');
      onCreated && onCreated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || err.response?.data || 'Error al registrar la solicitud';
      toast.error(typeof msg === 'string' ? msg : 'Error al registrar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b" style={{ borderColor: '#E8E4DF' }}>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: '#C44536' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1E293B' }}>Nueva Solicitud Presencial</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5" style={{ color: '#7C7F85' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Paciente */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#7C7F85', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Paciente</p>
            {pacienteSel ? (
              <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: '#E8E4DF', backgroundColor: '#F6F4F0' }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium" style={{ color: '#1E293B' }}>{pacienteSel.nombreCompleto}</span>
                </div>
                <button type="button" onClick={() => { setPacienteSel(null); setResultados([]); }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700">Cambiar</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o documento…"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                  <button type="button" onClick={handleBuscar} disabled={buscando}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: '#C44536' }}>
                    <Search className="w-4 h-4" /> {buscando ? 'Buscando…' : 'Buscar'}
                  </button>
                </div>
                {resultados.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {resultados.map(p => (
                      <button key={p.idPaciente} type="button" onClick={() => setPacienteSel(p)}
                        className="w-full flex items-center justify-between rounded-lg border p-2.5 text-left hover:bg-slate-50"
                        style={{ borderColor: '#E8E4DF' }}>
                        <span className="text-sm font-medium" style={{ color: '#1E293B' }}>{p.nombreCompleto}</span>
                        <span className="text-xs text-slate-400">{p.tipoDocumento} {p.numDocumento}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t pt-3" style={{ borderColor: '#E8E4DF' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#7C7F85' }}>No está registrado? Crear paciente</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={nuevoPaciente.nombreCompleto} onChange={e => setNuevoPaciente({ ...nuevoPaciente, nombreCompleto: e.target.value })}
                      placeholder="Nombre completo *" className="col-span-2 px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                    <input value={nuevoPaciente.numDocumento} onChange={e => setNuevoPaciente({ ...nuevoPaciente, numDocumento: e.target.value })}
                      placeholder="N° documento" className="px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                    <input value={nuevoPaciente.telefono} onChange={e => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                      placeholder="Teléfono" className="px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                    <input type="date" value={nuevoPaciente.fechaNacimiento} onChange={e => setNuevoPaciente({ ...nuevoPaciente, fechaNacimiento: e.target.value })}
                      className="px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                    <input type="number" value={nuevoPaciente.obraSocialId} onChange={e => setNuevoPaciente({ ...nuevoPaciente, obraSocialId: e.target.value })}
                      placeholder="Obra social (ID)" className="px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                  </div>
                  <button type="button" onClick={handleCrearPaciente}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: '#1E293B' }}>
                    <UserPlus className="w-3.5 h-3.5" /> Crear Paciente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Solicitud */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#7C7F85', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Motivo de consulta</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <select value={sol.idCategoria} onChange={e => setSol({ ...sol, idCategoria: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }}>
                  <option value="">Categoría *</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <input value={sol.titulo} onChange={e => setSol({ ...sol, titulo: e.target.value })}
                placeholder="Título *" className="col-span-2 px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
              <textarea value={sol.descripcion} onChange={e => setSol({ ...sol, descripcion: e.target.value })} rows={3}
                placeholder="Descripción *" className="col-span-2 px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#E8E4DF' }} />
              <label className="flex items-center gap-2 text-sm" style={{ color: '#1E293B' }}>
                <input type="checkbox" checked={sol.esUrgente} onChange={e => setSol({ ...sol, esUrgente: e.target.checked })} />
                Urgente
              </label>
            </div>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            Luego de registrar la solicitud se la derivará a un centro de salud disponible, que confirmará el turno del paciente.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: '#7C7F85', backgroundColor: '#F6F4F0' }}>
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#C44536' }}>
              {enviando ? 'Registrando…' : 'Registrar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}