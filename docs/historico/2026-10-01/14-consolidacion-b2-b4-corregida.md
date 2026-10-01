# Consolidación B2 v1.1 y B4 — correcciones incorporadas por ChatGPT
Fecha: 2026-10-01. Fuentes: documentos completos pegados por el usuario en el chat, B2 v1.1 y B4 de Claude; revisión posterior de ChatGPT.
Documento normalizado de trabajo: no transcripción literal. Conserva el alcance y las decisiones abiertas; las reglas corregidas de este documento prevalecen sobre las formulaciones contradictorias de esas entregas.
Estado: entregado para revisión. Sin implementación, prueba funcional, autorización de defaults ni cierre de bloques.
No se publican datos corporativos: CAT-S1, CAT-S2 y AVI-S1 son fixtures sintéticos declarados.

## 1. Reparto y alcance
Claude: flujos, pantallas, reglas de uso y casos. ChatGPT: B0 preservación/migración y B7a contratos comunes. B0 y B7a aún no entregados.
No devolver a Claude correcciones editoriales/técnicas que ChatGPT pueda incorporar. Revisar juntos solo cambios que afecten a decisiones o flujos.
D1–D25 continúan propuestas. No tocar código, ZIPs, CI, merges ni cerrar Issue.

## 2. B2: reglas consolidadas
Conservar búsqueda por medidas/texto, catálogo Excel/CSV, biblioteca/fichas, planos/archivos, copias y requisito de generación PDF.
Desarrollo y plegada combinables, con datos parciales. No sustituir ausencias por cero ni inventar medidas plegadas.
Orientación directa/invertida coherente dentro del par largo/ancho. Alto no se intercambia.
Intersección Y, orientación independiente o compartida entre bloques, tolerancias y una sola medida permanecen alternativas propuestas P7.
Semántica propuesta de evaluación:
- Coincidencia: satisface condiciones consultadas.
- Descartada: alguna condición conocida descarta todas las orientaciones permitidas.
- No evaluable: ninguna orientación cumple, pero alguna sigue posible con datos ausentes.
Por orientación: incumple domina sobre desconocida; entre orientaciones: cumple domina y después desconocida. Entre bloques Y: descartada domina y después desconocida.
Cuando orientación es compartida, combinar bloques dentro de cada orientación ANTES de unir orientaciones. No combinar por separado y después afirmar orientación compartida.
Mostrar catálogo plegado disponible y no evaluables como propuesta; no ocultar un filtro activo silenciosamente.
Tolerancia decimal inclusiva, sin redondeo previo. Alternativas: mm común, propia por bloque o porcentaje con base explícita. Espesor con tolerancia independiente es propuesta.
Sumatorio confirmado: solo desde pieza plegada, ocho celdas fijas 2×4, vacías ignoradas, estima desarrollo sin descuentos, destino Largo o Ancho en desarrollo elegido. No escribe medidas exteriores plegadas.
Cálculo decimal sin redondeo arbitrario. Selección inicial de destino, confirmación de sobrescritura, persistencia temporal/limpieza y activación de bloque son propuestas.
Retirar cámara/foto/experimental SOLO de CodeMatch, conservando evidencia histórica. Avisos mantiene cámara/galería.

### Inventario resumido B2 (referencias declaradas por Claude, no auditoría nueva)
R-01/02 consulta foto/cámara/galería; R-03/04 fotografiar plano; R-05 ArUco; R-06 fotos patrones; R-07 híbrido; R-08 laboratorio ArUco; R-09 laboratorio fotos; R-10 patrones/selector; R-11 panel consulta foto; R-12 cuatro entradas de menú.
R-13 fotos ficha históricas: almacenamiento comprimido actual, original no conservado; modo histórico lectura/exportación propuesto.
R-14 aprendizaje local; R-15 filtro histórico fotos; R-16 módulos; R-17 service worker/ASSETS; R-18 temas (decisión separada); R-19 PIN (retirada al acceso global); R-20 WebMCP escritura (decisión separada); R-21 demo (decisión separada).
Conservar records, attachments, settings, patterns, arucoTests, technicalRuns y recordHistory y datos locales relevantes. No destruir datos por retirar UI.
Copia v2 declarada cubre cinco tiendas, omite recordHistory/technicalRuns/localStorage. La recuperación PIN y resetData declarados borran base completa. Contrastarlos en B0.
Preservación T-CAM-05: inventario cobertura + complemento de omisiones + restauración/comparación; documentar omisiones por sí solo no acredita recuperación.
Nunca probar restauración sobre el único conjunto original. Entorno de comprobación aislado; mecanismo concreto pendiente B0.
Actualizar imports/ASSETS y estrategia de caché al retirar recursos; no afirmar probado.

### Contraste independiente realizado por ChatGPT
Ejecutado en JavaScript, fuera de QCS, sobre los conjuntos de B2:
mm: ±0,1 →1776/5000; ±0,2 →2390/4998; ±5 →60/4902; ±10 →120/4802.
Porcentaje: 1% →246/498; 2% →233/494; 5% →193/484.
Coinciden con Claude. Son frecuencias entre extremos exactos del fixture, NO tasa de errores de búsquedas reales ni prueba QCS.
Ejemplos JavaScript: |64.4−59.4|=5.000000000000007; |50.1−50|=0.10000000000000142; |52.52−52|=0.5200000000000031.
No se certifican hashes de scripts pegados sin contrastar bytes originales.

### Casos B2
93 distintos anteriores +11 propuestos P1 +14 nuevos B2 =118 hipotéticos.
T-CM-10 padre con subcasos 10.1 importación,10.2 exportación,10.3 planos; aliases T-XLS-01/T-XLS-02/T-PLN-01, no cuentan aparte.
Nuevos T-CM-11..15, T-SUM-07..10, T-CAM-04..08. No ejecutados contra QCS.
Mantener aliases de las siete fusiones de P1.
Fixtures CAT-S1/S2 y scripts completos siguen en el mensaje fuente; este documento no afirma que estén archivados literalmente.

## 3. B4: alta, evidencias y estados consolidados
Avisos Interna/Proveedor/Cliente; código, Denominación, contraparte, cantidad, problema y acción inmediata; fotos múltiples/comentario, borradores e informes PDF/Excel/Word; búsqueda/histórico/monitor; vínculos.
No integrar SAP por nomenclatura. Número SAP manual opcional propuesto.
Flujo: elección tipo → datos → fotos → revisión/registro. Momento exacto de creación de borrador es propuesta, no impedir guardar por una convención visual.
Código desconocido: A estricta, B descripción+identificación alternativa, C código o desconocido con texto; ninguna aprobada. Especificar explícitamente condiciones comunes de C antes de implementarla.
Denominación de catálogo editable con procedencia. No deducir proveedor del catálogo CodeMatch.
Cantidad con unidad explícita configurable; no convertir vacío en cero ni imprimir “unidades” si se registró kg/m.
Borrador autoguardado con indicador real de éxito/error; nunca “guardado” antes de confirmar persistencia.
Borrador privado por autor es propuesta; requiere identidad/permisos, no simular privacidad mediante etiqueta.
Estados propuestos: Borrador, Registrado, En análisis, En acción, Cerrado, Anulado.
Abiertos propuestos: Registrado+En análisis+En acción. Cierre/anulación/reapertura con autor/fecha/motivo según tabla Claude, pendiente decisión.
Vincular no cambia estado automáticamente. Avisos cerrados/anulados en solo lectura propuesto. Política de borrado/copias sigue abierta.
Conservar originales de evidencias y miniaturas es propuesta; no aplicar compresión CodeMatch a evidencia sin decisión.
Orden/comentarios/retirada quedan registrados. Informes emitidos conservan su instantánea aunque cambie el aviso.
No borrar original de galería ni modificar archivos externos como parte del archivo/sincronización. Limpieza de copias administradas por la app requiere política separada.

### Corrección incorporada: cámara y recuperación (sustituye B4 4.2 y T-AV-13)
Antes de abrir cámara/selector externo, persistir borrador y contexto de captura. Si falla, informar y permitir corregir; no declarar recuperación garantizada.
La foto se guarda en EvidenceStore cuando se recibe el resultado de captura/selección y se confirma su persistencia. No prometer que la app puede guardar una foto antes de recibirla.
Si Android mata el proceso, recuperar el borrador ya persistido. Recuperación de la captura depende del mecanismo Android/Capacitor empleado y debe verificarse.
T-AV-13 se desglosa: persistencia previa del formulario; resultado normal de captura; cierre del proceso antes/después de entregar resultado; cancelación/permisos; ausencia de adjuntos huérfanos o pérdida silenciosa.
No afirmar que toda foto sobrevivirá a cualquier cierre hasta validar ese mecanismo.

## 4. Migración: correcciones incorporadas
Datos qms.records.v1 tratados como potenciales datos del usuario; existencia/volumen reales no comprobados. No afirmar que contiene avisos reales sin leer una copia autorizada.
Conservar objeto original completo (cuatro módulos), campos desconocidos, IDs y updatedAt. Migración de avisos no debe sustituir ni perder los demás módulos.
Mapeo de estados propuesto: Abierta→Registrado, En análisis→En análisis, En acción→En acción, Cerrada→Cerrado. Conservar estado original.
Descripción breve→problema; referencia de pieza conserva procedencia y valor, sin certificar código; contraparte según tipo; causa/acción/verificación/fecha objetivo heredadas, no crear FAC automáticamente.
Campos nuevos sin dato quedan desconocidos. No rellenar fecha/autor/número empresarial por inferencia.
CORRECCIÓN de B4 4.7/9.4/DF-14: updatedAt es última modificación conocida, NUNCA fecha de registro o creación.
Campos de fecha separados:
- legacyUpdatedAt: valor original intacto.
- registeredAt: desconocido salvo evidencia independiente.
- createdAt histórico: desconocido.
- migratedAt: momento técnico de migración, no nacimiento del aviso.
Antigüedad/evolución por registro excluyen fecha desconocida del cálculo y muestran “N sin fecha de registro”. No usar updatedAt ni migratedAt como sustituto.
Si se ofrece análisis por última modificación, debe rotularse como métrica diferente.
T-AV-21 debe comprobar esta separación, la idempotencia y preservación íntegra.
Asignación de número al migrar sigue propuesta; distinguir referencia técnica y número definitivo.

## 5. Informes y archivo
PDF/Word/Excel con identificación, problema/acción, fotos ordenadas/comentarios, historial, vínculos y metadatos de generación.
Cada emisión referencia versión guardada; nueva emisión no cambia anteriores.
BORRADOR, copias externas/Word editable, diseño y contenido exhaustivo son propuestas.
CSV/listado separado de informes con fotos.
Estados archivo: local confirmado; pendiente en cola con destino; subiendo; subido confirmado; error recuperable; conflicto.
Estado agregado por conjunto/versionado de componentes, no solo número de transferencias.
Destino no configurado: local, no pendiente ficticio. Simulación no prueba SharePoint.
Después de modificar, conservar estado del informe anterior y marcar nueva versión/cambios pendientes.
Compartir registra apertura/resultado conocido de la hoja de compartir; no afirmar entrega al destinatario por abrirla.
Permisos servidor y pruebas con cuentas reales pendientes.

### Corrección incorporada: exportación (sustituye H-5, 7.2 y T-AV-22)
XLSX: campos textuales en celdas de tipo texto, sin fórmula; cantidades/fechas tipadas cuando conocidas. Conservar literal =1+1 y lote -12.
CSV: no existe tipo de celda. Comillas CSV no garantizan neutralización de fórmulas al abrir en cualquier hoja.
Ofrecer políticas documentadas, aún propuestas:
1 CSV fiel: conserva valor, avisa de interpretación dependiente del lector.
2 CSV protegido para un lector probado: escape/neutralización con transformación declarada, no prometer literal idéntico.
3 XLSX tipado cuando se necesiten ambas propiedades.
T-AV-22: separar fidelidad XLSX, fidelidad CSV y neutralización CSV para lector definido. No exigir simultáneamente seguridad universal y literal intacto en CSV.
Mantener dato fuente intacto; escape solo en salida.

## 6. Búsqueda, monitor y vínculos
Buscar campos de negocio explicitados, no nombres internos JSON. Referencia local puede buscarse si se ofrece; diferenciar de IDs internos no visibles.
Normalización de mayúsculas/acentos/espacios propuesta. Código original conservado sin modificar por normalización de búsqueda.
Filtros Y entre familias/O dentro; rangos inclusivos Europe/Madrid; comparar días locales usando instantes UTC/zona, no truncar UTC.
Recuento basado en mismo filtro y permisos de lista. Si paginada, contador coincide con total filtrado, no con filas visibles de una página.
Borradores por autor; abiertos/cerrados/anulados por definiciones propuestas. Sin sincronización: “Datos de este dispositivo”.
Número de pendientes: componentes del conjunto/versionado relevante; incluir errores/conflictos según categoría visible, sin ocultarlos como subido.
Vínculos bidireccionales con permiso; snapshot aviso→FAC conserva procedencia sin mutar evidencia compartida; retirada de vínculo auditada.
Agrupar proveedores mediante alias/identidad propuesta sin reescribir nombres históricos silenciosamente.
Calendario y contadores no son seguridad.

## 7. Casos B4 y pendientes
16 nuevos T-AV-09..24; T-AV-03 padre PDF/Word/Excel no suma subcasos.
118+16=134 hipotéticos, no aprobados ni ejecutados contra QCS.
AVI-S1/Anexo A son esperados declarados por Claude; no reproducidos íntegramente en esta entrega.
T-AV-21 actualizado por fechas/migración; T-AV-13 por cámara; T-AV-22 por formatos.
T-AV-24: comprobar capacidad si disponible, pero manejar también fallo real de escritura/cuota; consulta de espacio no garantiza éxito posterior.
“Copia previa a cualquier borrado” en tabla servicios debe llevar [N/PROV], no convertirse en contrato aprobado.
Pendientes: regla registro/estados, numeración, unidades, proveedores, política evidencias, conjunto archivo/TI, acción independiente o FAC/proyecto, diseño informe, roles.
Continúa diseño con alternativas explícitas; sin inventar cumplimiento empresarial.

## 8. Siguiente trabajo concreto
ChatGPT debe entregar B0 y B7a usando DF-1..DF-17 como insumos a contrastar, no como auditoría propia.
Claude puede revisar esta consolidación y continuar trabajo documental independiente; no requiere reeditar íntegros B2/B4.
Esta entrega corrige y publica documentos; NO entrega todavía contratos B0/B7a ni acredita ejecución en segundo plano.
