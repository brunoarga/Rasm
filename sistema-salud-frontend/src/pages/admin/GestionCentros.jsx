import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function GestionCentros() {
  const [centros, setCentros] = useState([]);
  useEffect(() => { api.get('/centros').then(r => setCentros(r.data)).catch(() => {}); }, []);
  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Centros de Salud</h1>
      </div>
      <div className="table-salud__responsive">
        <table className="table-salud">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Direccion</th>
              <th>Tipo</th>
              <th>Publico</th>
              <th>Emergencias</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {centros.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.direccion}</td>
                <td>{c.tipoCentro}</td>
                <td>{c.esPublico ? 'Si' : 'No'}</td>
                <td>{c.tieneEmergencias ? 'Si' : 'No'}</td>
                <td><span className={`badge-salud ${c.activo ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
