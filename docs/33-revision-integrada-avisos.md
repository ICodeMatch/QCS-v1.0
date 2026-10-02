# B4 · Revisión integrada en Chromium, sin APK nueva

2 de octubre de 2026. Rama `implementacion/etapa1-qcs`. Base revisada: `55bc76bac3dd65ca79e787aa0892c2c5688dd1aa`.

## Recorrido ejecutado

Chromium real, interfaz móvil de 393 × 852, almacenamiento IndexedDB y cifrado real de QCS. Se creó una ficha de CodeMatch y un aviso de proveedor con código ausente del catálogo, seis fotografías PNG sintéticas y comentarios individuales. Se generaron y descargaron PDF, XLSX y DOCX desde los botones de la aplicación. Se retiró una fotografía conservando copia, y se volvió a descargar el PDF ya existente: huella idéntica al archivo previo.

Tras recargar la aplicación y volver a entrar con contraseña, el borrador, cinco fotos activas y sus comentarios permanecieron. Se descargó una copia cifrada y se inspeccionó: aviso con fotografía retirada conservada, tres informes con instantáneas de las seis fotos originales y datos de CodeMatch.

La copia se recuperó mediante la interfaz de QCS en un contexto de navegador nuevo, con almacenamiento inicialmente vacío. Aviso, fotos, comentarios e informes reaparecieron; el PDF recuperado mantuvo la misma huella. La ficha de CodeMatch también apareció en Biblioteca. No hubo errores JavaScript ni desbordamiento horizontal en las capturas comprobadas.

Las pantallas se renderizaron y revisaron visualmente: cabecera azul QCS, tarjetas blancas, pasos Datos/Fotos/Informe y acciones turquesa. Esta inspección verifica la implementación visible en Chromium, no constituye aprobación nueva del usuario ni validación visual en Android.

## Comprobación reproducible

`scripts/check-avisos-browser.mjs` repite el recorrido contra la aplicación compilada. El job web lo ejecuta y conserva capturas, archivos de ensayo, copia cifrada sintética y resultado JSON como evidencia `QCS-Avisos-revision-web`. No se necesita compilar Android para esta comprobación. Las 14 pruebas automatizadas anteriores siguen siendo una comprobación distinta.

Solo se han empleado datos y fotos sintéticos. Ninguna credencial empresarial, plantilla privada ni evidencia real del usuario se incorpora al ensayo. La contraseña fija del script pertenece exclusivamente a su almacenamiento de ensayo.

## Límites y siguiente entrega

Ninguna APK nueva en este avance. La APK 0.1.4 anterior no contiene Avisos. El bloque B4 tiene ahora revisión integrada web; la próxima APK de prueba podrá comprobarlo en OPPO. La secuencia es revisión integrada → APK de prueba → aceptación en OPPO, no exigir revisión móvil de un código que aún no se ha instalado.

Pendientes OPPO: cámara/galería reales, permisos, orientación, archivos grandes y memoria; guardar/compartir y abrir los tres formatos con aplicaciones del teléfono; cerrar Android durante captura/guardado y recuperar. La recuperación ejecutada es de la copia cifrada QCS actual en navegador: no valida las copias históricas v1/v2 ni la migración de la aplicación habitual.

P6, estados empresariales, monitor/KPIs, SharePoint/identidad/permisos y vínculos de proyecto siguen con los límites del documento 32. No se han añadido nuevos estados ni funciones por este ensayo.

## Coordinación con Claude

El resumen consolidado en `/projects/...` no está accesible desde el entorno de ChatGPT; se recibió su síntesis, no el documento completo. Las partes B5 recibidas en Texto pegado(7)/(8) se revisaron y T-CAP-01 se recalculó en Python Decimal con precisión de 60 dígitos: global 1.0150/0.8887, agrupada 1.8217/1.5950, R̄/d2 1.5676/1.3725. Son cálculos independientes, no una validación del módulo B5 en APK.

Mantener separado el contador de muestras numéricamente válidas del de conformes; no excluir datos fuera de tolerancia del cálculo de capacidad. P5 y D16 permanecen abiertos. Reconocimiento de atributos sensible a mayúsculas es propuesta; A6 es aviso heurístico de posible ruido, no autorización para redondear datos legítimos; A1 conserva signos; T-HOM-34 representa una homologación de 30 características.

B2 actual conserva las decisiones ya implementadas y comparaciones decimales; el ensayo genérico IEEE-754 de Claude no demuestra fallo de la app. Cotejar P7 contra el código vigente antes de pedir decisiones duplicadas. No se modifica B2/B5 en este avance.

## Condición SharePoint añadida por el usuario

Confirmado el 2 de octubre: actualmente el móvil solo podrá conectarse a SharePoint desde la red de la empresa; con la SIM no. Fuera de esa red QCS conserva datos e informes localmente. B7b debe verificar acceso al destino real mediante la configuración empresarial; no aceptar cualquier Wi-Fi como prueba de acceso. La condición queda registrada para la integración futura: este avance no activa SharePoint ni demuestra conectividad empresarial.

El usuario confirma que se necesita la seguridad empresarial aplicable, además de la restricción de red. La futura integración debe respetar autenticación, permisos y políticas de la empresa; no dar acceso por el solo hecho de estar en su red. No publicar ni incrustar credenciales empresariales en código, informes o registros de diagnóstico. El acceso local de QCS Prueba sigue siendo provisional, no identidad empresarial. La configuración y pruebas con cuentas, destino y políticas reales son necesarias antes de declarar validada la integración. No se eligen ahora roles, un método concreto de autenticación o excepciones a políticas que no se han recibido.
