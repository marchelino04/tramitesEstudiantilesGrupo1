/**
 * Capa de datos del prototipo: guarda la información en el navegador (localStorage),
 * de modo que las solicitudes se mantienen al recargar la página.
 * En el sistema final esta capa se reemplaza por la base de datos (ver arquitectura, Fase 3).
 */
import { CLAVE_ALMACEN, CLAVE_SESION } from '../config.js';
import { crearDatosIniciales } from './semilla.js';

function leer(clave, almacen = localStorage) {
  try {
    return JSON.parse(almacen.getItem(clave) ?? 'null');
  } catch {
    return null;
  }
}

function escribir(clave, valor, almacen = localStorage) {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    // Navegación privada o almacenamiento lleno: el prototipo sigue funcionando en memoria
    return false;
  }
}

export function cargarDatos() {
  const guardados = leer(CLAVE_ALMACEN);
  if (guardados?.version === 1) return guardados;
  const nuevos = crearDatosIniciales();
  escribir(CLAVE_ALMACEN, nuevos);
  return nuevos;
}

export const guardarDatos = (datos) => escribir(CLAVE_ALMACEN, datos);

/** Borra lo que se haya hecho y vuelve a los datos de ejemplo */
export function restablecerDatos() {
  const nuevos = crearDatosIniciales();
  escribir(CLAVE_ALMACEN, nuevos);
  return nuevos;
}

/** La sesión se guarda solo mientras la pestaña está abierta */
export const leerSesion = () => leer(CLAVE_SESION, sessionStorage);
export const guardarSesion = (idUsuario) => escribir(CLAVE_SESION, idUsuario, sessionStorage);
export const cerrarSesion = () => {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    /* sin almacenamiento disponible */
  }
};
