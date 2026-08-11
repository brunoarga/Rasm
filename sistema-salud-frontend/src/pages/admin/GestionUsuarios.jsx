import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatearFecha } from '../../utils/fechas';

export default function GestionUsuarios() {
  const [tab, setTab] = useState('profesionales');
  const [usuarios, setUsuarios] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    api.get('/profesionales').then(r => setUsuarios(r.data.map(p => ({ id: p.id, nombre: p.usuario?.nombreCompleto, email: p.usuario?.email, tipo: p.usuario?.tipoProfesional, activo: p.usuario?.activo })))).catch(() => {});
    api.get('/pacientes').then(r => setPacientes(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page-container page-container--wide">
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">Usuarios y Pacientes</h1>
      </div>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: '1.25rem' }}>
        {['profesionales', 'pacientes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
            style={{
              backgroundColor: tab === t ? '#C44536' : 'white',
              color: tab === t ? 'white' : '#7C7F85',
              border: tab === t ? '1px solid #C44536' : '1px solid #E8E4DF',
            }}>
            {t === 'profesionales' ? `Profesionales (${usuarios.length})` : `Pacientes (${pacientes.length})`}
          </button>
        ))}
      </div>
      {tab === 'profesionales' ? (
        <div className="table-salud__responsive">
          <table className="table-salud">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.tipo}</td>
                  <td><span className={`badge-salud ${u.activo ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-salud__responsive">
          <table className="table-salud">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Fecha Nacimiento</th>
                <th>Obra Social</th>
                <th>Plan</th>
                <th>N° Afiliado</th>
                <th>Consentimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id}>
                  <td>{p.usuario?.nombreCompleto}</td>
                  <td>{p.usuario?.email}</td>
                  <td>{`${p.tipoDocumento || 'DNI'} ${p.numDocumento || ''}`}</td>
                  <td>{formatearFecha(p.fechaNacimiento)}</td>
                  <td>{p.obraSocial?.nombre || 'Sin cobertura'}</td>
                  <td>{p.planCobertura}</td>
                  <td>{p.numeroAfiliado}</td>
                  <td><span className={`badge-salud ${p.consentimientoOk ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{p.consentimientoOk ? 'Si' : 'No'}</span></td>
                  <td><span className={`badge-salud ${p.usuario?.activo ? 'badge-salud--pine' : 'badge-salud--brick'}`}>{p.usuario?.activo ? 'Activo' : 'Inactivo'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
