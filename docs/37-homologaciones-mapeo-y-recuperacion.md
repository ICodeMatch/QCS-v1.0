# B3 — mapeo válido y recuperación con original comprobado

03/10/2026. Continuación independiente de B3 mientras Claude revisa/amplía B6. Código web, sin nueva APK.

## Cambios y motivo

El mapeo manual valida orientación, escala de porcentaje, coordenadas de los campos y cabeceras contra las dimensiones de la hoja antes de construir vista previa. Filas fraccionarias, cero, negativas o texto, columnas fuera de hoja y cabeceras inexistentes producen error claro. Campos opcionales sin asignar permanecen vacíos; identificador no asignado conserva anclaje de la característica, posición y aviso, sin inventar ID.

Sesión de Homologaciones validada antes de guardar/importar/recuperar: claves internas y de muestras sin duplicados, procedencia y tipos de datos compatibles. Al importar y recuperar se compara tamaño y SHA-256 con los bytes del original conservado. Una copia cifrada válida puede contener datos internos incoherentes; por ello no basta verificar solo su cifrado. Antes de mostrar confirmación de recuperación se rechaza original alterado/incompleto; no se escribe ningún registro de esa copia. Registros existentes siguen conservados. Guardado impide sustituir original o cambiar su mapeo ya vinculado: otra plantilla requiere sesión nueva en esta fase.

## Evidencia

- 23 pruebas de la aplicación pasan; compilación web correcta.
- Nuevos casos: coordenadas inválidas rechazadas, identificador no asignado sin inventarlo, original alterado, claves duplicadas y sustitución de original/mapeo bloqueadas.
- Ambas plantillas privadas reales siguen legibles y validan el original: PVR.01 15 características; PVR.02 23. Archivos corporativos no publicados.
- Chromium integrado B3: importación/cancelación, confirmación, guiado/libre, corrección, reapertura, perfil reutilizable, copia/restauración con original idéntico. Nueva prueba crea copia cifrada sintética con original alterado: se rechaza antes de recuperar; permanecen las dos sesiones previas, no aparece confirmación de escritura. Cero errores JavaScript.

No es aceptación OPPO, prueba completa de seguridad empresarial ni validación del módulo B6. Informes/aprobación B3 e integración SharePoint siguen pendientes. No se decide destino QCS/PVR, número de requeridas ni otras propuestas abiertas.

## Coordinación B6

El resumen de Claude anuncia 17 casos ampliados, sin compartir aún su contenido. No se declara verificada esa ampliación. En el script corregido PRJ-S1 hay tres grupos antes de D8 y cuatro al evaluar cierre del proyecto, porque además se incluye D8 pendiente; A5 eficacia pendiente sigue en los bloqueos. La sección 5.6 de la versión corregida ya corresponde a reuniones con hora repetida/inexistente: revisar numeración al ampliar, sin sobrescribirla.
