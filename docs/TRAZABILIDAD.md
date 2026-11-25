# Trazabilidad: requerimientos → código

Relación entre los requerimientos y reglas de negocio del documento (Fases 2 y 3) y el lugar del prototipo donde se cumplen.

## Requerimientos funcionales

| Req. | Descripción | Pantalla | Código |
|---|---|---|---|
| RF1 | Solicitar constancia en línea con número de seguimiento | P2, P4 | `pantallas/p2-constancia.js`, `reglas/flujo.js` → `crearSolicitud` |
| RF2 | Justificar ausencia adjuntando comprobante | P3 | `pantallas/p3-justificacion.js`, `reglas/validaciones.js` → `validarJustificacion`, `validarArchivo` |
| RF3 | Consultar el estado y recibir avisos | P4, P5, campana | `pantallas/p4-mis-solicitudes.js`, `pantallas/p5-correo.js`, `servicios/notificaciones.js` |
| RF4 | Bandeja institucional para revisar, aprobar o rechazar | P6, P7 | `pantallas/p6-bandeja.js`, `pantallas/p7-detalle.js`, `reglas/flujo.js` → `aprobar`, `rechazar` |
| RF5 | Generar el documento con sello y archivarlo en el expediente | P8 | `servicios/documentos.js` → `htmlDocumento`, `codigoQr`; `pantallas/p8-expediente.js` |

## Requerimientos no funcionales

| Req. | Descripción | Dónde |
|---|---|---|
| RNF1 | Uso desde computadora o celular; tarea completada en 5 minutos o menos | `css/pantallas.css` (puntos de corte 860 px y 600 px; tabla apilada en móvil); envío habilitado solo con los datos completos y errores junto a cada campo |
| RNF2 | Acceso por rol | `main.js` → `rutaPermitida`; `reglas/permisos.js` → `visibles`, `puedeVer`, `pendientePara` |
| RNF3 | Respuesta en 3 s o menos y PDF en 10 s o menos | Todo se procesa en el navegador sin esperar a un servidor; el PDF sale de la impresión del navegador (`pantallas/p8-expediente.js`) |

## Reglas de negocio

| Regla | Descripción | Código |
|---|---|---|
| RN1 | Campos obligatorios completos antes de enviar | `reglas/validaciones.js` → `validarConstancia`, `validarJustificacion` |
| RN2 | Justificación dentro de 3 días hábiles | `reglas/fechas.js` → `fechaLimite`, `dentroDelPlazo`; `config.js` → `PLAZO_DIAS_HABILES` |
| RN3 | Rechazo con observación obligatoria | `reglas/validaciones.js` → `validarRechazo`; también se valida en `reglas/flujo.js` → `rechazar` |
| RN4 | Sello solo después de la aprobación de Dirección | `reglas/flujo.js` → `aprobar` (Secretaría pasa la constancia a Dirección); `servicios/documentos.js` marca BORRADOR mientras no esté lista |
| RN5 | Aviso en cada cambio de estado | `servicios/notificaciones.js` → `notificarFamilia`, `notificarRol` |
| RN6 | Historial con fecha y hora | `historial` de cada solicitud en `reglas/flujo.js`; se muestra con `ui/componentes.js` → `historial` |

## Componentes de la arquitectura (Fase 3)

| Componente | Archivos |
|---|---|
| C1 Autenticación y roles | `pantallas/p1-ingresar.js`, `datos/almacen.js` (sesión), `reglas/permisos.js` |
| C2 Constancias | `pantallas/p2-constancia.js`, `reglas/flujo.js` |
| C3 Justificaciones | `pantallas/p3-justificacion.js`, `reglas/fechas.js` |
| C4 Documentos PDF y expediente | `servicios/documentos.js`, `pantallas/p8-expediente.js` |
| C5 Bandeja institucional | `pantallas/p6-bandeja.js`, `pantallas/p7-detalle.js` |
| C6 Seguimiento | `pantallas/p4-mis-solicitudes.js`, `ui/componentes.js` → `barraAvance` |
| C7 Bitácora e indicadores | `historial` de cada solicitud, contadores de P6, "Tiempo del trámite" en P7 (`milisegundosTramite`) |
| C8 Notificaciones | `servicios/notificaciones.js`, `pantallas/p5-correo.js`, panel de avisos |

## Estados de una solicitud

```
Recibida → En revisión → Aprobada → Lista
                      ↘ Rechazada
```

- **Recibida**: al enviarla (`crearSolicitud`).
- **En revisión**: cuando Secretaría la abre (`tomarSolicitud`).
- **Aprobada → Lista**: cuando Dirección (constancias) o el profesor guía (justificaciones) aprueba; se genera el código de verificación y queda en el expediente.
- **Rechazada**: en cualquier revisión, siempre con observación.

## Ajustes de la revisión del prototipo

La versión 1 se conserva en `versiones/prototipo-v1.html`. Esta versión incluye los siete ajustes aprobados en el acta de revisión:

| Obs. | Ajuste | Código |
|---|---|---|
| O1 | Fecha límite exacta para justificar | `pantallas/p3-justificacion.js` → aviso `#plazo` |
| O2 | Tarjeta fija con el número de solicitud | `pantallas/p4-mis-solicitudes.js` → `.ok-card` |
| O3 | Formatos permitidos y tamaño máximo de 5 MB | `pantallas/p3-justificacion.js`; `config.js` → `MAX_ARCHIVO_MB`, `FORMATOS_PERMITIDOS` |
| O4 | Encabezado compacto en el celular | `css/componentes.css` (regla de 600 px) |
| O5 | Contadores de pendientes en la bandeja | `pantallas/p6-bandeja.js` → `.counts` |
| O6 | Confirmación antes de aprobar o rechazar | `pantallas/p7-detalle.js`; `ui/componentes.js` → `confirmar` |
| O7 | Tiempo del trámite | `pantallas/p7-detalle.js`; `reglas/flujo.js` → `milisegundosTramite` |

Las observaciones O8 (avisos por WhatsApp o SMS) y O9 (firma digital certificada) quedaron en el backlog de mejoras futuras.
