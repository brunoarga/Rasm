import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { parsearFechaLocal, aCadenaLocal } from '../../utils/fechas';

export default function CalendarioCitas() {
  const [citas, setCitas] = useState([]);
  useEffect(() => {
    const d = new Date(); d.setDate(1);
    const h = new Date(d); h.setMonth(h.getMonth() + 1);
    api.get(`/citas/profesional?desde=${aCadenaLocal(d)}&hasta=${aCadenaLocal(h)}`).then(r => setCitas(r.data)).catch(() => {});
  }, []);
  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Calendario de Citas</h1>
      </div>
      {citas.length === 0 ? (
        <div className="empty-state"><p className="empty-state__text">Sin citas programadas.</p></div>
      ) : (
        <div className="table-salud__responsive">
          <table className="table-salud">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Motivo</th>
                <th>Modalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map(c => (
                <tr key={c.id}>
                  <td>{parsearFechaLocal(c.fechaHora)?.toLocaleString('es-AR') || ''}</td>
                  <td>{c.solicitud?.paciente?.usuario?.nombreCompleto || 'N/A'}</td>
                  <td>{c.solicitud?.titulo || 'N/A'}</td>
                  <td>{c.modalidad}</td>
                  <td><span className="badge-salud badge-salud--copper">{c.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
