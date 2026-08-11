import React from 'react';
import { MessageCircle, Phone, Clock } from 'lucide-react';

const centros = [
  { nombre: 'Hospital Pablo Soria', ciudad: 'San Salvador de Jujuy', region: 'Región Centro', whatsapp: '3884042734', horario: 'Lunes a Viernes 7 a 11hs' },
  { nombre: 'Hospital Néstor Sequeiros', ciudad: 'San Salvador de Jujuy', region: 'Región Centro', whatsapp: '3883301941', horario: 'Lunes a Viernes 7 a 14hs' },
  { nombre: 'Hospital Carlos Snopek', ciudad: 'San Salvador de Jujuy', region: 'Región Centro', whatsapp: '3883316050', horario: 'Lunes a Viernes 6:30 a 16hs' },
  { nombre: 'Hospital San Roque', ciudad: 'San Salvador de Jujuy', region: 'Región Centro', whatsapp: '3884044053', horario: 'Lunes a Viernes 7 a 12hs' },
  { nombre: 'Hospital Dr. Wenceslao Gallardo', ciudad: 'Palpalá', region: 'Región Valles', whatsapp: '3883316050', horario: 'Lunes a Viernes 6:30 a 16hs' },
  { nombre: 'Hospital Arturo Zabala', ciudad: 'Perico', region: 'Región Valles', whatsapp: '3884086794', horario: 'Lunes a Viernes 7 a 15hs' },
  { nombre: 'Hospital Ntra. Sra. del Carmen', ciudad: 'El Carmen', region: 'Región Valles', whatsapp: '3884086794', horario: 'Lunes a Viernes 6 a 13hs' },
  { nombre: 'Hospital San Isidro Labrador', ciudad: 'Monterrico', region: 'Región Valles', whatsapp: '3884567025', horario: 'Lunes a Viernes 6:30 a 11:30hs' },
  { nombre: 'Hospital Paterson', ciudad: 'San Pedro', region: 'Región Ramal', whatsapp: '3884567229', horario: 'Lunes a Viernes 7 a 15hs' },
  { nombre: 'Hospital Oscar Orias', ciudad: 'Libertador', region: 'Región Ramal', whatsapp: '3884086794', horario: 'Lunes a Viernes 7 a 15hs' },
  { nombre: 'Hospital Calilegua', ciudad: 'Calilegua', region: 'Región Ramal', whatsapp: '3884567025', horario: 'Lunes a Viernes 6:30 a 14hs' },
  { nombre: 'Hospital San Miguel', ciudad: 'Yuto', region: 'Región Ramal', whatsapp: '3884042794', horario: 'Lunes a Viernes 7 a 11:30hs' },
  { nombre: 'Hospital Zegada', ciudad: 'Fraile Pintado', region: 'Región Ramal', whatsapp: '3884042794', horario: 'Lunes a Viernes 6:30 a 12hs' },
  { nombre: 'Sanatorio Nuestra Señora del Rosario', direccion: 'General Belgrano 356, San Salvador de Jujuy', telefono: '0388 423-1086', horario: 'Abierto las 24 horas' },
  { nombre: 'Instituto de Psicopatología SRL', direccion: 'Calle General San Martín 141, San Salvador de Jujuy', telefono: '0388 423-1397' },
  { nombre: 'Sanatorio Lavalle', direccion: 'Calle General Otero 337', telefono: '0388 423-1999' },
  { nombre: 'Clínica Mayo', direccion: 'Calle General Alvear 1299', telefono: '0388 483-3411' },
];

const items = [...centros, ...centros];

export default function CentrosAdheridosMarquee() {
  return (
    <section id="centros" className="py-10 lg:py-14 overflow-hidden bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-pizarra-light/50">
          Centros de Salud y Clínicas Adheridas en Jujuy
        </p>
        <p className="text-xs text-pizarra-light/50 mt-1">
          Contacto y horarios de atención
        </p>
      </div>

      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--color-crema, #faf8f5), transparent)',
          }}
        />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, var(--color-crema, #faf8f5), transparent)',
          }}
        />

        <div className="marquee-track flex gap-4 sm:gap-5 items-stretch">
          {items.map((c, i) => (
            <div
              key={`${c.nombre}-${i}`}
              className="marquee-item shrink-0 w-[280px] rounded-xl bg-white border border-stone/30 p-4 transition-all duration-500 hover:grayscale-0 hover:opacity-100 hover:border-teal-medico/30 hover:shadow-sm"
              style={{
                filter: 'grayscale(0.6)',
                opacity: 0.7,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'grayscale(0)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'grayscale(0.6)';
                e.currentTarget.style.opacity = '0.7';
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-medico/15 to-teal-medico/5 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-teal-medico" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="min-w-0">
                <p className="text-sm font-semibold text-pizarra leading-tight">{c.nombre}</p>
                <p className="text-[11px] text-pizarra-light/50 leading-tight mt-0.5">
                  {c.direccion || (c.region ? `${c.region} · ${c.ciudad}` : c.ciudad)}
                </p>
              </div>
            </div>

            {(c.whatsapp || c.telefono) && (
              <div className="mt-3 space-y-1.5">
                {c.whatsapp && (
                  <a
                    href={`https://wa.me/${c.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp: {c.whatsapp}
                  </a>
                )}
                {c.telefono && (
                  <a
                    href={`tel:${c.telefono.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pizarra/80 hover:text-teal-medico transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {c.telefono}
                  </a>
                )}
                {c.horario && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-pizarra-light/60">
                    <Clock className="w-3.5 h-3.5" />
                    {c.horario}
                  </p>
                )}
              </div>
            )}
          </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marqueeScroll 60s linear infinite;
          width: max-content;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
