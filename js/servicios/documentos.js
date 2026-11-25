/**
 * C4 · Documentos (RF5): constancia o comprobante con sello electrónico y código de verificación.
 * Antes de la aprobación de Dirección la constancia se muestra como borrador, sin sello (RN4).
 */
import { esc, fecha, fechaHora, numero } from '../ui/util.js';

export function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const azar = crypto.getRandomValues(new Uint8Array(8));
  const texto = Array.from(azar, (b) => letras[b % letras.length]).join('');
  return `${texto.slice(0, 4)}-${texto.slice(4)}`;
}

/** Código QR ilustrativo generado a partir del código de verificación */
export function codigoQr(codigo) {
  let semilla = 0;
  for (const c of codigo) semilla = (semilla * 31 + c.charCodeAt(0)) >>> 0;
  const lado = 21;
  let celdas = '';
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const esquina = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      let lleno;
      if (esquina) {
        const fx = x > 13 ? x - 14 : x;
        const fy = y > 13 ? y - 14 : y;
        lleno = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5);
      } else {
        semilla = (semilla * 1103515245 + 12345) >>> 0;
        lleno = (semilla >> 16) & 1;
      }
      if (lleno) celdas += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return `<svg width="96" height="96" viewBox="-1 -1 23 23" role="img" aria-label="Código QR de verificación"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#111">${celdas}</g></svg>`;
}

const CUERPO = {
  'Constancia de estudio': (e, anio) => `es estudiante regular de esta institución, matriculado(a) en la sección ${esc(e.seccion)} durante el curso lectivo ${anio}.`,
  'Constancia de matrícula': (e, anio) => `se encuentra debidamente matriculado(a) en la sección ${esc(e.seccion)} para el curso lectivo ${anio}.`,
  'Constancia de notas': (e) => `cursa la sección ${esc(e.seccion)} y sus calificaciones constan en el expediente académico de la institución.`,
  'Constancia de conducta': (e) => `cursa la sección ${esc(e.seccion)} y no registra boletas de conducta en el presente curso lectivo.`,
};

const membrete = (titulo, fechaTexto) =>
  `<div class="lh"><div><b>Colegio Técnico Profesional San Sebastián</b><br>Dirección</div><div style="text-align:right">${titulo}<br>${fechaTexto}</div></div>`;

export function htmlDocumento(datos, s) {
  const e = datos.estudiantes[s.estudiante];
  const emitido = s.estado === 'Lista' && s.documento;

  if (s.tipo === 'constancia') {
    const cuerpo = CUERPO[s.detalle.tipoConstancia](e, new Date().getFullYear());
    return `<div class="doc">${emitido ? '' : '<div class="wm">BORRADOR · SIN SELLO</div>'}
      ${membrete(`Constancia ${numero(s.numero)}`, emitido ? fecha(s.documento.emitido) : 'Pendiente de aprobación')}
      <h3>${esc(s.detalle.tipoConstancia.toUpperCase())}</h3>
      <p>La Dirección hace constar que <b>${esc(e.nombre)}</b>, cédula <b>${esc(e.cedula)}</b>, ${cuerpo}</p>
      <p>Se extiende a solicitud de la persona interesada${s.detalle.motivo ? `, para efectos de: ${esc(s.detalle.motivo)}` : ''}.</p>
      <div class="foot">
        <div class="seal">${emitido ? `Sellado electrónicamente por la Dirección<br>${fechaHora(s.documento.emitido)}` : 'Espacio para el sello electrónico<br>(se aplica solo después de la aprobación de Dirección)'}</div>
        <div style="text-align:center">${emitido ? codigoQr(s.documento.codigo) : '<div class="qr-vacio">QR</div>'}<div style="font-size:12px">Código: ${emitido ? esc(s.documento.codigo) : '—'}</div></div>
      </div></div>`;
  }

  return `<div class="doc">
    ${membrete(`Justificación ${numero(s.numero)}`, fecha(s.documento.emitido))}
    <h3>COMPROBANTE DE JUSTIFICACIÓN DE AUSENCIA</h3>
    <p>Se registra como <b>justificada</b> la ausencia de <b>${esc(e.nombre)}</b> (sección ${esc(e.seccion)}) del ${fecha(s.detalle.desde)} al ${fecha(s.detalle.hasta)}, por motivo de ${esc(s.detalle.motivo.toLowerCase())}.</p>
    <p>Comprobante revisado: ${esc(s.detalle.archivo.nombre)}.</p>
    <div class="foot">
      <div class="seal">Firmado electrónicamente por el profesor guía<br>${fechaHora(s.documento.emitido)}</div>
      <div style="text-align:center">${codigoQr(s.documento.codigo)}<div style="font-size:12px">Código: ${esc(s.documento.codigo)}</div></div>
    </div></div>`;
}
