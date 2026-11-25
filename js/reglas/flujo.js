/**
 * Flujo de una solicitud (diagramas del proceso mejorado y de estados, Fase 3).
 *
 *   Recibida → En revisión → Aprobada → Lista
 *                       ↘ Rechazada (siempre con observación)
 *
 * Constancia:     Secretaría verifica → Dirección aprueba (sello y QR) → Lista
 * Justificación:  Secretaría revisa   → Profesor guía firma           → Lista
 */
import { ROLES } from '../config.js';
import { notificarFamilia, notificarRol } from '../servicios/notificaciones.js';
import { generarCodigo } from '../servicios/documentos.js';
import { validarRechazo } from './validaciones.js';
import { pendientePara } from './permisos.js';

const ahora = () => new Date().toISOString();

/** RN6: todo cambio queda en el historial con fecha y hora */
function registrarPaso(solicitud, estado, por, nota, fecha = ahora()) {
  solicitud.estado = estado;
  solicitud.historial.push({ estado, fecha, por, nota });
  if (estado === 'Lista' || estado === 'Rechazada') solicitud.cerrada = fecha;
}

/** RF1 · RF2: registra una solicitud nueva en estado Recibida */
export function crearSolicitud(datos, idUsuario, tipo, detalle, correoAvisos) {
  const usuario = datos.usuarios[idUsuario];
  datos.secuencia += 1;
  const solicitud = {
    numero: datos.secuencia,
    tipo,
    estudiante: usuario.estudiante,
    solicitante: idUsuario,
    correoAvisos,
    estado: 'Recibida',
    rolPendiente: 'secretaria',
    creada: ahora(),
    detalle,
    historial: [],
  };
  registrarPaso(solicitud, 'Recibida', usuario.nombre, 'Solicitud enviada en línea', solicitud.creada);
  datos.solicitudes.push(solicitud);
  notificarFamilia(datos, solicitud, 'fue recibida');
  notificarRol(datos, 'secretaria', solicitud, 'nueva solicitud en la bandeja');
  return solicitud;
}

/** Secretaría abre una solicitud recibida: pasa a En revisión */
export function tomarSolicitud(datos, usuario, solicitud) {
  if (usuario.rol !== 'secretaria' || solicitud.estado !== 'Recibida') return false;
  registrarPaso(solicitud, 'En revisión', 'Secretaría', 'Secretaría abrió la solicitud');
  notificarFamilia(datos, solicitud, 'está en revisión');
  return true;
}

/** Texto del botón de aprobación según el subrol */
export function textoAprobar(usuario, solicitud) {
  if (usuario.rol === 'secretaria') {
    return solicitud.tipo === 'constancia' ? 'Datos correctos: enviar a Dirección' : 'Cumple requisitos: avisar al profesor guía';
  }
  return usuario.rol === 'direccion' ? 'Aprobar y aplicar sello electrónico' : 'Aprobar con firma electrónica';
}

/** RF4 · RN4. Devuelve el mensaje para mostrar al usuario. */
export function aprobar(datos, usuario, solicitud, observacion = '') {
  if (!pendientePara(usuario, solicitud)) throw new Error('Esta solicitud no está pendiente para su rol.');
  tomarSolicitud(datos, usuario, solicitud);

  if (usuario.rol === 'secretaria' && solicitud.tipo === 'constancia') {
    solicitud.rolPendiente = 'direccion';
    registrarPaso(solicitud, 'En revisión', 'Secretaría', observacion || 'Datos verificados; constancia generada desde la plantilla y enviada a Dirección');
    notificarRol(datos, 'direccion', solicitud, 'constancia pendiente de aprobación');
    return 'Enviada a Dirección para su aprobación.';
  }

  if (usuario.rol === 'secretaria') {
    const seccion = datos.estudiantes[solicitud.estudiante].seccion;
    solicitud.rolPendiente = 'guia';
    registrarPaso(solicitud, 'En revisión', 'Secretaría', observacion || 'Cumple requisitos; se avisó al profesor guía');
    notificarRol(datos, 'guia', solicitud, 'justificación pendiente de su firma', (u) => u.seccion === seccion);
    return 'Se avisó al profesor guía.';
  }

  // Dirección (constancias) o profesor guía (justificaciones): aprobación final
  const fecha = ahora();
  const nota = usuario.rol === 'direccion' ? 'Constancia aprobada' : 'Firma electrónica del profesor guía';
  registrarPaso(solicitud, 'Aprobada', usuario.rol === 'direccion' ? 'Dirección' : usuario.nombre, observacion || nota, fecha);
  solicitud.documento = { codigo: generarCodigo(), emitido: fecha };
  solicitud.rolPendiente = null;
  registrarPaso(
    solicitud,
    'Lista',
    'Sistema',
    solicitud.tipo === 'constancia'
      ? 'Sello electrónico y código QR aplicados; PDF archivado en el expediente digital'
      : 'Ausencia registrada como justificada y archivada en el expediente digital',
    fecha,
  );
  notificarFamilia(datos, solicitud, solicitud.tipo === 'constancia' ? 'está lista para descargar' : 'fue aprobada y archivada');
  return solicitud.tipo === 'constancia' ? 'Constancia aprobada, sellada y archivada.' : 'Justificación aprobada con firma electrónica.';
}

/** RN3: el rechazo exige observación y se notifica al solicitante */
export function rechazar(datos, usuario, solicitud, observacion) {
  if (!pendientePara(usuario, solicitud)) throw new Error('Esta solicitud no está pendiente para su rol.');
  const error = validarRechazo(observacion);
  if (error) throw new Error(error);
  solicitud.rolPendiente = null;
  solicitud.observacion = observacion.trim();
  registrarPaso(solicitud, 'Rechazada', ROLES[usuario.rol], solicitud.observacion);
  notificarFamilia(datos, solicitud, 'fue rechazada (ver observación)');
  return 'Solicitud rechazada; se avisó por correo.';
}

/** Tiempo del trámite (indicador 1) */
export const milisegundosTramite = (s) => new Date(s.cerrada ?? Date.now()) - new Date(s.creada);
