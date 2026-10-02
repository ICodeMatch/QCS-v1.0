# QCS Prueba 0.1.5 · Avisos · Informe para Claude

2 de octubre de 2026. Rama: implementacion/etapa1-qcs. Código de entrega: 71b8811be10e42566eac2a4c103048624b4c040d.

## Avance de aplicación

Primer bloque Avisos disponible para pruebas: Internas/Proveedor/Cliente; Datos → Fotos → Informe; autoguardado y recuperación de borradores; múltiples fotografías con comentarios; retirada con confirmación y copia conservada; consulta por texto/tipo/fechas. Generación PDF, Excel y Word con instantánea y archivo cifrados independientes del borrador. Volver a guardar o compartir utiliza el archivo conservado. Editar el aviso o retirar fotos no cambia los informes anteriores. Las copias cifradas incluyen los avisos y los informes.

CodeMatch conserva layout, búsqueda con desarrollo y plegada simultáneos, sumatorio 2×4, Biblioteca, fotos de referencia y herramientas existentes. No se introducen decisiones nuevas de P7 ni se activa reconocimiento automático de fotografías.

Los informes son BORRADOR y locales. No se asigna número SAP ni se simula subida. Monitor/KPIs, estados P6, proyectos/FAC y servicios empresariales siguen pendientes.

## Evidencia comprobada

14 pruebas automatizadas pasan. Revisión integrada en Chromium real y GitHub Actions: aviso con seis fotos sintéticas y comentarios; generación y descarga de PDF/XLSX/DOCX; reapertura; retirada de una foto con copia; recuperación cifrada en almacenamiento nuevo con aviso, informes y ficha de CodeMatch. El PDF conserva su huella después de retirar la foto y después de recuperar la copia. Sin errores JavaScript ni desbordamiento horizontal comprobado. Pantallas renderizadas e inspeccionadas.

PDF de ensayo renderizado, textos finales y fotografía visibles. XLSX reabierto con ExcelJS; DOCX inspeccionado como OpenXML. Estas pruebas no sustituyen apertura en las aplicaciones del móvil, fotos reales, permisos, memoria u orientación. Copias históricas v1/v2 no validadas; no sustituir la aplicación habitual.

## Condición empresarial confirmada

SharePoint solo por la red de la empresa, no mediante SIM. La futura integración debe respetar identidad, permisos y políticas empresariales. Cualquier Wi-Fi no acredita red empresarial. Fuera de ella se conserva trabajo local. SharePoint todavía no está conectado; el acceso local de prueba es provisional.

## Prueba breve en OPPO

1. Antes de actualizar, descargar una copia cifrada desde Ajustes y conservarla con su contraseña. Instalar 0.1.5 sobre QCS Prueba anterior, sin desinstalar ni borrar almacenamiento. Verificar etiqueta 0.1.5 y que Biblioteca conserve las fichas previas.
2. Abrir No conformidades, crear aviso de proveedor. Introducir datos parciales, salir a Inicio y volver desde Borradores. Comprobar conservación y Volver entre pasos e Inicio.
3. Añadir seis fotos reales combinando cámara/galería; escribir comentarios distintos. Cerrar normalmente y volver a abrir: datos, fotos y comentarios deben mantenerse.
4. Generar PDF, Excel y Word; elegir un destino y abrir cada archivo con las aplicaciones del teléfono. Revisar imágenes, orientación y comentarios. Cancelar una operación de compartir y comprobar que el informe sigue disponible.
5. Cambiar el aviso o retirar una foto con confirmación; volver a guardar un informe anterior. Debe conservar el contenido anterior; el informe nuevo debe recoger los cambios.
6. Descargar copia cifrada del conjunto. Comprobar su recuperación desde Ajustes sin sustituir registros existentes. La prueba de restauración en almacenamiento nuevo ya realizada fue en navegador; no borrar datos del móvil para repetirla.
7. Anotar versión, paso, mensaje exacto y resultado. Si falla, conservar datos/copia y comunicar la incidencia; no desinstalar como solución.

## Límites conocidos

El PDF usa Helvetica estándar. Caracteres incompatibles se rechazan con aviso sin perder el borrador; Word/Excel siguen disponibles. Originales de evidencia e instantáneas aumentan tamaño y uso de memoria: probar fotos grandes en OPPO. Recuperación de contraseña y Recordarme pendientes. Esta entrega sigue siendo de prueba.

## Cómo seguimos construyendo

ChatGPT: cerrar aceptación B4 en dispositivo, corregir fallos y continuar por bloques con conservación, servicios y pruebas. No compilar una APK por cada ajuste; entregar al completar un bloque sustancial revisado.

Claude: conservar documentación consolidada y revisar evidencia frente a especificación sin duplicar cambios de código. P5 y D16 de B5 abiertos; reconocimiento sensible a mayúsculas propuesto, no aprobado. Muestras numéricamente válidas separadas de conformes: incluir las mediciones fuera de tolerancia en los cálculos de capacidad. T-CAP-01 recalculado independientemente por ChatGPT: global 1.0150/0.8887, agrupada 1.8217/1.5950, R̄/d2 1.5676/1.3725. No equivale a validar B5 en APK.

B2: cotejar P7 con código y decisiones vigentes. El ensayo IEEE-754 de Claude no demuestra fallo actual de una búsqueda que usa comparación decimal. No rediseñar el layout aprobado ni convertir propuestas D en requisitos.

Después de B4: reutilizar especificaciones existentes para Homologaciones y herramientas de capacidad. Recibir plantillas reales para verificar mapeos, identificadores y campos sin inferir unidades. No fijar el método P5 ni políticas D16; avanzar partes independientes. Proyectos y vínculos después; SharePoint cuando se disponga de configuración empresarial real. No contratar APIs ni servicios adicionales.

## Trazabilidad de la entrega

Versión Android: 0.1.5; versionCode 6. Identificador: com.qualitycontrol.suite.stage1layout. Firma de entrega comprobada: mismo certificado que 0.1.4. Manifest binario comprobado: mismo identificador, versión 0.1.5 y código 6, superior al 5 anterior. El bundle incluido contiene Avisos e informes.

GitHub Actions 37009212251: jobs web y Android completados correctamente, incluida revisión integrada Avisos y comprobaciones de CodeMatch. APK final firmada y verificada: QCS-Prueba-Avisos-0.1.5.apk, 7989861 bytes. SHA-256: bc436210e4c323d666e7001aec5154966c6cf905dd8ac66c6eae65ba41c3ca40. Certificado SHA-256: 151f60e27b28b29fc98797366c74bd7ce27021ad3ad7bc3c1ea51fdb37127193. Instalación y aceptación OPPO pendientes.
