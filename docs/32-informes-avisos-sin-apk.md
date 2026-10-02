# B4 · Informes de Avisos en código, sin APK nueva

Fecha: 2 de octubre de 2026. Rama: `implementacion/etapa1-qcs`. Base: `fe8c587fd4da57e8d3221a0f989520201996f887`.

## Implementado

Desde Datos → Fotos → Informe se pueden generar PDF, Excel (.xlsx) y Word (.docx), con los datos del borrador, fotografías de evidencia y comentarios individuales. Se conserva el archivo generado y una instantánea cifrada independiente del aviso, con referencia local, fecha, revisión de origen y huellas SHA-256. Los informes se rotulan BORRADOR; no se asigna número SAP, estado empresarial ni subida a SharePoint.

Editar el aviso o retirar una foto después no altera el informe anterior. La instantánea incluye las fotos activas en el momento de generar; no incorpora las retiradas. El borrador sigue conservando las retiradas conforme al avance anterior. El informe vuelve a compartirse usando los mismos bytes conservados; no se regenera con los datos actuales. La copia cifrada incluye informes y sus instantáneas. La recuperación admite el nuevo tipo de registro sin sustituir los existentes.

La generación valida que la revisión leída sea la guardada. Primero se conserva el archivo localmente; después se solicita guardar o compartir con el mecanismo común de QCS. Un fallo al generar o conservar no anuncia éxito; cancelar compartir mantiene el informe disponible y no confirma un destino externo. No se borran informes antiguos ni se añade una función de eliminación.

PDF: paginación A4, cabecera QCS azul, campos y fotos proporcionales, comentarios e historial. Excel: hojas Aviso, Fotografías e Historial; las entradas se escriben como texto literal, incluso si empiezan por =; los textos largos se distribuyen en filas de continuación. Word: datos, imágenes proporcionales, comentarios e historial. Se utilizan imágenes completas, no las miniaturas de pantalla; el original recibido permanece en la instantánea. No se utiliza una plantilla corporativa no proporcionada ni se declara equivalencia con ella.

## Evidencia ejecutada

14 pruebas automatizadas locales pasan, incluidas tres nuevas: archivos reales PDF/XLSX/DOCX con seis fotografías sintéticas y textos largos; conservación de instantáneas, conflicto de revisión y fallos; compartir cancelado y segundo intento con bytes idénticos. Se comprueban imágenes embebidas, literalidad de Excel, texto completo en filas de continuación, seis posiciones de imagen en Word y contenido de la copia cifrada. Las once pruebas anteriores siguen pasando.

Compilación web correcta. PDF de ensayo renderizado e inspeccionado: tres páginas, fotografía y comentario visibles; extracción comprueba final del texto y cero bloques fuera de página. XLSX se vuelve a abrir con ExcelJS; DOCX se inspecciona como paquete OpenXML. Word/Excel no se han renderizado en aplicaciones de escritorio ni abierto en el OPPO. Las fotos de ensayo son sintéticas: no equivalen a permisos, memoria u orientación con fotos reales del teléfono.

## Pendiente de comprobación / límites

- Revisión integrada de apariencia y navegación en navegador real y OPPO. Ninguna APK nueva se ha generado. La APK instalada 0.1.4 no contiene este avance ni los borradores del documento 31.
- Generar, guardar/compartir, volver a abrir y recuperar copia con fotos reales en OPPO; memoria con originales grandes. Los informes conservados aumentan el tamaño de la copia al incluir archivo e instantánea.
- El PDF usa Helvetica estándar: español y caracteres compatibles están cubiertos. Si un texto contiene un carácter incompatible (por ejemplo ciertos símbolos o emojis), se rechaza la generación con aviso y se conserva el borrador; Word/Excel permanecen disponibles. No se sustituye silenciosamente texto.
- Recuperación con copia real histórica de CodeMatch v1/v2 sigue pendiente; no se ha validado migración de la aplicación habitual.
- Monitor/KPIs dependen de la definición de estados P6. SharePoint e identidad/permisos son B7b; vínculos de proyecto/FAC son B6. No se cierran mediante este avance.

## Instrucciones de continuación para Claude

Revisar este código contra B4, sin ampliar alcance ni convertir propuestas en requisitos. Separar revisión documental, pruebas automatizadas y verificación en dispositivo. Puede pasar a B2: contrastar los dos bloques de medidas simultáneos, el sumatorio 2×4 que aplica al desarrollo elegido, Biblioteca y regreso, y conservación/recuperación de cámara; no rediseñar el layout histórico aceptado.

`B5_CAPACIDAD_COMPLETO.md` se ha anunciado como referencia única, pero su contenido no está incluido en el resumen recibido. Aportar documento completo y los cinco puntos de contraste, con P5 abierta distinguida de lo aprobado. Las cifras T-CAP-01 trasladadas (Pp 1.0150, Ppk 0.8887, Cp 1.8217, Cpk 1.5950) son evidencia de Claude; ChatGPT no vuelve a declararlas verificadas con solo el resumen. CAP-S2/S3 previas no sustituyen la revisión de la nueva consolidación.

ChatGPT termina B4 mediante revisión integrada antes de preparar una APK que merezca la pena. Mantener la misma firma/identificador en futuras actualizaciones; hacer copia previa, sin desinstalar. Compilaciones Android se reservan para workflow_dispatch o el marcador establecido por la rama; este avance no pide Android.
