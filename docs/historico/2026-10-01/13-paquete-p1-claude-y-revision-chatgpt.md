# Paquete P1 de Claude y revisión de ChatGPT — 2026-10-01

## Procedencia y alcance
Registro estructurado del paquete completo pegado por el usuario en este chat el 2026-10-01, seguido de la revisión de ChatGPT. No es reproducción literal ni auditoría independiente del código.
El usuario autoriza actualizar la documentación de GitHub. Continúa el alcance de documentación, análisis y auditoría en lectura: sin implementación, ZIPs, CI, merges ni cierre de Issue.
Claude declara como base su v2.3 (claude/PROPUESTA_PANTALLAS_FLUJOS_v2_3.md) y CONTINUAR-QCS.md; declara origin/main 1f0cdc6. No certificamos ese HEAD como actual.
La v2.3 completa no se ha recibido en este turno ni se acredita aquí su publicación. P1 informa que sustituye v2.2, v2.2.1 y partes de bloques 3–5. La v2.2 archivada sigue disponible como fuente completa anterior; P1 registra cambios posteriores, no reconstruye documentos ausentes.
[C] confirmado; [CÓD] lectura declarada de Claude, no ejecución; [VERIF-C] cálculo/ejecución independiente declarada de Claude; [N]/[PROV]/[D#] propuestas o reglas abiertas. D1–D25 siguen sin aprobar.

## Correcciones que aporta Claude (E-1 a E-7)
1. Homologación de proveedores sigue dentro del alcance. D13 puede proponer empezar por Pieza, nunca excluir Proveedores. HO-9 pendiente de definición operativa/documento.
2. Búsqueda efectiva runSearchAdvanced (app.js:198–199), no runSearch. toleranceFor admite mm o porcentaje; dimensionMatchAdvanced compara orientación directa/invertida incluso con una medida. measureMode actual sigue excluyente.
3. Cinco entradas capture="environment": queryPhoto, bulkPlanCamera, arucoCamera, recordPlanCamera y patternPhotoCamera; Fotografiar plano en dos lugares.
4. resetData (app.js:313) y recuperación de PIN (314) contienen rutas destructivas. Retirar interfaz no autoriza borrar evidencias; resetData requiere auditoría propia aunque desaparezca recuperación PIN.
5. Sumatorio actual usa coma flotante y redondea a dos decimales; contrato futuro decimal.
6. Rótulos de bocetos y texto confirmado difieren. También duplican acceso a Ajustes. Resolver diseño sin declarar nuevas aprobaciones.
7. Versiones visibles v2.9.0 y v2.4 laboratorio son inconsistentes; ninguna certificada.

## Matriz de alcance y diferencias (40 identificadores)
| Familia | Requisitos/identificadores | Diferencia observada por Claude |
| --- | --- | --- |
| Acceso | AC-1 acceso global; AC-2 Inicio/navegación/contadores; AC-3 identidad QCS | QMS sin acceso global, CodeMatch con PIN propio; orden y barras distintos; identidad dividida |
| CodeMatch | CM-1 búsqueda combinada/parcial/invertida; CM-2 sumatorio; CM-3 retirar cámara conservando histórico; CM-4 catálogo, planos, copias, PDF | Selector excluyente, un par de medidas; sumatorio variable/redondeado; cinco cámaras y experimental presentes; consulta PDF existente, generación ausente |
| Avisos | AV-1 alta/borrador/estados; AV-2 código desconocido provisional; AV-3 informes; AV-4 SharePoint; AV-5 histórico/monitor; AV-6 vínculos | qms.records.v1/localStorage, diez campos de texto; faltan Denominación, cantidad, acción inmediata, fotos, borrador, informes PDF/Word, monitor, sincronización y vínculos |
| Homologaciones | HO-1 Excel original/mapeo; HO-2 estructura de plantilla; HO-3 decimal/inclusivo; HO-4 conformidad/completitud/aprobación separadas; HO-5 guiada/libre; HO-6 aprobación humana; HO-7 cabecera/calibración propuesta; HO-8 informe/archivo; HO-9 proveedores | Módulo mínimo de texto; importador de catálogo no sirve como parser PVR; sin modelo de características, evaluación, medición ni flujo de proveedores |
| Capacidad | CP-1 métodos visibles; CP-2 validación; CP-3 importar mediciones; CP-4 criterio configurable; CP-5 conservación/comparación | Global n−1 y within agrupada; restricciones de subgrupos diferentes del diseño; máquina reutiliza stats; resultados recalculados sin versión de fórmula; sin importación ni criterios |
| Mejora | MJ-1 PDCA/8D/causa raíz; MJ-2 acciones/calendario; MJ-3 FAC propia propuesta; MJ-4 permisos | Proyectos con textos libres; sin pasos, vínculos, FAC ni usuarios |
| Servicios | SV-1 archivo/outbox; SV-2 copias; SV-3 informes; SV-4 identidad/permisos; SV-5 ciclo de vida propuesto; SV-6 evidencias propuestas; SV-7 conflictos propuestos; SV-8 fechas; SV-9 autoguardado/offline | Copias QMS y CodeMatch separadas; sin servicios comunes implementados |

Preservar protección existente qms.js:7: no sobrescribir datos que no pudieron leerse.
Importador catálogo app.js:202: lectura de sheet1.xml y valores v, no fórmulas f; no probado con PVR. No confundir con parser de Homologaciones.
Referencias de archivo/línea proceden de Claude sobre QMS-0.1-proyecto.zip, no se han vuelto a comprobar en esta actualización.

## Bloques y propietarios
Reparto documental que ChatGPT asume en este chat; no significa aprobación de defaults ni contratos entregados.
| Bloque | Propietario/estado | Entrega y dependencia |
| --- | --- | --- |
| B0 preservación | ChatGPT, pendiente | Inventario IndexedDB/localStorage, PIN/protección/recuperación, conservación/exportación, migración y copia verificable |
| B1 acceso/Inicio | Claude, documento entregado pendiente revisión | S1–S5; identidad empresarial pendiente; diseño no aprobado/implementado |
| B2 CodeMatch | Claude, siguiente bloque declarado | Búsqueda/tolerancia/no evaluados, sumatorio decimal 8 celdas, inventario retirada, casos; compartir hallazgos con B0 sin duplicar auditoría |
| B7a servicios locales | ChatGPT, contratos pendientes; Claude revisión de flujos | EvidenceStore, HistoryLog, SearchIndex, ReportGenerator, BackupService y FileService/outbox |
| B4 Avisos | Claude flujos; ChatGPT contratos/migración | F1–F6, estados, código desconocido, informe/monitor; reutiliza B7a |
| B7b SharePoint | ChatGPT protocolo/arquitectura; TI evidencia real | Dos cuentas y dispositivo, permisos/caché/revocación/conflictos; no afirmar subida sin evidencia |
| B3 Homologaciones | Claude flujos/material sintético; ChatGPT parser/modelos/evaluación | H-P1–H-P7, estructura variable, medición/informe, proveedores pendiente definición |
| B5 Capacidad | ChatGPT motor/validación; Claude flujos | Ambos métodos rotulados como alternativas propuestas, importación, conservación/comparación |
| B6 Mejora/FAC | Claude flujos; ChatGPT modelos/vínculos | PDCA/8D, acciones/calendario/equipo/FAC; depende de Avisos y permisos |

Orden técnico de Claude propuesto: B0 → B1 → B2 → B7a → B4 con B7b → B3 → B5 → B6. Capacidad documental puede avanzar independientemente. No reemplaza silenciosamente la secuencia general acordada.

## B1 entregado, pendiente revisión
S1 Acceso global (IdentityService como incógnita; sesión/error/conexión).
S2 Inicio: Avisos/No Conformidades, Homologaciones, Informes de calidad, Mejora y resolución de problemas, CodeMatch al final; contadores reales con permisos, sin cifras ilustrativas.
S3 Registros globales con filtros y estado de archivo.
S4 Ajustes: cuenta, SharePoint, copias, almacenamiento, versión.
S5 CodeMatch sin segundo PIN, vuelta a Inicio.
Propuestas: un único acceso a Ajustes en barra inferior, retirar selector de temas propio, barra global con pestañas internas, acción Nuevo aviso, vertical como fase inicial.
Navegación propuesta: Atrás/autoguardado o confirmación, conservar retorno de vínculos. No fijar una caducidad offline ni método empresarial sin decisión.

## Revisión de casos reportada por Claude
100 identificadores originales, siete fusiones, 93 distintos. Clasificación declarada: 20 esperados calculados, 28 revisables documentalmente y 45 solo definidos; 38 con decisión pendiente. Ninguno ejecutado contra QCS.
Fusiones: NAV-02→NAV-01; NUM-07→NUM-01; NUM-08→NUM-03; HOM-30→HOM-01; HOM-33→HOM-17; HOM-35→ID-09; SYN-06→SYN-01. Prefijo T- en todos. Mantener aliases por trazabilidad.
Necesidades declaradas: emulador 59, OPPO 32, material sintético 25, datos reales 4, SharePoint 4, TI 2; 61 cubribles en emulador sin móvil/SharePoint. Recuentos no recalculados aquí.
Once casos adicionales propuestos (104 distintos si se incorporan):
T-ACC-01 identidad; T-ACC-02 Atrás; T-CAM-01 retirada UI; T-CAM-02 preservación histórica; T-CAM-03 borrado; T-CM-10 import/export/planos; T-AV-07 subida real con fotos/permisos; T-AV-08 monitor/recuento; T-HOM-36 medición/retomar; T-HOM-38 informes; T-PRY-04 8D.
No confundir agregar cobertura con aprobar reglas de producto contenidas en el caso.

## Esperados reportados, no pruebas de QCS
Decimales: 5,7=USL y 12,1=LSL dentro; 0,207=LSL dentro; 100±5% acepta 95/105 y rechaza 94,999/105,001.
Sumatorio 5+7=12; 10+20+…+80=360.
CAT-S1: desarrollo185×80±5 → A-001/002/003/005/006/008; plegada120×80×40 → A-001/003/005/007 y cuatro no evaluadas; ambos → A-001/003/005. Sin tolerancia → A-001/003/008; ±4 → A-001/003/005/008; una medida185 → A-001/002/003/005/006/008.
Estos esperados requieren la definición completa de CAT-S1 para reproducirlos; no inventar fixture desde los resultados.
Capacidad: Pp1,0150; Ppk0,8887; Cp1,8217; Cpk1,5950 (agrupada). Claude refiere contraste previo de ChatGPT; este turno no lo reproduce y el estado anterior de CONTINUAR decía pendiente. Conservar discrepancia de evidencia hasta enlazar el cálculo/dataset independiente.
R̄0,054, Cp1,568/Cpk1,373 con d2=1,693: contraste externo pendiente según Claude.
Zona horaria: Claude declara cálculo zoneinfo para 25/10/2026, 02:30 local dos veces (00:30UTC+02 y 01:30UTC+01). No es ejecución QCS ni verificación nueva de ChatGPT.

## Decisiones P1–P10 (sin repetir todas al usuario ahora)
P1 identidad/SharePoint/TI. P2 proveedores/HO-9. P3 muestras requeridas. P4 resultados Homologaciones Excel/QCS/ambos. P5 métodos/criterios Capacidad y definición Cm/Cmk. P6 registro Avisos D25/estados D3. P7 búsqueda/tolerancia y D8–D12. P8 aprobador FAC/lectura C-02. P9 roles/retención/copias/informes. P10 calibración/omitidas/excluidas.
No bloquean trabajo independiente. No defaults aprobados por silencio.

## Correcciones de ChatGPT antes de consolidar
- B1 entregado como documento, pendiente revisión/decisiones; no “cerrado” ni implementación terminada.
- Porcentaje observado en código no es requisito confirmado para futura búsqueda.
- Nuevas reglas de pruebas siguen propuestas: copia previa ante cualquier borrado; impedir cierre de 8D hasta eficacia; quitar selector de temas.
- Corregir referencias internas: B2 depende de P7, no P8; HO-9 remite a P2, no P4.
- Recuperación de acceso: existe petición previa de “¿Has olvidado la contraseña?”. Conservar requisito visual referido en contexto, funcionamiento pendiente; ausencia en siete bocetos no lo cancela ni autoriza diseñar recuperación destructiva.
- Muestras/identificadores/orden/bloques proceden de cada plantilla. Nunca renumerar según una plantilla de ejemplo.
- Homologación de proveedores permanece en alcance.
- D1–D25 y 11 casos nuevos continúan propuestas. Contratos ChatGPT no entregados.
- No afirmar v2.3 completa publicada ni cálculos contrastados aquí sin evidencia.

## Siguiente entrega concreta
Claude B2: pantallas, reglas de uso y casos/inventario UI.
ChatGPT B0 + B7a: inventario datos/PIN, preservación/migración y contratos locales.
Un propietario por entrega; revisión cruzada mediante copia/pega del usuario. Sin comunicación automática con Claude acreditada.
