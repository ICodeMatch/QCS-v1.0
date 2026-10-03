# B6 — contraste independiente de la entrega de Claude

03/10/2026. Recibidos en chat B6_PREPARADO_PARA_IMPLEMENTACION.md y b6calc_completo.py completos, junto con salida PRJ-S1. Se ejecutó un verificador independiente de cálculos y variantes; no se ejecutó aquí el archivo completo original de Claude. Inspección del script original para cobertura de reglas. Ninguna prueba funcional de B6 en QCS ni aprobación de políticas.

## Confirmado por reproducción

11 acciones, siete abiertas, tres completadas, una cancelada; dos vencidas A2/F2 y A3 vence hoy. D20 como supuesto: 2/5=40%; alternativas base 2/6=33,3% y 3/6=50%. R1/R2 UTC correctas y hora repetida de Madrid 25/10/2026 02:30 corresponde a 00:30/01:30 UTC según offset. FAC lectura A, progreso, compuertas y permisos siguen propuestas.

## Correcciones materiales pendientes

1. Caso 5.1: completar A5 aumenta a tres completadas; bajo D20 y una cancelada, 3/5=60%, no 3/6=50%. El resultado No eficaz conserva su bloqueo propio; no rotularlo Sin verificar si está verificado negativamente. Separar actividad, resultado y verificación identificada.
2. Caso 5.2: el escenario es dos completadas y cuatro canceladas, no todas canceladas. Conservarlo como caso mixto 2/2=100%; añadir variante realmente todas canceladas con cero consideradas, seis canceladas y ningún porcentaje. La fórmula del script original divide por cero para esta última variante.
3. El script solo mira Completada para retirar el bloqueo de eficacia; no modela resultado ni persona/fecha de verificación. No cubre Completada+No eficaz. FAC imprime causa/eficacia y transición bloqueada mediante textos fijos; contadores de proyectos/FAC también son fijos. La salida base no demuestra evaluación dinámica de esos estados.
4. Estados y compuertas de proyecto, paso, PDCA y acción deben etiquetarse coherentemente como propuestas donde no haya aprobación. El título Ciclo de vida acordado contradice las cautelas que mantienen estados abiertos. No aplica, motivo o cierre con excepción nunca fabrican causa verificada ni eficacia positiva.
5. Evitar dependencia circular: D8 cierre no puede necesitar estar completado para poder completarse. D6 conserva independencia de D7. Precisar el conjunto de requisitos del perfil propuesto sin aprobarlo por implementación.
6. Acción tiene vencimiento DateOnly, sin hora. El subcaso de 02:30 debe usar reunión/instante zonificado; no añadir hora al vencimiento de la acción por ese ejemplo.
7. La causa Verificada de P-A es un dato explícito sintético, no evidencia heredada de usuario real. El script no incluye estado de causa ni su verificación. No inferir procedencia histórica ni validar D4 desde una etiqueta sin datos del supuesto.

## Reparto y siguiente trabajo

Claude corrige documento y script de referencia con datos de resultado/verificación/causa y assertions de los subcasos existentes; entrega resultados diferenciados de cálculos base/textos fijos. ChatGPT conserva B3 implementación. No duplicar servicios B7a ni generar una APK por esta auditoría. No modificar ni cerrar decisiones de usuario mediante defaults.

Verificador reproducible: docs/scripts/verificar-prj-s1.py. Correcciones previamente vigentes: docs/18-contratos-v0.2-y-b6-revisado.md.


## Actualización 03/10: corrección realizada por ChatGPT

Tras confirmar Claude que no había modificaciones en marcha, el usuario autorizó corregir directamente. Entrega corregida: docs/claude/B6_PREPARADO_PARA_IMPLEMENTACION.md y docs/claude/b6calc_completo.py; salida y registro de 16 pruebas incluidos. Ahora Claude revisa estos archivos concretos. El apartado anterior registra lo detectado en la entrega original; no describe defectos pendientes de la nueva versión sin nueva revisión. No se ha implementado B6 productivo.
