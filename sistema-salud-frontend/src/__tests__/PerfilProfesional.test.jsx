import React from 'react';
import { render, screen } from '@testing-library/react';
import PerfilProfesional from '../pages/profesional/PerfilProfesional';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        id: 1,
        nombreCompleto: 'Lic. Mariano Martinez',
        email: 'mariano@salud.com',
        telefono: '1155552222',
        direccion: null,
        tipoProfesional: 'PSICOLOGO',
        especialidad: 'Psicologia Clinica',
        numeroLicencia: 'LP-12345',
        horarioAtencion: 'Lun-Mie-Vie 8-17hs',
        fotoPerfil: null,
        centroActual: { id: 1, nombre: 'Hospital Pablo Soria', direccion: 'San Salvador de Jujuy' },
        centrosDisponibles: [
          { id: 1, nombre: 'Hospital Pablo Soria', direccion: 'San Salvador de Jujuy' },
          { id: 2, nombre: 'Hospital Oscar Orías', direccion: 'Libertador' },
        ],
      },
    }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    defaults: { baseURL: 'http://localhost:8085/api' },
  },
}));

describe('PerfilProfesional', () => {
  test('debe renderizar los datos del perfil', async () => {
    render(<PerfilProfesional />);
    expect(await screen.findByText(/Lic\. Mariano Martinez/i)).toBeInTheDocument();
    expect(screen.getByText(/mariano@salud\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Hospital Pablo Soria/i)).toBeInTheDocument();
    expect(screen.getByText(/Centro de Atención Asignado:/i)).toBeInTheDocument();
  });
});
