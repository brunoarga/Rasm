import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MensajesPage from '../pages/mensajes/MensajesPage';
import * as mensajesApi from '../services/mensajes';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { idUsuario: 1, nombreCompleto: 'Ana Paciente', tipoUsuario: 'PACIENTE' },
  }),
}));

jest.mock('../services/mensajes', () => ({
  obtenerConversaciones: jest.fn(),
  obtenerConversacion: jest.fn(),
  enviarMensaje: jest.fn(),
  contarNoLeidos: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const conversaciones = [
  {
    id: 10,
    idSolicitud: 7,
    solicitudTitulo: 'Consulta ansiedad',
    idInterlocutor: 5,
    interlocutorNombre: 'Dra. Marta Ríos',
    interlocutorAvatar: null,
    rolInterlocutor: 'PROFESIONAL',
    ultimoMensaje: 'Hola Ana, ¿cómo estás?',
    fechaUltimoMensaje: '2026-08-11T10:00:00',
    noLeidos: 2,
  },
];

const detalle = {
  conversacion: conversaciones[0],
  mensajes: [
    {
      id: 1, idEmisor: 5, emisorNombre: 'Dra. Marta Ríos',
      contenido: 'Hola Ana, ¿cómo estás?', leido: true, propio: false,
      fechaEnvio: '2026-08-11T10:00:00',
    },
    {
      id: 2, idEmisor: 1, emisorNombre: 'Ana Paciente',
      contenido: 'Bien, gracias', leido: true, propio: true,
      fechaEnvio: '2026-08-11T10:05:00',
    },
  ],
};

const renderPage = (path = '/mensajes') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/mensajes" element={<MensajesPage />} />
      <Route path="/mensajes/:id" element={<MensajesPage />} />
    </Routes>
  </MemoryRouter>
);

describe('MensajesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra estado vacío cuando no hay conversaciones', async () => {
    mensajesApi.obtenerConversaciones.mockResolvedValue([]);
    mensajesApi.contarNoLeidos.mockResolvedValue(0);

    renderPage();

    expect(await screen.findByText('Sin conversaciones')).toBeInTheDocument();
  });

  test('lista conversaciones y permite abrir el hilo y enviar mensaje', async () => {
    mensajesApi.obtenerConversaciones.mockResolvedValue(conversaciones);
    mensajesApi.contarNoLeidos.mockResolvedValue(2);
    mensajesApi.obtenerConversacion.mockResolvedValue(detalle);
    mensajesApi.enviarMensaje.mockResolvedValue({ id: 3 });

    renderPage();

    expect(await screen.findByText('Dra. Marta Ríos')).toBeInTheDocument();
    expect(screen.getByText(/2 sin leer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dra. Marta Ríos'));

    expect(await screen.findByText('Bien, gracias')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Escribí un mensaje...');
    fireEvent.change(input, { target: { value: '¿Cuándo es mi turno?' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    await waitFor(() => {
      expect(mensajesApi.enviarMensaje).toHaveBeenCalledWith(10, '¿Cuándo es mi turno?');
    });
  });

  test('selecciona la conversación indicada por query param solicitud', async () => {
    mensajesApi.obtenerConversaciones.mockResolvedValue(conversaciones);
    mensajesApi.contarNoLeidos.mockResolvedValue(2);
    mensajesApi.obtenerConversacion.mockResolvedValue(detalle);

    renderPage('/mensajes?solicitud=7');

    expect(await screen.findByText('Hola Ana, ¿cómo estás?')).toBeInTheDocument();
  });
});
