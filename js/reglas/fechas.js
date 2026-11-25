import { PLAZO_DIAS_HABILES } from '../config.js';

/** Fecha sin hora (medianoche local) */
export const soloFecha = (f) => new Date(f.getFullYear(), f.getMonth(), f.getDate());

/** Convierte 'AAAA-MM-DD' (valor de un input date) en fecha local */
export const desdeInput = (valor) => new Date(`${valor}T00:00`);

export const esDiaHabil = (f) => f.getDay() !== 0 && f.getDay() !== 6;

/** Suma días hábiles (lunes a viernes) */
export function sumarDiasHabiles(fecha, dias) {
  const resultado = soloFecha(fecha);
  let sumados = 0;
  while (sumados < dias) {
    resultado.setDate(resultado.getDate() + 1);
    if (esDiaHabil(resultado)) sumados++;
  }
  return resultado;
}

/** RN2: último día para justificar una ausencia que terminó en `fechaFin` */
export const fechaLimite = (fechaFin) => sumarDiasHabiles(fechaFin, PLAZO_DIAS_HABILES);

export const dentroDelPlazo = (fechaFin, hoy = new Date()) => soloFecha(hoy) <= fechaLimite(fechaFin);
