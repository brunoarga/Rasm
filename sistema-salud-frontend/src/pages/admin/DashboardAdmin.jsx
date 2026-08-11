import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/estadisticas/generales').then(r => setStats(r.data)).catch(() => {}); }, []);
  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Panel de Administracion</h1>
      </div>
      <div className="stats-row">
        <div className="stats-card">
          <span className="stats-card__number">{stats?.totalSolicitudes || 0}</span>
          <span className="stats-card__label">Total Solicitudes</span>
        </div>
        <div className="stats-card stats-card--brick">
          <span className="stats-card__number">{stats?.urgentes || 0}</span>
          <span className="stats-card__label">Urgentes</span>
        </div>
        <div className="stats-card stats-card--pine">
          <span className="stats-card__number">{stats?.completadas || 0}</span>
          <span className="stats-card__label">Completadas</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__number">{stats?.enProceso || 0}</span>
          <span className="stats-card__label">En Proceso</span>
        </div>
      </div>
      <div className="stats-row">
        <div className="stats-card stats-card--pine">
          <span className="stats-card__number">{stats?.totalPacientes || 0}</span>
          <span className="stats-card__label">Total Pacientes</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__number">{stats?.pacientesConCobertura || 0}</span>
          <span className="stats-card__label">Con Cobertura</span>
        </div>
        <div className="stats-card stats-card--brick">
          <span className="stats-card__number">{stats?.pacientesSinCobertura || 0}</span>
          <span className="stats-card__label">Sin Cobertura</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__number">{stats?.pacientesActivos || 0}</span>
          <span className="stats-card__label">Activos</span>
        </div>
      </div>
      <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 0 }}>
        <Link to="/admin/usuarios" style={{ textDecoration: 'none' }}>
          <div className="feature-card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <h3 className="feature-card__title">Usuarios y Pacientes</h3>
            <p className="feature-card__text">Gestion de profesionales y pacientes del sistema</p>
          </div>
        </Link>
        <Link to="/admin/centros" style={{ textDecoration: 'none' }}>
          <div className="feature-card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <h3 className="feature-card__title">Centros de Salud</h3>
            <p className="feature-card__text">Administrar centros y clinicas</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
