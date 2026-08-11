import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function EstadisticasProfesional() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/estadisticas/generales').then(r => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return <div className="page-container"><div className="spinner-salud" style={{ margin: '3rem auto' }}></div></div>;
  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Estadisticas</h1>
      </div>
      <div className="stats-row">
        <div className="stats-card">
          <span className="stats-card__number">{stats.totalSolicitudes}</span>
          <span className="stats-card__label">Total</span>
        </div>
        <div className="stats-card stats-card--brick">
          <span className="stats-card__number">{stats.urgentes}</span>
          <span className="stats-card__label">Urgentes</span>
        </div>
        <div className="stats-card stats-card--pine">
          <span className="stats-card__number">{stats.completadas}</span>
          <span className="stats-card__label">Completadas</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__number">{stats.enProceso}</span>
          <span className="stats-card__label">En Proceso</span>
        </div>
      </div>
      <div className="layout-split">
        <div className="card-salud">
          <div className="card-salud__header">
            <h3 className="card-salud__header-title">Por Estado</h3>
          </div>
          <div className="card-salud__body">
            <table className="table-salud">
              <tbody>
                <tr><td style={{ border: 'none' }}>Creadas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.creadas}</td></tr>
                <tr><td style={{ border: 'none' }}>Revisadas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.revisadas}</td></tr>
                <tr><td style={{ border: 'none' }}>Asignadas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.asignadas}</td></tr>
                <tr><td style={{ border: 'none' }}>En Proceso</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.enProceso}</td></tr>
                <tr><td style={{ border: 'none' }}>Derivadas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.derivadas}</td></tr>
                <tr><td style={{ border: 'none' }}>Completadas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.completadas}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-salud">
          <div className="card-salud__header">
            <h3 className="card-salud__header-title">Por Prioridad</h3>
          </div>
          <div className="card-salud__body">
            <table className="table-salud">
              <tbody>
                <tr><td style={{ border: 'none', color: 'var(--color-brick)', fontWeight: 600 }}>Urgentes</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.urgentes}</td></tr>
                <tr><td style={{ border: 'none', color: 'var(--color-copper)' }}>Altas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.alta}</td></tr>
                <tr><td style={{ border: 'none' }}>Medias</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.media}</td></tr>
                <tr><td style={{ border: 'none', color: 'var(--color-pine)' }}>Bajas</td><td style={{ border: 'none', textAlign: 'right', fontWeight: 600 }}>{stats.baja}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
