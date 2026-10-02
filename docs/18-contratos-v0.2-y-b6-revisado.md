# Contratos B0/B7a v0.2 — ajustes de flujos y B6
2026-10-02, ChatGPT. Complementa docs/16-contratos-b0-b7a-v0.1.md. Fuente: revisión R-1..R-19 y B6 entregados por Claude. Documento normalizado; no reproducción literal, no implementación ni pruebas. Se omiten hallazgos sensibles conforme decisión del usuario.
No aprueba D1–D25 ni política empresarial. Cambios técnicos son contratos provisionales revisables.

## Ajustes incorporados de R-1..R-19
R-1 RuleProfile: allOf/anyOf/conditional rules, ruleVersion; evaluateRegistration(entityRevision) devuelve faltantes completos{path,reasonKey,parameters}. register revalida perfil y revisión actual, guarda versionRegla. No escoger alternativaA/B/C por código.
R-2 Result: warnings[] y requiredConfirmations[] aparte de blockers. Confirmación incluye hash/revisión del conjunto de consecuencias, motivos y operationId. Si cambia revisión, pedir nueva evaluación; no aceptar confirmación obsoleta.
R-3 evaluateTransition(id,revision,toState)→allowed/blockers/warnings/requiredInputs/dependencyRevisions. ChangeState revalida todas las dependencias en commit; evaluación UI no garantiza transición posterior. Reapertura conserva cierre/aprobación anteriores como históricos, referencia supersededBy sin mutar informe.
R-4 retire/restore evidencia: motivo puede ser opcional en borrador segúnperfil; conservar evento técnico incluso en borrador (CORRIGE propuesta “sin evento”). Deshacer es operación compensatoria, no borrar historial. VentanaUI configurable; blob no eliminado mientras referenciado. Motivo/permiso de registro segúnpolítica.
R-5 ownerTypes: referenceCode, aviso, homologationCharacteristic, homologationSample, action, projectStep, cause, FAC; ownerId estable. viewLabel opcional distinto caption. Clave de característica no depende IDliteral duplicado.
R-6 beginImport exige propietario/contexto persistido; persistir progreso previo a cámara, aun casi vacío si necesario. ErrorOWNER_NOT_FOUND. La fichaCodeMatch se guarda/contextualiza sin inventar estadoBorrador empresarial. Código antes de vincular foto.
R-7 índice/facetas: tokensAND configurable, exactMatchRank de número/código, aggregate congroupBy/zone. Facetas de archivo indexadas conoutboxRevision; consulta coherente o devuelve incomplete/stale, nunca total mezclado silencioso. Aliascontraparte versionados, nombrehistórico intacto.
R-8 localRef y número definitivo ambos indexados; asignación no cambia entidadID ni rompe vínculos.
R-9 aggregate→requiredTotal/uploaded,optionalTotal/uploaded,errors/conflicts,lastUploadedRevision,currentRevision. ErrorrequiresAction diferenciado. previewEnqueueExisting(scope) muestra conjunto/versión/destino; enqueue tras autorización concreta no sube automáticamente todo al configurar.
R-10 generador acepta revisión GUARDADA de borrador; “confirmado” significa persistencia, no aprobación. Rótulos derivan estado/perfil. exportList guarda snapshotConsulta/revisiones/campos/formato/políticaCSV; resultados congelados antes de generación.
Progreso indeterminado permitido; cancelación no marca ready. Evidencia faltante→error; informeincompleto solo tras confirmación explícita ligada a lista faltantes, rótulo visible y evento.
R-11 XLSX puede incluir valor exacto texto + numérico representable auxiliar; nunca fingir exactitud numérica arbitraria. IDliteral siempre texto. PDF imprime representación decimal definida.
R-12 timeline combina negocio/archivo bajo categorías distintas. share registra hoja abierta/resultado conocido, NO “entregado” por abrir hoja. reviewed/configSaved eventTypes; motivo/procedencia segúnoperación.
R-13 sessionState none/active/requiresOnline/offlineAuthorized/error. No sesión “caducada pero válida”: permiso offline separado explícito, vigente/caducable por política. can unknown no permite aprobar/escribir protegido. pendingForSubject→drafts/jobs; logout plan conserva datos/aislamiento conformepolítica, no borrar para salir. Método empresarial/recuperación pendientes.
R-14 vínculos placeholder u ocultos segúnperfilpermisos, proyecciónpending. Evento canónico de relación y proyecciones en extremos; no prometer transacción atómica entre almacenes remotos. Lectura enlace no concede lectura destino.
R-15 deletedAt es atributo técnico, no autorizaciónborrado. Operación permitida según entidad/estado/retención/referencias. No convertir Anulado enborrado. Política borradores/datos huérfanos pendiente.
R-16 getConflict→base/local/current,differingFields,criticalFields,revisionTokens. resolve choices+reason requiere permiso y nuevas revisiones; conflicto cambiado durante resolución reabre evaluación. No mezclar automáticamente aprobación/estado/evidencia crítica.
R-17 CatalogLookup.info→loaded/count/catalogRevision. Counts responden catálogoactual, no estimaciones históricas.
R-18 preservar representacioneslegacy sin transformar durante migración; política detallada de preservación se gestiona de forma privada. Nueva referencia reducida/miniatura sin análisis; política evidencias separada.
R-19 acción conid/localRef; número comercial opcional según perfilType. Ordenvisual mutable no identificador; compartir/vincularacción usaIDestable.

## B6: alcance registrado
Proyectos PDCA/8D;5porqués/Ishikawa/causaverificada;acciones/responsables/fechas;Mis tareas/calendario/equipo/vínculos;FAC siete secciones como propuesta;PDF/XLSX/Word/archivo porcomponentes.
Estados, compuertas, progreso, prioridades, roles y numeración siguenpropuestas. Acciónpertenece a contenedor o independiente es decisiónabierta. No excluir alcance por falta decisión.
No convertir textoslegacy enacciones ni “Finalizado” en cierreverificado conautor/fecha inventados.
Archivo ypermisos reales requieren integración/prueba.

### Correcciones B6 incorporadas
1 Coherencia8D: D6 verifica implantación/eficacia de accionesD5 y contención pertinente; NO exige terminar preventivasD7 futuras. D7 gestiona prevención/estandarización; cierre valida requeridas delconjunto. Evitar dependencia circular D6/D7.
2 Causaverificada confirmada: una excepción de cierre no convierte candidata enverificada. “No aplica” y cierreconexcepción siguenpropuestas; deben mostrarse como ausencia/excepción, no cumplimiento.
3 Eficacia tiene tres conceptos: actividadCompletada,resultadoEficaz/Noeficaz,verificación/aprobación identificada. Completar actividad no pruebaEficaz. ScriptPRJ-S1 comprueba pendiente, pero no cubre Completada+Noeficaz; añadir subcaso de cierrebloqueado bajo perfilestricto.
4 D4Completado de PRJ-S1 presupone causaverificada de P-A, que no está declarada enfixture. Añadir ese dato para esperadoexhaustivo; si no, listaBloqueos debe incluir causanoacreditada.
5 Porcentaje canceladas fuera: si todas accionescanceladas denominador0→“Sin acciones consideradas;N canceladas”, no dividirporcero ni100%.
6 FAC lecturasA/B/C continúanalternativas; registro propio siguepropuestaenalcance. No decir “se confirma criterio por defecto” ni propiedad compartidaacciones sin decidir.
7 Equipo: asignarresponsable no otorga automáticamenteEditar. Añadir miembro/cambiarrol requiere permiso y confirmación; conservarverificaciónservidor. No afirmar “creadorAdministrar” comopermisoreal antesidentidad.
8 Búsquedavínculos no indexa títulos/datos inaccesibles. Informeexportado snapshots de permisos no controla lectura de copiaexterna; no garantizarrevocación.
9 FechasmanualesDateOnly YYYY-MM-DD, reuniones instantUTC+zoneId; fechaambigua cambiohorario requiereelecciónoffset; hora inexistente daerror claro. ReunionesR1/R2 noambiguas, sinrecurrenciaasumida.
10 Reapertura destino anterior significa estadooperativo definido, no restaurarCerrado. Historialconserva decisiónanterior; nueva revisión requiere nuevaevaluación.
11 Informe “NO CERRADO” provisional no implica inexactitud de datos ya confirmados. Wordexternoeditable rótulo fijo; app no puede detectareditexterna automáticamente.
12 Calendar eventos deacciones se derivan delIDacción/revisión; reprogramar actualiza misma proyección, no duplicaevento. Reunión no creaacciones. Recordatorios/notificaciones siguenpropuesta D21, no suprimir requisito confirmado si surgiera.

## Casos y evidencia
Revisión fotos añadeT-CAM-09..12:+4 a150=154.
B6 añade19:+19=173hipotéticos. T-CAM-01/02 redefinidos nosuman; subcasos no cuentanindependientes. Ninguno ejecutadoQCS.
PRJ-S1/scriptClaude quedan cálculos declarados; no reproducidosindependientemente en esta entrega. No confirmar hash de bytespegados.
No añadirautomáticamente nuevosIDs por correcciones: ampliar subcasos eficacia/canceladas/cierre/permiso/fechaambigua.
No publicarinforme privado de seguridad ni referenciasdescriptivas de vulnerabilidades.

## Estado y siguiente trabajo
Contratos comunesv0.2 entregados pararevisión; B6 registrado conajustesdirectos. No cerrar bloques/issue ni iniciar implementación por esta entrega.
ChatGPT: parser/ConformityRule/CapacityEngine y validaciónindependiente enalcance documental.
Claude: comprobar SOLO ajustes de contrato contra flujos, marcar desacuerdosmateriales, sinreemitir B1–B6. Puede preparar B5 pantallasCapacidad/importación/comparación usando motorcajanegra, sin duplicar cálculo.
