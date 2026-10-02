# QCS Prueba CodeMatch 0.1.4 — entrega y continuación

Fecha: 2 de octubre de 2026. Autor: ChatGPT. El usuario decide requisitos y prioridades.

Este informe acompaña a la APK de prueba, no declara terminada la suite ni sustituye las pruebas en el OPPO A94 5G.

## Referencia de esta entrega

- Repositorio: https://github.com/ICodeMatch/QCS-v1.0
- Rama de implementación: `implementacion/etapa1-qcs`. El código está en `app/`; no usar los ZIP antiguos de `main` como base.
- Commit del código: `c0ed242861813948eece14260a30c66d5ccbe910`.
- Compilación: https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36999990414
- APK: `QCS-Prueba-CodeMatch-0.1.4.apk`, versión Android 0.1.4, código de versión 5.
- Identificador: `com.qualitycontrol.suite.stage1layout`, igual que la entrega 0.1.3. La APK entregada se firma con la misma clave de prueba conservada privadamente. No subir la clave ni sus credenciales al repositorio.

## Cambios de esta versión

1. Se conserva el layout histórico de CodeMatch recuperado y aceptado por el usuario.
2. La identificación muestra juntos «Pieza en desarrollo» (largo/ancho) y «Pieza plegada» (largo/ancho/alto). Desaparece el selector excluyente. Se pueden introducir datos parciales de uno o ambos bloques; los criterios introducidos se combinan.
3. Se mantienen los tres estados: Coincidencia, No evaluable y Descartada, decimales con coma o punto, límites inclusivos y orientación intercambiable de largo/ancho por bloque.
4. Sumatorio: ocho celdas, dos columnas por cuatro filas. Sus botones están en el bloque de pieza plegada. «Sumar largo» aplica el total a Largo de desarrollo; «Sumar ancho» aplica a Ancho de desarrollo. Antes de sustituir un valor existente se pide confirmación. No cambia las medidas plegadas ni aplica descuentos de plegado. Las cotas se conservan mientras está abierto el módulo. Este efecto corresponde al comportamiento conservado de la entrega anterior; contrastarlo con B2/T-SUM al revisar.
5. «Registros» global abre una pantalla propia de QCS, rotulada pendiente. No abre la biblioteca CodeMatch. La biblioteca sigue dentro del módulo.
6. Android usa los recursos de icono QCS con letras y tic, ya existentes: el manifiesto anterior apuntaba al recurso antiguo que solo mostraba el tic. Se corrige también el icono circular.
7. Se conserva «Herramientas de calidad» y el orden de Inicio: No conformidades, Homologaciones, Herramientas de calidad, Proyectos de calidad y CodeMatch.
8. Contraseña local: mínimo ocho caracteres, admite más. Recuperación y Recordarme siguen rotulados pendientes. Sin segundo acceso en CodeMatch.

## Funciones conservadas y límites

Se conservan importación XLSX/CSV, exportación Excel, biblioteca/fichas, consulta de planos y archivos técnicos, fotos de referencia múltiples desde cámara/galería reducidas y sin análisis automático, copias y acceso local. No declarar cada función validada en Android por conservarla en el código.

La suite empresarial no está terminada. Avisos, Homologaciones, Herramientas y Proyectos están pendientes de implementación. Registros global también. SharePoint, identidad empresarial, permisos de equipo y calendario compartido no están conectados. No presentar almacenamiento local como «Subido» o como SharePoint.

La instalación anterior 0.1.3 debe actualizarse con esta APK, sin desinstalar. Hacer antes una copia desde Ajustes. Las otras apps de prueba con identificadores distintos y la app habitual tienen almacenamientos independientes. No sustituir la app habitual hasta validar conservación/restauración de los datos reales.

## Pruebas

Nueve pruebas locales pasan. Incluyen conservación de fichas y fotos, copias cifradas, guardado/conflictos, acceso mínimo de ocho, regreso desde CodeMatch, Registros separado, suma exacta, búsqueda con ambos bloques, datos faltantes, orientación y borde decimal inclusivo.

El estado final de la compilación, pruebas de navegador y firma figura al final de este informe una vez completada la entrega.

Pendiente en el OPPO: actualización sobre 0.1.3 conservando datos, Atrás físico y de pantalla, cámara/galería/permisos, seis fotos y sustitución con fallo, importación/exportación y apertura de PDFs reales, guardado tras cerrar/reabrir, y restauración de una copia real antigua v1/v2. La compatibilidad de esas copias antiguas no está validada. No ejecutar borrados/restablecimientos para probar sin copia previa y confirmación.

## Orden de construcción de lo pendiente

1. **Cerrar esta entrega en el OPPO.** Registrar versión y resultado de los trece recorridos de aceptación existentes. Corregir incidencias reproducibles sin rehacer el layout aprobado. Confirmar especialmente sumatorio, ambos bloques, Atrás, copia real y conservación.
2. **Avisos/No conformidades.** Primer flujo completo: tipo interna/proveedor/cliente → datos con Denominación → fotos y comentarios → borrador y guardado → informe e histórico. Después monitor/filtros y exportaciones PDF/Excel/Word. Reutilizar los servicios comunes; conservar los diseños aprobados y no inventar reglas obligatorias pendientes de decisión.
3. **Registros global.** Dar acceso a los registros de módulos realmente implementados, con procedencia y navegación al registro. Definir su contenido frente a los monitores de cada módulo antes de construirlo. No convertirlo en biblioteca CodeMatch ni duplicar bases de datos.
4. **Homologaciones.** Piezas y proveedores; leer las plantillas PVR reales facilitadas por el usuario, detectar cotas/límites y permitir mapeo/vista previa. Respetar numeración y estructura de cada plantilla. Medición guiada/libre, sesión recuperable e informe; distinguir pendientes, resultado medido y aprobación. No modificar el Excel original ni publicar plantillas corporativas.
5. **Herramientas de calidad.** Cp/Cpk, Pp/Ppk y Cm/Cmk con importación, método/subgrupos visibles, gráficos y exportaciones. Contrastar motor con los esperados documentados CAP-S2/CAP-S3. No confundir variación dentro de subgrupos y global ni aprobar por índices redondeados.
6. **Proyectos de calidad.** PDCA, 8D, 5 porqués/Ishikawa, FAC, acciones/responsables/fechas y vínculos con Avisos/Homologaciones/estudios. Reutilizar B6 recibido y revisado; no pedir de nuevo un bloque ya entregado. FAC documental no equivale a procedimiento empresarial aprobado.
7. **Integración empresarial.** Preparar y probar SharePoint con la autorización y configuración de la empresa, identidad/permisos y colaboración real. No contratar APIs ni servicios adicionales. La versión local puede avanzar mientras esta configuración siga pendiente, rotulándola correctamente.

## Reparto para continuar sin duplicar trabajo

- **ChatGPT:** mantiene la implementación en esta rama, conservación de datos, servicios compartidos, pruebas técnicas, compilación y firma. Siguiente módulo propuesto: Avisos, después de corregir las incidencias de esta APK.
- **Claude:** revisión de la entrega contra B2/T-SUM y la lista de aceptación vigente; identificar contradicciones concretas con pantalla/campo/caso. Verificar si el cuerpo completo de B5 está entregado y completar únicamente lo que falte; revisar el flujo de Avisos y sus casos ya documentados antes de implementarlo. B1/B2/B3/B4/B6 ya recibidos como documentos: no reemitirlos ni cambiar defaults D1–D25 sin decisión del usuario.
- **Usuario:** pruebas del dispositivo, prioridad y decisiones de comportamiento. Un fallo de una prueba no autoriza por sí solo rediseñar la app.
- Coordinación: informes por el usuario mientras Claude no publique un comentario de prueba verificable en GitHub. Leer una página pública no demuestra escritura ni vigilancia continua. No detener QCS esperando esa integración.
- Para cada tarea: indicar propietario, rama, commit de referencia, archivos afectados y pruebas. Antes de editar, comprobar el último estado de la rama. No modificar los ZIP/workflow de `main`, fusionar ni tocar trabajo ajeno durante esta continuación.

## Mensaje listo para Claude

Claude, continúa desde la rama implementacion/etapa1-qcs y el commit de esta entrega. Revisa los cambios contra B2/T-SUM y los trece recorridos de aceptación, distinguiendo lectura de código, prueba local y prueba en el móvil. Indica contradicciones concretas, sin ampliar requisitos. Comprueba el cuerpo completo de B5 y completa solo lo pendiente; luego revisa Avisos como siguiente flujo de implementación. Reutiliza B1/B2/B3/B4/B6 existentes. ChatGPT mantiene código, compilación, firma y conservación; tú revisión funcional y documentación pendiente. No cambies código, ZIPs ni workflows, no contrates servicios y no afirmes comunicación automática con ChatGPT.

## Resultado final verificado

- GitHub Actions: ejecución 36999990414 completada con éxito sobre el commit c0ed242861813948eece14260a30c66d5ccbe910.
- Nueve pruebas automatizadas pasan en CI. Navegador Chromium a 393×852: acceso, Inicio, CodeMatch, sumatorio, ficha conservada al volver, navegación interna, Registros separado y Ajustes; sin errores de página en esos recorridos. Capturas revisadas visualmente de CodeMatch y Registros.
- Compilación Android correcta. Artefacto CI 11223152715. La entrega descargable se firma después de descargar ese artefacto; no confundir el APK debug de Actions con el APK entregado aquí.
- Firma APK verificada v1/v2/v3. Certificado SHA-256 igual a 0.1.3: `151f60e27b28b29fc98797366c74bd7ce27021ad3ad7bc3c1ea51fdb37127193`.
- APK entregada: 7.543.397 bytes. SHA-256: `c33fe99373f585db43c7fef75ad0d7cdd13e8268d459f7b654edc596e2f5499d`.
- No se han ejecutado pruebas en el OPPO ni declarado cerrados sus trece recorridos.

## Instalación y primera comprobación del usuario

1. En QCS Prueba CodeMatch 0.1.3, guardar una copia desde Ajustes.
2. Descargar e instalar QCS-Prueba-CodeMatch-0.1.4.apk sobre esa misma app, sin desinstalarla. No hace falta instalar los documentos del informe.
3. Abrir con la contraseña existente y comprobar que siguen las fichas/fotos guardadas.
4. Revisar el icono QCS, las medidas juntas, el destino del sumatorio, Registros global y los botones Volver.
5. Registrar cualquier incidencia con la versión 0.1.4, pantalla, pasos, resultado esperado y observado. No borrar datos para resolver un fallo.
