import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DetalleSolicitudModal from '../../components/usuario/DetalleSolicitudModal';
import { formatearFecha } from '../../utils/fechas';
import { Eye, ChevronRight } from 'lucide-react';

const PRIORIDAD_BADGE = {
  URGENTE: 'bg-red-100 text-red-700',
  ALTA: 'bg-amber-100 text-amber-700',
  MEDIA: 'bg-slate-100 text-slate-700',
  BAJA: 'bg-emerald-100 text-emerald-700',
};

const ESTADO_BADGE = {
  CREADA: 'bg-slate-100 text-slate-700',
  REVISADA: 'bg-blue-100 text-blue-700',
  ASIGNADA: 'bg-teal-medico/10 text-teal-medico',
  EN_PROCESO: 'bg-amber-100 text-amber-700',
  DERIVADA: 'bg-violet-100 text-violet-700',
  COMPLETADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-red-100 text-red-700',
};

export default function MisSolicitudes() {
  const [sols, setSols] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargar = () => {
    api.get('/solicitudes').then(r => setSols(r.data || [])).catch(() => {});
  };

  useEffect(() => { cargar(); }, []);

  const abrirDetalle = (s) => {
    setSelectedSolicitud(s.id);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setSelectedSolicitud(null);
  };

  return (
    <div className="page-container page-container--narrow">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Mis Solicitudes</h1>
      </div>

      {sols.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__text">No tenes solicitudes.</p>
        </div>
      ) : (
        sols.map(s => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onClick={() => abrirDetalle(s)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirDetalle(s); } }}
            className={`request-item request-item--${s.prioridad === 'URGENTE' ? 'urgent' : s.prioridad === 'ALTA' ? 'alta' : s.prioridad === 'MEDIA' ? 'media' : 'baja'} cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] group`}
          >
            <div className="request-item__top">
              <div className="min-w-0 flex-1">
                <div className="request-item__title">{s.titulo}</div>
                <p className="request-item__desc">{s.descripcion}</p>
                <div className="request-item__meta">
                  {s.nombreCategoria} &middot; {formatearFecha(s.fechaCreacion, { day: 'numeric', month: 'short', year: 'numeric' })}
                  {s.nombreProfesional && <> &middot; Prof: {s.nombreProfesional}</>}
                </div>
              </div>
              <div className="request-item__right">
                <span className={`badge-salud ${ESTADO_BADGE[s.estado] || 'bg-slate-100 text-slate-700'}`}>{s.estado}</span>
                <span className={`badge-salud ${PRIORIDAD_BADGE[s.prioridad] || 'bg-slate-100 text-slate-700'}`}>{s.prioridad}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-teal-medico opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
              <Eye className="w-3.5 h-3.5" />
              Ver detalle
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))
      )}

      {isModalOpen && (
        <DetalleSolicitudModal
          solicitudId={selectedSolicitud}
          onClose={cerrarModal}
          onCancelada={cargar}
          onEditada={cargar}
        />
      )}
    </div>
  );
}
