/** P2 · Solicitar constancia (RF1, RN1): el envío se habilita solo con los datos obligatorios completos. */
import { TIPOS_CONSTANCIA } from '../config.js';
import { validarConstancia } from '../reglas/validaciones.js';
import { crearSolicitud } from '../reglas/flujo.js';
import { etiquetaPantalla, mostrarAviso } from '../ui/componentes.js';
import { $, esc, numero } from '../ui/util.js';

export const acceso = 'solicitante';

export function vista(app) {
  const e = app.datos.estudiantes[app.usuario.estudiante];
  return `<main><div class="narrow card">${etiquetaPantalla('P2')}
    <h1>Solicitar constancia</h1><p class="sub">Los campos con <span class="req">*</span> son obligatorios.</p>
    <form id="form-constancia" novalidate>
      <label for="tipo">Tipo de constancia <span class="req">*</span></label>
      <select id="tipo"><option value="">Seleccione…</option>${TIPOS_CONSTANCIA.map((t) => `<option>${t}</option>`).join('')}</select>
      <label for="motivo">Institución o motivo (opcional)</label>
      <input id="motivo" type="text" maxlength="120" placeholder="Ej.: beca, pensión, banco">
      <label>Datos del estudiante (desde el expediente)</label>
      <dl class="kv card" style="background:var(--bg)"><dt>Nombre</dt><dd>${esc(e.nombre)}</dd><dt>Cédula</dt><dd>${esc(e.cedula)}</dd><dt>Sección</dt><dd>${esc(e.seccion)}</dd></dl>
      <label for="correo">Correo para avisos <span class="req">*</span></label>
      <input id="correo" type="email" value="${esc(app.usuario.correo)}" aria-describedby="error-correo"><div class="err" id="error-correo"></div>
      <div class="check"><input type="checkbox" id="privacidad"><label for="privacidad">Acepto el aviso de privacidad: los datos se usan solo para este trámite (Ley 8968). <span class="req">*</span></label></div>
      <button class="btn block" id="enviar" type="submit" disabled>Enviar solicitud</button>
      <p class="hint" id="ayuda-envio">Complete los campos obligatorios para habilitar el envío.</p>
      <button class="btn sec block" type="button" data-ir="solicitudes">Volver</button>
    </form>
  </div></main>`;
}

export function conectar(app) {
  const leer = () => ({ tipo: $('#tipo').value, motivo: $('#motivo').value.trim(), correo: $('#correo').value.trim(), privacidad: $('#privacidad').checked });

  const revisar = () => {
    const errores = validarConstancia(leer());
    const correo = $('#correo').value.trim();
    $('#error-correo').textContent = correo && errores.correo ? errores.correo : '';
    $('#correo').setAttribute('aria-invalid', String(Boolean(correo && errores.correo)));
    const valido = Object.keys(errores).length === 0;
    $('#enviar').disabled = !valido;
    $('#ayuda-envio').textContent = valido ? 'Todo listo para enviar.' : 'Complete los campos obligatorios para habilitar el envío.';
    return valido;
  };

  $('#form-constancia').addEventListener('input', revisar);
  $('#form-constancia').addEventListener('change', revisar);
  $('#form-constancia').addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!revisar()) return;
    const datos = leer();
    const s = crearSolicitud(app.datos, app.idUsuario, 'constancia', { tipoConstancia: datos.tipo, motivo: datos.motivo }, datos.correo);
    app.ui.ultimaCreada = s.numero;
    app.guardar();
    mostrarAviso(`Solicitud enviada con el ${numero(s.numero)}`);
    app.ir('solicitudes');
  });
  revisar();
}
