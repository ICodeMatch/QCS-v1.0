# Contratos específicos v0.1: ExcelTemplateReader, ConformityRule, CapacityEngine
2026-10-02 ChatGPT. Entrega documental para revisar B3/B5. Sin implementación ni pruebas. No contiene informe de seguridad. Complementa16/18; decisiones usuario abiertas.

## ExcelTemplateReader
read(file,options) devuelve ImportPreview inmutable: originalRef/digest,nombre/tamaño,hojas,bloques,cabecera,características,muestras,avisos,structuralSignature,readerVersion.
Nunca modifica original. Hashbytes distinto firmaestructura; selecciónhojas/mapeo explicitados. Encabezados/filas/columnas variables; no asumir primera hoja ni30muestras.
MappingProfile{id,version,templateType,revision,sheetSelectors,ranges,fieldBindings,percentEncoding,blankTolerancePolicy,attributeMap}.
Preview de ID: rawValue,displayValue,cellType,format,formula,cachedValue,sourceCell. internalKey distinto sourceIdentifier; duplicados/vacíos no renumerados. Si Excel ya perdió cero inicial, advertir y no inventarlo.
DecimalCells como texto normalizado más raw; coma/punto según perfil, separadores miles ambiguos→revisión. No convertir error/vacío/NaN/Infinity en0.
Valores/fórmulas/cachés son fuentes distintas. Fórmula presente sin caché no computada por asumir resultado; recalcular SOLO operaciones de dominio permitidas desde inputs verificables. No ejecutar macros ni fórmulas arbitrarias.
Fórmula sustituida por valor no invalida si límites pueden determinarse. Tolerancia vacía→desconocida salvo perfil explícito; límites explícitos pueden bastar.
Tipo% perfil define proporción0.05 o porcentaje5; unidad de medición nominal, no porcentaje implícito.
confirmImport(previewId,previewDigest,mappingVersion,acknowledgements): verifica revisiónactual, crea registro y procedencia sin importar parcialmente al activo. cancelled mantiene origen/registroactual.
Errores archivoilegible,formatoNoSoportado,estructuraAmbigua,campoRequeridoDesconocido; avisos porcampo. Guardarraw no equivale evaluarcaracterística. Roles/avisosbloqueantes pendientesperfiles.

## ConformityRule
evaluateSample({specRevision,type,valueRaw,unit,limitsOrNominal,tolerances,blankPolicy,percentEncoding,attributeMap}) devuelve:
status{pending,invalid,conforming,nonconforming,notEvaluable},reason,canonicalValueText,LSLText,USLText,ruleVersion,inputDigest.
Vacío pending; valor inválido invalid; especificación incompleta/incoherente notEvaluable. No decisión humana.
Dim límites nominal+desviaciones firmadas; % nominal*(1+desviación proporcional). LSL<=USL verificado antes comparación; rangos inclusivos exactos.
Nominal negativo con% requiere convenciónperfil; no invertir/corregir límites silenciosamente.
Decimal aritmética exacta coeficiente+escala o biblioteca apropiada; divisiónnofinita requiere precisión/método visible. Comparación/suma/tolerancia no redondean previo.
Attribute mapa explícito normalizado conraw conservado; desconocido invalid, nunca conforme por defecto.
aggregateCharacteristic(samples,specRevision,requiredPolicy,exclusionPolicy) separa resultado medido/completitud/nValid/nRequired/omitidas/excluida.
No conformes dominan SOLO bajo misma especificación válida. Invalid sinNC→notEvaluable; conformes parciales→conforming ypartial; sinmedir→unmeasured. Requeridasdesconocidas→undefined,no0. N=0 requiereperfil.
Aprobación firma revisiónmedición/especificación; cambio no muta decisión/informe anteriores.
BúsquedaCodeMatch comparte decimalinclusivo,pero funciónmatch separada deconformidad: tresestados pororientación/bloque,no afirmar pieza conforme por coincidencia catálogo.

## CapacityEngine
compute({studyId,revision,kind,observations,subgroups,limits,method,criteria,conditions,engineVersion})→indices/mean/sigma/n/degreesOfFreedom/methodMetadata/warnings/applicability/inputsDigest.
Observación{id,valueText,source,groupId,position}; no descartar inválidos silenciosamente. Excluirrequiere motivo,conservarraw.
Pp=(USL−LSL)/(6*s_global); Ppk=min((USL−mean)/(3*s_global),(mean−LSL)/(3*s_global)),s_global muestral n−1.
Cp/Cpk usan sigmaWithin método explícito:
- pooled: sqrt(sum within SSE/sum(ni−1)); singleton aporta0SSE/0df; almenos1grupo ni>=2. No permite declarar diseño estadístico adecuado solo por poder calcular.
- Rbar/d2: grupos tamañosiguales admitidos y d2 por fuente/versiontabla verificadas; Rbar promediorangos. Tamañosvariables→unsupported hasta método documentado,no usar d2 único.
Cm/Cmk usan serie de estudio máquina y sigma/método declarados; no certificar estudioCm/Cmk por cambiar etiquetasPp/Ppk.
s=0→undefined/degenerate con motivo, nunca Infinity como índice válido; n<2/df0→insufficientData. USL<=LSL→invalidSpecification para capacidad; límites unilaterales requieren perfil específico,no inventarCp bilateral.
No exigir medias entrelímites para calcular: índice negativo posible y significativo. No truncar índices a0.
Criterioausente→sinsemáforo; presente→resultado contra criterioversionado, NO homologación/aprobación. Estabilidad/distribución/subgrupos/condicionesdocumentadas aparte.
Cálculoestadístico puede usar puntoflotante con precisión/método declarados; regla decimal de límites/entrada no implica raízcuadrada exacta. Resultadoguardado completa versiónmotor/método/criterio; no recalcular alabrir silenciosamente.
Comparaciónestudios: límites/unidad/característica/método/población/condiciones; incompatibilidad señalada, no ocultar por mismo código.
Motor retorna números de precisión interna y representación informe, redondeo SOLO presentación. Tabla d2/criterios/suficiencia máquina requieren referencia primaria y selección antes uso real; contrato no fija fuentes verificadas todavía.

## Validación futura y reparto
Fixtures nominal/límite exacto,tipos desconocidos,estructura variable,IDs textuales; estadística dataset propio y cálculo independiente con inputs completos.
Valores de referencia anteriores no se certifican nuevamente sin dataset/cálculo enlazados. No pruebaQCS ejecutada.
Claude: B5 pantallasimportación/grupos/método/condiciones/resultados/histórico/comparación/informe, usando estosservicios. Señalar discrepancias concretas,sin duplicar motor/parser.
ChatGPT: completar evidenciaestadística/referencias/mapeo real y preparaciónvalidación enalcance documental. Sin cambiar código/CI/ZIP.
