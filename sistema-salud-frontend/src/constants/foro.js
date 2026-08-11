import {
  Brain, Lightbulb, BookOpen, HeartHandshake,
} from 'lucide-react';
import { parsearFechaLocal } from '../utils/fechas';

export const CATEGORIAS = [
  { value: 'Ansiedad', label: 'Ansiedad', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Brain },
  { value: 'Consejos', label: 'Consejos', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', icon: Lightbulb },
  { value: 'Experiencias', label: 'Experiencias', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: BookOpen },
  { value: 'Apoyo', label: 'Apoyo', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: HeartHandshake },
];

export const REACCIONES_FACEBOOK = [
  { tipo: 'like', emoji: '👍', label: 'Me gusta', color: '#1877F2' },
  { tipo: 'love', emoji: '❤️', label: 'Me encanta', color: '#E0245E' },
  { tipo: 'care', emoji: '🤗', label: 'Me importa', color: '#F7B125' },
  { tipo: 'haha', emoji: '😂', label: 'Me divierte', color: '#F7B125' },
  { tipo: 'wow', emoji: '😮', label: 'Me sorprende', color: '#F7B125' },
  { tipo: 'sad', emoji: '😢', label: 'Me entristece', color: '#F7B125' },
  { tipo: 'angry', emoji: '😡', label: 'Me enfada', color: '#E9710F' },
];

export function categoriaMeta(valor) {
  return CATEGORIAS.find(c => c.value.toLowerCase() === (valor || '').toLowerCase())
    || { value: valor, label: valor || 'General', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', icon: BookOpen };
}

export function formatearFecha(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  const dia = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora} hs`;
}

export function formatearFechaRelativa(iso) {
  if (!iso) return '';
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return 'ahora mismo';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function iniciales(nombre) {
  if (!nombre || nombre === 'Anónimo') return 'A';
  const partes = nombre.trim().split(/\s+/);
  const primer = partes[0]?.charAt(0) || '';
  const seg = partes.length > 1 ? partes[1].charAt(0) : '';
  return (primer + seg).toUpperCase();
}
