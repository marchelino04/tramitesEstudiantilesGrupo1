/**
 * Validaciones de los formularios (RN1, RN2, RN3).
 * Cada función devuelve un objeto { campo: mensaje } con los errores encontrados; vacío si todo está bien.
 */
import { FORMATOS_PERMITIDOS, MAX_ARCHIVO_MB, MIN_OBSERVACION, TIPOS_CONSTANCIA, MOTIVOS_AUSENCIA } from '../config.js';
import { dentroDelPlazo, desdeInput, fechaLimite, soloFecha } from './fechas.js';

export const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor).trim());

/** RF1 · RN1 */
export function validarConstancia({ tipo, motivo, correo, privacidad }) {
  const errores = {};
  if (!TIPOS_CONSTANCIA.includes(tipo)) errores.tipo = 'Seleccione el tipo de constancia.';
  if (motivo && motivo.length > 120) errores.motivo = 'Máximo 120 caracteres.';
  if (!correo) errores.correo = 'Escriba el correo para los avisos.';
  else if (!correoValido(correo)) errores.correo = 'Escriba un correo válido.';
  if (!privacidad) errores.privacidad = 'Debe aceptar el aviso de privacidad.';
  return errores;
}

/** RF2 · RN1 · RN2. Devuelve también la fecha límite calculada. */
export function validarJustificacion({ desde, hasta, motivo, archivo }, hoy = new Date()) {
  const errores = {};
  let limite = null;
  let vencido = false;

  if (!desde || !hasta) {
    errores.fechas = 'Indique las fechas de la ausencia.';
  } else {
    const inicio = desdeInput(desde);
    const fin = desdeInput(hasta);
    if (fin < inicio) errores.fechas = 'La fecha final no puede ser anterior a la inicial.';
    else if (fin > soloFecha(hoy)) errores.fechas = 'No se puede justificar una fecha futura.';
    else {
      limite = fechaLimite(fin);
      vencido = !dentroDelPlazo(fin, hoy);
      if (vencido) errores.plazo = 'El plazo para justificar esta ausencia ya venció.';
    }
  }
  if (!MOTIVOS_AUSENCIA.includes(motivo)) errores.motivo = 'Seleccione el motivo.';
  const errorArchivo = validarArchivo(archivo);
  if (errorArchivo) errores.archivo = errorArchivo;
  return { errores, limite, vencido };
}

export function validarArchivo(archivo) {
  if (!archivo) return 'Adjunte el comprobante.';
  if (!FORMATOS_PERMITIDOS.includes(archivo.type)) return 'Formato no permitido. Adjunte un PDF, JPG o PNG.';
  if (archivo.size > MAX_ARCHIVO_MB * 1024 * 1024) return `El archivo supera el máximo de ${MAX_ARCHIVO_MB} MB.`;
  return null;
}

/** RN3: el rechazo exige una observación */
export function validarRechazo(observacion) {
  return String(observacion ?? '').trim().length >= MIN_OBSERVACION
    ? null
    : `Para rechazar debe escribir una observación (mínimo ${MIN_OBSERVACION} caracteres).`;
}
