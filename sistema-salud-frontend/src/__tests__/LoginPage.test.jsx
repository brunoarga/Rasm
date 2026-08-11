import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import LoginPage from '../pages/public/LoginPage';

const mockLogin = jest.fn();
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    register: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: () => false,
    hasRole: () => false,
  }),
}));

jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
      <ToastContainer />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe renderizar el formulario de login', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText(/correo electrónico|tu@email.com|correo|email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder|ingresar|iniciar sesión|entrar/i })).toBeInTheDocument();
  });

  test('debe llamar a login al enviar el formulario', async () => {
    mockLogin.mockResolvedValue({ nombreCompleto: 'Test', tipoUsuario: 'PACIENTE' });
    renderLoginPage();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/tu@email.com|correo|email/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /acceder|ingresar|iniciar sesión|entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });
});