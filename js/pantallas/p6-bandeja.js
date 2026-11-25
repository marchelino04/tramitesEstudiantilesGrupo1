/** P6 · Bandeja institucional (RF4): ordenada por fecha, con contadores y filtros por tipo, estado y nombre. */
import { ESTADOS } from '../config.js';
import { pendientePara, visibles } from '../reglas/permisos.js';
import { chip, etiquetaPantalla, menuLateral } from '../ui/componentes.js';
import { $, esc, fechaHora, numero } from '../ui/util.js';

export const acceso = 'institucional';

function descripcion(usuario) {
  if (usuario.rol === 'guia') return `Justificaciones de la sección ${esc(usuario.seccion)}`;
  if (usuario.rol === 'direccion') return 'Constancias de la institución';
  return 'Todas las solicitudes';
}

function filtrar(app) {
  const { fTipo, fEstado, fq } = app.ui;
  const texto = fq.trim().toLowerCase();
  return visibles(app.datos, app.usuario)
    .filter((s) => (!fTipo || s.tipo === fTipo) && (!fEstado || s.estado === fEstado))
    .filter((s) => !texto || app.datos.estudiantes[s.estudiante].nombre.toLowerCase().includes(texto) || numero(s.numero).includes(texto))
    .sort((a, b) => new Date(a.creada) - new Date(b.creada));
}

function fila(app, s) {
  const e = app.datos.estudiantes[s.estudiante];
  const pendiente = pendientePara(app.usuario, s);
  return `<tr class="${pendiente ? 'pend' : ''}">
    <td class="num">${String(s.numero).padStart(4, '0')}</td><td>${esc(e.nombre)}</td><td>${esc(e.seccion)}</td>
    <td>${s.tipo === 'constancia' ? 'Constancia' : 'Justificación'}</td><td class="num">${fechaHora(s.creada)}</td>
    <td>${chip(s.estado)}${pendiente ? '<br><small>Pendiente para usted</small>' : ''}</td>
    <td><button class="btn ${pendiente ? '' : 'sec'}" data-ir="bandeja/${s.numero}">${pendiente ? 'Revisar' : 'Ver'}</button></td>
  </tr>`;
}

export function vista(app) {
  const { usuario, ui } = app;
  const todas = visibles(app.datos, usuario).filter((s) => pendientePara(usuario, s));
  const lista = filtrar(app);
  const opcion = (valor, texto, actual) => `<option value="${valor}" ${actual === valor ? 'selected' : ''}>${texto}</option>`;

  return `<main><div class="shell">${menuLateral('bandeja')}<section>${etiquetaPantalla('P6')}
    <h1>Bandeja de solicitudes</h1>
    <p class="sub">${descripcion(usuario)} · ordenadas por fecha, la más antigua primero.</p>
    <div class="counts">
      <div><b>${todas.length}</b>Pendientes para mí</div>
      <div><b>${todas.filter((s) => s.tipo === 'constancia').length}</b>Constancias</div>
      <div><b>${todas.filter((s) => s.tipo === 'justificacion').length}</b>Justificaciones</div>
    </div>
    <div class="filters">
      <div><label for="filtro-tipo">Tipo de trámite</label><select id="filtro-tipo">${opcion('', 'Todos', ui.fTipo)}${opcion('constancia', 'Constancias', ui.fTipo)}${opcion('justificacion', 'Justificaciones', ui.fTipo)}</select></div>
      <div><label for="filtro-estado">Estado</label><select id="filtro-estado">${opcion('', 'Todos', ui.fEstado)}${ESTADOS.map((e) => opcion(e, e, ui.fEstado)).join('')}</select></div>
      <div class="q"><label for="buscar">Buscar</label><input id="buscar" type="text" placeholder="Nombre del estudiante o número" value="${esc(ui.fq)}"></div>
    </div>
    <div class="scroll"><table class="stack">
      <thead><tr><th>N.°</th><th>Estudiante</th><th>Sección</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th><span class="sr">Acción</span></th></tr></thead>
      <tbody id="filas">${lista.length ? lista.map((s) => fila(app, s)).join('') : '<tr><td colspan="7">No hay solicitudes con estos filtros.</td></tr>'}</tbody>
    </table></div>
  </section></div></main>`;
}

export function conectar(app) {
  $('#filtro-tipo').addEventListener('change', (e) => {
    app.ui.fTipo = e.target.value;
    app.render();
  });
  $('#filtro-estado').addEventListener('change', (e) => {
    app.ui.fEstado = e.target.value;
    app.render();
  });
  // La búsqueda solo actualiza la tabla para no perder el foco mientras se escribe
  $('#buscar').addEventListener('input', (e) => {
    app.ui.fq = e.target.value;
    const lista = filtrar(app);
    $('#filas').innerHTML = lista.length ? lista.map((s) => fila(app, s)).join('') : '<tr><td colspan="7">No hay solicitudes con estos filtros.</td></tr>';
  });
}
