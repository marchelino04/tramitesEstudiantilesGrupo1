/**
 * Constantes del sistema. Corresponden a las reglas y catálogos definidos en el documento (Fases 2 y 3).
 */

export const ESTADOS = ['Recibida', 'En revisión', 'Aprobada', 'Rechazada', 'Lista'];
export const ESTADOS_FINALES = ['Rechazada', 'Lista'];
/** Pasos que se muestran en la barra de avance */
export const PASOS = ['Recibida', 'En revisión', 'Aprobada', 'Lista'];

export const ROLES = {
  estudiante: 'Estudiante',
  encargado: 'Encargado',
  secretaria: 'Secretaría',
  direccion: 'Dirección',
  guia: 'Profesor guía',
};
export const ROLES_SOLICITANTE = ['estudiante', 'encargado'];

export const TIPOS_CONSTANCIA = ['Constancia de estudio', 'Constancia de matrícula', 'Constancia de notas', 'Constancia de conducta'];
export const MOTIVOS_AUSENCIA = ['Salud', 'Asunto familiar', 'Trámite legal', 'Otro'];

/** RN2: días hábiles para justificar una ausencia (supuesto académico) */
export const PLAZO_DIAS_HABILES = 3;
export const MAX_ARCHIVO_MB = 5;
export const FORMATOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
/** RN3: largo mínimo de la observación al rechazar */
export const MIN_OBSERVACION = 5;

/** Clave con la que se guardan los datos en el navegador */
export const CLAVE_ALMACEN = 'tramites-ctp-datos';
export const CLAVE_SESION = 'tramites-ctp-sesion';
