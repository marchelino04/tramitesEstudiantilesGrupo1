/**
 * C8 · Notificaciones (RF3, RN5): cada cambio genera un aviso en la plataforma y un correo.
 * En el prototipo el correo no sale del navegador; queda registrado y se consulta en la pantalla P5.
 */
import { numero } from '../ui/util.js';

function registrar(datos, idUsuario, solicitud, texto, correoDestino) {
  const usuario = datos.usuarios[idUsuario];
  if (!usuario) return;
  const ahora = new Date().toISOString();
  datos.avisos.unshift({ usuario: idUsuario, numero: solicitud.numero, texto, fecha: ahora, leido: false });
  datos.correos.unshift({
    usuario: idUsuario,
    para: correoDestino ?? usuario.correo,
    numero: solicitud.numero,
    asunto: `Solicitud ${numero(solicitud.numero)}: ${texto}`,
    fecha: ahora,
    leido: false,
  });
}

/** Avisa al estudiante y a su persona encargada; el correo va a la dirección indicada en la solicitud */
export function notificarFamilia(datos, solicitud, texto) {
  Object.entries(datos.usuarios)
    .filter(([, u]) => u.estudiante === solicitud.estudiante)
    .forEach(([id]) => registrar(datos, id, solicitud, texto, solicitud.correoAvisos));
}

/** Avisa a todas las personas con un rol (por ejemplo, Secretaría o Dirección) */
export function notificarRol(datos, rol, solicitud, texto, filtro = () => true) {
  Object.entries(datos.usuarios)
    .filter(([, u]) => u.rol === rol && filtro(u))
    .forEach(([id]) => registrar(datos, id, solicitud, texto));
}
