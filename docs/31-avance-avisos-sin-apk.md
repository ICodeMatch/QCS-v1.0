# Avisos — primer avance de código, sin APK

2 de octubre de 2026. Usuario autoriza continuar por bloques y generar APK cuando haya un avance suficiente, no por cada cambio. La APK entregada sigue siendo 0.1.4; este código nuevo aún no está incluido en ella.

## Implementado en preparación

Elección Internas/Proveedor/Cliente, Datos → Fotos → Resumen, creación/guardado de borradores parciales, autoguardado confirmado, regreso/abandono seguro, listado y búsqueda por texto/tipo/fechas de creación local. No asignar número definitivo/SAP ni imponer el ciclo propuesto de estados: solo Borrador.

Datos: Código material, Denominación, proveedor/cliente cuando corresponde, cantidad afectada, descripción del problema y acción inmediata. No inferir proveedor del catálogo ni impedir borrador por código desconocido. Avisos internos no reciben un campo Área/Proceso obligatorio: sigue propuesto.

Evidencias: conservar archivo recibido, generar miniatura aparte, varias imágenes sin límite numérico impuesto, comentarios individuales y retirada con confirmación/copia conservada. El borrador y contexto se guardan antes de cámara/selector externo; recuperar el resultado que devuelva Android en su borrador. Identificador de captura estable para evitar duplicado al reintentar después de guardar. La recuperación real del proceso Android está pendiente de prueba.

Guardar se confirma tras la transacción. Cambios escritos mientras termina un guardado se conservan en el siguiente; salir intenta guardar y falla sin navegar si no se confirma. Fotos se guardan como lote sin éxito parcial. Copia cifrada existente incluye los avisos y fotos; recuperación admite nuevos avisos sin sustituir registros existentes. No borrar originales ni comprimir evidencia con la política de referencias CodeMatch.

Diseño basado en la referencia de Avisos aprobada: cabecera azul oscuro, tarjetas blancas, acentos turquesa y pasos Datos/Fotos/Informe. Revisión visual en navegador real y OPPO pendiente en este avance.

## Verificado localmente

11 pruebas automatizadas: las 9 de la base y 2 de Avisos. Datos parciales, seis evidencias sintéticas con comentarios, retirada con conservación, reintento sin duplicado, lote inválido sin guardado parcial, conflicto de edición, copia cifrada comprobada, conservación de última edición durante guardado lento, bloqueo de salida ante fallo, contexto previo a selector, navegación global y reabrir borrador. La prueba de seis evidencias sintéticas verifica almacenamiento; no sustituye seis fotos reales de cámara ni su consumo de memoria.

Bundle web preparado; no se ejecutó Capacitor/Gradle ni se generó APK en esta fase. Android se compilará únicamente con petición explícita: workflow_dispatch o commit deliberado marcado [apk]. En pushes ordinarios el workflow solo comprueba código web (npm ci/test/build) y el job Android queda omitido. Esta regla se aplica a la rama de implementación; no se modifica main.

## Pendiente del bloque

- PDF/Excel/Word con fotos/comentarios e instantánea conservada del informe generado.
- Registro/numeración/estados: separar opciones de requisitos; no aprobar D1–D25 por implementación.
- Monitor completo con estados/KPIs/gráficos cuando se concreten estados; de momento lista de borradores real sin cifras de ejemplo.
- Prueba visual y técnica de evidencia original, fotos grandes/formatos y seis fotos reales; cámara/galería, permisos y recuperación después de cierre Android.
- Recuperación de copia real con Avisos, cierre/reapertura y convivencia con datos de CodeMatch en dispositivo.
- SharePoint/identidad empresarial/permisos y vínculos a otros módulos, pendientes. Guardado local nunca se rotula Subido.

## Continuación/reparto

ChatGPT continúa este bloque, primero informes con evidencia e instantánea y después revisión integrada. No generar nueva APK hasta que el bloque merezca probarse. Antes de la siguiente APK, actualizar versión visible/Android conservando identificador y firma; la etiqueta del código en preparación indica que no es la 0.1.4 entregada.

Claude: revisar documentos de Avisos/B4 y este avance contra casos existentes, señalar contradicciones con referencias, comprobar y completar únicamente B5 pendiente. No duplicar implementación, modificar CI, reemitir B1/B2/B3/B4/B6, contratar servicios ni afirmar coordinación automática. Informes por el usuario mientras su escritura GitHub siga sin verificarse.
