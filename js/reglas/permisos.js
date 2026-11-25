/**
 * RNF2 · Acceso por rol: cada perfil solo ve las solicitudes que le corresponden.
 */
import { ESTADOS_FINALES, ROLES_SOLICITANTE } from '../config.js';

export const esSolicitante = (usuario) => ROLES_SOLICITANTE.includes(usuario?.rol);

/** Solicitudes que el usuario puede ver */
export function visibles(datos, usuario) {
  return datos.solicitudes.filter((s) => puedeVer(datos, usuario, s));
}

export function puedeVer(datos, usuario, solicitud) {
  const estudiante = datos.estudiantes[solicitud.estudiante];
  switch (usuario.rol) {
    case 'estudiante':
    case 'encargado':
      return solicitud.estudiante === usuario.estudiante;
    case 'secretaria':
      return true;
    case 'direccion':
      return solicitud.tipo === 'constancia';
    case 'guia':
      return solicitud.tipo === 'justificacion' && estudiante.seccion === usuario.seccion;
    default:
      return false;
  }
}

/** La solicitud espera una acción del rol del usuario */
export const pendientePara = (usuario, solicitud) =>
  solicitud.rolPendiente === usuario.rol && !ESTADOS_FINALES.includes(solicitud.estado);
