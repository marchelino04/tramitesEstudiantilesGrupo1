/** P7 · Detalle y resolución (RF4, RN3): aprobar o rechazar según el subrol, con confirmación. */
import { ROLES } from '../config.js';
import { aprobar, milisegundosTramite, rechazar, textoAprobar, tomarSolicitud } from '../reglas/flujo.js';
import { pendientePara, puedeVer } from '../reglas/permisos.js';
import { validarRechazo } from '../reglas/validaciones.js';
import { chip, confirmar, etiquetaPantalla, historial, menuLateral, mostrarAviso } from '../ui/componentes.js';
import { $, duracion, esc, fecha, fechaHora, kb, numero } from '../ui/util.js';

export const acceso = 'institucional';

const buscar = (app, n) => app.datos.solicitudes.find((s) => s.numero === Number(n));

const AYUDA = {
  secretaria: {
    constancia: 'La constancia se genera desde la plantilla; Dirección la revisa antes de aplicar el sello.',
    justificacion: 'Al aprobar, el profesor guía recibe el aviso para firmar.',
  },
  direccion: { constancia: 'Al aprobar se aplica el sello electrónico, el código QR y se genera el PDF.' },
  guia: { justificacion: 'Al aprobar, la ausencia queda justificada y se avisa a la familia.' },
};

/** Cuando Secretaría abre una solicitud recibida, esta pasa a En revisión */
export function preparar(app, n) {
  const s = buscar(app, n);
  if (s && puedeVer(app.datos, app.usuario, s) && tomarSolicitud(app.datos, app.usuario, s)) app.guardar(false);
}

function panelResolver(app, s) {
  if (!pendientePara(app.usuario, s)) {
    return `<h2>Estado</h2><p>${chip(s.estado)}</p><p class="hint">${
      s.rolPendiente ? `Pendiente de ${esc(ROLES[s.rolPendiente])}.` : 'Sin acciones pendientes para su rol.'
    }</p>`;
  }
  return `<h2>Resolver</h2>
    <label for="observacion">Observación <span class="hint">(obligatoria para rechazar)</span></label>
    <textarea id="observacion" maxlength="400" aria-describedby="error-observacion"></textarea><div class="err" id="error-observacion"></div>
    <div class="acts"><button class="btn" id="aprobar">${textoAprobar(app.usuario, s)}</button><button class="btn danger" id="rechazar">Rechazar</button></div>
    <p class="hint">${AYUDA[app.usuario.rol]?.[s.tipo] ?? ''}</p>`;
}

function datosSolicitud(app, s) {
  const e = app.datos.estudiantes[s.estudiante];
  const d = s.detalle;
  const especificos =
    s.tipo === 'constancia'
      ? `<dt>Tipo</dt><dd>${esc(d.tipoConstancia)}</dd><dt>Institución o motivo</dt><dd>${esc(d.motivo || '—')}</dd>`
      : `<dt>Fechas</dt><dd>${fecha(d.desde)} al ${fecha(d.hasta)}</dd><dt>Motivo</dt><dd>${esc(d.motivo)}</dd><dt>Detalle</dt><dd>${esc(d.comentario || '—')}</dd>`;
  const vistaPrevia = app.datos.archivos[s.numero];
  const adjunto =
    s.tipo === 'justificacion'
      ? `<h2 style="margin-top:18px">Comprobante adjunto</h2><div class="att"><b>${esc(d.archivo.nombre)}</b> <small>· ${kb(d.archivo.tamano)}</small>${
          vistaPrevia ? `<img src="${vistaPrevia}" alt="Vista previa del comprobante">` : ''
        }</div>`
      : '';
  return `<div class="card"><dl class="kv">
      <dt>Estudiante</dt><dd>${esc(e.nombre)}</dd><dt>Cédula</dt><dd>${esc(e.cedula)}</dd><dt>Sección</dt><dd>${esc(e.seccion)}</dd>
      ${especificos}
      <dt>Enviada</dt><dd>${fechaHora(s.creada)}</dd><dt>Tiempo del trámite</dt><dd>${duracion(milisegundosTramite(s))}</dd>
    </dl>${adjunto}
    ${s.tipo === 'constancia' ? `<div class="acts"><button class="btn sec" data-ir="expediente/${s.numero}">${s.estado === 'Lista' ? 'Ver constancia sellada' : 'Ver borrador de la constancia'}</button></div>` : ''}
  </div>`;
}

export function vista(app, n) {
  const s = buscar(app, n);
  if (!s || !puedeVer(app.datos, app.usuario, s)) {
    return `<main><div class="shell">${menuLateral('bandeja')}<section><h1>Solicitud no encontrada</h1><button class="btn sec" data-ir="bandeja">← Volver a la bandeja</button></section></div></main>`;
  }
  return `<main><div class="shell">${menuLateral('bandeja')}<section>${etiquetaPantalla('P7')}
    <button class="btn sec" data-ir="bandeja" style="margin-bottom:12px">← Volver a la bandeja</button>
    <h1>Solicitud ${numero(s.numero)} · ${s.tipo === 'constancia' ? 'Constancia' : 'Justificación'}</h1><p class="sub">${chip(s.estado)}</p>
    <div class="detail">
      <div>${datosSolicitud(app, s)}<div class="card" style="margin-top:16px"><h2>Historial de estados</h2>${historial(s.historial)}</div></div>
      <div class="card">${panelResolver(app, s)}</div>
    </div>
  </section></div></main>`;
}

export function conectar(app, n) {
  const s = buscar(app, n);
  if (!s || !$('#aprobar')) return;

  const ejecutar = async (accion) => {
    const observacion = $('#observacion').value.trim();
    if (accion === 'rechazar') {
      const error = validarRechazo(observacion);
      $('#error-observacion').textContent = error ?? '';
      $('#observacion').setAttribute('aria-invalid', String(Boolean(error)));
      if (error) return $('#observacion').focus();
    }
    const aprobando = accion === 'aprobar';
    const confirmado = await confirmar({
      titulo: aprobando ? '¿Confirmar aprobación?' : '¿Confirmar rechazo?',
      mensaje: aprobando
        ? 'Esta acción avanza la solicitud y notifica a las personas involucradas.'
        : 'La persona solicitante recibirá la observación por correo.',
      aceptar: aprobando ? 'Sí, aprobar' : 'Sí, rechazar',
    });
    if (!confirmado) return;
    try {
      const mensaje = aprobando ? aprobar(app.datos, app.usuario, s, observacion) : rechazar(app.datos, app.usuario, s, observacion);
      app.guardar();
      mostrarAviso(`${numero(s.numero)}: ${mensaje}`);
    } catch (error) {
      $('#error-observacion').textContent = error.message;
    }
  };

  $('#aprobar').addEventListener('click', () => ejecutar('aprobar'));
  $('#rechazar').addEventListener('click', () => ejecutar('rechazar'));
}
