# B3 Homologaciones — primer avance de código, sin APK

2 de octubre de 2026. Rama implementacion/etapa1-qcs.

## Código preparado

Lectura XLSX local conservando archivo íntegro y SHA-256; valores literales, fórmulas, caché y direcciones separados. Propuesta de mapeo por etiquetas y revisión manual para orientación, campos, rangos y escala de porcentajes. Vista previa y confirmación explícita antes de incorporar características a una sesión. Identificadores literales, vacíos y duplicados conservados con claves internas separadas. Configuración reutilizable y firma estructural independiente del hash del archivo.

Sesiones cifradas con cabecera opcional, medición guiada y libre, posiciones conservadas al saltar, corrección con historial antes/después, autoguardado y reapertura. Salida bloqueada si guardar falla. Valores válidos separados de valores conformes. Decimales inclusivos con signo; ausencia de tolerancia no se convierte en cero. Muestras requeridas y completitud siguen sin definir; aprobación humana pendiente. Original descargable sin modificación. Restauración admite el nuevo tipo de registro.

## Evidencia realizada

- Lectura local de las plantillas reales PVR.01 y PVR.02: respectivamente 15 y 23 características, con 30 posiciones por característica. No se publican los archivos corporativos.
- SHA-256 leídos coinciden con los originales registrados; ninguna escritura en los Excel.
- 19 pruebas locales pasan: 14 existentes y cinco nuevas para reglas exactas, importación variable y procedencia, guardado/historial/conflicto/copia cifrada, UI con edición durante guardado, fallo y reapertura, y formato numérico/fecha sin cambiar el valor fuente.
- Compilación web correcta.

Estas pruebas no equivalen a aceptación en OPPO ni cierran todo B3. El análisis de Claude recibido por resumen declara alineación documental y recorridos preparados, no ejecutados; no se ha leído aquí su archivo actualizado completo.

## Pendiente antes de una APK del bloque

Prueba integrada en Chromium realizada el 03/10: importación/cancelación, vista previa confirmada, guiado/libre, saltar, corregir, reabrir y recuperar copia cifrada con original idéntico, cero errores JavaScript y sin desbordamiento global. Evidencia sintética reproducible mediante scripts/check-homologaciones-browser.mjs. Pendiente contraste completo de cabeceras y formatos de plantillas reales; revisar cancelación y reutilización de configuración. Informes y aprobación de Homologaciones aún no implementados. Salida QCS/PVR, muestras requeridas, exclusiones, calibración y operativa de proveedores siguen abiertas. No inventar reglas ni presentar estos controles como completos.

El momento de guardar borrador es una elección técnica provisional y reversible: se conserva la sesión local al crearla y las ediciones por autoguardado. No es una decisión obligatoria nueva que bloquee al usuario.

Claude prepara aceptación y revisa correcciones del documento histórico 15-b3-homologaciones-corregido.md; no duplica código ni contratos. Sin integración SharePoint activa. Su futuro acceso está limitado a red empresarial y a identidad, permisos y políticas reales, según usuario. No se genera nueva APK en este avance.

## Revisión integrada 03/10 y siguiente trabajo

Chromium con viewport móvil 393×852: cinco características sintéticas, IDs 01/1.0/01/vacío/5; cancelación conserva cabecera; límites inclusivos; salto deja posiciones vacías; edición libre y guiada; corrección 10.1→9.9 con historial; reapertura tras recarga; copia cifrada restaurada en contexto nuevo. Original descargado y restaurado idéntico por SHA-256. Cero errores JavaScript y sin desbordamiento global; la tabla libre usa desplazamiento horizontal interno. Capturas revisadas visualmente, patrón azul/turquesa y tarjetas conservado. La regresión B4 integrada también pasa: seis fotos, tres informes y recuperación junto a CodeMatch.

CI ejecutará ambas revisiones web y guardará evidencias sintéticas. Android sigue condicionado a petición expresa o marcador de APK; este commit no genera APK. Siguiente trabajo: revisión adicional de mapeos/cabeceras reales y salida de informes B3 según decisión de destino. OPPO sigue pendiente.
