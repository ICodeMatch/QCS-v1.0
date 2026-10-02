# Adenda: plantillas por código y criterio de portabilidad
2026-10-02 · ChatGPT · QCS
Documento general. Requisitos comunicados por el usuario a través de la actualización de Claude de las 08:55. Diseño de interfaces propuesto, pendiente de revisión. Sin implementación, modificaciones de código, ZIP o CI.

## Requisitos y decisiones separadas
Confirmado: Homologaciones usa la plantilla específica del código alojada en SharePoint; la app incluye biblioteca de plantillas Excel y creación de plantillas nuevas. Debe tener independencia.
Interpretación pendiente: biblioteca local para trabajar sin SharePoint. No convertirla en decisión confirmada sobre sincronización/visibilidad.
Windows/iOS: criterio de futuro, fuera del alcance de entrega actual. Separar reglas y datos comunes de adaptadores de cámara/archivos/persistencia/identidad. No prometer viabilidad o requisitos de distribución de plataformas no evaluadas.

## Cobertura existente
19 cubre lectura, mapeo, vista previa, procedencia, estructura variable y original sin modificar.
16/18 cubren evidencias, historial, informes, búsqueda, revisión y archivo por componentes.
22 diferencia identidad, revisión de trabajo y versión guardada.
Ninguno de ellos define completamente biblioteca de plantillas, asociaciones por código o editor/escritor de plantilla nueva. Esta adenda los reserva como extensión documental; no presentarlos implementados.

## Plantilla y versión
Template={id,name,type,origin,status,versions}.
TemplateVersion={versionId,templateId,revisionLabel,originalRef?,originalDigest?,structureSnapshot,mappingProfileRef?,structuralSignature,createdBy,createdAt,sourceRevision?}.
originalDigest de bytes distinto de structuralSignature. revisionLabel visible no sustituye versionId.
Homologación guarda templateId/versionId, estructura y mapeo utilizados. Nunca sustituir versión en sesiones ya iniciadas porque cambió biblioteca o SharePoint.
Plantilla creada en QCS conserva estructura fuente; el Excel exportado tiene su propio digest/versión de escritor. Original importado y archivo generado no son el mismo artefacto.

## Asociación código–plantilla
TemplateBinding={id,code,templateId,templateVersionId?,selectionPolicy,status,scope,revision}.
Código literal, sin conversión numérica. scope indica dispositivo o ámbito compartido; pendiente de decisión.
resolveTemplateForCode(code,context) devuelve none | single | multiple | unavailable | permissionUnknown y candidatos autorizados con versión/procedencia.
No asumir relación universal uno a uno: revisiones, procesos o clientes podrían requerir varias plantillas. Si multiple, elegir explícitamente; sin datos inventados ni selección silenciosa.
El usuario decide quién mantiene asociaciones y si selección sigue versión fijada o revisión vigente. La versión efectiva se fija al iniciar homologación.
No inferir ruta SharePoint del código ni consultar ubicación no configurada.

## Biblioteca y editor
TemplateLibrary lista, busca, lee versiones, importa mediante preview/confirmación, duplica como identidad nueva y archiva con historial.
Archivar impide selección para sesiones nuevas por defecto; mantiene acceso autorizado de referencias históricas. No borrar versiones referenciadas por homologaciones.
Edición de versión activa crea borrador nuevo; confirmar nueva versión no altera original ni sesiones anteriores.
Editor de cabecera/bloques/características conserva orden e IDs literales. Duplicados/vacíos avisan; claves internas distintas. Tipos/descripciones desconocidos se conservan y no se convierten en conformes.
Políticas de tolerancia vacía, porcentajes, unidades y muestras proceden de perfil explícito; nunca inferidas para completar plantilla.

## Exportación de plantilla nueva
TemplateWriter.export(versionId,profile) devuelve archivo derivado, digest, writerVersion, exportManifest y warnings.
Se escribe un libro nuevo con IDs como texto y valores decimales exactos como texto o columnas exactas auxiliares si se ofrece número aproximado. Límites solo si son calculables bajo especificación/perfil conocido.
Sin fórmulas nuevas en el perfil propuesto por Claude. Esto no autoriza eliminar fórmulas de un original importado ni reescribirlo.
Rótulo «Creada en QCS; oficialidad no acreditada» mientras no exista aprobación/política empresarial. No declarar oficial una plantilla por guardarla en SharePoint.
No confundir exportar plantilla vacía con escribir resultados en copia derivada de PVR: la decisión Nº1 sigue abierta.

## Local y remoto
Biblioteca local propuesta: guardar versión/original permite iniciar y medir sin acceso remoto, sujeto a permisos/política offline. Sin copia local ni conexión, mostrar unavailable; no simular descarga.
Archivo local no equivale a SharePoint ni a acceso multiusuario. Destino validado y recibo comprobado necesarios para mostrar Subido.
Actualización remota: detectar nueva versión, mostrar diferencias y ofrecer incorporarla; no sustituir sesión en curso.
Adaptadores usan archivos/bytes/referencias opacas y resultados de disponibilidad. Los contratos de dominio no exigen rutas nativas Android ni interfaces de actividad.

## FAC, prototipo y recuento
El encargo de buscar formato FAC está recibido. Ocho secciones y vista 8D siguen propuestas. Las fuentes resumidas sin enlaces/textos concretos no acreditan cumplimiento normativo; contrastar documentación primaria cuando se entregue la adenda. No aprobar formatos por analogía con resúmenes.
Opciones A/B/C de prototipo no elegidas. No fijar plazos sin alcance, comprobación de base y validación de herramientas. Preparar una propuesta de ejecución después de resolver alcance; esta adenda no autoriza implementación.
Casos vigentes propuestos: 189. T-HOM-56 a 61 son seis adicionales propuestos, separados; 195 solo si se incorporan formalmente. Ninguna prueba funcional ejecutada.

## Reparto
Claude entrega adendas y flujos completos; aplica el contraste recibido sin reemitir bloques innecesariamente.
ChatGPT mantiene contratos y contraste técnico. Esta extensión responde a las necesidades nuevas de biblioteca/asociación/editor/escritor sin duplicar las pantallas.
Pendientes del usuario: significado de independencia, ámbito de biblioteca y asociaciones, mantenimiento/permisos, oficialidad, selección de versión, destino de resultados y prototipo.
