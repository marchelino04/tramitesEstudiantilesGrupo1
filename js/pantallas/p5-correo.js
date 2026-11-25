/** P5 · Aviso por correo (RF3, RN5): correos que el sistema envía en cada cambio de estado. */
import { chip, etiquetaPantalla, menuLateral } from '../ui/componentes.js';
import { esSolicitante } from '../reglas/permisos.js';
import { $$, esc, fechaHora, numero } from '../ui/util.js';

export const acceso = 'todos';

export function vista(app) {
  const { datos, usuario, ui } = app;
  const correos = datos.correos.filter((c) => c.usuario === app.idUsuario);
  const indice = Math.min(ui.correoSel, Math.max(correos.length - 1, 0));
  const actual = correos[indice];
  const s = actual && datos.solicitudes.find((x) => x.numero === actual.numero);
  const solicitante = esSolicitante(usuario);

  const contenido = `${etiquetaPantalla('P5')}<h1>Correo electrónico</h1><p class="sub">Avisos recibidos en ${esc(usuario.correo)}.</p>
    <div class="mail">
      <div>${
        correos.length
          ? correos
              .map(
                (c, i) =>
                  `<button class="list-btn ${c.leido ? '' : 'unread'}" data-correo="${i}" aria-current="${i === indice}"><span>${esc(c.asunto)}<br><small>${fechaHora(c.fecha)}</small></span></button>`,
              )
              .join('')
          : '<p class="sub">Sin correos.</p>'
      }</div>
      ${
        actual
          ? `<article class="card">
          <dl class="kv"><dt>De</dt><dd>tramites@ctp.ejemplo.cr</dd><dt>Para</dt><dd>${esc(actual.para)}</dd><dt>Asunto</dt><dd>${esc(actual.asunto)}</dd><dt>Fecha</dt><dd>${fechaHora(actual.fecha)}</dd></dl>
          <hr>
          <p>Hola, ${esc(usuario.nombre.split(' ')[0])}:</p>
          <p>La solicitud <b>${numero(actual.numero)}</b> ${s ? `de ${esc(datos.estudiantes[s.estudiante].nombre)} se encuentra en estado ${chip(s.estado)}` : 'cambió de estado'}.</p>
          ${s?.estado === 'Rechazada' ? `<div class="obs"><b>Observación:</b> ${esc(s.observacion)}</div>` : ''}
          <div class="acts"><button class="btn" data-ir="${solicitante ? `solicitudes/${actual.numero}` : `bandeja/${actual.numero}`}">${solicitante ? 'Ver mis solicitudes' : 'Abrir solicitud'}</button></div>
          <p class="hint">Mensaje automático del sistema de trámites. No responda este correo.</p>
        </article>`
          : ''
      }
    </div>`;

  return solicitante ? `<main>${contenido}</main>` : `<main><div class="shell">${menuLateral('correo')}<section>${contenido}</section></div></main>`;
}

/** Al abrir un correo se marca como leído */
export function preparar(app) {
  const correos = app.datos.correos.filter((c) => c.usuario === app.idUsuario);
  const actual = correos[Math.min(app.ui.correoSel, Math.max(correos.length - 1, 0))];
  if (actual && !actual.leido) {
    actual.leido = true;
    app.guardar(false);
  }
}

export function conectar(app) {
  $$('[data-correo]').forEach((b) =>
    b.addEventListener('click', () => {
      app.ui.correoSel = Number(b.dataset.correo);
      app.render();
    }),
  );
}
