import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import Terminos from '../pages/public/Terminos';
import Privacidad from '../pages/public/Privacidad';

describe('LandingPage - canales de contacto', () => {
  test('el botón de crisis enlaza a la línea de prevención del suicidio', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link', { name: '0800-777-7711' });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((el) => expect(el).toHaveAttribute('href', 'tel:08007777711'));
  });

  test('el footer enlaza a contacto, páginas legales y Ministerio de Salud', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'soporte.nexialink@gmail.com' })).toHaveAttribute('href', 'mailto:soporte.nexialink@gmail.com');
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toHaveAttribute('href', '/terminos');
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute('href', '/privacidad');
    const ministerio = screen.getByRole('link', { name: /ministerio de salud de jujuy/i });
    expect(ministerio).toHaveAttribute('href', 'https://salud.jujuy.gob.ar');
    expect(ministerio).toHaveAttribute('target', '_blank');
    expect(ministerio).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Páginas legales', () => {
  test('Términos renderiza el título', () => {
    render(
      <MemoryRouter>
        <Terminos />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /términos y condiciones/i })).toBeInTheDocument();
  });

  test('Privacidad renderiza el título', () => {
    render(
      <MemoryRouter>
        <Privacidad />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /política de privacidad/i })).toBeInTheDocument();
  });
});
