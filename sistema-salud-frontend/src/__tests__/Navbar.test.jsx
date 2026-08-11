import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ThemeProvider } from '../contexts/ThemeContext';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const renderNavbar = () => render(
  <ThemeProvider>
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  </ThemeProvider>
);

describe('Navbar', () => {
  test('debe renderizar el logo y enlaces principales', () => {
    renderNavbar();
    expect(screen.getByText(/rasm/i)).toBeInTheDocument();
    expect(screen.getByText(/nexialink/i)).toBeInTheDocument();
  });

  test('debe mostrar enlace de acceso cuando no hay usuario', () => {
    renderNavbar();
    expect(screen.getByText(/acceder/i)).toBeInTheDocument();
  });
});