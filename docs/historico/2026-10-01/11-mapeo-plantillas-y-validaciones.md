# PVR.01 / PVR.02 — inspección técnica y validaciones pendientes
ChatGPT, 2026-10-01 Europe/Madrid. Inspección de XML y fórmulas en XLSX, sin modificar originales, recalcular Excel ni probar app. NO código implementado.
Originales corporativos conservados como adjuntos de la conversación; no publicados en este repositorio público.
- PVR.01 - Template.R02.xlsx: SHA-256 b30f2bfcf5f6570c80d48afab1efacfb6de77b407566ea10613b8eb514b17270
- PVR.02 - Template.R02.xlsx: SHA-256 4d7e6007ab9d5e6f31f0e7f4e160c31e6bca6c96544908ae97c69e2d6ad4f211

## Estructura verificada por lectura
| Plantilla | Hoja | Rango | Bloques de características |
|---|---|---|---|
| PVR.01 R02 | PVR.01 | A1:Q61 | B:P, 15 columnas |
| PVR.02 R02 | PVR.02 | A1:AG61 | B:P y S:AG; Q separador |
Ambas hojas protegidas. No publicar contraseñas ni datos corporativos.

| Campo | Fila/celdas |
|---|---|
| Identificador | fila14 (repetido por fórmulas fila23) |
| Tipo | fila15: validación Dim.,Attribute,% |
| Especificación | fila16 |
| Tolerancia superior/inferior | filas17/18 |
| Nominal | fila19 |
| Límite superior/inferior | filas20/21 |
| 30 muestras | filas24:53 |
| Resultado agregado | fila54 |

PVR01 IDs1–15. PVR02 primer bloque: 1,2,3.1,3.2,4,5.1,5.2,5.3,6,7.1,7.2,7.3,8,9,10.
Segundo: S:Z IDs11–18; AA:AG sin ID aunque hay rangos de fórmulas. No crear características ficticias por existir formato/fórmulas.
Preservar identificador y texto visible, tipo de celda y orden. Excel numérico puede haber perdido un cero final: no reconstruirlo sin evidencia.

Cabecera primer bloque:
documento O1, fecha O2, código O3, revisión O4; denominación C5:G6; cliente J5:L5, proveedor J6:L6; realizado por O5:P5; pedido/lote O6:P6.
Proceso C8:E8, operación C9:E9, línea C10:E10, máquina C11:E11; condiciones dimensionales/funcionales en zona F8:L11; equipos O8:O11.
Observaciones C56:P56 y A57:P60.
Segundo bloque replica cabeceras por fórmulas: no tratarlas como homologación independiente.

## Fórmulas observadas
Dimensional: USL=nominal+tolerancia superior; LSL=nominal+tolerancia inferior.
Porcentaje: USL=nominal*(1+tolerancia superior); LSL=nominal*(1+tolerancia inferior).
Tolerancias % fracciones: 5%=0,05, inferior -5%=-0,05.
Las MEDICIONES mantienen la unidad del nominal. Tipo % describe tolerancia relativa; no obliga medición porcentual ni demuestra que sea Resistencia.
Ejemplo de criterio a contrastar: nominal100, tol-0,05/+0,05 →95..105.
La fórmula de comparación utiliza <LSL y >USL: extremos inclusivos según lectura.
Valores vacíos no deben convertirse automáticamente en conformes ni ceros por el contrato nuevo.
Dim. con tolerancia vacía puede tratarla como0 por suma; % vacío produce vacío: mostrar esta diferencia en vista previa y pedir corrección de especificación incompleta, sin aprobación automática.
Fórmulas compartidas: seguidores XML sin texto no equivalen a fórmula ausente; expandir referencias correctamente.

## Atributos y fallo de agregación
Resultado fila54 cuenta cadenas *NOK*, pero formato condicional colorea también Not ok/No ok.
Normalización propuesta: trim/case-insensitive; OK→OK; NOK/Not ok/No ok→NOK; desconocido→revisión; vacío→pendiente.
Corregir error de caso de prueba v2.1 que decía también OK→NOK.
Original fórmula puede considerar OK cualquier texto no vacío sin NOK, y con menos muestras que necesarias: no replicar.

## Contrato de evaluación propuesto, NO implementado
Resultado de muestra: pendiente / inválida / conforme / no conforme / no aplicable justificado.
Requisito completo y unidad válida antes de evaluar.
Conformidad y completitud separadas. nValidas y nRequeridas, valores inválidos no cuentan como conformes.
Fuera de límite no se oculta por estar incompleta.
Redondeo de pantalla no cambia dato evaluado; definir precisión y tolerancia numérica antes de implementación.
Cambiar especificación o muestras requeridas deja historial y reevalúa sin borrar valores.
No aplica requiere motivo y usuario/fecha.
Aprobación humana es decisión aparte: excepción explícita no transforma mediciones NOK/pendientes en OK.

## Pruebas necesarias
Dim nominal50 tol±0,5 →49,5..50,5: extremos dentro;49,499 y50,501 fuera.
Porcentaje nominal100 tol±5%→95..105: extremos dentro;94,999 y105,001 fuera.
Atributos y vacíos/desconocidos conforme normalización.
5requeridas/3válidas conformes→parcial; unaNOK→no conforme; máximo30plantilla.
Tolerancia inferior positiva→aviso, no corrección silenciosa.
Nominal/tol ausentes o límites incoherentes→no evaluable.
IDs3.1/3.10 texto conservados si original los conserva.
Vista previa contrastada con almenos10celdas incluyendo segundo bloque/muestras.
SHA original igual antes/después.
Estos son casos definidos y cálculos de referencia simples; aún no son pruebas ejecutadas contra Excel o app.
