# Propuesta de pantallas y flujos QCS v2.1 — Claude
Fecha declarada por Claude: 2026-10-01 15:25 Europe/Madrid. Recibida por copia y pega del usuario.
Esta es una transcripción estructurada del contenido recibido, conservando sus reglas, propuestas y preguntas. No es una aprobación ni una validación de fórmulas. Las correcciones de ChatGPT se recogen por separado en CONTINUAR-QCS.md y en 11-mapeo-plantillas-y-validaciones.md.

Autoridad: el usuario decide requisitos, prioridades y cambios. Solo documentación y planificación: no modifica código, ZIPs ni CI, no hace merges, no contrata servicios, no fija plazos y no da ningún cálculo por validado.
Convención: [C] confirmado por el usuario; [CHAT] hallazgo trasladado por ChatGPT, NO inspeccionado por Claude; [CÓD] observado en código, no probado; [N] propuesta pendiente de aprobación; [?] pregunta abierta.

## 0. Cambios respecto a v2
Sustituye apartado 3 de v2 (Homologaciones), parte FAC del apartado 5 y apartado 8 (preguntas).
Sin cambios: apartado 1 (decisiones resueltas), apartado 2 (sumatorio), apartado 4 (Capacidad) y M1–M6 del apartado 5.
Claude NO ha visto PVR.01 y PVR.02 Template R02. Sus datos de celdas, fórmulas y validaciones vienen del informe de ChatGPT. Necesita recibirlos para inspeccionarlos.
Claude sigue sin poder abrir comentarios del Issue; comunicación manual.

## 1. Homologaciones
### 1.1 Plantillas [CHAT]
Tipos Dim., %, Attribute; hasta 30 mediciones por característica. PVR.01: 15 características; PVR.02 añade segundo bloque y utiliza identificadores como 3.1, 3.2, 5.1.
No son catálogo CodeMatch.
Problemas: resultado agregado de atributos busca NOK, colores reconocen también Not ok y No ok; porcentajes fraccionarios; tolerancia inferior se suma con signo; OK agregado con mediciones parciales.
No copiar fórmulas sin contrastar.

### 1.2 Modelo interno [N]
Tabla de características:
- Identificador TEXTO: conservar 3.1, 3.10, 5.1 literalmente y en orden de origen, sin ordenar como decimales.
- Descripción, bloque/hoja de origen, tipo.
- Dim.: nominal, tolerancia inferior con signo, superior, unidad.
- %: nominal, tolerancias inferior/superior en %, límites calculados siempre visibles; fracción interna, porcentaje visible. Entrada de tolerancias 5 o 5 %, no 0,05.
- Atributo: sin límites, OK/NOK.
- Hasta 30 muestras con autor y fecha; muestras requeridas por característica.
- Trazabilidad: archivo, hoja, celda de cada dato, fecha de lectura, huella.
- Tolerancia inferior positiva: avisar sin corregir silenciosamente.
Claude deja pendiente inspeccionar límites porcentuales e inclusión de extremos.

### 1.3 Importación [N]
1. Elegir archivo SharePoint/dispositivo; original nunca se modifica.
2. Detectar hojas, bloques y número de características.
3. Vista previa con identificador, tipo, nominal, tolerancias, unidad, muestras existentes y procedencia de cada dato.
Avisos: tolerancia inferior positiva, atributo desconocido, porcentaje ambiguo, identificador convertido a número, fila vacía.
4. Corregir mapeo manual de hoja/columnas/celdas; guardar por plantilla y revisión.
5. Confirmar crea tabla y abre modo tabla, pendiente o con muestras existentes.
Normalizar OK, NOK, Not ok y No ok; desconocidos pendientes, nunca OK automático.
?H7: copia Excel, registro QCS o ambos. Mientras no se decida, diseñar registro propio sin escribir Excel; no constituye implementación.

### 1.4 Muestras y estados [N]
Requeridas 1–30, fijadas al crear y ajustables por característica; sin número por defecto impuesto (?H3).
Más muestras que requeridas, hasta 30.
Dos indicadores independientes:
- Conformidad medida: Sin medir / Conforme / No conforme.
- Completitud n de N.
Estado calculado no editable:
- Pendiente: 0.
- Parcial, conforme hasta ahora: conforme e incompleta.
- No conforme: cualquier muestra fuera, incluso incompleta.
- Completa y conforme: todas requeridas y conformes.
No mostrar OK de característica/homologación incompleta.
No aplica solo con motivo; visible y contado aparte.
Resumen: completas, parciales, pendientes, no conformes, no aplicables; conformidad y completitud separadas.

### 1.5 Medición guiada/libre [N]
Orden por característica (todas sus muestras) o por pieza (muestra 1 de todas, luego 2).
Modo libre: tabla completa y filtros Todas/Pendientes/Parciales/No conformes, cualquier celda.
Dim.: numérico, unidad y límites antes de medir, resultado inmediato, coma/punto.
Texto original propuesto por Claude para %: “se escribe el porcentaje con su símbolo; la app lo convierte internamente y muestra los límites calculados”. Definición pendiente de inspección.
Atributo: botones OK/NOK sin texto libre; comentario/foto sugeridos, no obligatorios, en NOK.
Saltar deja pendiente; volver/corregir sin perder resto; autoguardado borrador; retomar tras cerrar; icono/texto además de color.

### 1.6 Resto [N]
H1, H5, H6, H7 de v2: alta, evidencias y resultado, PDF/Excel/Word, archivo SharePoint, monitor, vínculos.
Resultado general humano; app sugiere y exige confirmación para aprobar con pendientes/parciales/no conformes, registrándolo.
?H8: Claude interpreta % como Resistencia y PVR como comprobación Dimensional; Material/Funcional con Atributo/%; pendiente inspección, NO confirmado.

### 1.7 Comprobaciones [N]
Texto original con error de Claude: “Atributo: «OK», «NOK», «Not ok» y «No ok» (importados) dan NOK”. Desconocido pendiente. VER corrección en documento de continuidad: OK debe dar OK.
IDs 3.1/3.10/5.1 texto y orden.
Entrada de tolerancia 5 y 5 % misma fracción; límite contra cálculo independiente.
Aviso inferior positiva.
Dim.: extremos y 0,001 fuera; inclusión pendiente de Claude.
5 requeridas/3 conformes no completa ni OK; una fuera No conforme; hasta30, no31.
Huella original invariable; al menos10 celdas de vista previa contrastadas.
Guardar/cerrar/retomar.

## 2. FAC [N salvo delegación del formato C]
Falta plantilla deja de bloquear porque usuario dice “el que decidáis”.
Propuesta inspirada en recorrido8D, no procedimiento empresarial aprobado ni equivalencia a estándar.

### 2.1 Recorrido
Borrador → Abierta → Contención → Análisis → Acciones → Verificación de eficacia → Pendiente de aprobación → Cerrada.
No eficaz/no aprobada vuelve a Acciones con motivo e historial.
Sin eficacia verificada no pendiente aprobación; sin aprobación no cierre; causa no verificada nunca confirmada; ningún avance automático.

### 2.2 Campos
Cabecera: número, título, estado, prioridad Normal/Alta, apertura, abierta por, coordinador.
1. Identificación/origen: aviso interno/proveedor/cliente, proyecto u otro; vínculo; código; Denominación; proveedor/cliente; cantidad; lote/albarán opcional; fecha/lugar/proceso; detectado por. Desde aviso hereda, corregible sin modificar aviso.
2. Descripción/evidencias: Qué/Dónde/Cuándo/Impacto o cantidad; fotos comentadas; documentos.
3. Contención: descripción/responsable/fecha/estado de acciones; cantidades revisada/no conforme; disposición retener/seleccionar/retrabajar/rechazar/devolver/otra.
4. Causa: aparición y escape/detección opcional; 5 porqués/Ishikawa/otro y vínculo M3; verificación realizada, evidencia, resultado verificada/no verificada.
5. Acciones correctivas/preventivas: descripción/tipo/responsable/colaboradores/fecha prevista/real/estado/evidencias; afecta otros códigos/líneas/clientes y explicación.
6. Eficacia: criterio medible y resultado esperado; responsable/fecha prevista; eficaz/no eficaz y evidencia.
7. Aprobación/cierre: aprobador/fecha/decisión aprobar o rechazar con motivo; comentario cierre; aprendizajes opcionales.

### 2.3 Relaciones/archivo
Abrir FAC desde aviso hereda datos/fotos y mantiene vínculo.
Relacionable con PDCA/8D, accesible desde D4; independiente de proyecto y enlazable después.
Varias acciones.
FAC-AAAA-NNN propuesto: ID provisional local, número definitivo al sincronizar, mecanismo ChatGPT.
PDF/Word/Excel, carpeta SharePoint, históricos/búsqueda, permisos proyecto y servidor.

### 2.4 Comprobaciones
Herencia de aviso; bloqueo claro de transiciones inválidas; cierre con eficacia/aprobación; causa sin verificar no confirmada; rechazo vuelve Acciones con historial; dos cuentas reales para permisos de registros/archivos, depende TI.

## 3. Servicios para contratos
HomologacionStore: cabecera/estado/borrador.
TablaCaracteristicas: modelo anterior.
MuestraStore: valor/autor/fecha.
ConformityRule: función pura por tipo.
ExcelTemplateReader: vista previa/configuración/trazabilidad/huella; deja de diferirse.
FACStore: cabecera/siete secciones.
ContainmentStore; ActionStore compartido; LinkService; NumberingService ID provisional; ApprovalLog.
Resto apartado6 de v2 sin cambios.

## 4. Preguntas y valores por defecto [N]
Cinco decisiones usuario:
1. Destino Homologaciones: Excel/QCS/ambos (?H7).
2. Muestras requeridas: número y ámbito (?H3).
3. FAC: aprobador y puede ser iniciador.
4. Capacidad: desviación agrupada o R̄/d2, definición Cm/Cmk, criterios (?K1–3).
5. TI: identidad/carpetas/permisos SharePoint (?1,7).

ChatGPT: contratos/mapeo/numeración/SharePoint/borradores offline.
Claude: inspeccionar Excel, reglas %, límites inclusivos, relación con comprobaciones.

Valores propuestos para aprobación en bloque, NO autorizados por silencio:
- Registros global filtrable; informe Avisos genérico propio; estados/numeración v1 y NºSAP manual opcional.
- Proveedores/clientes lista local editable importable; internos Área o proceso.
- Fotos sin límite fijo, aviso >20 y compresión.
- CodeMatch Y de ambos bloques, tolerancia común, sumados “estimado”.
- Sumatorio vacía al aplicar; cerrar sin aplicar conserva mientras búsqueda abierta; confirmar sobrescritura; activa bloque Desarrollo desmarcable.
- Retirar Fotografiar plano, importar archivo; conservar fotos históricas sin borrarlas, copia previa.
- Diseñar homologación Pieza; Proveedores sin flujo hasta decidir; motivos editables; resultado general humano.
- Capacidad umbral de pocos datos configurable no impuesto; compatibles mismo código/característica/unidad.
- Proyecto progreso acciones completas/totales; sin notificaciones primera entrega; FAC independiente sí; caché de archivos abiertos y cola offline.

## Resumen
Homologaciones con tres tipos y completitud separada; FAC siete secciones; sumatorio mantiene regla confirmada.
Claude no vio Excel ni comentarios. Necesita adjuntos.
Todo [N] sigue propuesto; sin código/plazos.
