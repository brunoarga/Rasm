import React from 'react';
import { Link } from 'react-router-dom';

export default function Terminos() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/" className="text-sm hover:underline" style={{ color: '#B8452F' }}>&larr; Volver al inicio</Link>
      <h1 className="text-2xl sm:text-3xl mt-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#1E2124' }}>
        Términos y Condiciones
      </h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed" style={{ color: '#6C757D' }}>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#1E2124' }}>1. Uso de la plataforma</h2>
          <p>
            RASMNexiaLink es una plataforma digital que conecta pacientes con profesionales de la salud mental y centros de salud adheridos.
            El uso de la plataforma implica la aceptación de estos términos.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#1E2124' }}>2. Alcance del servicio</h2>
          <p>
            La plataforma facilita la solicitud de asistencia, la asignación de profesionales, el agendamiento de turnos y el seguimiento
            terapéutico. No reemplaza la atención de emergencias: ante una crisis o situación de riesgo, comunicate con la línea de
            prevención disponible en la página principal.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#1E2124' }}>3. Responsabilidad del usuario</h2>
          <p>
            El usuario se compromete a brindar información veraz y a utilizar la plataforma de forma responsable y respetuosa.
            El uso indebido puede derivar en la suspensión de la cuenta.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#1E2124' }}>4. Modificaciones</h2>
          <p>
            RASMNexiaLink podrá actualizar estos términos en cualquier momento. Los cambios entrarán en vigencia al publicarse en esta página.
          </p>
        </section>
      </div>
    </div>
  );
}
