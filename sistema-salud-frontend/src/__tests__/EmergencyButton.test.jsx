import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmergencyButton from '../components/layout/EmergencyButton';

describe('EmergencyButton', () => {
  test('debe renderizar el boton de emergencia como link', () => {
    render(
      <BrowserRouter>
        <EmergencyButton />
      </BrowserRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'tel:08009991234');
  });

  test('debe tener el texto SOS', () => {
    render(
      <BrowserRouter>
        <EmergencyButton />
      </BrowserRouter>
    );
    expect(screen.getByText('SOS')).toBeInTheDocument();
  });
});