/**
 * Punto de entrada: carga los datos, resuelve la ruta (#/...) y dibuja la pantalla que corresponde.
 */
import { cargarDatos, cerrarSesion, guardarDatos, guardarSesion, leerSesion, restablecerDatos } from './datos/almacen.js';
import { esSolicitante } from './reglas/permisos.js';
import { encabezado, panelAvisos } from './ui/componentes.js';
import { $, $$ } from './ui/util.js';
import * as P1 from './pantallas/p1-ingresar.js';
import * as P2 from './pantallas/p2-constancia.js';
import * as P3 from './pantallas/p3-justificacion.js';
import * as P4 from './pantallas/p4-mis-solicitudes.js';
import * as P5 from './pantallas/p5-correo.js';
import * as P6 from './pantallas/p6-bandeja.js';
import * as P7 from './pantallas/p7-detalle.js';
import * as P8 from './pantallas/p8-expediente.js';

/** Rutas del prototipo: dirección → pantalla */
const RUTAS = [
  [/^ingresar$/, P1],
  [/^solicitudes\/constancia$/, P2],
  [/^solicitudes\/justificacion$/, P3],
  [/^solicitudes(?:\/(\d+))?$/, P4],
  [/^correo$/, P5],
  [/^bandeja$/, P6],
  [/^bandeja\/(\d+)$/, P7],
  [/^expediente(?:\/(\d+))?$/, P8],
];

const app = {
  datos: cargarDatos(),
  idUsuario: null,
  get usuario() {
    return this.idUsuario ? this.datos.usuarios[this.idUsuario] : null;
  },
  /** Estado de la interfaz (filtros, selección); no se guarda */
  ui: { perfil: 'ana', filtro: 'todas', fTipo: '', fEstado: '', fq: '', correoSel: 0, ultimaCreada: null, panel: false },

  ir(ruta) {
    if (location.hash === `#/${ruta}`) this.render();
    else location.hash = `#/${ruta}`;
  },
  guardar(redibujar = true) {
    guardarDatos(this.datos);
    if (redibujar) this.render();
  },
  iniciarSesion(id) {
    this.idUsuario = id;
    guardarSesion(id);
    this.ui.ultimaCreada = null;
    this.ir(esSolicitante(this.usuario) ? 'solicitudes' : 'bandeja');
  },
  salir() {
    this.idUsuario = null;
    cerrarSesion();
    this.ir('ingresar');
  },
  restablecer() {
    this.datos = restablecerDatos();
    this.render();
  },
  render,
};

function rutaActual() {
  const ruta = location.hash.replace(/^#\/?/, '');
  for (const [patron, pantalla] of RUTAS) {
    const coincide = ruta.match(patron);
    if (coincide) return { pantalla, parametro: coincide[1] ?? null };
  }
  return { pantalla: null, parametro: null };
}

/** RNF2: sin sesión solo se ve P1; cada tipo de usuario solo entra a sus pantallas */
function rutaPermitida(pantalla) {
  const usuario = app.usuario;
  if (!usuario) return pantalla === P1 ? null : 'ingresar';
  const inicio = esSolicitante(usuario) ? 'solicitudes' : 'bandeja';
  if (!pantalla || pantalla === P1) return inicio;
  if (pantalla.acceso === 'solicitante' && !esSolicitante(usuario)) return inicio;
  if (pantalla.acceso === 'institucional' && esSolicitante(usuario)) return inicio;
  return null;
}

function render() {
  const { pantalla, parametro } = rutaActual();
  const redirigir = rutaPermitida(pantalla);
  if (redirigir) return app.ir(redirigir);

  pantalla.preparar?.(app, parametro);
  const usuario = app.usuario;
  let html = pantalla.vista(app, parametro);
  if (usuario) {
    const avisos = app.datos.avisos.filter((a) => a.usuario === app.idUsuario && !a.leido).length;
    const correos = app.datos.correos.filter((c) => c.usuario === app.idUsuario && !c.leido).length;
    html = encabezado(usuario, avisos, correos) + html;
  }
  $('#app').innerHTML = html;
  app.ui.panel = false;
  pantalla.conectar?.(app, parametro);
  if (usuario) conectarEncabezado();
}

function conectarEncabezado() {
  $('#btn-salir').addEventListener('click', () => app.salir());
  $('#btn-correo').addEventListener('click', () => {
    app.ui.correoSel = 0;
    app.ir('correo');
  });
  $('#btn-avisos').addEventListener('click', alternarPanel);
}

function alternarPanel() {
  $('#panel-avisos')?.remove();
  app.ui.panel = !app.ui.panel;
  $('#btn-avisos').setAttribute('aria-expanded', String(app.ui.panel));
  if (!app.ui.panel) return;
  const avisos = app.datos.avisos.filter((a) => a.usuario === app.idUsuario);
  document.body.insertAdjacentHTML('beforeend', panelAvisos(avisos));
  avisos.forEach((a) => (a.leido = true));
  guardarDatos(app.datos);
  $('.badge', $('#btn-avisos'))?.remove();
}

// Navegación con data-ir en cualquier botón de la página, y avisos del panel
document.addEventListener('click', (evento) => {
  const destino = evento.target.closest('[data-ir]');
  if (destino) return app.ir(destino.dataset.ir);
  const aviso = evento.target.closest('[data-abrir]');
  if (aviso) {
    $('#panel-avisos')?.remove();
    const n = aviso.dataset.abrir;
    return app.ir(esSolicitante(app.usuario) ? `solicitudes/${n}` : `bandeja/${n}`);
  }
  if (app.ui.panel && !evento.target.closest('#panel-avisos, #btn-avisos')) {
    $('#panel-avisos')?.remove();
    app.ui.panel = false;
  }
});

window.addEventListener('hashchange', () => {
  window.scrollTo(0, 0);
  render();
});

// Si la pestaña ya tenía una sesión abierta, se mantiene al recargar
const sesion = leerSesion();
if (sesion && app.datos.usuarios[sesion]) app.idUsuario = sesion;
render();
