# B6: Proyectos de calidad — entrega corregida para revisión de Claude

03/10/2026. ChatGPT corrige la entrega completa de Claude recibida en el chat. Fuente de correcciones: docs/18-contratos-v0.2-y-b6-revisado.md; contraste previo: docs/36-contraste-independiente-b6.md. Este documento y b6calc_completo.py sustituyen la versión del fixture recibida para su siguiente revisión. No aprueban políticas ni implementan B6 en QCS.

## 0. Estado, alcance y supuestos

Se conserva el alcance: PDCA/8D, causas (5 porqués/Ishikawa), acciones/responsables/fechas, Mis tareas/calendario/equipo, FAC y vínculos, informes. FAC lectura A como registro propio es un supuesto [N] del fixture; B/C continúan abiertas (C-02). No excluir esas alternativas por el código del ensayo.

Estados, compuertas, excepciones, criterios de progreso, pertenencia de acciones, roles y numeración siguen propuestas [N] donde no exista confirmación del usuario. El perfil estricto del script es un supuesto explícito, no un default de QCS. Las decisiones pendientes no se cierran por hacer pasar pruebas.

D20 del fixture excluye canceladas del denominador. Las otras alternativas se muestran como propuestas, no como tres porcentajes de una política ya elegida. Actividad completada, resultado Eficaz/No eficaz y verificación identificada son conceptos distintos. No aplica, motivo, aprobación o excepción no fabrican causa verificada ni eficacia positiva.

Vínculos usan ID interno estable. Número visible es una etiqueta opcional, mutable y no necesariamente única. Identidad, permisos y políticas empresariales requieren integración real. Asignar responsable no concede edición.

## 1. Flujos y decisiones

### 1.1 Ciclo de vida propuesto [N]

Borrador → Planificado → En curso ↔ Bloqueado → Cerrado; Cancelado propuesto. La disponibilidad de cada transición, sus motivos y permisos se define por el perfil que finalmente se apruebe. El estado no avanza por el solo hecho de calcular un porcentaje.

Perfil estricto sintético usado aquí: sin acciones abiertas, pasos requeridos terminados, causa con verificación identificada y actividades de eficacia completadas con fecha real, resultado Eficaz y verificación identificada. Todas las actividades de eficacia no canceladas se consideran requeridas en este ensayo; no es una regla aprobada general para QCS. Las alternativas No aplica o cierre con excepciones siguen abiertas y no se implementan en el script.

### 1.2 8D [nomenclatura y compuertas propuestas]

D1 Equipo; D2 Descripción; D3 Contención; D4 Causa raíz; D5 Acciones correctivas; D6 Implantación y verificación de eficacia; D7 Prevención/estandarización; D8 Cierre. Nomenclatura empresarial y obligatoriedad de orden pendientes. Se permite preparar trabajo en paralelo según el futuro perfil.

D4 no acredita causa real por una etiqueta: debe distinguir candidata, verificación identificada y procedencia. D5 puede contener acciones todavía en curso; completar la descripción del paso no equivale a ejecutar todas sus acciones.

D6 verifica implantación de D5 y contención pertinente, más eficacia; no exige terminar las preventivas futuras de D7. El cierre del conjunto puede seguir bloqueado por esas preventivas bajo el perfil sintético estricto.

D8 no se exige a sí mismo para completarse: evaluar requisitos previos D1–D7 y las demás compuertas, permitir completar D8 si el perfil lo admite, y después evaluar cierre del proyecto. El script separa `before_d8` de `project_close_issues`. No se aprueba automáticamente esta organización como política empresarial.

### 1.3 PDCA [N]

Plan → Do → Check (Eficaz/No eficaz) → Act (Estandarizar/Nuevo ciclo) es el flujo de trabajo propuesto. La exigencia de nuevo ciclo ante No eficaz y de último ciclo Eficaz para cerrar sigue ligada al perfil pendiente. El script no modela compuertas de cierre PDCA: P-B se utiliza para tareas, calendario y monitor.

### 1.4 Causas

Candidata / Verificada / Descartada; verificación con qué, quién, cuándo y procedencia. Causa probable en Ishikawa no equivale a verificada. 6M editable como propuesta. Las afirmaciones de verificación del fixture son datos sintéticos explícitos, no evidencia heredada de una homologación o proyecto real.

### 1.5 Acciones [estados y política propuestos]

Pendiente / En curso / Completada / Cancelada. Una acción pertenece a un contenedor en el fixture; acción independiente continúa abierta. Fecha real para completar y motivo para cancelar/reprogramar siguen reglas del perfil propuesto. El script de progreso solo cuenta estados: no valida todo el historial ni la admisibilidad de cada cambio de estado.

Vencimiento es DateOnly YYYY-MM-DD. Pendiente/En curso con fecha menor que hoy es vencida; fecha igual a hoy vence hoy; sin fecha no es vencida. El día de referencia se obtiene en Europe/Madrid para este ensayo, no de la zona del servidor. Reuniones tienen instante y zona, separados del vencimiento de una acción.

Responsable y colaboradores, pertenencia a equipo, motivos de reprogramación y permisos efectivos requieren reglas aprobadas. Asignar responsable no otorga acceso Editar.

### 1.6 FAC [lectura A como supuesto N]

Registro propio propuesto con siete secciones: Identificación; Descripción/evidencias; Contención/disposición; Causa; Acciones; Eficacia; Aprobación. Estados propuestos: Borrador → Abierta → Contención → Análisis → Acciones → Verificación eficacia → Pendiente aprobación → Cerrada. B/C siguen alternativas.

Instantánea desde aviso, referencias a fotos y relación de acciones son propuestas con procedencia explícita; no se duplica evidencia por decisión automática. Aprobador Nº3 abierto; aprobación no convierte No eficaz o falta de verificación en Eficaz. Referencia local y numeración definitiva FAC-AAAA-NNN son propuestas, sin servidor integrado ni números reales asignados.

## 2. Vínculos B4/B3/B6

Aviso ↔ proyecto; aviso ↔ FAC; FAC ↔ proyecto; homologación ↔ proyecto. Claves internas estables y proyecciones en extremos según permisos. Vínculo no concede lectura del destino. Placeholder “Registro vinculado (sin acceso)” o vínculo oculto depende del perfil; no se fija por este ensayo. Confirmación y permisos para crear/quitar siguen contratos provisionales B7a; no se promete transacción atómica entre almacenes remotos.

## 3. Fixture PRJ-S1 exacto

Referencia: 26/10/2026 10:00 Europe/Madrid = 09:00 UTC. Cambio de hora: 25/10/2026 03:00 CEST → 02:00 CET.

| ID | Contenedor | Tipo | Responsable | Prevista | Estado | Real |
|---|---|---|---|---|---|---|
| A1 | P-A | Contención | U1 | 2026-10-20 | Completada | 2026-10-19 |
| A2 | P-A | Correctiva | U2 | 2026-10-25 | En curso | — |
| A3 | P-A | Correctiva | U1 | 2026-10-26 | Pendiente | — |
| A4 | P-A | Preventiva | U1 | 2026-10-30 | Completada | 2026-10-22 |
| A5 | P-A | Verificación eficacia | U2 | 2026-11-15 | Pendiente | — |
| A6 | P-A | Correctiva | U1 | 2026-10-10 | Cancelada | — |
| B1 | P-B | Correctiva | U2 | 2026-10-27 | Pendiente | — |
| B2 | P-B | Correctiva | U1 | 2026-11-03 | Pendiente | — |
| F1 | FAC-1 | Contención | U1 | 2026-10-21 | Completada | 2026-10-21 |
| F2 | FAC-1 | Correctiva | U1 | 2026-10-24 | Pendiente | — |
| F3 | FAC-1 | Verificación eficacia | U1 | — | Pendiente | — |

P-A: 8D En curso, revisión 1, causa Verificada; P-B: PDCA Planificado; FAC-1: Acciones, causa Candidata. Para evaluar identificación se añaden explícitamente a la causa sintética P-A: U1, 2026-10-22T08:00:00Z, procedencia “Dato sintético añadido explícitamente al fixture”. Esto no afirma un hecho real ni reconstruye un autor histórico.

P-A pasos D1–D5 Completado, D6 En curso, D7/D8 No iniciado. A5/F3 tienen inicialmente resultado, verificador y fecha de verificación vacíos. Las variantes añaden esos campos explícitamente para probar su efecto.

## 4. Resultados base reproducidos

- P-A: seis acciones, dos completadas, una cancelada, tres abiertas. D20 2/5=40%; alternativas base 2/6=33,3% y 3/6=50%. Mostrar “2 de 5; 1 cancelada no cuenta”.
- Vencidas A2/F2; A3 vence hoy; F3 sin fecha.
- U1: vencida F2, hoy A3, más adelante B2, sin fecha F3. U2: vencida A2, esta semana B1, más adelante A5. Semana 26/10–01/11.
- Antes de D8: acciones abiertas A2/A3/A5; pasos previos D6/D7 incompletos; actividad de verificación A5 pendiente. Causa sintética P-A sí identificada.
- Cierre de P-A: lo anterior más D8 pendiente. Cuatro grupos diagnósticos en la salida corregida porque se separa D8 del conjunto previo; no son cuatro casos nuevos ni una nueva política aprobada. No se permite cierre en este perfil.
- FAC hacia Verificación eficacia: causa sin verificar y correctiva F2 abierta. Hacia Pendiente aprobación: añade actividad F3 pendiente. Los bloqueos se calculan desde datos, no se imprimen incondicionalmente.
- Calendario abierto: 24/10 F2, 25/10 A2, 26/10 A3, 27/10 B1, 03/11 B2, 15/11 A5.
- R1 24/10 09:00 Madrid = 07:00 UTC; R2 26/10 09:00 = 08:00 UTC.
- Monitor calculado: 11 acciones, 7 abiertas, 3 completadas, 1 cancelada, 2 vencidas; 2 proyectos activos, 1 con vencidas; 1 FAC abierta, 1 con vencidas.

## 5. Subcasos corregidos

### 5.1 Eficacia negativa

Cambiar solo A5 a Completada con fecha real, resultado No eficaz y verificación identificada. Bajo D20: **3 de 5 = 60%**, una cancelada. Sigue bloqueada la eficacia por **resultado No eficaz**, aunque la actividad esté completada y el resultado verificado. Sin identidad/fecha de verificación se muestra además ese faltante, separado del resultado negativo. Ofrecer o exigir nueva acción/ciclo es política pendiente, no una creación automática del script.

### 5.2 Cancelación mixta y todas canceladas

Caso mixto original: A1/A4 Completadas; A2/A3/A5/A6 Canceladas → 2 de 2=100%; cuatro canceladas no cuentan. No llamarlo “todas canceladas”.

Variante realmente todas canceladas: las seis acciones Canceladas → cero consideradas, seis canceladas → **“Sin acciones consideradas; 6 canceladas”**, porcentaje ausente. La variante se construye para comprobar progreso, no para autorizar cancelar retrospectivamente acciones completadas en QCS. Sin acciones: cero consideradas/canceladas, también sin porcentaje. Un progreso 100% no acredita eficacia ni aprobación.

### 5.3 D6, D8 y causas

D6 puede resultar sin bloqueos de su comprobación sintética cuando correctivas/contención y eficacia están satisfechas, aunque D7/preventiva futura sigan pendientes. El cierre puede continuar bloqueado.

D8 puede completarse cuando requisitos previos están satisfechos aunque D8 todavía no lo esté; cerrar proyecto sigue pendiente hasta completar D8 bajo el perfil de ensayo. Causa Candidata o Verificada sin identidad/fecha no satisface el criterio de causa del perfil estricto.

### 5.4 Reapertura [flujo propuesto, no probado por el script]

Reabrir a estado operativo definido (ejemplo En curso), con motivo y nueva revisión. Aprobación y cierre anteriores quedan históricos ligados a su revisión, sin borrarlos o reescribirlos. Informe antiguo íntegro; nueva evaluación necesaria. No restaurar automáticamente un estado anterior que vuelva a ser Cerrado.

### 5.5 Permisos [simulación pendiente]

Asignación a U3 con permiso Ver no otorga edición. Los permisos efectivos deben comprobarse mediante identidad/servidor reales. El script no simula permisos ni prueba la interfaz “Mis tareas” por políticas empresariales.

### 5.6 Reunión con hora repetida o inexistente

Reunión 25/10/2026 02:30 Europe/Madrid: dos posibilidades, 00:30 UTC (CEST) y 01:30 UTC (CET). Debe elegir offset, no aceptar arbitrariamente el primero. Reunión 29/03/2026 02:30 no existe: error claro. Vencimiento DateOnly de una acción no necesita este selector y no incorpora hora por este subcaso.

## 6. Decisiones abiertas conservadas

C-02 FAC A/B/C; Nº3 aprobador; compuertas estricto/excepciones/No aplica; D20 progreso; nomenclatura y orden 8D; pertenencia o acción independiente; roles/permisos por módulo; numeración; política de cierre PDCA y tratamiento de resultado No eficaz. El ensayo no decide ninguna.

## 7. Ejecución y límites

Ejecutados por ChatGPT el 03/10:

```sh
python3 docs/claude/b6calc_completo.py --test
python3 docs/claude/b6calc_completo.py
```

**16 comprobaciones pasan.** Cubren cálculos base, fechas/tareas/calendario, eficacia negativa y falta de resultado/identificación, cancelación mixta/todas/sin acciones, causa, FAC calculada, variación del monitor, D6/D7, D8 y conversión horaria. Salida real: docs/claude/b6calc_salida.txt.

No cubren ejecución funcional QCS, aprobación real, permisos, reapertura/persistencia, edición de informes ni integración B3/B4/B7a/SharePoint. No se declara B6 terminado ni todos sus recorridos OPPO probados.

Claude revisa esta versión concreta y comunica cambios materiales exactos. ChatGPT mantiene B3. No generar APK por esta corrección documental/de referencia.

## 8. Qué cambió y por qué

- Denominador 3/5=60% en eficacia negativa: coherencia con D20.
- Dos variantes de cancelación y guardia de denominador cero.
- Actividad, resultado y verificación separados; bloqueos negativos conservados.
- Causa/FAC/monitor calculados desde datos; desaparecen conclusiones fijas.
- Requisitos previos D8 separados del cierre; D6 no depende de D7.
- Hora ambigua pertenece a reunión, no a vencimiento DateOnly; se detecta también hora inexistente.
- Estados/compuertas/numeración propuestos rotulados coherentemente; causa P-A claramente sintética.
- El script sigue siendo referencia de fixture, no motor productivo B6 ni prueba de seguridad empresarial.
