# B3 Homologaciones — registro y correcciones incorporadas
2026-10-01, ChatGPT. Fuente: B3 completo de Claude pegado por el usuario. Registro normalizado, no copia literal del documento ni del script.
Estado: entrega documental para revisión; sin implementación ni prueba funcional. Defaults D1–D25 siguen propuestas. Fuentes XLSX atribuidas a revisión anterior de ChatGPT, no inspeccionadas nuevamente aquí.

## Alcance conservado
Importar Excel preservando original, mapeo/vista previa/configuración reutilizable. Estructura variable y literal por plantilla; no fijar filas, número de características/bloques/muestras. Medición guiada/libre, saltar/retomar/corregir. Decimal inclusivo. Separar medición, completitud y aprobación humana. Proveedores en alcance, operativa pendiente.
Documento fuente entrega H-P1/H-P2 alta, H-P3 importación/vista previa, H-P4 tabla, medición guiada/libre, H-P6 aprobación, informe/histórico/monitor/vínculos.
Servicios/parser/modelos corresponden a ChatGPT, aún pendientes. Claude expresa necesidades de pantalla, no duplica contratos.

## Correcciones incorporadas (prevalecen sobre texto contradictorio de B3)

### 1. Tolerancias vacías: regla por plantilla, nunca cero general
El fixture HOM-S1 adopta explícitamente vacío=0 para su característica 3.2. Ese resultado es válido SOLO bajo esa regla sintética.
Importación genérica: ausencia de tolerancia es desconocida salvo que un perfil verificado de plantilla defina su significado o existan límites explícitos suficientes.
Mostrar ausencia y procedencia; no fabricar límite cero para homologaciones en blanco ni otras plantillas.
Si no se pueden determinar límites, no evaluable hasta resolver mapeo/regla; conservar medida raw.
T-HOM-44 se divide en subcasos:
a) Perfil que define vacío=0: límites10..10,10.0001 fuera, aviso.
b) Perfil sin tal regla ni límites suficientes: límites desconocidos, no evaluable.
c) Límites explícitos verificados: evaluar sin inventar tolerancias.
Tolerancia inferior positiva no se corrige automáticamente; evaluar límites definidos y advertir si exige revisión. LSL>USL invalida regla, no genera NOK automático de la pieza.

### 2. Fórmula sustituida por valor
Ausencia de fórmula no vuelve inválida por sí sola una característica. Si nominal/tolerancias o límites explícitos permiten evaluación fiable, calcular y advertir diferencia estructural con procedencia.
Solo no evaluable cuando falta información necesaria, hay error relevante o resultado ambiguo sin regla aprobada.
Conservar fórmula/caché/valor literal como fuentes distintas. Un error en una celda no consultada no invalida globalmente la homologación.
Sustituye regla genérica de tabla4.4 para A11/A12. Tipos/gravedades de avisos siguen propuestas y deben especificarse por dependencia del dato.

### 3. Completitud no confunde ranura, muestra y pieza
Ranura conserva posición original; saltar no desplaza datos.
Recorrido “por pieza” solo si existe identidad de pieza/muestra común entre características. El mismo índice k no acredita misma pieza.
Si esa correspondencia no está definida, rotular “recorrido por posición k”, no “por pieza”.
Requeridas: indicar explícitamente si son n valores válidos cualesquiera o posiciones requeridas; política abierta. Medidas repetidas de una misma pieza no son automáticamente piezas distintas.
Valores inválidos no cuentan como válidos; no conformes numéricamente válidos sí. Omitidas/excluidas con motivo son propuestas.
N=0 debe tener regla explícita; no clasificar por accidente como Pendiente/Completa. N desconocido→Sin definir. No sumar requeridas desconocidas como cero.

### 4. Conformidad al cambiar especificación
Evaluar muestras contra versión concreta de especificación. Reevaluación conserva resultados/versiones anteriores y los informes emitidos.
“No conforme domina” aplica a muestras evaluadas válidamente bajo la misma especificación; no reutilizar NOK previo como resultado actual cuando nueva regla es desconocida/inválida.
Una regla inválida produce no evaluable actual y conserva evaluación anterior como histórico.
Aprobación referencia revisión exacta. Reapertura/cambio posterior marca decisión anterior como histórica/sustituida, sin borrarla ni reescribir informe antiguo.

### 5. Destino de resultados: opciones excluyentes claras
Sustituir apartado8.5 cuya B decía “además” y C “ambos”:
A Registro/informe QCS, sin rellenar derivado PVR.
B Archivo nuevo derivado de plantilla como salida operativa principal; registro técnico/procedencia/historial QCS se conserva para trazabilidad.
C Ambas salidas operativas: informe QCS y derivado PVR.
Original intacto en todos. Regla de escritura/formatos/protección/fórmulas del derivado pendiente de contrato y decisión; no prometer B mientras no exista.
Si usuario quiere otra clasificación de destinos, mantener intención antes de fijar rótulos A/B/C.

### 6. Huella y configuración reutilizable
Huella archivo detecta cualquier cambio de bytes, incluida cumplimentación; no equivale a estructura.
Firma estructural/configuración separadas del hash del original. Cada archivo conserva su huella; variación de mediciones no implica por sí sola estructura distinta.
Vista previa siempre accesible; formato de confirmación y cuándo exigir revisión son propuestas.
Varios bloques de una misma hoja no demuestran una única homologación para todo archivo: agrupación debe venir de cabecera/contexto/mapeo confirmado, no solo de posición visual.

### 7. Seguridad y original
Documento original íntegro conserva evidencia; lectura/importación selecciona campos previstos. No importar ni mostrar como campo empresarial un contenido que sea contraseña conocida.
No afirmar que se detecta automáticamente cualquier contraseña en texto libre. Original puede contener información sensible: acceso/retención pendientes TI.
Hoja protegida puede leerse sin editar y no acredita autenticidad. Archivo cifrado/no soportado: error claro, no solicitar credenciales innecesarias.
Restauración/pruebas sobre copia aislada, nunca único original.

### 8. Avisos de importación y gravedad
Importar datos no evaluables no significa aprobar reglas. Detectar estructura ambigua requiere revisión/mapeo antes de confirmar asignaciones incorrectas; no basta “archivo legible y alguna característica”.
Guardar original/estado provisional puede ser posible sin confirmar homologación estructurada. Cancelar no modifica registro activo; borrador y área temporal deben distinguirse.
Atributos normalizados OK/NOK con alternativas literales definidas y procedencia; sin normalización por inferencia semántica de “Pass”.
Tolerancia % debe indicar almacenamiento: proporción0.05=5% o valor5=5%, según mapeo. Nunca asumir escala por etiqueta sola.

## B3 conservado: estados y pantallas
Estados propuestos Borrador→En medición→Pendiente aprobación→Aprobada/Rechazada.
Aprobación humana con identidad/motivo, excepciones explícitas sin cambiar medidas. Roles/separación medidor-aprobador pendientes.
Seis conceptos: estado por muestra; conformidad de lo medido; válidas/requeridas; completitud; omitidas/excluidas; aprobación.
Tabla mantiene identificador literal, internalKey estable, posición/origen; duplicados distinguidos, vacío como “sin ID posición n”, no inventar ID de origen.
Evidencias/comentarios usan servicios comunes, con captura y recuperación verificables. Calibración según equipo real/fecha de medición; aviso/bloqueo pendiente.
PDF/Word/XLSX instantáneas; salida literal ID texto, CSV fiel/protegido según14. Libro QCS no se presenta como PVR rellenado.
SharePoint local/pendiente/subiendo/subido confirmado/error/conflicto por componentes. Sin prueba real no acreditar integración.
Proveedores: entrada reservada, no confundir filtro de homologaciones de piezas por proveedor con homologación del proveedor.
Datos legacy potenciales: conservar originales completos; “Aprobada” legacy no crea firma/autor/fecha verificables. Fechas desconocidas no se reconstruyen de updatedAt.

## Fixtures y casos
HOM-S1 declarado:11 características,1excluida,10consideradas; según reglas sintéticas Claude:3conformes,4no conformes,2no evaluables,1sin medir;16/21válidas;6completas,2parciales,2pendientes. No reproducido mediante script por ChatGPT en esta entrega.
Normalización atributos y vacío=0 quedan explícitos como reglas del fixture, no generalización del parser.
Ausencia de ID debe llevar aviso A5 según regla del propio B3; tabla de esperados omitía ese aviso. Duplicado “4”:A4 en ambas características, no solo segunda.
Contraste R.Status sintético no es ejecución de fórmulas Excel ni lectura nueva de archivos. No rotular como “la plantilla mostraría” sin configuración/fórmula contrastada; “simulación de regla descrita”.
HOM-M1 tiene OCHO registros (2borradores+2medición+1pendiente+2aprobadas+1rechazada), no seis. U1 muestra1borrador; permisos de otros registros deben definirse para reproducir monitor.
Recorrido guiado debe aclarar caso inicial sin medidas frente a reanudación: listar todas req≥k no coincide con “omitir completas” si se ejecuta sobre HOM-S1 ya cumplimentado.
16 nuevos T-HOM-40..55;150total hipotético, no casos aprobados ni ejecutados. T-HOM-36/38 ya cuentan P1.
Actualizar esperados T-HOM-44,48,55 con correcciones anteriores; no sumar subcasos como independientes.
Parser/helpers de script no son contrato productivo: rechazar NaN/Infinity, datos ambiguos, nominal inválido y límites incoherentes antes de comparar.
Script num() acepta Decimal no finito y limits() presupone nominal válido; fuera del fixture no robusto. Esto limita alcance del script, no invalida cálculos finitos listados.

## Dependencias y siguiente entrega
B0/B7a pendientes de ChatGPT. DF-18..23 siguen hallazgos declarados de Claude, no auditoría independiente de ChatGPT.
No convertir detalles rutinarios (momento de persistir borrador) en nueva ronda obligatoria de preguntas: resolver en contrato provisional, configurable/reversible, preservando intención del usuario.
Revisión de Claude solo si corrección afecta requisito/flujo; no reemitir B3 completo.
Solo publicación documental. Ningún código/ZIP/CI modificado, merge ni cierre Issue.
