import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CentrosAdheridosMarquee from "../../components/CentrosAdheridosMarquee";

/* ──────── HOOK: Animación al hacer scroll ──────── */
function useOnScreen(threshold = 0.25) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen font-body text-pizarra dark:text-slate-100">

      {/* ═══════════════ HERO ═══════════════ */}
      <HeroSection />

      {/* ═══════════════ CENTROS DE SALUD ADHERIDOS (MARQUEE) ═══════════════ */}
      <CentrosAdheridosMarquee />

      {/* ═══ Separador ═══ */}
      <AnimatedSeparator />

      {/* ═══════════════ PREGUNTAS FRECUENTES ═══════════════ */}
      <section id="preguntas-frecuentes" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <SectionHeader
          label="FAQ"
          title="Preguntas frecuentes"
          subtitle="Todo lo que necesitás saber antes de dar el primer paso."
        />
        <FaqAccordion />
      </section>

      {/* ═══ Separador ═══ */}
      <AnimatedSeparator />

      {/* ═══════════════ EMERGENCIA ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-12">
        <div id="ayuda-urgente" className="rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 border border-red-700 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-600/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Situación de crisis o emergencia</p>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Si estás pasando por una crisis severa o pensamientos de lastimarte, comunicate ahora con la Línea de Prevención del Suicidio. <strong>Gratuita, anónima y disponible 24/7.</strong>
              </p>
            </div>
          </div>
          <a href="tel:08007777711" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-md transition-all duration-300 hover:bg-red-50 hover:shadow-lg hover:scale-[1.02] shrink-0 animate-pulse-sos">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} fill="none" stroke="currentColor" d="M3 5a2 2 0 012-2h2l2 5-2.5 1.5a11 11 0 005 5L13 14l5 2v2a2 2 0 01-2 2 15 15 0 01-13-13z" />
            </svg>
            0800-777-7711
          </a>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-stone/40 bg-white dark:bg-pizarra-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-base font-bold text-pizarra dark:text-slate-100">
                <span className="font-semibold text-teal-medico">RASM</span>NexiaLink
              </p>
              <p className="mt-3 text-xs leading-relaxed text-pizarra-light">
                Plataforma de salud mental que conecta pacientes con profesionales y centros de salud adheridos en Jujuy.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-pizarra dark:text-slate-100 mb-3">Navegación</p>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#centros" className="text-pizarra-light hover:text-teal-medico transition-colors">Centros adheridos</a></li>
                <li><a href="#preguntas-frecuentes" className="text-pizarra-light hover:text-teal-medico transition-colors">Preguntas frecuentes</a></li>
                <li><a href="#ayuda-urgente" className="text-pizarra-light hover:text-teal-medico transition-colors">Ayuda urgente</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-pizarra dark:text-slate-100 mb-3">Contacto</p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="mailto:soporte.nexialink@gmail.com" className="text-pizarra-light hover:text-teal-medico transition-colors">soporte.nexialink@gmail.com</a>
                </li>
                <li>
                  <a href="tel:08007777711" className="font-semibold text-terracota hover:underline">0800-777-7711</a>
                  <span className="block text-pizarra-light/70 mt-0.5">Línea de Prevención del Suicidio · gratuita y 24/7</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-pizarra dark:text-slate-100 mb-3">Institucional</p>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/terminos" className="text-pizarra-light hover:text-teal-medico transition-colors">Términos y condiciones</Link></li>
                <li><Link to="/privacidad" className="text-pizarra-light hover:text-teal-medico transition-colors">Política de privacidad</Link></li>
                <li>
                  <a href="https://salud.jujuy.gob.ar" target="_blank" rel="noopener noreferrer" className="text-pizarra-light hover:text-teal-medico transition-colors">Ministerio de Salud de Jujuy</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-pizarra-light/70">
            <span>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-teal-medico">RASM</span>NexiaLink. Todos los derechos reservados.
            </span>
            <span className="text-center sm:text-right">
              En caso de emergencia, llamá a la Línea de Prevención del Suicidio{" "}
              <a href="tel:08007777711" className="font-semibold text-terracota hover:underline">0800-777-7711</a>.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════ COMPONENTES INTERNOS ═══════════ */

function HeroSection() {
  const [ref, visible] = useOnScreen(0.15);
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Organic morph shape - visual metaphor for interconnected network */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          className={`w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] lg:w-[800px] lg:h-[800px] bg-gradient-to-br from-teal-medico/8 via-terracota/5 to-teal-medico/3 transition-all duration-[1200ms] ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'morph 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Secondary accent shape */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          className={`w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-gradient-to-tl from-teal-medico/5 to-transparent transition-all duration-[1500ms] delay-300 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{
            borderRadius: '40% 60% 70% 30% / 50% 60% 30% 60%',
            animation: 'morph 22s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" aria-hidden="true" />

      <div
        ref={ref}
        className={`relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="font-sans text-3xl md:text-5xl font-bold tracking-tight text-white">
          Red de Atención e Interconexión en Salud Mental
        </h1>
        <p className="mt-4 max-w-xl mx-auto font-sans text-base md:text-lg font-normal text-slate-200 leading-relaxed">
          Explora las instituciones y centros adheridos en Jujuy y da el primer paso hacia tu bienestar.
        </p>
      </div>
    </section>
  );
}



function SectionHeader({ label, title, subtitle }) {
  const [ref, visible] = useOnScreen(0.2);
  return (
    <div ref={ref} className={`text-center max-w-2xl mx-auto mb-12 lg:mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-teal-medico bg-teal-medico/10 px-4 py-1.5 rounded-full mb-4">
        {label}
      </span>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pizarra">{title}</h2>
      <p className="mt-3 text-pizarra-light text-base sm:text-lg">{subtitle}</p>
    </div>
  );
}

/* ─── Separador animado ─── */
function AnimatedSeparator() {
  const [ref, visible] = useOnScreen(0.1);
  return (
    <div ref={ref} className="flex items-center justify-center py-8 lg:py-10">
      <div className={`flex items-center gap-4 transition-all duration-700 ${visible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
        <span className="block w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-teal-medico/30 to-transparent" />
        <svg className="w-4 h-4 text-teal-medico/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="block w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-teal-medico/30 to-transparent" />
      </div>
    </div>
  );
}

/* ─── Acordeón FAQ ─── */
function FaqAccordion() {
  const faqs = [
    { q: "¿Cómo sé qué profesional es adecuado para mí?", a: "Al completar tu solicitud, nuestro sistema te conecta con el profesional más adecuado según tu situación, disponibilidad y obra social. Si necesitás un cambio, podés solicitarlo sin problema." },
    { q: "¿Las sesiones son presenciales o virtuales?", a: "Ofrecemos ambas modalidades. Al momento de la solicitud podés indicar tu preferencia. Las sesiones virtuales se realizan por videollamada segura desde cualquier dispositivo." },
    { q: "¿Aceptan obras sociales y prepagas?", a: "Sí, trabajamos con la mayoría de las obras sociales nacionales y provinciales, además de prepagas. Consultá la cobertura al momento de registrarte." },
    { q: "¿Cuánto tiempo tengo que esperar para recibir atención?", a: "En general, un profesional se contacta con vos dentro de las 24 a 48 horas hábiles. En casos de urgencia, contamos con canales de atención inmediata." },
    { q: "¿Es confidencial lo que comparto en la plataforma?", a: "Absolutamente. Todos los datos y conversaciones están protegidos por secreto profesional y cumplen con la Ley de Protección de Datos Personales. Tu privacidad es nuestra prioridad." },
    { q: "¿Puedo cambiar de profesional si no me siento cómodo?", a: "Por supuesto. La relación terapéutica es fundamental. Si en cualquier momento sentís que no es el profesional indicado, solicitá el cambio desde tu panel y te asignaremos a otro." },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone/60 overflow-hidden transition-all duration-300 hover:border-teal-medico/20"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left"
            >
              <span className="text-sm font-semibold text-pizarra pr-4">{faq.q}</span>
              <svg
                className={`w-4 h-4 shrink-0 text-pizarra-light transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-350 ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-5 sm:px-6 pb-4 text-sm text-pizarra-light/80 leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
