/** Piezas de interfaz que se repiten en varias pantallas. */
import { PASOS, ROLES } from '../config.js';
import { $, esc, fechaHora, numero } from './util.js';

export const ICONOS = {
  logo: `<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect x="3" y="2" width="22" height="28" rx="3" fill="var(--pri)"/><rect x="8" y="8" width="12" height="2.5" rx="1" fill="var(--card)"/><rect x="8" y="13" width="12" height="2.5" rx="1" fill="var(--card)"/><circle cx="24" cy="24" r="8" fill="var(--card)" stroke="var(--pri)" stroke-width="2.5"/><path d="M20.5 24l2.5 2.5 4.5-5" fill="none" stroke="var(--pri)" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  campana: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>`,
  correo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  salir: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>`,
};

export const etiquetaPantalla = (id) => `<span class="stag">${id}</span>`;

export const chip = (estado) => `<span class="chip s-${esc(estado.split(' ')[0])}">${esc(estado)}</span>`;

export function barraAvance(estado) {
  if (estado === 'Rechazada') return '';
  const actual = PASOS.indexOf(estado);
  return `<div class="steps" aria-hidden="true">${PASOS.map((_, i) => `<span class="${i <= actual ? 'on' : ''}"></span>`).join('')}</div>
    <div class="steps-l" aria-hidden="true">${PASOS.map((p) => `<span>${p}</span>`).join('')}</div>`;
}

export const historial = (pasos) =>
  `<ul class="tl">${pasos.map((h) => `<li>${chip(h.estado)} ${esc(h.nota)}<small>${fechaHora(h.fecha)} · ${esc(h.por)}</small></li>`).join('')}</ul>`;

export function encabezado(usuario, avisosSinLeer, correosSinLeer) {
  return `<header class="top">
    <div class="brand">${ICONOS.logo}<span>Trámites Estudiantiles<br><small>CTP San Sebastián</small></span></div>
    <div class="who"><b>${esc(usuario.nombre)}</b>${esc(ROLES[usuario.rol])}${usuario.seccion ? ` · sección ${esc(usuario.seccion)}` : ''}</div>
    <button class="ibtn" id="btn-avisos" aria-label="Avisos (${avisosSinLeer} sin leer)" aria-expanded="false">${ICONOS.campana}${avisosSinLeer ? `<span class="badge">${avisosSinLeer}</span>` : ''}</button>
    <button class="ibtn" id="btn-correo" aria-label="Correo (${correosSinLeer} sin leer)">${ICONOS.correo}${correosSinLeer ? `<span class="badge">${correosSinLeer}</span>` : ''}</button>
    <button class="ibtn" id="btn-salir" aria-label="Cerrar sesión">${ICONOS.salir}</button>
  </header>`;
}

export function menuLateral(actual) {
  const opcion = (ruta, texto) =>
    `<button data-ir="${ruta}" aria-current="${actual === ruta ? 'page' : 'false'}">${texto}</button>`;
  return `<nav class="side" aria-label="Menú">${opcion('bandeja', 'Bandeja')}${opcion('expediente', 'Expediente digital')}${opcion('correo', 'Correo')}</nav>`;
}

export function panelAvisos(avisos) {
  return `<div class="card panel" id="panel-avisos" role="dialog" aria-label="Avisos"><h2>Avisos</h2>
    ${
      avisos.length
        ? avisos
            .map(
              (a) =>
                `<button class="list-btn ${a.leido ? '' : 'unread'}" data-abrir="${a.numero}"><span>${numero(a.numero)}: ${esc(a.texto)}<br><small>${fechaHora(a.fecha)}</small></span></button>`,
            )
            .join('')
        : '<p class="sub">No hay avisos nuevos.</p>'
    }</div>`;
}

/** Mensaje breve en la parte inferior de la pantalla */
export function mostrarAviso(texto) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = texto;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/** Diálogo de confirmación. Devuelve una promesa que se resuelve con true o false. */
export function confirmar({ titulo, mensaje, aceptar }) {
  const capa = $('#capa');
  capa.innerHTML = `<div class="modal-bg"><div class="card modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
    <h2 id="titulo-modal">${esc(titulo)}</h2><p>${esc(mensaje)}</p>
    <div class="acts"><button class="btn" id="modal-si">${esc(aceptar)}</button><button class="btn sec" id="modal-no">Cancelar</button></div>
  </div></div>`;
  $('#modal-si').focus();
  return new Promise((resolver) => {
    const cerrar = (valor) => {
      capa.innerHTML = '';
      document.removeEventListener('keydown', escape);
      resolver(valor);
    };
    const escape = (e) => e.key === 'Escape' && cerrar(false);
    document.addEventListener('keydown', escape);
    $('#modal-si').onclick = () => cerrar(true);
    $('#modal-no').onclick = () => cerrar(false);
  });
}
