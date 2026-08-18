import React from 'react';
import { Link } from 'react-router-dom';

export default function Privacidad() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/" className="text-sm hover:underline" style={{ color: '#FFFFFF' }}>&larr; Volver al inicio</Link>
      <h1 className="text-2xl sm:text-3xl mt-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: '#FFFFFF' }}>
        Política de Privacidad
      </h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed" style={{ color: '#E2E8F0' }}>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>1. Datos que recolectamos</h2>
          <p>
            Recolectamos los datos necesarios para brindar el servicio: información personal de registro, datos de contacto,
            obras sociales y los registros que cargás en tu diario de bienestar y solicitudes de asistencia.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>2. Confidencialidad clínica</h2>
          <p>
            Toda la información clínica está protegida por secreto profesional y se trata conforme a la Ley de Protección de
            Datos Personales. Solo el profesional asignado a tu atención puede acceder a tu ficha y registros.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>3. Uso de la información</h2>
          <p>
            La información se utiliza exclusivamente para gestionar tu atención: asignación de profesionales, agendamiento de
            turnos, seguimiento terapéutico y notificaciones. No se comparte con terceros sin tu consentimiento.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>4. Contacto</h2>
          <p>
            Ante consultas sobre el tratamiento de tus datos, comunicate con el equipo a través de los canales de contacto de la plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}
