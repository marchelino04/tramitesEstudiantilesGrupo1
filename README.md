# Trámites Estudiantiles · CTP San Sebastián

Prototipo funcional del sistema en línea para **solicitar constancias** y **justificar ausencias** del Colegio Técnico Profesional San Sebastián. Corresponde a la Fase 4 (Construcción y revisión del prototipo) del proyecto del curso Procesos de Ingeniería de Software.

Está hecho con **HTML, CSS y JavaScript** (módulos ES), sin frameworks ni instalación. Los datos se guardan en el navegador (`localStorage`), así que las solicitudes que se crean siguen ahí al recargar la página.

## Cómo abrirlo

Los módulos de JavaScript no funcionan si se abre `index.html` con doble clic. Use una de estas opciones:

**Visual Studio Code**
1. Instale la extensión **Live Server** (Ritwick Dey).
2. Abra la carpeta del proyecto.
3. Clic derecho en `index.html` → **Open with Live Server**.

**Python** (si lo tiene instalado)
```bash
python -m http.server 8000
```
y abra <http://localhost:8000>.

## Publicarlo en GitHub Pages

1. Cree un repositorio en GitHub y suba todos los archivos de esta carpeta (con `index.html` en la raíz).
2. En el repositorio: **Settings → Pages**.
3. En *Source* elija **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarde.
4. En uno o dos minutos queda publicado en `https://<usuario>.github.io/<repositorio>/`.

## Perfiles de prueba

En la pantalla de inicio se elige el perfil con el que se ingresa:

| Perfil | Rol | Qué puede hacer |
|---|---|---|
| Ana Rodríguez Mora | Estudiante | Solicitar constancias, justificar ausencias, ver estado y documentos |
| Laura Mora Castro | Encargado | Lo mismo que el estudiante, en nombre de su hijo(a) |
| Karla Solano Brenes | Secretaría | Revisar todas las solicitudes, preparar constancias y validar justificaciones |
| MSc. Jorge Arias Ulate | Dirección | Aprobar constancias y aplicar el sello electrónico |
| Prof. Daniel Quesada Mora | Profesor guía (10-2) | Firmar las justificaciones de su sección |

El enlace **Restablecer datos de ejemplo** de la pantalla de inicio deja todo como al principio.

### Recorrido sugerido

1. Ingrese como **Laura**, solicite una constancia y justifique una ausencia.
2. Ingrese como **Karla**: abra las solicitudes (pasan a *En revisión*) y apruébelas.
3. Ingrese como **Daniel** y firme la justificación.
4. Ingrese como **Jorge**, revise el borrador de la constancia y apruébela.
5. Vuelva como **Laura**: revise los avisos, el correo y descargue la constancia sellada.

## Estructura

```
index.html                  Página única; carga los estilos y js/main.js
css/
  base.css                  Variables de color, tipografía, botones y formularios
  componentes.css           Encabezado, tarjetas, chips de estado, historial, modal
  pantallas.css             Diseño de cada pantalla y versión para móvil
js/
  main.js                   Rutas (#/...), control de acceso por rol y dibujo de pantallas
  config.js                 Estados, roles, catálogos y parámetros (plazo, tamaño de archivo)
  datos/
    semilla.js              Datos de ejemplo
    almacen.js              Guardado en localStorage y sesión
  reglas/                   Reglas de negocio (sin interfaz)
    validaciones.js         RN1, RN2, RN3
    fechas.js               Días hábiles y fecha límite
    permisos.js             Qué ve y qué resuelve cada rol
    flujo.js                Cambios de estado de las solicitudes
  servicios/
    notificaciones.js       Avisos en el sistema y correos (RN5)
    documentos.js           Constancia, comprobante, código de verificación y QR
  ui/
    componentes.js          Piezas reutilizables (encabezado, chips, historial, confirmación)
    util.js                 Formato de fechas y números
  pantallas/                Una pantalla por archivo (P1 a P8)
img/favicon.svg
versiones/prototipo-v1.html Primera versión del prototipo, antes de la revisión
docs/TRAZABILIDAD.md        Relación entre requerimientos, reglas y código
```

Las capas siguen la arquitectura de componentes de la Fase 3: las **pantallas** solo muestran información y llaman a las **reglas** y **servicios**; las reglas no dependen de la interfaz y los **datos** se leen y guardan en un solo lugar.

## Alcance del prototipo

- El correo y los avisos se muestran dentro del sistema (pantalla P5 y campana); no se envían correos reales.
- "Descargar PDF" abre la ventana de impresión del navegador; ahí se elige **Guardar como PDF**.
- El sello electrónico y el código QR identifican el documento; la firma digital certificada (BCCR) queda como integración futura.
- Los datos viven en el navegador de cada persona; no hay servidor ni base de datos compartida.
