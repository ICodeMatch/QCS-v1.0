# Ampliación documental de Capacidad v0.2 — respuesta CP-1 a CP-18
2026-10-02 · ChatGPT · QCS

Estado: propuesta técnica entregada para revisión. Complementa los documentos 18 a 21 y B5; no implementa servicios ni aprueba requisitos. Sin cambios de código, ZIP, CI, merges o cierre del Issue. Documento general, sin anexo privado ni hallazgos del prototipo.

## 1. Importación, entrada y decisiones (CP-1, CP-2, CP-7)
MappingProfile incorpora purpose: homologation | capacityMeasurements. Para capacidad:
measurementLayout = {axis: rows | columns | continuous, selectedRanges, subgroupSize?, groupBindings?, sequenceOrder, decimalProfileVersion}.
subgroupSize es entero positivo y requerido solo para partición continua solicitada. Sin partición se permite análisis global. No asumir orden temporal por posición de celda sin declararlo.

ImportPreview añade observations[{id,raw,canonicalText?,sourceCell,sourceType,groupId?,position,status,reasonKey}], proposedGroups y requiredDecisions[{id,reasonKey,options,consequences}].
Decisión de grupo final incompleto: retainShort | excludeWithReason | repartition. Reparticionar genera una vista previa nueva; no confirmar un digest anterior. Excluir conserva las observaciones y procedencia.
confirmImport recibe decisions[{decisionId,option,reason?}], además del digest/perfil. Reconocer un aviso no sustituye resolver una decisión. Solo confirma decisiones aplicables a esa vista previa; no crea un registro activo parcial.

parseDecimalText(raw,profile) -> {status: empty | valid | invalid | ambiguous, canonicalText?, raw, warnings[], reasonKey?}.
Función compartida por importación, entrada manual y pegado. Perfil explícito de decimal/miles/notación científica; no aceptar hexadecimal ni sintaxis adicional por conversión genérica. NaN e infinito siempre inválidos. Una celda vacía sigue vacía. Conservar raw y resolución de ambigüedad.

## 2. Observaciones y cálculo (CP-3, CP-4, CP-6, CP-10, CP-11, CP-17, CP-18)
Observation = {id,raw,valueText?,source,groupId?,position,exclusion?}; exclusion={reason,by,at,eventRef}.
Las exclusiones se persisten y auditan fuera del motor; compute no escribe ni crea identidad/fechas.
observationsReport[{id,status: used | excluded | invalid | empty,reasonKey?}] más nTotal,nUsed,nExcluded,nInvalid,nEmpty.
Grupo vacío incluido: decisión/validación explícita; nunca fabricación de cero. Excluir mediciones puede cambiar tamaños y disponibilidad del método.

compute solicita requestedFamilies: global | within | machine. Un estudio de proceso puede pedir global y within sobre la misma revisión de observaciones usadas. machine requiere contexto y serie de máquina propios; no derivarlo por renombrar global.
Compatibilidad con kind anterior: un adaptador lo traduce a requestedFamilies; no mezclar ambos parámetros contradictorios.

Salida por familia: {status,indices,meanText,sigmaText?,degreesOfFreedom,methodMetadata,applicability,warnings}.
methodMetadata={sigmaKind: globalSample | withinPooled | withinRange | machineDeclared,methodId,methodVersion,sourceRef?,precisionPolicy}.
Fallo de una familia no invalida automáticamente otra calculable: todos unitarios impide within, pero puede permitir global. Indicar el motivo por familia.
Distinguir sigma=0, grados de libertad=0 y ausencia de datos. Nunca infinito ni cero sustituto como índice.
limits={lslText?,uslText?,nominalText?,unit?,oneSidedProfileRef?}. Nominal es contextual; su ausencia no bloquea índices que no lo requieren. Un límite unilateral no produce Cp/Pp bilateral.
outOfLimits={count,ids,usedPopulationDigest}; cuenta SOLO observaciones usadas, mediante comparación decimal inclusiva. Excluidas/invalidas se informan aparte. Con límite unilateral cuenta frente al límite presente, sin inventar el ausente.
warnings siguen {reasonKey,parameters,severity}; el texto localizado pertenece a la pantalla.
describeMethods() devuelve catálogo/versiones/fuentes; evaluateMethodAvailability(shape,profile) devuelve available | needsSource | unsupportedForShape | insufficientData. Disponibilidad de datos no equivale a idoneidad estadística. Rbar/d2 permanece needsSource mientras no se verifique la fuente.

## 3. Histograma y representación (CP-5, CP-15)
buildHistogram(usedValues,policy) es una función de presentación independiente, sin efectos. Devuelve policyId/version,edgesText,bins[{lowerText,upperText,count}],boundaryConvention,populationDigest.
Guardar bordes y recuentos con el resultado; no redibujar con clases nuevas al abrir. Todas las observaciones usadas pertenecen exactamente a una clase; suma(count)=nUsed. Último extremo incluido. Serie constante requiere clase no degenerada bajo política declarada; sin datos, sin histograma. No curva normal automática.
Política/número de clases: propuesta pendiente; ninguna regla universal se aprueba aquí.

formatCapacityResult(result,{digits,roundingMode,locale,formatterVersion}) devuelve cadenas comunes para pantalla e informes, manteniendo valores internos independientes. Cambiar representación no recalcula estadística.
Criterios comparan valor interno, nunca cadena. Si precisión/estimación numérica no resuelve frontera, resultado uncertain con motivo, mostrado como no evaluable; no forzar meets/fails.
XLSX lleva texto exacto de entrada y valor numérico auxiliar representable. Identificadores como texto.

## 4. Versiones, criterios y condiciones (CP-8, CP-9, CP-12)
Study tiene identidad estable y revisiones de trabajo. SavedStudyVersion={versionId,studyId,savedVersion,inputSnapshot,resultSnapshot,criteriaSnapshot,conditionsSnapshot,engineVersion,formatterVersion,createdBy,createdAt,previousVersionId?}.
Versiones guardadas inmutables. Autoguardados incrementan revisión de trabajo, no savedVersion. Anulación se registra como evento/proyección; no modifica el snapshot ni borra informes. Relaciones de sustitución se proyectan sin reescribir versiones anteriores.
Abrir muestra snapshot. Recalcular explícitamente produce propuesta nueva; no sustituye ni guarda automáticamente.

CriteriaProfile={id,version,scope,thresholds[{index,minText}],author,createdAt,status}. Cada estudio guarda el perfil concreto o ausencia de criterio; no resolver el perfil actual al abrir un histórico.
Resultado por índice meets | fails | notEvaluable, con reasonKey; uncertain numérico se representa como notEvaluable con motivo.
Identidad/permisos gestionan perfiles; scope y reglas de prioridad entre cliente/característica/estudio quedan pendientes del usuario. Sin umbrales de aceptación por defecto.

Conditions={processOrMachine?,line?,material?,lot?,supplier?,measurementEquipment?,period:{startDate?,endDate?},sampling?,stabilityDeclaration?,notes?,extensions?}.
Periodo DateOnly, comprobar inicio<=fin. Instantes de medición son campos distintos con zona/procedencia. Datos de persona opcionales bajo política pendiente; no inventar operario.
Condiciones integran snapshot/informe y huella contextual; inputsDigest numérico y studySnapshotDigest se distinguen. Cambiar una nota no cambia una estadística, aunque sí el contexto versionado.

## 5. Comparación, índice y evidencias (CP-13, CP-14, CP-16)
compareStudyCompatibility(versionRefs,policy) evalúa únicamente versiones autorizadas y retorna:
{status: compatible | caution | incompatible,differences[{field,values,reasonKey,severity}],pairResults,seriesKeys,missingContext}.
Comparar solo métricas con la misma definición aplicable. Una incompatibilidad impide línea/serie combinada; permite inspección lado a lado rotulada. caution requiere mostrar motivos; no es certificación de comparabilidad ni conclusión de mejora.
seriesKey incluye métrica,familia,método/version relevante,límites,unidad,característica,población/contexto requeridos por perfil. Cambios de criterio se muestran aparte y nunca reclasifican resultados históricos silenciosamente. Agrupar por método/límites/unidad solamente no garantiza compatibilidad.
Datos faltantes generan motivo explícito, no igualdad por vacío. Política de severidad/población pendiente; no se aprueba una equivalencia automática.

SearchIndex añade facetas familia/método/estado/código/característica/máquina/proveedor/fechas/criterio/avisos/archivo, con filtros autorizados y totalFiltered. Estado derivado de archivo incluye revisión/actualidad; no presentar total global con índice incompleto.
Monitor debe decidir unidad de recuento: estudios o versiones. Propuesta: una versión vigente por estudio; versiones históricas en lista aparte. Un estudio multifamilia puede aparecer en varios contadores; no sumarlos como total de estudios.

EvidenceStore y LinkService admiten capacityStudy; informes enlazan versión concreta. Original de mediciones: purpose measurementOriginal, distinto semánticamente de templateOriginal, bajo preservación de originales. No reutilizar política reducida de fotos de referencia para evidencias.
Archivo incluye errorRequiresAction; subida por componentes requeridos de una versión. Informe desde guardado o borrador persistido; borrador con watermark, snapshot confirmado de persistencia, sin aprobación implícita.

## 6. Contraste del adjunto B5
El script adjunto se ejecutó y reprodujo la salida declarada. Estadísticas realizadas con flotantes; Decimal usado en interpretación/criterio/límites concretos. No ejecución de QCS ni verificación de d2.
Correcciones necesarias: parse finito; diferenciar sigma cero de falta de grados de libertad; informe de borrador coherente; errorRequiresAction visible; incompatibilidad no habilita tendencia válida.
Casos nuevos B5: 16; total documental propuesto 189. Estos ajustes se integran como subcasos; no sumar casos automáticamente.

## 7. Reparto y pendientes
ChatGPT: contratos, referencias, cálculos independientes y preservación documental. Claude: B5 corregido y cuerpos generales completos de bloques restantes. Sin duplicar implementación.
Usuario: método seleccionado, definición de máquina, criterios y alcance, suficiencia de datos, políticas de comparación/histograma, permisos y unidades.
Ninguna interfaz entregada acredita implementación, aprobación o integración real.
