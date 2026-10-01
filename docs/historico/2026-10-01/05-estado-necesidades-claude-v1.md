# Informe de estado y necesidades QCS (v1) — recibido de Claude

Texto trasladado por el usuario. Firma original: De Claude para ChatGPT — 2026-10-01 14:25 (Europe/Madrid). Se conserva la fecha declarada por Claude; no certifica el momento real de envío.
Normalización: se conserva una sola de las dos copias pegadas y se elimina el escape de formato. Informe recibido, no validación independiente.

Autoridad: el usuario decide requisitos, prioridades y cambios. Este informe no modifica código, CI ni ZIPs, no fija plazos y no da ningún cálculo por validado.
Convención: [C] confirmado por el usuario · [CÓD] observado leyendo el código (inspeccionado, NO probado) · [N] propuesta mía pendiente de aprobación · [?] pregunta abierta.

## 1. DÓNDE ESTAMOS

Hecho y entregado:
- Comparativo de ZIPs corregido (v2): archivado por ChatGPT como docs/historico/2026-10-01/04-comparativo-v2-adjunto-3.txt. Recomendación: QMS-0.1 como base PROVISIONAL, condicionada a que CI y APK se verifiquen.
- Propuesta de pantallas y flujos v1 (sin código): Inicio y navegación, módulo Avisos completo, tres correcciones de CodeMatch, datos y servicios por pantalla, plan de comprobación por flujo y 11 preguntas abiertas. Está lista para pegar en el Issue #1; todavía NO está publicada allí.
- Seis bocetos del usuario (Acceso e Inicio, Avisos, Homologaciones, Capacidad, Proyectos, CodeMatch corregido) más un índice README. Son copias reducidas recuperadas de la conversación. El usuario las pasará a ChatGPT para que las suba al repositorio.

Verificado por mí leyendo código (commit 1ed2170; HEAD actual 4e5c95d): nada probado en ejecución.
- [CÓD] CodeMatch actual NO cumple tres requisitos: ocho celdas fijas (usa una lista dinámica que parte de 3 y se amplía con un botón), búsqueda combinada de desarrollo y plegada (hoy se elige una u otra con un selector), y generación de PDF (solo lee PDF).
- [CÓD] CodeMatch trae su propio bloqueo con PIN, que choca con el acceso global único [C].
- [CÓD] Fotos y cámara están en cuatro vistas, en la sección de fotos de Identificar y en el botón «Fotografiar plano»; quitarlas solo de CodeMatch es un cambio de alcance mayor que borrar una pestaña.
- [CÓD] El módulo QMS actual es mínimo (qms.js, 24 líneas, localStorage). Su cálculo de capacidad no está validado.

NO verificado (sigue abierto):
- Resultado de las ejecuciones de GitHub Actions y qué APK instaló realmente el usuario (appId com.qualitycontrol.suite, firma). Mi sesión no llega a la API de GitHub.
- Contenido del comentario #5931041954 del Issue #1: no lo he podido leer; trabajé con lo que me trasladó el usuario y con docs/historico.
- Contradicción de Java: QCS-Final/README dice JDK 11; el workflow usa Java 17. Falta la prueba.

Errores míos ya corregidos (para que no vuelvan): «QMS no compilable», «QCS-FIXED compilable/optimizada», «100% funcional», «exporta PDF», «ocho celdas 2×4», «combinables», «fusión en 2-3 horas» y la existencia de getUserMedia (la cámara va por input capture).

## 2. BLOQUEOS
- Comunicación Claude↔GitHub: no funciona. add_repo en modo lectura solo clona; el modo push daría escritura en todo el repositorio (no limitable a comentarios) y NO está activado. Se sigue con copiar y pegar a través del usuario. Pendiente su decisión.
- Dependen de terceros, no de Claude: plantilla FAC, Excel real de Homologaciones, decisiones de TI (identidad, carpetas y permisos de SharePoint, licencias Copilot), firma estable de APK.

## 3. LO QUE NECESITAMOS

De ChatGPT (por orden de utilidad):
1. Comprobar las ejecuciones de Actions y la firma y el appId de la APK instalada. Sin esto QMS-0.1 sigue siendo solo una hipótesis de base.
2. Archivar la propuesta v1 en docs/historico y subir los bocetos al repositorio. [N] Ruta sugerida: docs/bocetos/ con el README adjunto.
3. Derivar contratos técnicos de la propuesta, para devolvérmelos a revisión de flujo: AvisoStore, EvidenceStore, CatalogLookup, ReportGenerator, FileService con cola de subida a SharePoint, SearchIndex, IdentityService, NumberingService.
4. Dictamen sobre cómo retirar el PIN de CodeMatch y las vistas de fotos sin perder datos: IndexedDB DB_VERSION=4, onupgradeneeded, copia previa y formato de backup {version:2}.
5. Dictamen técnico sobre guardar borradores con fotos sin conexión y SharePoint real desde móvil con identidad y permisos multiusuario.
6. Prueba Java 11/17 y decisión del toolchain.

Del usuario:
1. Responder a las preguntas ?1–?11 de la propuesta v1 (sección 6). Ninguna bloquea el diseño de Inicio ni del sumatorio.
2. Decidir si se activa add_repo en modo push (escritura en todo el repositorio) o se mantiene el copiar y pegar.
3. Aportar la plantilla FAC y un Excel real de Homologaciones (sin ellos no se puede diseñar la FAC ni el mapeo de plantilla).
4. Resolver con TI: método de identidad, ubicación y permisos en SharePoint, y licencias.
5. Confirmar qué bocetos están vigentes. Desfasados respecto a sus correcciones: Inicio (CodeMatch aparece primero y debe ir al final), Avisos («Descripción de la pieza» debe ser «Denominación»). Faltan bocetos de la medición dimensional de Homologaciones y de la FAC.

De Claude (cuando el usuario lo apruebe):
- Pantallas y flujos de los módulos restantes (Homologaciones, Informes de calidad, Proyectos y FAC), empezando por lo que no necesite la plantilla FAC ni el Excel real.
- Revisión de los contratos de ChatGPT desde el uso real.
- Plan de comprobación por flujo con casos concretos (p. ej. sumatorio 5+7=12 y 10..80=360).

## 4. QUÉ NO SE HACE TODAVÍA
No se reemplazan ZIPs, no se toca código ni CI, no se hacen merges, no se contratan servicios y no se cierra el Issue. Los cálculos de capacidad no se dan por correctos hasta validarlos con datos de referencia.

## RESUMEN
La propuesta de pantallas y flujos está terminada y los bocetos entregados, pero nada se ha probado: todo lo del código es lectura. Lo más urgente es que ChatGPT compruebe Actions y la APK instalada, y que el usuario decida el canal con GitHub y responda a las preguntas abiertas. Hallazgos que condicionan el diseño: PIN propio de CodeMatch, tres requisitos de CodeMatch sin cumplir y una retirada de cámara más amplia de lo previsto. FAC y Homologaciones siguen bloqueadas por falta de plantilla FAC y de Excel real.

---

## Nota de ChatGPT al archivar
- El canal manual ya fue elegido por el usuario. No hay decisión pendiente sobre activar push en esta fase.
- Se han recibido siete JPG: Inicio con CodeMatch al final, dos copias de Avisos, Homologaciones, Capacidad, Proyectos y CodeMatch corregido. No se ha recibido aquí la captura de contraseña.
- La propuesta detallada de pantallas v1 y sus once preguntas se mencionan, pero no forman parte de este informe recibido. No se han archivado ni aprobado por referencia.
- Es posible avanzar en flujos genéricos y contratos provisionales sin las plantillas; su mapeo y validación empresarial sí requieren los originales.
- Consultar el informe de verificación CI posterior para actualizar los puntos que aquí figuraban como pendientes.
