/** P4 · Inicio del solicitante: estado, avance, historial, observaciones y documentos (RF3, RF5). */
import { barraAvance, chip, etiquetaPantalla, historial } from '../ui/componentes.js';
import { $, $$, esc, fechaHora, numero } from '../ui/util.js';

export const acceso = 'solicitante';

const FILTROS = [
  ['todas', 'Todas'],
  ['constancia', 'Constancias'],
  ['justificacion', 'Justificaciones'],
];

const titulo = (s) => (s.tipo === 'constancia' ? s.detalle.tipoConstancia : 'Justificación de ausencia');

function tarjeta(s) {
  return `<article class="card req-card" id="solicitud-${s.numero}">
    <div class="h"><div><b>${numero(s.numero)} · ${esc(titulo(s))}</b><br><small>Enviada el ${fechaHora(s.creada)}</small></div>${chip(s.estado)}</div>
    ${barraAvance(s.estado)}
    ${s.estado === 'Rechazada' ? `<div class="obs"><b>Observación:</b> ${esc(s.observacion)}</div>` : ''}
    <details style="margin-top:10px"><summary>Ver historial</summary><div style="margin-top:10px">${historial(s.historial)}</div></details>
    ${
      s.estado === 'Lista'
        ? `<div class="acts"><button class="btn sec" data-ir="expediente/${s.numero}">${s.tipo === 'constancia' ? 'Ver y descargar constancia (PDF)' : 'Ver comprobante de justificación'}</button></div>`
        : ''
    }
    ${s.estado === 'Rechazada' && s.tipo === 'constancia' ? '<div class="acts"><button class="btn sec" data-ir="solicitudes/constancia">Corregir y volver a solicitar</button></div>' : ''}
  </article>`;
}

export function vista(app) {
  const { usuario, datos, ui } = app;
  const estudiante = datos.estudiantes[usuario.estudiante];
  const mias = datos.solicitudes
    .filter((s) => s.estudiante === usuario.estudiante)
    .filter((s) => ui.filtro === 'todas' || s.tipo === ui.filtro)
    .sort((a, b) => new Date(b.creada) - new Date(a.creada));
  const recien = ui.ultimaCreada && datos.solicitudes.find((s) => s.numero === ui.ultimaCreada);

  return `<main><div class="narrow">${etiquetaPantalla('P4')}
    <h1>Hola, ${esc(usuario.nombre.split(' ')[0])}</h1>
    <p class="sub">Estudiante: ${esc(estudiante.nombre)} · sección ${esc(estudiante.seccion)}</p>
    ${
      recien
        ? `<div class="card ok-card" role="status"><div>Su solicitud fue enviada con el número</div><div class="n">${numero(recien.numero)}</div><div class="hint">Le avisaremos por correo a ${esc(recien.correoAvisos)} cada vez que cambie de estado.</div></div>`
        : ''
    }
    <div class="big-acts">
      <button data-ir="solicitudes/constancia"><b>Solicitar constancia</b><small>Estudio, matrícula, notas o conducta</small></button>
      <button data-ir="solicitudes/justificacion"><b>Justificar ausencia</b><small>Plazo: 3 días hábiles</small></button>
    </div>
    <h2>Mis solicitudes</h2>
    <div class="tabs" role="group" aria-label="Filtrar por tipo">
      ${FILTROS.map(([valor, texto]) => `<button class="tab" data-filtro="${valor}" aria-pressed="${ui.filtro === valor}">${texto}</button>`).join('')}
    </div>
    ${mias.length ? mias.map(tarjeta).join('') : '<p class="sub">No hay solicitudes con este filtro.</p>'}
  </div></main>`;
}

export function conectar(app, parametro) {
  $$('[data-filtro]').forEach((b) =>
    b.addEventListener('click', () => {
      app.ui.filtro = b.dataset.filtro;
      app.render();
    }),
  );
  // Al llegar desde un aviso se resalta la solicitud
  if (parametro) $(`#solicitud-${parametro}`)?.scrollIntoView({ block: 'center' });
}
