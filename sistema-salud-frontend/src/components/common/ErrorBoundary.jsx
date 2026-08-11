import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="page-container page-container--narrow" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Algo salio mal</h1>
            <p style={{ color: 'var(--color-warm-gray)', marginBottom: '2rem' }}>
              Ocurrio un error inesperado. Por favor intenta de nuevo.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn-salud btn-salud--primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                Volver al inicio
              </button>
              <button
                className="btn-salud btn-salud--secondary"
                onClick={() => window.location.reload()}
              >
                Recargar pagina
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{ marginTop: '2rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-brick)', background: 'var(--color-brick-light)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
