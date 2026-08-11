export function parsearFechaLocal(valor) {
  if (!valor) return null;
  const s = String(valor).trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  let hh = 0, mm = 0, ss = 0;
  const resto = s.slice(10);
  if (resto) {
    if (/^Z/i.test(resto.trim())) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    const m2 = resto.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (m2) {
      hh = Number(m2[1]) || 0;
      mm = Number(m2[2]) || 0;
      ss = Number(m2[3]) || 0;
    }
  }
  return new Date(y, m - 1, d, hh, mm, ss);
}

export function formatearFecha(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return d.toLocaleDateString('es-AR', opts);
}

export function formatearFechaHora(iso, opts = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) {
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  return d.toLocaleString('es-AR', opts);
}

export function hoyISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function aCadenaLocal(dt) {
  const p = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}:${p(dt.getSeconds())}`;
}

export function timeAgo(iso) {
  const d = parsearFechaLocal(iso);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function esMismoDia(iso, ref = new Date()) {
  const d = parsearFechaLocal(iso);
  if (!d) return false;
  return d.getDate() === ref.getDate()
    && d.getMonth() === ref.getMonth()
    && d.getFullYear() === ref.getFullYear();
}
