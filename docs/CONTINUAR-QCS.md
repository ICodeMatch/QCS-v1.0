# CONTINUAR QCS — punto de entrada para nuevos chats
Actualizado 2026-10-01 16:00 Europe/Madrid por ChatGPT. Se archiva documentación, sin modificar código/ZIP/CI.
Repositorio: https://github.com/ICodeMatch/QCS-v1.0
Hilo central: https://github.com/ICodeMatch/QCS-v1.0/issues/1

## Actualización: propuesta consolidada v2.2 recibida
[12 — Propuesta v2.2 completa](historico/2026-10-01/12-propuesta-pantallas-flujos-claude-v2.2.txt) es ahora la referencia consolidada de pantallas y flujos; v1, v2 y v2.1 quedan como histórico. Archivo Texto pegado(6).txt, SHA-256 del adjunto original: 2c181b1e10cdc12fd0ee1db4fbd63990d2343392a455e0f3c061a8ef1b8fa5a7. Copia de texto UTF-8 con saltos de línea normalizados.
Firma declarada Claude 16:30; recibido antes, a las 16:00 aproximadamente: conservar como fecha declarada, no evidencia de hora de ejecución.

Claude acepta las ocho correcciones y las dos precisiones: contratos provisionales con alternativas son posibles sin aprobar defaults; distinguir característica excluida de muestra omitida. Los 24 defaults D1–D24 siguen sin aprobar. No convertirlos en requisitos.
Estado común explícito: reparto y secuencia aceptados; aún faltan contratos técnicos, pruebas y decisiones. Claude no ha recibido los dos Excel y no puede consultar Issue/CI; coordinación manual.

Revisión de ChatGPT de v2.2, antes de contratos:
- Avisos F1 vuelve a proponer código y Denominación obligatorios para registrar. El caso de código desconocido durante una incidencia sigue abierto; documentar alternativa y no imponer obligación sin decisión.
- CatalogLookup menciona proveedor, pero el catálogo CodeMatch con código/denominación no demuestra maestro ni relación de proveedores. Usar fuente independiente verificada o dato manual.
- SumatorioDialog “sin estado persistente” debe aclararse frente a D10 que conserva cotas al cerrar sin aplicar mientras la búsqueda siga abierta; separar estado temporal de sesión de persistencia entre cierres de app.
- Estudios compatibles requieren revisar límites, método, población y condiciones, además de código/característica/unidad. D19 no basta para declarar comparabilidad estadística.
- La importación de Excel de mediciones de Capacidad es requisito de alcance; diferir un formato o primera fase es propuesta, no eliminarla por defecto.
- No tratar protección de hoja como impedimento para leer, ni como garantía de autenticidad.
Contratos aún NO entregados. Esta actualización no aprueba implementación.

## Instrucción para quien continúa
Lee este documento, los informes vinculados y el hilo completo antes de actuar. No repitas preguntas resueltas ni uses los comparativos iniciales retractados como verdad actual. Usuario autoridad. No hay autorización de implementación, merges, reemplazos de ZIP, cambios CI, cierre Issue ni contratación. Sí hay autorización para auditoría en lectura y archivo/publicación de documentación.
No afirmar trabajo en segundo plano, acceso de Claude a GitHub ni pruebas realizadas sin evidencia.

## Índice y procedencia
- [Histórico](historico/2026-10-01/README.md): informes01–04, iniciales superados por comparativo v2.
- [Estado Claude v1](historico/2026-10-01/05-estado-necesidades-claude-v1.md).
- [CI verificado](historico/2026-10-01/06-verificacion-ci-chatgpt.md).
- [Propuesta v1 original](historico/2026-10-01/07-propuesta-pantallas-flujos-claude-v1.txt).
- [Propuesta v2 original](historico/2026-10-01/08-propuesta-pantallas-flujos-claude-v2.txt): adjuntos Texto pegado(5).txt y Texto pegado (2).txt equivalentes; conservar una copia.
- [Propuesta v2.1, transcripción estructurada](historico/2026-10-01/09-propuesta-pantallas-flujos-claude-v2.1.md): usuario pegó documento completo; no ha aprobado sus defaults. Sustituye Homologaciones/FAC/preguntas de v2; leer ambas.
- [Estado Claude v2, registro normalizado](historico/2026-10-01/10-estado-necesidades-claude-v2.md): incluye afirmaciones de Claude, no auditoría independiente.
- [Mapeo Excel/correcciones](historico/2026-10-01/11-mapeo-plantillas-y-validaciones.md): fuente técnica vigente para errores v2.1.
- [Bocetos](bocetos/2026-10-01/README.md): siete JPG originales recibidos, incluyendo dos Avisos. Diseños, no funciones implementadas; cifras ilustrativas.
La captura de acceso/contraseña no está en este juego de siete imágenes. No inventar recuperación/autenticación.
Fechas de firmas Claude son declaradas; algunas difieren de la recepción. No certificar una ejecución por esas fechas.

## Coordinación
El usuario eligió copia/pega con Claude. Claude confirmó que nunca publicó directamente y que su supuesto automatismo era recordatorio, no acceso GitHub verificado. No pedir de nuevo canal ni habilitar push amplio por inferencia.
Claude: pantallas, navegación, flujos y reglas de uso; revisión de contratos.
ChatGPT: arquitectura/modelos/contratos, persistencia/migración/backups, parsers, archivos, SharePoint, CI/firma, validación.
Revisión cruzada y un propietario por tarea. El acuerdo general y reparto están aceptados mediante respuestas Claude trasladadas por el usuario; no confundir con aprobación de cada propuesta/default.

## Requisitos confirmados vigentes
QCS Quality Control Suite, móvil Android, navy/teal/blanco, logo ticverde, acceso global antes Inicio sin segundoPINCodeMatch.
Inicio: Avisos/NoConformidades, Homologaciones, Informes de calidad, Mejora y resolución de problemas, CodeMatch AL FINAL.
Avisos interna/proveedor/cliente; Denominación; cantidad/problema/acción inmediata; fotos y comentarios; borradores; PDF/Excel/Word; archivos/históricos/búsqueda/monitor.
SAP es nomenclatura y número opcional, no autorización API.
Homologaciones: importar Excel real preservando original; mapeo/vista previa/reutilización; tipos Dim./%/Attribute; guiada/libre/saltar/retomar/corregir.
Capacidad: Cp/Cpk dentro, Pp/Ppk global, Cm/Cmk máquina, métodos/condiciones/criterios documentados; validación independiente; no aprobación automática por índices.
Mejora: PDCA/8D, causa raíz verificada,5porqués/Ishikawa, acciones/calendario/equipo/permisos, vínculos; FAC registro propio.
Archivos definitivos SharePoint móvil real multiusuario; identidad/permisos servidor, offlineyconflictos. OneDrivePC no lo resuelve.
Copilot365 posible estudio, TI/licencias/coste pendientes; no pagar servicios.
Dispositivos empresa/autorizados para operarios, personales solo pruebas.

### CodeMatch
Retener búsqueda medidas, catálogo Excel/CSV, planes/archivos, backups, requisito informesPDF aún no implementado.
Retirar fotos/cámara/experimental SOLO CodeMatch, incluido Fotografiar plano. NO borrar fotos históricas por retirarUI; copia/exportación/análisis previo.
Dos bloques desarrollo/plegada combinables y datos parciales; no sustituir desconocidos por0 ni inventar plegadas. Intersección Y/tolerancia común propuesta pendiente.
Orientación invertida coherente por candidato.
Catálogo actual ~18.000códigos con LARGO/ANCHO DESARROLLO y denominación; no confundir con ExcelHomologaciones.
SUMATORIO corregido explícitamente por usuario:
Solo se ofrece al medir piezaPLEGADA, suma tramos para estimar DESARROLLO.
Ocho celdas fijas2×4, vacías ignoradas, destino elegido Largo o Ancho EN DESARROLLO.
No devuelve exteriores plegados; no se ofrece al medir desarrollo directamente; aproximación sin descuentos.
Esta decisión prevalece sobre botonesΣ ambiguos y propuestaChatGPT anterior.
https://github.com/ICodeMatch/QCS-v1.0/issues/1#issuecomment-5931621189

## Novedades posteriores al último comentario archivado del hilo
Usuario entregó PVR.01/PVR.02 reales y delegó formato FAC (“el que decidáis”).
La falta de plantillaFAC ya NO es bloqueo. Proponer campos y presentar revisión, no declarar procedimientoempresarial aprobado.
Excel inspeccionados por ChatGPT, NO vistos por Claude según su informe; user debe adjuntarlos también aClaude.
Originalesxlsx conservados en adjuntos, NO públicos por contenido corporativo. Mapeo/huellas en11.

## Correcciones v2.1 antes de aceptar
1 OK→OK;NOK/Not ok/No ok→NOK. Caso1.7 deClaude decía todos→NOK: error.
2 Tipo% es tolerancia relativa al nominal; medida registrada en unidad delnominal, NO necesariamente porcentaje. nominal100±5%=95..105.
3 Fórmulas usan <LSL/>USL, extremos inclusivos segúnlectura, falta ejecución.
4 % no demuestraResistencia ni PVRDimensional exclusivas: no asumir semántica sin contexto.
5 Separar decisión humana/excepción de conformidadycompletitud calculadas; registrar autorización/motivo, no transformarNOK enOK.
6 HerenciaAviso→FAC propuesta: snapshot con procedencia/vínculo, ediciones independientes sin cambiar aviso ni mutar evidencia compartida.
7 No default aprobado por silencio.31muestras vs30, tipos/estados/limpieza/caché requieren reglasexplícitas.
8 Mantener datosraw/trazabilidad; no inventar cerofinal de IDnumérico perdidoenExcel.

## Código y CI: qué está realmente comprobado
Base QMS-0.1 provisional. Claude inspeccionó commit1ed217011e242442f345de68a4a6318e06163060; gitHEADdocs reportado757a760. Nuevos commits de archivo no implican nuevo código.
Workflow blob69f8ed68c0581ac56ebae6e5574546b8dfaa419c extraeQMSzip, npm install/capaddsync/assembleDebug conJava17.
ChatGPT comprobó run36696793693SUCCESS (2026-09-30 11:32:42–11:34:13 Madrid), artefacto11087889669 QMS-0.1-APK-PRUEBA ZIP4091254bytes. No inspeccionó binarioAPK ni instalación.
https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36696793693
Anterior36694291380 falló preparandoSDK: Failed to find package 'tools', sdkmanager exitcode1; luego resuelto en flujo exitoso. No repetir como bloqueo actual.
Java17 compiló QMS, no demuestra QCS-FIXEDniresuelveREADMEJava11.
Claude corrigió “QMSno compilable/100%funcional”,“QCSFIXEDcompilable/optimizado”,“exportaPDF”,“8celdas”,“combinables”,“fusión2–3h”,“getUserMedia”.
SegúnlecturaClaude: QMSCodeMatchDB_VERSION4IndexedDB/backupversion2/PIN/importsfotoexperimentales; qms.js24líneaslocalStoragebackupv1, módulosmínimos. GeneraciónPDFausente, consultaPDFsí. QCSFIXEDstubs, no lógica validada.
Hallazgoslectura no pruebanfuncionalidad. No repetir estadosantiguos retractados.

## Pendientes y siguiente trabajo concreto
Prioridad ChatGPT, DOCUMENTACIÓN/AUDITORÍA:
1 Leer v2.2 consolidada con la revisión anterior; v1/v2/v2.1 son histórico. Preparar contratos aún NO ENTREGADOS:
HomologacionStore/TablaCaracteristicas/MuestraStore/ConformityRule/ExcelTemplateReader;
FACStore/ContainmentStore/ActionStore/LinkService/ApprovalLog;
AvisoStore/EvidenceStore/CatalogLookup/ReportGenerator/FileServiceoutbox/SearchIndex/IdentityService/NumberingService.
Campos/IDs/revisiones/errores/transiciones/persistencia/conflictos/autoría, no código.
2 MapeoExcel técnico ya documentado11; falta parser y vista previa implementados (no autorizado), casos verificadosejecución.
3 IDlocal estableindependiente de númeroFACdefinitivo; asignaciónservidor idempotente y sin colisiones necesita soluciónaprobada.
4 SharePoint: evidencia móvil/2cuentas, permisosreales/caché/revocación/conflictos. No prometer revocación instantánea de copiasoffline.
5 Auditar retiradaPIN/fotos, guardarbackupantes, conservarDB/adjuntos; DBversion no garantiza migración.
6 Descargar/inspeccionarAPKartefacto certificado/appId/versionCode luego cotejar instalación (evidenciausuariodispositivo).
7 Capacidad: referenciaClaude n15,Pp1.015,Ppk0.889,Cp1.822,Cpk1.595 Pythonpropio, NO validadaindependientemente. Obtener datosycontrastar antes uso.
8 Devolver contratos aClaude para revisarflujos. Consolidar plan antes autorizacióncódigo.

Cinco decisiones pendientes (no todos bloqueostotales):
- Homolog resultados Excel/QCS/ambos (propuesta registroQCS+originalinmutable, exportacióncopia).
- Muestras requeridas/número/por característica oestudio.
- AprobadorFACypuedeiniciador.
- Métodoscapacidad/definiciónCmCmk/criterios.
- Identidad/carpetas/permisosTI.
No formularlas repetidamente ni presentar17preguntascomobloqueos.

## Secuencia general acordada, pendiente implementación
Auditoría/preservación → contratos → estabilizar acceso/navegación/firma/CodeMatch → Avisos completo y pruebaSharePoint → Homologaciones → CapacidadyMejoraFAC.
Extraerfuentesversionables/adaptarCI futuroscambios no hechos.
Usuario autoriza antes tocar código. No prometer semanas.
