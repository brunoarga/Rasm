import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Brain, Moon, TrendingUp, TrendingDown, Minus,
  Calendar, Award, AlertTriangle, Sparkles,
  Loader2
} from 'lucide-react';

const ANIMO_COLORS = {
  EXCELENTE: 'bg-emerald-100 text-emerald-700',
  ESTABLE: 'bg-slate-100 text-slate-600',
  ANSIOSO: 'bg-amber-100 text-amber-700',
  TRISTE: 'bg-indigo-100 text-indigo-700',
  IRRITABLE: 'bg-rose-100 text-rose-700',
};

const ANIMO_LABELS = {
  EXCELENTE: 'Excelente', ESTABLE: 'Estable',
  ANSIOSO: 'Ansioso', TRISTE: 'Triste', IRRITABLE: 'Irritable',
};

function Barrita({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function InsightsEmocionales() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/diario/patrones')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-pastel p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-teal-medico animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.diasRegistrados === 0) {
    return null;
  }

  const tendenciaIcon = data.tendenciaGeneral === 'Mejorando' ? TrendingUp
    : data.tendenciaGeneral === 'Requiere atención' ? AlertTriangle
    : data.tendenciaGeneral?.includes('Registrá') ? null
    : Minus;
  const TendenciaIcon = tendenciaIcon;
  const tendenciaColor = data.tendenciaGeneral === 'Mejorando' ? 'text-emerald-600'
    : data.tendenciaGeneral === 'Requiere atención' ? 'text-amber-600'
    : 'text-slate-500';

  return (
    <div className="card-pastel overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-medico" />
          <h3 className="text-sm font-bold text-slate-900">Patrones Emocionales</h3>
        </div>
        <p className="text-[11px] text-slate-500">Basado en tus últimos {data.diasRegistrados} registros</p>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {data.rachaActual > 1 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-medico/5 border border-teal-medico/20">
            <div className="w-8 h-8 rounded-full bg-teal-medico/10 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-teal-medico" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-medico">{data.rachaActual} días consecutivos</p>
              <p className="text-[10px] text-slate-500">¡Seguí así! La constancia ayuda a ver tu evolución.</p>
            </div>
          </div>
        )}

        {TendenciaIcon && (
          <div className={`flex items-center gap-3 p-3 rounded-xl border bg-opacity-5 ${
            data.tendenciaGeneral === 'Mejorando'
              ? 'border-emerald-200'
              : data.tendenciaGeneral === 'Requiere atención'
                ? 'border-amber-200'
                : 'border-slate-200'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              data.tendenciaGeneral === 'Mejorando'
                ? 'bg-emerald-100'
                : data.tendenciaGeneral === 'Requiere atención'
                  ? 'bg-amber-100'
                  : 'bg-slate-100'
            }`}>
              <TendenciaIcon className={`w-4 h-4 ${tendenciaColor}`} />
            </div>
            <div>
              <p className={`text-xs font-bold ${tendenciaColor}`}>Tendencia: {data.tendenciaGeneral}</p>
              <p className="text-[10px] text-slate-500">
                {data.tendenciaGeneral === 'Mejorando' ? 'Vas por buen camino, seguí así.' :
                 data.tendenciaGeneral === 'Requiere atención' ? 'Considerá hablar con tu profesional.' :
                 'Sin cambios significativos.'}
              </p>
            </div>
          </div>
        )}

        {data.mejorDiaSemana && data.peorDiaSemana && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-[10px] text-emerald-700 font-semibold">Mejor día</p>
              <p className="text-xs font-bold text-slate-800">{data.mejorDiaSemana}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <TrendingDown className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[10px] text-amber-700 font-semibold">Menos favorable</p>
              <p className="text-xs font-bold text-slate-800">{data.peorDiaSemana}</p>
            </div>
          </div>
        )}

        {data.porDiaSemana && data.porDiaSemana.length > 1 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Por día de la semana
            </p>
            <div className="space-y-2">
              {data.porDiaSemana.map(d => (
                <div key={d.dia} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-800">{d.dia}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ANIMO_COLORS[d.animoPredominante] || 'bg-slate-100 text-slate-600'}`}>
                      {ANIMO_LABELS[d.animoPredominante] || d.animoPredominante}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Barrita label="Ánimo" value={d.animoPromedio} max={5} color="bg-teal-medico" />
                    <Barrita label="Estrés" value={d.estresPromedio} max={10} color="bg-amber-500" />
                    <Barrita label="Sueño" value={d.suenioPromedio} max={12} color="bg-indigo-500" />
                  </div>
                  {d.cantidadRegistros > 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">{d.cantidadRegistros} registro{d.cantidadRegistros !== 1 ? 's' : ''}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.correlacionSuenioAnimo && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <Moon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-indigo-700 leading-relaxed">{data.correlacionSuenioAnimo}</p>
          </div>
        )}

        {data.patronEstresSuenio && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Brain className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">{data.patronEstresSuenio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
