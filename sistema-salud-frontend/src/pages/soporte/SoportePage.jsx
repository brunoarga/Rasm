import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy, MessageSquare, ChevronDown, CheckCircle2, Building2,
  CalendarCheck, Siren, ClipboardList, UserCheck, Mail
} from 'lucide-react';

const FAQS = [
  {
    q: '¿Cómo funciona la derivación a un centro de salud?',
    a: 'La secretaría central deriva tu solicitud al centro que corresponde según tu obra social y la práctica. El centro la recibe en su bandeja con tu folio y te contacta para asignarte un turno.',
  },
  {
    q: '¿Qué es el folio y para qué sirve?',
    a: 'El folio (formato NSL-año-número) es el identificador único de tu derivación. Téngalo a mano cuando consulte por teléfono o por la plataforma; agiliza la atención y el seguimiento.',
  },
  {
    q: '¿Perdí la confirmación de mi derivación? ¿Cómo la recupero?',
    a: 'Podés ver el estado de todas tus solicitudes en tu espacio personal. Si necesitás que otro medio (email o WhatsApp) te la reenviemos, escribinos desde Mensajes y pedí el reenvío.',
  },
  {
    q: 'El centro no me asignó turno todavía. ¿Qué hago?',
    a: 'La plataforma controla automáticamente las derivaciones sin turno. Si supera el plazo, la secretaría central recibe una alerta y puede reasignarla a otro centro. También podés escribirnos para acelerar el caso.',
  },
  {
    q: '¿Cómo corrijo mis datos de contacto (email, teléfono, domicilio)?',
    a: 'Tus datos los actualiza la mesa de entrada / recepción del centro o el equipo de soporte. Escribinos desde Mensajes indicando el dato a corregir y el folio si lo tenés.',
  },
  {
    q: '¿Cambié de obra social?',
    a: 'Informá el cambio a soporte o en tu centro de salud para que la derivación se haga por el circuito correcto. Las prácticas y centros disponibles dependen de tu cobertura vigente.',
  },
];

const PASOS = [
  {
    icon: UserCheck,
    titulo: '1. Verificá tus datos institucionales',
    texto: 'Confirmá que el email y teléfono institucional de tu centro estén cargados: por ahí llegan las alertas y las derivaciones.',
  },
  {
    icon: ClipboardList,
    titulo: '2. Recibí las derivaciones',
    texto: 'Las solicitudes llegan a la bandeja del centro con folio y datos del paciente. Aceptá y gestioná cada folio.',
  },
  {
    icon: CalendarCheck,
    titulo: '3. Asigná el turno',
    texto: 'Elegí un profesional y horario. El paciente recibe la confirmación por la plataforma y WhatsApp.',
  },
  {
    icon: Siren,
    titulo: '4. Emergencias',
    texto: 'Si tu centro tiene guardia, activala en casos urgentes. La central puede derivar con máxima prioridad.',
  },
  {
    icon: Building2,
    titulo: '5. Alta de nuevos profesionales',
    texto: '¿Se incorporó un profesional o un nuevo centro? Gestioná el alta desde el panel de administración de la red.',
  },
];

export default function SoportePage() {
  const [abierto, setAbierto] = useState(0);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-medico/10 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-6 h-6 text-teal-medico" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Centro de Soporte NEXIALINK</h1>
            <p className="text-sm text-slate-500">Asistencia para pacientes y para los centros de la red · Adopción y resolución de dudas</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/mensajes"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-medico hover:shadow-sm transition-all">
            <MessageSquare className="w-5 h-5 text-teal-medico mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Escribinos por Mensajes</h3>
            <p className="text-xs text-slate-500 mt-1">Dudas, confirmaciones perdidas o corrección de datos, directo al equipo de soporte.</p>
          </Link>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <Mail className="w-5 h-5 text-teal-medico mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Email institucional</h3>
            <p className="text-xs text-slate-500 mt-1">Las alertas de derivación y escalamientos llegan al email institucional de cada centro.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <CheckCircle2 className="w-5 h-5 text-teal-medico mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Seguimiento automático</h3>
            <p className="text-xs text-slate-500 mt-1">La red monitorea demoras y calidad: los casos que requieren intervención se marcan solos.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-800 mb-2">Preguntas frecuentes</h2>
          {FAQS.map((f, i) => (
            <div key={i} className={`border rounded-lg overflow-hidden ${abierto === i ? 'border-teal-medico/40 bg-teal-medico/5' : 'border-slate-200'}`}>
              <button
                onClick={() => setAbierto(abierto === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
                <span className="text-sm font-semibold text-slate-700">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${abierto === i ? 'rotate-180' : ''}`} />
              </button>
              {abierto === i && (
                <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Guía de incorporación para centros de la red</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PASOS.map((p, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="w-9 h-9 rounded-lg bg-teal-medico/10 flex items-center justify-center mb-3">
                  <p.icon className="w-4 h-4 text-teal-medico" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 leading-snug">{p.titulo}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}