/** P8 · Constancia y expediente digital (RF5). "Descargar PDF" usa la impresión del navegador (Guardar como PDF). */
import { esSolicitante, puedeVer, visibles } from '../reglas/permisos.js';
import { htmlDocumento } from '../servicios/documentos.js';
import { chip, etiquetaPantalla, menuLateral } from '../ui/componentes.js';
import { $, esc, fecha, numero } from '../ui/util.js';

export const acceso = 'todos';

const titulo = (s) => (s.tipo === 'constancia' ? s.detalle.tipoConstancia : 'Justificación de ausencia');

function listaExpediente(app, archivadas, actual) {
  const porEstudiante = {};
  archivadas.forEach((s) => (porEstudiante[s.estudiante] ??= []).push(s));
  const grupos = Object.entries(porEstudiante)
    .map(([id, lista]) => {
      const e = app.datos.estudiantes[id];
      return `<p style="margin:10px 0 6px;font-weight:700">${esc(e.nombre)} · ${esc(e.seccion)}</p>${lista
        .map(
          (s) =>
            `<button class="list-btn" data-ir="expediente/${s.numero}" aria-current="${actual?.numero === s.numero}"><span>${esc(titulo(s))}<br><small>${numero(s.numero)} · ${fecha(s.documento.emitido)}</small></span>${chip('Lista')}</button>`,
        )
        .join('')}`;
    })
    .join('');
  return `<div class="card"><h2>Expediente</h2>${grupos || '<p class="sub">Aún no hay documentos archivados.</p>'}</div>`;
}

export function vista(app, n) {
  const { datos, usuario } = app;
  const solicitante = esSolicitante(usuario);
  const archivadas = visibles(datos, usuario)
    .filter((s) => s.estado === 'Lista')
    .sort((a, b) => new Date(b.documento.emitido) - new Date(a.documento.emitido));
  let actual = n ? datos.solicitudes.find((s) => s.numero === Number(n)) : archivadas[0];
  if (actual && !puedeVer(datos, usuario, actual)) actual = null;
  // El borrador (sin sello) solo lo ve el personal; el solicitante solo ve documentos emitidos
  if (actual && actual.estado !== 'Lista' && (solicitante || actual.tipo !== 'constancia')) actual = null;

  const documento = actual
    ? `${htmlDocumento(datos, actual)}${actual.estado === 'Lista' ? '<div class="acts no-print"><button class="btn" id="descargar">Descargar PDF</button></div><p class="hint">Se abre la ventana de impresión: elija "Guardar como PDF".</p>' : ''}`
    : '<p class="sub">No hay documentos.</p>';

  const contenido = `${etiquetaPantalla('P8')}
    ${solicitante ? '<button class="btn sec" data-ir="solicitudes" style="margin-bottom:12px">← Mis solicitudes</button>' : ''}
    <h1>${actual && actual.estado !== 'Lista' ? 'Vista previa de la constancia' : 'Expediente digital'}</h1>
    <p class="sub">${solicitante ? `Documentos archivados de ${esc(datos.estudiantes[usuario.estudiante].nombre)}` : 'Documentos emitidos y archivados por estudiante'}</p>
    <div class="detail"><div>${documento}</div>${listaExpediente(app, archivadas, actual)}</div>`;

  return solicitante
    ? `<main><div class="narrow">${contenido}</div></main>`
    : `<main><div class="shell">${menuLateral('expediente')}<section>${contenido}</section></div></main>`;
}

export function conectar() {
  $('#descargar')?.addEventListener('click', () => window.print());
}
