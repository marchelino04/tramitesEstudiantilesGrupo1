/**
 * Datos de ejemplo con los que inicia el prototipo. Todos los nombres son ficticios.
 * Las fechas se calculan a partir de hoy para que los plazos y tiempos sean realistas.
 */

const hace = (dias, horas = 0, minutos = 0) =>
  new Date(Date.now() - ((dias * 24 + horas) * 60 + minutos) * 60000).toISOString();

const paso = (estado, fecha, por, nota = '') => ({ estado, fecha, por, nota });

export function crearDatosIniciales() {
  return {
    version: 1,
    secuencia: 13,

    usuarios: {
      ana: { nombre: 'Ana Rodríguez Mora', rol: 'estudiante', correo: 'ana.rodriguez@est.ejemplo.cr', estudiante: 'E1' },
      laura: { nombre: 'Laura Mora Castro', rol: 'encargado', correo: 'laura.mora@ejemplo.cr', estudiante: 'E1' },
      karla: { nombre: 'Karla Solano Brenes', rol: 'secretaria', correo: 'secretaria@ctp.ejemplo.cr' },
      jorge: { nombre: 'MSc. Jorge Arias Ulate', rol: 'direccion', correo: 'direccion@ctp.ejemplo.cr' },
      daniel: { nombre: 'Prof. Daniel Quesada Mora', rol: 'guia', correo: 'd.quesada@ctp.ejemplo.cr', seccion: '10-2' },
    },

    estudiantes: {
      E1: { nombre: 'Ana Rodríguez Mora', cedula: '1-1890-0456', seccion: '10-2' },
      E2: { nombre: 'Luis Jiménez Rojas', cedula: '6-0512-0877', seccion: '11-1' },
      E3: { nombre: 'María Vargas Solís', cedula: '2-0934-0211', seccion: '9-3' },
      E4: { nombre: 'Diego Solís Chaves', cedula: '1-1902-0390', seccion: '10-2' },
    },

    solicitudes: [
      {
        numero: 9,
        tipo: 'constancia',
        estudiante: 'E1',
        solicitante: 'laura',
        correoAvisos: 'laura.mora@ejemplo.cr',
        estado: 'Rechazada',
        rolPendiente: null,
        creada: hace(9, 3),
        detalle: { tipoConstancia: 'Constancia de notas', motivo: 'Trámite de beca' },
        observacion: 'Las notas del III periodo aún no están cerradas; puede solicitarla a partir del 2 de diciembre.',
        historial: [
          paso('Recibida', hace(9, 3), 'Laura Mora Castro', 'Solicitud enviada en línea'),
          paso('En revisión', hace(9, 1), 'Secretaría', 'Secretaría abrió la solicitud'),
          paso('Rechazada', hace(8, 5), 'Secretaría', 'Las notas del III periodo aún no están cerradas; puede solicitarla a partir del 2 de diciembre.'),
        ],
      },
      {
        numero: 10,
        tipo: 'justificacion',
        estudiante: 'E1',
        solicitante: 'ana',
        correoAvisos: 'ana.rodriguez@est.ejemplo.cr',
        estado: 'Lista',
        rolPendiente: null,
        creada: hace(6, 4),
        detalle: {
          desde: hace(7),
          hasta: hace(7),
          motivo: 'Salud',
          comentario: 'Cita médica en la clínica',
          archivo: { nombre: 'dictamen_medico.pdf', tipo: 'application/pdf', tamano: 184000 },
        },
        documento: { codigo: 'K7PQ-3MXA', emitido: hace(6, 1) },
        historial: [
          paso('Recibida', hace(6, 4), 'Ana Rodríguez Mora', 'Solicitud enviada en línea'),
          paso('En revisión', hace(6, 3), 'Secretaría', 'Cumple requisitos; se avisó al profesor guía'),
          paso('Aprobada', hace(6, 1), 'Prof. Daniel Quesada Mora', 'Firma electrónica del profesor guía'),
          paso('Lista', hace(6, 1), 'Sistema', 'Archivada en el expediente digital'),
        ],
      },
      {
        numero: 11,
        tipo: 'constancia',
        estudiante: 'E3',
        solicitante: null,
        correoAvisos: 'maria.vargas@est.ejemplo.cr',
        estado: 'Lista',
        rolPendiente: null,
        creada: hace(2, 2, 40),
        detalle: { tipoConstancia: 'Constancia de estudio', motivo: 'Pensión alimentaria' },
        documento: { codigo: 'R2WD-8HJN', emitido: hace(2, 2, 31) },
        historial: [
          paso('Recibida', hace(2, 2, 40), 'María Vargas Solís', 'Solicitud enviada en línea'),
          paso('En revisión', hace(2, 2, 35), 'Secretaría', 'Datos verificados; enviada a Dirección'),
          paso('Aprobada', hace(2, 2, 31), 'Dirección', 'Constancia aprobada'),
          paso('Lista', hace(2, 2, 31), 'Sistema', 'Sello electrónico y código QR aplicados'),
        ],
      },
      {
        numero: 12,
        tipo: 'constancia',
        estudiante: 'E2',
        solicitante: null,
        correoAvisos: 'luis.jimenez@est.ejemplo.cr',
        estado: 'En revisión',
        rolPendiente: 'direccion',
        creada: hace(0, 1, 10),
        detalle: { tipoConstancia: 'Constancia de matrícula', motivo: 'Licencia de conducir' },
        historial: [
          paso('Recibida', hace(0, 1, 10), 'Luis Jiménez Rojas', 'Solicitud enviada en línea'),
          paso('En revisión', hace(0, 0, 55), 'Secretaría', 'Datos verificados; enviada a Dirección'),
        ],
      },
      {
        numero: 13,
        tipo: 'justificacion',
        estudiante: 'E4',
        solicitante: null,
        correoAvisos: 'diego.solis@est.ejemplo.cr',
        estado: 'Recibida',
        rolPendiente: 'secretaria',
        creada: hace(0, 0, 25),
        detalle: {
          desde: hace(1),
          hasta: hace(1),
          motivo: 'Asunto familiar',
          comentario: 'Fallecimiento de un familiar',
          archivo: { nombre: 'acta_defuncion.jpg', tipo: 'image/jpeg', tamano: 420000 },
        },
        historial: [paso('Recibida', hace(0, 0, 25), 'Diego Solís Chaves', 'Solicitud enviada en línea')],
      },
    ],

    avisos: [],
    correos: [
      {
        usuario: 'laura',
        para: 'laura.mora@ejemplo.cr',
        numero: 9,
        asunto: 'Solicitud N.° 0009: fue rechazada (ver observación)',
        fecha: hace(8, 5),
        leido: true,
      },
      {
        usuario: 'ana',
        para: 'ana.rodriguez@est.ejemplo.cr',
        numero: 10,
        asunto: 'Solicitud N.° 0010: está lista y archivada',
        fecha: hace(6, 1),
        leido: true,
      },
    ],
    /** Vista previa de los comprobantes en imagen (se guardan solo si pesan poco) */
    archivos: {},
  };
}
