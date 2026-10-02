# B0/B7a — contratos provisionales v0.1 y actualización de fotos CodeMatch
2026-10-02. Autor ChatGPT. Entrega documental concreta, para revisión de flujos por Claude. No implementación, auditoría independiente del código antiguo ni prueba funcional. No aprueba D1–D25.
B0: protocolo de preservación entregado; contraste de almacenes/PIN en fuentes y restauración real aún pendientes.
B7a: contratos comunes locales entregados en versión inicial; parser, motores estadísticos y adaptadores SharePoint no implementados.

## 1. Cambio confirmado del usuario (prevalece sobre B2 y documentos13–15)
Biblioteca/ficha de cada código CodeMatch admite varias fotos de referencia de la pieza real, desde cámara o galería, mostrando distintas vistas. No limitar a una ni imponer cuatro ranuras.
Guardar copia de baja resolución/comprimida suficiente para reconocer visualmente la pieza con poco espacio.
No usar esas fotos para contorno, medición, aprendizaje ni identificación automática.
Retirar análisis fotográfico/experimental y sus entradas. Mantener cámara/galería para referencia dentro de biblioteca/ficha. Fotografiar plano sigue fuera del alcance confirmado de esta excepción.
No borrar fotos existentes. Retirada total de cámara/capture y fotos históricas solo lectura ya no son criterios vigentes.
T-CAM-01 debe verificar ausencia de análisis y presencia de captura/galería de referencia, no cero capture en todo CodeMatch.
R-13 se conserva y adapta a lista variable de fotos; R-14 aprendizaje se retira como función conservando datos hasta preservar/decidir.
No extender compresión de referencia a fotos de evidencia de Avisos/Homologaciones.
Dimensiones/calidad/peso objetivo son parámetros técnicos propuestos pendientes de comparación visual, no valores aprobados.

## 2. Sobre común de entidades y operaciones (propuesta técnica)
Entity: id UUID estable local, schemaVersion, revision entero, createdAt UTC si conocido, updatedAt UTC, actorId nullable, provenance, legacyRaw opcional, deletedAt nullable.
IDs comerciales/SAP son atributos independientes, nunca clave primaria. Para code CodeMatch conservar código fuente y mapear a ID sin normalizar destructivamente.
Operation: operationId UUID, entityId, expectedRevision, actorContext, payload.
Result: ok/data/revision o error{code,message,field,path,retryable,operationId}.
Errores comunes: VALIDATION,NOT_FOUND,REVISION_CONFLICT,UNAUTHORIZED,STORAGE_FULL,READ_FAILED,WRITE_FAILED,CORRUPT_DATA,UNSUPPORTED_SCHEMA,CANCELLED.
READ_FAILED/CORRUPT_DATA nunca desencadenan inicialización vacía que sobrescriba el origen.
Comando repetido con mismo operationId retorna resultado previo; payload distinto con mismo ID rechaza.
expectedRevision evita “último guardado gana” silencioso. Conflicto conserva ambas propuestas hasta resolución auditada.
Confirmación UI no sustituye validación del servicio ni permiso servidor.
Guardar entidad+evento en una transacción local cuando compartan almacén. Binarios externos requieren protocolo temporal/commit, no promesa de atomicidad entre sistemas.

## 3. B0: PreservePlan y BackupService
Inventario antes de migrar/retirar:
- siete tiendas CodeMatch declaradas: records,attachments,settings,patterns,arucoTests,technicalRuns,recordHistory.
- claves locales declaradas: PIN, temas, posición ArUco, aprendizaje/activación; qms.records.v1 completo (cuatro módulos).
- cada entrada clasificada: negocio/evidencia/derivado/preferencia/credencial; cobertura comprobada, volumen, tipo y destino. Fuente de esta lista: Claude; contraste pendiente.
- acceso/origen WebView/appId/ruta y versión: no asumir que DB con mismo nombre será accesible si cambia origen.
exportSnapshot(scope): pausa escrituras o fija snapshot coherente; produce manifest{formatVersion,exportId,createdAt,sourceApp,origin,schema,stores,entries,coverage,omissions}.
Cada tienda: count y digest canónico; binarios: MIME,tamaño,SHA256 real bytes,ID/vínculos. Claves con arrays/objetos serializadas sin perder tipo. Conservar blobs de settings, no confiar en JSON.stringify de Blob.
Credenciales/tokens no se exportan como datos de negocio; inventariar política aparte. Hash PIN de legado no se publica ni se traslada como identidad QCS. Temas/flags pueden preservarse aunque UI desaparezca.
verifyPackage(): esquema/tamaños/huellas/referencias/duplicados; no importar paquete parcialmente corrupto.
previewRestore(): muestra destino, coincidencias/conflictos, omisiones y cambios; no toca base activa.
restoreToStaging(): aislado, IDs conservados, idempotencia, compatibilidad v1/v2 por adaptador explícito. Paquete v2 legado no se llama completo si faltan tiendas/claves.
compareRestored(): recuentos Y contenido/huellas/vínculos; recuentos iguales solos no acreditan igualdad.
activateMigration(): solo después de verificación y rollback disponible; conserva origen intacto; checkpoint de versión/operationId. Recuperación tras interrupción reanuda o aborta sin duplicar.
No probar sobre única copia real ni borrar DB para recuperar acceso.
Borrado general: fuera de migración, política usuario pendiente; no imponer copia antes de cada borrado como regla aprobada.
PIN: auditar rutas hash/lectura/escritura/guardas/cifrado. Hasta contrastar, “PIN parece bloqueo UI según Claude”; no certificar cifrado ni ausencia de cifrado de toda app.
Foto histórica ya comprimida: preservar archivo disponible, no inventar original inexistente.

### Migración legacy provisional
qms.records.v1 conservar objeto raw completo, campos no reconocidos y cuatro módulos. Importar avisos/homologaciones de forma independiente sin reemplazar hermanos.
Legacy id mantiene correspondencia estable; sin ID crear mapa de origen determinista y persistente, no regenerar UUID cada intento.
updatedAt→legacyUpdatedAt, NO fecha registro/creación. migratedAt distinto. Actor/fechas desconocidos null con procedencia.
Estado antiguo guardado literal; mapping propuesto no crea aprobación firmada. “Aprobada” legacy muestra estado heredado sin atribuir autor/fecha.
Código/Denominación no inferidos por migración. Asignación de número definitivo pendiente.
Compatibilidad versiones de copia se comprueba con fixtures y paquete real autorizado, no por número de versión.

## 4. EvidenceStore: dos políticas distintas
Evidence: id, ownerType/ownerId, purpose(reference|qualityEvidence|templateOriginal), blobRef,thumbnailRef,MIME,size,width,height,digest,position,caption,source(camera|gallery|import|legacy),capturedAt nullable,importedAt,actorId,revision,transform,retiredAt/motive.
ReferencePhotoPolicy CodeMatch [usuario confirma compresión]: copia derivada reducida, conservar proporción/orientación; etiqueta transform{codec,maxDimension,quality,sourceDigest opcional}. No ampliar pequeña ni recomprimir repetidamente en cada apertura/backup.
Piloto propuesto: lado mayor1280px,JPEG calidad0.72; comparar alternativas y peso en OPPO antes de fijar. No tope fijo de cantidad ni cuatro viewSlot. Fallback codec si transparencia necesaria, pendiente prueba.
QualityEvidencePolicy: conservación original propuesta según TI/usuario; no reutilizar compresión referencia. Original plantilla inmutable.
beginImport(owner,purpose): crea contexto durable antes de cámara; draft confirmado previamente.
commitImport(contextId,file): valida decodificación/espacio, genera copia/miniatura, escribe staging y solo después vínculo confirmado; devuelve evidencia o error. Reintento no duplica.
Si cierra Android: recuperar borrador/contexto; capturas solo si adaptador realmente devuelve resultado durable; no garantizar antes de probar.
list(owner): IDs/miniaturas/orden/captions, no cargar originales para toda cuadrícula.
reorder(ids,expectedRevision),editCaption(),retire(reason) con evento. Histórico/informes mantienen referencias a revisión emitida.
deleteUnreferenced(policy): no elimina archivos de galería/cámara externos. No eliminar blob referenciado por informe/snapshot aunque se retire de ficha.
Fallo individual no pierde formulario ni adjuntos anteriores. STAGING huérfano se detecta y recupera/limpia conforme política, no silenciosamente.
Espacio disponible es estimación; manejar también fallo real en escritura.

## 5. HistoryLog
Event{id,operationId,entityId,entityRevision,type,occurredAtUTC,actorId,actorSource,before,after,reason,source}.
append integrado con cambio; lectura paginada por instante/ID estable. Edición/borrado por usuario no expuestos.
Actor desconocido legacy se declara; timestamp cliente no demuestra hora servidor.
Historial local append-only lógico no es sistema antimanipulación acreditado. Servidor/permisos pendientes.
Mismos operationIds deduplican; outbox no altera eventos de negocio para fingir subida.

## 6. ReportGenerator
generate({entityId,revision,formats,templateVersion,methodVersions,locale,reportOperationId}).
Lee snapshot confirmado con evidencia/versiones en orden. Devuelve Report{id,sourceRevision,snapshotDigest,format,templateVersion,generatorVersion,artifactRef,size,digest,status}.
Estados generating/ready/failed/cancelled; ready solo archivo persistido. Cancelación no deja informe “emitido” parcial.
PDF/Word/XLSX offline propuesto; bibliotecas/licencias/compatibilidad técnica aún pendientes.
XLSX ID/código texto; decimales exactos conservados además de presentación: Excel numérico puede perder precisión, no prometer precisión arbitraria de un Number.
CSV: fiel o protegido para lector definido; transformar solo exportación, dato raw intacto.
No “rellenar PVR” por este servicio genérico: adaptador separado cuando usuario elija.
Documento emitido inmutable dentro QCS; nueva generación nuevoID. Copia externa editable no se puede vigilar tras salir de app.
Si error evidencia/archivo faltante: fallar o informe explícitamente incompleto tras decisión, nunca fingir inclusión.
Captions y campos de usuario escapados según formato; no fórmulas desde texto ni rutas arbitrarias.
Instantánea ligada a aprobación/revisión, fechas desconocidas “No indicado”.

## 7. FileService/outbox local
UploadJob{id,idempotencyKey,artifactId/artifactRevision,digest,destinationConfigRevision,componentSetId,localRevision,status,attempts,nextAttemptAt,remoteReceipt,lastError}.
enqueue exige destino configurado; sin destino LOCAL_SAVED. No asignar remoto por guardar local.
Estados pending/uploading/uploaded/error_retryable/conflict; error no recuperable conserva local y ofrece corregir configuración, no bucle.
Worker con lease/heartbeat; reinicio convierte lease expirado en reintento, no Uploaded. Backoff configurable; cancellation conserva local.
uploaded exige recibo identificable (remoteItemId,version/etag,digest si disponible) para misma revisión; validación integración pendiente.
Idempotencia servidor: upload repetido reconcilia mismo destino/artefacto; si destino no soporta clave, estrategia explícita nombres/verificación, no garantizar exactly-once.
Aggregate(componentSet,revision): subido solo todos requeridos de esa versión confirmados. Componentes opcionales definidos, informes antiguos no obligan por accidente a que todo registro vuelva pendiente.
Nuevo informe/revisión añade conjunto nuevo; recibos viejos históricos. Conflicto de edición datos distinto de conflicto nombre archivo.
Archivar/copiar no equivale sincronizar permisos/datos. No prometer trabajo Android en segundo plano ni revocación instantánea offline.
SharePoint prueba dos cuentas/móvil pendiente B7b, sin adaptar endpoints aquí.

## 8. SearchIndex y CatalogLookup
index(entityRevision,allowedBusinessFields): index derivado reconstruible; texto original no se transforma. Normalización configurable mayúsculas/acentos/espacios.
query({text,filters,sort,cursor,actorScope}) devuelve items,totalFiltered,scope(local|remoteValidated),indexRevision.
count y lista misma consulta/snapshot/permisos; total no tamaño página. Cursor invalidado si cambia snapshot.
No JSON.stringify indiscriminado. IDs visibles opcionales, nombres internos nunca. Fechas por rango días en zona explícita.
Índice local no acredita permisos servidor; actorScope resuelto IdentityService y caché aprobada.
CatalogLookup.byCode devuelve denominación/procedencia/catalogRevision, no proveedor inferido. Estado noCatalog/notFound/multiple.
Código literal conserva ceros; índices normalizados auxiliares sin colapsar materiales distintos.
Index falla: indicar estado incompleto o consultar fuente; no mostrar contador parcial como total.

## 9. IdentityService, NumberingService, LinkService
Identity: currentSession{subject,authority,verifiedAt,expiresAt,offlinePolicy}; can(action,entity) con unknown distinto de allowed.
Legacy PIN no es usuario empresarial. Autenticación/recuperación pendientes TI; recuperación jamás deleteDatabase.
Numbering: request(entityId,operationId,type); localRef inmediato; definitivo servidor idempotente y único por namespace. Offline “Nº pendiente”, no secuencia global inventada.
Link: id,from,to,relation,sourceSnapshotRevision,createdAt,actorId; crear/quitar auditado y con permiso. Localidad transaccional si mismo almacén; remoto relación canónica/proyección, no prometer atomicidad doble servidor.
Snapshot FAC guarda evidencia immutable revisionRefs; comentarios posteriores independientes. Retirada en origen no borra informe/FAC históricos.
Sin acceso no revelar título/código/datos de destino. El hecho de mostrar vínculo sin acceso sigue política pendiente.

## 10. RegistroStore común y decisiones parametrizadas
saveDraft(payload,expectedRevision) permite parcial; register exige RuleProfile{id,version,requiredFields,unknownCodePolicy}.
Políticas estados/roles/omisión/exclusión son perfiles propuestos, no hardcode aprobado.
ChangeState valida transición/motivo/permiso contra perfil y fija evento. Informe snapshot consulta revision concreta.
Complejidad específica Homologaciones/decimal/parser y CapacityEngine siguen contratos separados pendientes.
Actor/hora raw/valor decimal como texto y escala de entrada conservados; representación cálculo no confunde precisión con redondeo visible.
Persistir al primer cambio o al entrar es decisión de implementación reversible; siempre permitir guardar progreso solicitado y antes de salir a cámara.

## 11. Verificación mínima futura, no ejecutada
- Paquete con7tiendas+binarios+settingsBlob+localStorage relevante: restauración aislada con mismo contenido/huellas.
- Migración repetida no duplica ni modifica módulos hermanos; interrupción recuperable.
- Nueva foto referencia múltiple reducida, legado visible, sin extracción contorno ni aprendizaje; calidad/peso contrastados con OPPO.
- STAGING/fallo cuota no muestra “guardado”; cancelación cámara conserva formulario.
- Conflicto revisión evita overwrite silencioso; operación repetida idempotente.
- Informe viejo conserva datos/fotos tras editar/retirar actuales.
- Outbox reintenta sin falso subido; misma revisión/recibo; componente pendiente no agregadoSubido.
- Count/lista paginada mismo total/permisos; índices no fuente autoritativa.
Estas verificaciones complementan casos previos sin añadir automáticamente al recuento150.

## 12. Encargo coordinado a Claude
Revisar SOLO coherencia de estos contratos con B1–B4 y nuevas fotos: lista servicio/operación→pantalla afectada→cambio mínimo. No rehacer contratos ni reemitir bloques.
Entregar B6 Mejora/proyectos/FAC: PDCA/8D/acciones/calendario/vínculos, flujos/estados alternativos, contenido informe y casos. FAC propuesta, roles/aprobadores pendientes. Usar EvidenceStore/HistoryLog/LinkService/ReportGenerator/outbox como dependencias.
No desarrollar parser/cálculo Capacidad/almacenes/PIN ni duplicar B0. Esos son ChatGPT.
Entrega de Claude por copia/pega del usuario; comentario Issue no demuestra que Claude lo recibió.
