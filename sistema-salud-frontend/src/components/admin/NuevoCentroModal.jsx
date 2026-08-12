import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Building2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const TIPO_CENTRO = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CENTRO_ATENCION', label: 'Centro de Atención' },
  { value: 'GUARDIA', label: 'Guardia' },
  { value: 'CLINICA_PRIVADA', label: 'Clínica Privada' },
];

const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1';

export default function NuevoCentroModal({ onClose, onCreado }) {
  const [enviando, setEnviando] = useState(false);
  const [f, setF] = useState({
    nombre: '',
    tipoCentro: 'HOSPITAL',
    direccion: '',
    telefono: '',
    horarioAtencion: '',
    esPublico: true,
    tieneEmergencias: false,
    latitud: '',
    longitud: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.nombre.trim()) {
      toast.error('El nombre del centro es obligatorio');
      return;
    }
    setEnviando(true);
    try {
      await api.post('/centros', {
        nombre: f.nombre,
        tipoCentro: f.tipoCentro,
        direccion: f.direccion || null,
        telefono: f.telefono || null,
        horarioAtencion: f.horarioAtencion || null,
        esPublico: f.esPublico,
        tieneEmergencias: f.tieneEmergencias,
        latitud: f.latitud ? parseFloat(f.latitud) : null,
        longitud: f.longitud ? parseFloat(f.longitud) : null,
        activo: true,
      });
      toast.success('Centro creado correctamente');
      onCreado();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear el centro');
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-medico/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-teal-medico" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nuevo Centro de Salud</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Registrá un hospital, clínica o centro de atención a la red.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nombre *</label>
            <input value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })}
              className={inputCls} placeholder="Ej: Hospital Central" required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo de centro</label>
              <select value={f.tipoCentro} onChange={e => setF({ ...f, tipoCentro: e.target.value })} className={inputCls}>
                {TIPO_CENTRO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={f.telefono} onChange={e => setF({ ...f, telefono: e.target.value })}
                className={inputCls} placeholder="(011) 4567-8900" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Dirección</label>
            <input value={f.direccion} onChange={e => setF({ ...f, direccion: e.target.value })}
              className={inputCls} placeholder="Calle, número, localidad" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Horario de atención</label>
              <input value={f.horarioAtencion} onChange={e => setF({ ...f, horarioAtencion: e.target.value })}
                className={inputCls} placeholder="Lun a Vie 8:00 - 20:00" />
            </div>
            <div>
              <label className={labelCls}>Coordenadas (lat, lng) — opcional</label>
              <div className="flex gap-2">
                <input value={f.latitud} onChange={e => setF({ ...f, latitud: e.target.value })}
                  className={inputCls} placeholder="Lat" />
                <input value={f.longitud} onChange={e => setF({ ...f, longitud: e.target.value })}
                  className={inputCls} placeholder="Lng" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={f.esPublico}
                onChange={e => setF({ ...f, esPublico: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-medico focus:ring-teal-medico/30 accent-teal-medico" />
              Es público
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={f.tieneEmergencias}
                onChange={e => setF({ ...f, tieneEmergencias: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-medico focus:ring-teal-medico/30 accent-teal-medico" />
              Atiende emergencias
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-medico px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              Crear centro
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}