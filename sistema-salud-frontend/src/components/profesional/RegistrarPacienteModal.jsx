import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function RegistrarPacienteModal({ onClose, centroSaludId, profesionalId }) {
  const [form, setForm] = useState({
    nombreCompleto: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI',
    numDocumento: '',
    fechaNacimiento: '',
    obraSocialId: '',
    numeroAfiliado: '',
    planCobertura: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [cats, setCats] = useState([]);
  const [crearSolicitud, setCrearSolicitud] = useState(false);
  const [sol, setSol] = useState({
    idCategoria: '', titulo: '', descripcion: '', fechaHora: '', duracion: 30, modalidad: 'PRESENCIAL',
  });

  useEffect(() => {
    api.get('/categorias').then(r => setCats(r.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const buildPayload = () => {
    const nombre = form.nombreCompleto.trim();
    const idx = nombre.lastIndexOf(' ');
    const payloadNombre = idx > 0 ? nombre.slice(0, idx) : nombre;
    const payloadApellido = idx > 0 ? nombre.slice(idx + 1) : '';

    const fecha = form.fechaNacimiento || null;

    const osId = form.obraSocialId !== '' ? parseInt(form.obraSocialId, 10) : null;

    const payload = {
      nombre: payloadNombre,
      apellido: payloadApellido,
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numDocumento || null,
      fechaNacimiento: fecha,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      obraSocialId: osId,
      numeroAfiliado: form.numeroAfiliado || null,
    };

    if (centroSaludId) {
      payload.centroSaludId = centroSaludId;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreCompleto.trim()) {
      toast.warning('El nombre completo es obligatorio');
      return;
    }
    if (crearSolicitud && (!sol.idCategoria || !sol.titulo.trim() || !sol.descripcion.trim())) {
      toast.warning('Completá categoría, título y descripción de la solicitud');
      return;
    }
    setEnviando(true);
    try {
      const body = buildPayload();
      const pacienteRes = await api.post('/pacientes/registro-profesional', body);

      if (crearSolicitud) {
        const paciente = pacienteRes.data;
        await api.post('/solicitudes/presencial', {
          idPaciente: paciente.id,
          idCategoria: parseInt(sol.idCategoria, 10),
          titulo: sol.titulo.trim(),
          descripcion: sol.descripcion.trim(),
          idCentroSalud: centroSaludId || null,
          idProfesional: profesionalId || null,
          fechaHora: sol.fechaHora || null,
          duracion: sol.duracion,
          modalidad: sol.modalidad,
        });
        toast.success('Paciente y solicitud registrados');
      } else {
        toast.success('Paciente registrado exitosamente');
      }
      onClose();
    } catch (err) {
      const resp = err.response;
      const msg = resp?.data?.message || resp?.data?.mensaje || resp?.data || 'Error al registrar paciente';
      toast.error(typeof msg === 'string' ? msg : 'Error al registrar paciente');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b" style={{ borderColor: '#E8E4DF' }}>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: '#C44536' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1E293B' }}>Registrar Paciente Espontáneo</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5" style={{ color: '#7C7F85' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Nombre completo *</label>
            <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} placeholder="Ej: Juan Carlos Pérez" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} placeholder="3885876345" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} placeholder="Farias 997" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Tipo doc.</label>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }}>
                <option>DNI</option><option>Pasaporte</option><option>CE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>N° documento</label>
              <input name="numDocumento" value={form.numDocumento} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} placeholder="39775642" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Fecha nac.</label>
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} />
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: '#E8E4DF' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#7C7F85', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cobertura médica</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Obra social (ID)</label>
                <input name="obraSocialId" value={form.obraSocialId} onChange={handleChange} type="number" placeholder="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>N° afiliado</label>
                <input name="numeroAfiliado" value={form.numeroAfiliado} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1E293B' }}>Plan</label>
                <input name="planCobertura" value={form.planCobertura} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors" style={{ borderColor: '#E8E4DF' }} />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#1E293B' }}>
            <input type="checkbox" checked={crearSolicitud} onChange={e => setCrearSolicitud(e.target.checked)} />
            Crear solicitud de atención ahora
          </label>

          {crearSolicitud && (
            <div className="border-t pt-4 space-y-3" style={{ borderColor: '#E8E4DF' }}>
              <p className="text-xs font-semibold" style={{ color: '#7C7F85', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Solicitud de atención</p>
              <div>
                <select value={sol.idCategoria} onChange={e => setSol({ ...sol, idCategoria: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }}>
                  <option value="">Categoría *</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <input value={sol.titulo} onChange={e => setSol({ ...sol, titulo: e.target.value })}
                placeholder="Título *" className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
              <textarea value={sol.descripcion} onChange={e => setSol({ ...sol, descripcion: e.target.value })} rows={3}
                placeholder="Descripción *" className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#E8E4DF' }} />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex gap-2">
                  <input type="datetime-local" value={sol.fechaHora} onChange={e => setSol({ ...sol, fechaHora: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }} />
                </div>
                <select value={sol.duracion} onChange={e => setSol({ ...sol, duracion: parseInt(e.target.value, 10) })}
                  className="px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }}>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <div>
                <select value={sol.modalidad} onChange={e => setSol({ ...sol, modalidad: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E8E4DF' }}>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: '#7C7F85', backgroundColor: '#F6F4F0' }}>
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#C44536' }}>
              {enviando ? 'Registrando…' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
