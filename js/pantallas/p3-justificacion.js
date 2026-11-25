/** P3 · Justificar ausencia (RF2, RN2): muestra la fecha límite y bloquea el envío si el plazo venció. */
import { MAX_ARCHIVO_MB, MOTIVOS_AUSENCIA, PLAZO_DIAS_HABILES } from '../config.js';
import { correoValido, validarArchivo, validarJustificacion } from '../reglas/validaciones.js';
import { crearSolicitud } from '../reglas/flujo.js';
import { desdeInput } from '../reglas/fechas.js';
import { etiquetaPantalla, mostrarAviso } from '../ui/componentes.js';
import { $, esc, fecha, kb, numero } from '../ui/util.js';

export const acceso = 'solicitante';

/** Las imágenes pequeñas se guardan para mostrarlas en el detalle (P7) */
const MAX_VISTA_PREVIA = 1024 * 1024;

export function vista(app) {
  const e = app.datos.estudiantes[app.usuario.estudiante];
  return `<main><div class="narrow card">${etiquetaPantalla('P3')}
    <h1>Justificar ausencia</h1><p class="sub">Estudiante: ${esc(e.nombre)} · sección ${esc(e.seccion)}</p>
    <div class="alert warn" id="plazo" aria-live="polite">Plazo: ${PLAZO_DIAS_HABILES} días hábiles después de la ausencia.</div>
    <form id="form-justificacion" novalidate>
      <div class="row2">
        <div><label for="desde">Desde <span class="req">*</span></label><input id="desde" type="date"></div>
        <div><label for="hasta">Hasta <span class="req">*</span></label><input id="hasta" type="date"></div>
      </div>
      <div class="err" id="error-fechas"></div>
      <label for="motivo">Motivo <span class="req">*</span></label>
      <select id="motivo"><option value="">Seleccione…</option>${MOTIVOS_AUSENCIA.map((m) => `<option>${m}</option>`).join('')}</select>
      <label for="comentario">Detalle (opcional)</label><textarea id="comentario" maxlength="400"></textarea>
      <label for="archivo">Comprobante <span class="req">*</span></label>
      <div class="drop"><input id="archivo" type="file" accept=".pdf,.jpg,.jpeg,.png"><div class="hint" id="info-archivo">Formatos: PDF, JPG o PNG · máximo ${MAX_ARCHIVO_MB} MB</div></div>
      <div class="err" id="error-archivo"></div>
      <label for="correo">Correo para avisos <span class="req">*</span></label>
      <input id="correo" type="email" value="${esc(app.usuario.correo)}">
      <button class="btn block" id="enviar" type="submit" disabled style="margin-top:16px">Enviar justificación</button>
      <button class="btn sec block" type="button" data-ir="solicitudes" style="margin-top:8px">Volver</button>
    </form>
  </div></main>`;
}

export function conectar(app) {
  let archivo = null;

  const leer = () => ({ desde: $('#desde').value, hasta: $('#hasta').value, motivo: $('#motivo').value, archivo });

  const revisar = () => {
    const { errores, limite, vencido } = validarJustificacion(leer());
    const plazo = $('#plazo');
    if (limite) {
      plazo.className = `alert ${vencido ? 'bad' : 'warn'}`;
      plazo.textContent = vencido
        ? `El plazo para justificar venció el ${fecha(limite)}. El sistema no permite el envío; consulte con Orientación.`
        : `Tiene hasta el ${fecha(limite)} para justificar esta ausencia (${PLAZO_DIAS_HABILES} días hábiles).`;
    } else {
      plazo.className = 'alert warn';
      plazo.textContent = `Plazo: ${PLAZO_DIAS_HABILES} días hábiles después de la ausencia.`;
    }
    const ambas = $('#desde').value && $('#hasta').value;
    $('#error-fechas').textContent = ambas && errores.fechas ? errores.fechas : '';
    const correoOk = correoValido($('#correo').value);
    const valido = Object.keys(errores).length === 0 && correoOk;
    $('#enviar').disabled = !valido;
    return valido;
  };

  $('#archivo').addEventListener('change', (evento) => {
    archivo = evento.target.files[0] ?? null;
    const error = archivo ? validarArchivo(archivo) : null;
    $('#error-archivo').textContent = error ?? '';
    if (error) archivo = null;
    $('#info-archivo').textContent = archivo ? `${archivo.name} · ${kb(archivo.size)}` : `Formatos: PDF, JPG o PNG · máximo ${MAX_ARCHIVO_MB} MB`;
    revisar();
  });

  const formulario = $('#form-justificacion');
  formulario.addEventListener('input', revisar);
  formulario.addEventListener('change', revisar);
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (!revisar()) return;
    const s = crearSolicitud(
      app.datos,
      app.idUsuario,
      'justificacion',
      {
        desde: desdeInput($('#desde').value).toISOString(),
        hasta: desdeInput($('#hasta').value).toISOString(),
        motivo: $('#motivo').value,
        comentario: $('#comentario').value.trim(),
        archivo: { nombre: archivo.name, tipo: archivo.type, tamano: archivo.size },
      },
      $('#correo').value.trim(),
    );
    if (archivo.type.startsWith('image/') && archivo.size <= MAX_VISTA_PREVIA) {
      app.datos.archivos[s.numero] = await leerComoDataUrl(archivo);
    }
    app.ui.ultimaCreada = s.numero;
    app.guardar();
    mostrarAviso(`Justificación enviada con el ${numero(s.numero)}`);
    app.ir('solicitudes');
  });
}

function leerComoDataUrl(archivo) {
  return new Promise((resolver) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => resolver(null);
    lector.readAsDataURL(archivo);
  });
}
