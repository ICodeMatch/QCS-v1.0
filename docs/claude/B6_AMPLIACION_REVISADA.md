# B6 — revisión parcial de tres secciones ampliadas

03/10/2026. ChatGPT corrige directamente las secciones T-PRY-06, T-PRY-07 y T-PRY-13 recibidas en chat. No se han recibido los otros catorce elementos de la ampliación anunciada ni la nueva tabla de decisiones. No confirmar porcentajes de completitud o validación de esa entrega.

La numeración de sección no es el ID del caso. La sección 5.6 vigente de B6_PREPARADO_PARA_IMPLEMENTACION.md corresponde a reuniones repetidas/inexistentes y se conserva; integrar estos casos después de ella o en un anexo usando sus IDs originales. No sustituirla por T-PRY-06.

## Corrección de presentación de los bloqueos

Cuatro dimensiones conceptuales: acciones, pasos, causa y eficacia. En PRJ-S1 la causa sintética está verificada e identificada, por lo que solo tres dimensiones presentan bloqueos. El script corregido separa el diagnóstico de pasos previos D6/D7 del diagnóstico D8: por esa presentación emite cuatro grupos. No es una cuarta dimensión incumplida ni cambia las reglas. Agrupar D6/D7/D8 en una fila deja tres categorías activas.

A5 pendiente aparece en acciones abiertas y en actividad de verificación pendiente; es la misma acción vista desde dos requisitos, no dos acciones independientes. Su resultado negativo, ausencia de resultado y ausencia de verificación identificada deben distinguirse.

## Ampliación T-PRY-06 — matriz de estados del proyecto

Estado DEF, pendiente de implementación y prueba funcional. Todas las transiciones, campos obligatorios, motivos y compuertas que no haya aprobado el usuario son propuestas [N] de perfil, no requisitos nuevos confirmados.

Escenarios propuestos para completar bajo ese perfil:

- Borrador → Planificado: evaluar los campos que el perfil considere requeridos (título, metodología y responsable en el supuesto propuesto). No dar esos requisitos por aprobados por este caso.
- Planificado → En curso: transición confirmada por la persona; necesidad de acción o paso iniciado sigue propuesta.
- En curso ↔ Bloqueado: motivo/comentario según perfil pendiente.
- En curso → Cerrado: evaluar revisión actual de acciones, pasos, causa y eficacia según el perfil aprobado o el perfil sintético explícito del ensayo. Mostrar todos los faltantes reales; causa cumplida no aparece como bloqueo.
- Cancelación: disponibilidad por estado, motivo y permisos según perfil pendiente. No borrar datos ni documentos por cancelar.
- Reapertura de Cerrado/Cancelado: destino operativo definido, motivo, nueva revisión y evaluación. El cierre o aprobación anterior queda histórico vinculado a su revisión; no se borra ni reescribe. No volver automáticamente a un estado previo Cerrado.
- No avanzar estado por un porcentaje calculado; transiciones no permitidas muestran motivo.

Antes de guardar una transición, revalidar revisión y dependencias conforme contratos B7a; si cambiaron, reevaluar. No afirmar atomicidad de varios almacenes remotos ni permisos empresariales reales sin integración. Las proyecciones de vínculo y archivo tienen su propia coherencia.

## Ampliación T-PRY-07 — 8D, compuertas propuestas y paralelismo

Estado DEF, pendiente de implementación/prueba. Nomenclatura, orden obligatorio o guía, requisitos de paso y No aplica siguen [N]/[PROV].

- D4: verificar causa con datos de qué/quién/cuándo/procedencia bajo el perfil sintético. No aplica con motivo sigue alternativa abierta y nunca crea causa verificada. Tampoco satisface por sí solo la compuerta independiente de causa para cierre estricto.
- D5: propuesta de al menos una acción correctiva; completar descripción del paso no acredita implantar sus acciones.
- D6: comprobar implantación de correctivas D5 y contención pertinente y eficacia requerida según perfil. No depende de completar preventivas futuras D7. Cancelar una acción no demuestra que se implantó ni fue eficaz; la política de cancelación/excepción sigue abierta.
- D7: prevención/estandarización; propuesta de preventiva o No aplica con motivo, sin aprobación implícita.
- D8: evaluar los pasos previos requeridos D1–D7 y compuertas del perfil; no exigirse completado a sí mismo para poder completarse. Evaluar cierre del proyecto después según su perfil.
- Permitir redactar contenido/trabajar en paralelo sin fingir que los pasos están cumplidos.

### A5: actividad, resultado y verificación separados

A5 es una acción de verificación en el fixture; las reglas para transitar/cancelar siguen propuestas. Actividad completada requiere fecha real en el perfil de ensayo. Resultado Eficaz/No eficaz es un campo diferente. Identidad y fecha de quien verifica son distintos de responsable o fecha de realización de la actividad.

- Pendiente: bloquea acciones abiertas y actividad de verificación pendiente.
- Completada sin resultado: bloquea por resultado ausente.
- Completada + Eficaz sin verificación identificada: sigue bloqueada por ese faltante.
- Completada + Eficaz con fecha real y verificación identificada: satisface únicamente el requisito de eficacia de A5; no elimina otras acciones, pasos, causa o aprobación pendientes.
- Completada + No eficaz identificado: conserva bloqueo por resultado No eficaz aunque la actividad esté completada y verificada. Bajo D20 propuesto, cambiar solo A5 produce 3/5=60%; el progreso no acredita eficacia.

No crear automáticamente acción correctiva, reabrir A5 ni sustituir su resultado histórico. Proponer nueva acción/verificación y efectuarla con confirmación/flujo que finalmente se apruebe. Preservar evaluaciones negativas previas, revisiones e informes. Política de nueva verificación/reapertura pendiente.

## Ampliación T-PRY-13 — cierre 8D del fixture

Cálculos del fixture contrastados; presentación/interacción DEF; integración, permisos y OPPO no ejecutados.

Bajo el perfil estricto sintético [N], mostrar todos los bloqueos:

| Dimensión | Estado PRJ-S1 | Diagnóstico |
|---|---|---|
| Acciones | Bloqueada | A2, A3, A5 abiertas |
| Pasos | Bloqueada | D6/D7 previos incompletos; D8 cierre pendiente |
| Causa | Cumplida en el fixture | Verificación sintética P-A con identidad/fecha; no es evidencia real |
| Eficacia | Bloqueada | A5 actividad de verificación pendiente; no se inventa resultado |

Tres dimensiones con bloqueos; el cierre estricto del ensayo no se permite. Antes de completar D8 se excluye D8 de sus propios prerrequisitos; siguen pendientes acciones, D6/D7 y A5. Causa cumplida no se muestra como fila de error.

La salida del script conserva cuatro grupos diagnósticos por separar pasos previos y D8. La interfaz puede agruparlos por dimensión sin cambiar los datos ni esconder A5. Listas vinculadas solo si el usuario tiene acceso; enlace no concede permiso.

Cierre con excepción es alternativa [PROV], no aprobada ni implementada por este caso. Un motivo no convierte causa candidata en verificada, No eficaz en Eficaz ni evidencia ausente en presente. Conservar excepción visible si el usuario y la política la permiten.

## Motivos de las correcciones

- Coherencia entre las cautelas [N] y los esperados: las matrices no aprueban políticas nuevas.
- El término Eficaz solo no garantiza verificación identificada ni cumplimiento de todo D6/cierre.
- No automatizar acciones/reaperturas todavía abiertas; conservar histórico negativo.
- Reapertura conserva decisiones históricas; evitar la expresión ambigua “invalida/borrar cierre”.
- Separar dimensiones conceptuales de cantidad de filas diagnósticas; corregir la interpretación de mi anterior indicación sobre cuatro grupos.
- No prometer atomicidad remota antes de integrar B7a.
- Sección 5.6 previa conservada; el resto de la ampliación sigue sin recibir.

Claude revisa estos cambios concretos y comparte únicamente las restantes secciones y la tabla nueva para contraste. ChatGPT continúa B3. Sin APK ni implementación productiva de B6 por esta entrega.
