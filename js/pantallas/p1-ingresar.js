/** P1 · Inicio de sesión (RNF2): cada perfil ve solo las opciones de su rol. */
import { ROLES } from '../config.js';
import { ICONOS, etiquetaPantalla, mostrarAviso } from '../ui/componentes.js';
import { $, $$, esc } from '../ui/util.js';

export const acceso = 'publico';

export function vista(app) {
  const elegido = app.ui.perfil;
  const usuario = app.datos.usuarios[elegido];
  return `<main><div class="card login">${etiquetaPantalla('P1')}
    <div class="brand" style="margin-bottom:10px">${ICONOS.logo}<span>Trámites Estudiantiles</span></div>
    <h1>Iniciar sesión</h1><p class="sub">Constancias y justificaciones de ausencias en línea.</p>
    <label for="correo">Correo institucional</label><input id="correo" type="email" class="ro" readonly value="${esc(usuario.correo)}">
    <label for="contrasena">Contraseña</label><input id="contrasena" type="password" class="ro" readonly value="prototipo">
    <p class="hint">Elija un perfil de prueba para ingresar.</p>
    <div class="profiles" role="group" aria-label="Perfiles de prueba">
      ${Object.entries(app.datos.usuarios)
        .map(
          ([id, u]) =>
            `<button data-perfil="${id}" aria-pressed="${id === elegido}"><span>${esc(u.nombre)}<br><small>${esc(ROLES[u.rol])}${u.seccion ? ` · sección ${esc(u.seccion)}` : ''}</small></span><span aria-hidden="true">›</span></button>`,
        )
        .join('')}
    </div>
    <button class="btn block" id="ingresar" style="margin-top:16px">Ingresar</button>
    <button class="link-btn" id="restablecer">Restablecer datos de ejemplo</button>
  </div></main>`;
}

export function conectar(app) {
  $$('[data-perfil]').forEach((b) =>
    b.addEventListener('click', () => {
      app.ui.perfil = b.dataset.perfil;
      app.render();
    }),
  );
  $('#ingresar').addEventListener('click', () => app.iniciarSesion(app.ui.perfil));
  $('#restablecer').addEventListener('click', () => {
    app.restablecer();
    mostrarAviso('Se restablecieron los datos de ejemplo.');
  });
}
