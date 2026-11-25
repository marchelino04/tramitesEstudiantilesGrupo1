/** Utilidades de presentación: selección de elementos, escape de texto y formato de fechas. */

export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

/** Evita que el texto escrito por el usuario se interprete como HTML */
export const esc = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const dos = (n) => String(n).padStart(2, '0');

export const numero = (n) => `N.° ${String(n).padStart(4, '0')}`;

export function fecha(valor) {
  const f = new Date(valor);
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()}`;
}

export function fechaHora(valor) {
  const f = new Date(valor);
  return `${fecha(f)} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

export function duracion(milisegundos) {
  const min = Math.max(0, Math.round(milisegundos / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ${min % 60} min`;
  return `${Math.floor(h / 24)} d ${h % 24} h`;
}

export const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
