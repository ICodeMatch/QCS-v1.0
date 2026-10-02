# Relevo a Claude — QCS Prueba
Fecha: 2026-10-02, 11:01 Europe/Madrid. Autoridad: usuario.

## Cambio de coordinación
El usuario pide que Claude continúe con lo que pueda porque queda poco cupo de Work. ChatGPT deja de modificar código después de guardar este relevo. La antigua instrucción a Claude de «solo documentación / no tocar código» queda sustituida, para la primera entrega, por esta petición del usuario. Trabajar en la rama de implementación; no merge a main ni cierre de Issue sin autorización. No ampliar módulos.

## Punto exacto
Repositorio: ICodeMatch/QCS-v1.0.
Rama: implementacion/etapa1-qcs.
Último cambio de implementación: 3929d5a2b2499bed308a81b23dd5fae1b22ed201.
Código Android/web real: app/. No compilar los ZIP históricos de la raíz.
Primera entrega: acceso local provisional, Inicio QCS, CodeMatch por medidas, guardado cifrado, biblioteca/fotos de referencia, catálogo y planos. Otros módulos pendientes.
APK separada: appId com.qualitycontrol.suite.stage1; nombre QCS Prueba; versionCode 2 / versionName 0.1.1.

## Compilaciones y evidencia
- Run 36986814937, commit 5f302cbc18db97de26dc53c11025c87255e0f9b4: SUCCESS. Siete pruebas automatizadas superadas, APK compilada y capturas web reales producidas con Playwright.
- Artefacto: QCS-Prueba-0.1.1, ID 11217992743. Contiene APK y previews/01-acceso.png, 02-inicio.png, 03-codematch.png, 04-sumatorio.png.
- ChatGPT descargó e inspeccionó esas capturas. Detectó medidas apiladas en CodeMatch y tarjetas de Inicio demasiado altas.
- Commit 3929d5a corrigió CSS: cotas de desarrollo en 2 columnas, plegada en 3, tarjetas de Inicio compactas.
- Run 36987305322 compila ese último cambio. Al redactar este relevo sigue EN CURSO, no declarar éxito hasta consultar el resultado.
- https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36987305322
- El primer intento de este trabajo falló antes de compilar por paquete Android SDK 'tools' retirado. Resuelto: setup-android con packages: platform-tools.
- Ninguna prueba en OPPO ejecutada. Los 13 recorridos de aceptación de Claude siguen pendientes.
- No hay aceptación del usuario del diseño corregido ni validación de migración.

## Diseño: requisito, no rediseñar
El usuario rechazó el aspecto básico de la primera APK y exige seguir los bocetos aprobados. También adaptar icono Android. Pantallas nuevas deben mantener su patrón.
Referencias conservadas en docs/bocetos/2026-10-01/ y su README:
Inicio CodeMatch al final, Avisos, Homologaciones, Capacidad, Proyectos y CodeMatch corregido.
El usuario aportó de nuevo acceso e Inicio en este chat:
- Acceso: nave industrial azul oscuro; logo QCS turquesa con letras/tic blancos; tarjeta blanca Bienvenido, contraseña con ojo, Recordarme, Entrar turquesa, enlace recuperación.
- Inicio: cabecera blanca con logo/nombre/ajustes; fondo claro; cinco tarjetas con iconos y descripciones; No conformidades, Homologaciones, Informes de calidad, Proyectos de calidad, CodeMatch al final; barra Inicio/Registros/Ajustes.
- Interiores: cabeceras azul oscuro, fondo claro, tarjetas blancas, acciones turquesa.
Se mantienen correcciones de requisitos posteriores a los dibujos: denominación, fotos de referencia permitidas en CodeMatch (sin análisis), etc. Los dibujos no acreditan SharePoint ni permisos.

Cambios hechos:
app/src/main.js, app/www/index.html, app/www/style.css.
Logo vectorial app/www/assets/qcs-logo.svg; fondo app/www/assets/login-factory.jpg.
Variantes launcher PNG para todas las densidades y adaptive icons con drawable/qcs_brand_foreground.xml.
El fondo industrial fue generado con IA para este proyecto, sin foto descargada de terceros; procedencia en app/www/assets/README.md.
Botón Recordarme visible y pendiente/deshabilitado. Recuperación pendiente. Evitar simular funciones no implementadas.
Versión visible QCS Prueba 0.1.1 en acceso/Inicio/Ajustes.
Copias y bloqueo pasan al apartado Ajustes. Navegación inferior guarda ficha antes de salir.

## Puntos de control de Claude
1. Sumatorio: EXACTAMENTE 8 celdas, 2 columnas x 4 filas, coma/punto, vacías ignoradas, sin descuentos, Borrar cotas y Usar este total. Cambia el largo O ancho de DESARROLLO elegido; no modifica cotas plegadas; confirma sustitución de valor existente. No dar T-SUM por aprobado: contrastar B2 y esperados. El boceto corregido ofrece destino elegido.
2. Acceso: contraseña local de al menos 12 caracteres y cifrado para nuevos datos. Recuperación no implementada; perder contraseña deja datos inaccesibles sin esa clave. Copias cifradas también necesitan contraseña. No afirmar recuperación sin contraseña ni seguridad empresarial.
3. Históricos: instalación separada NO comparte almacén con app habitual. Restauración antigua v1/v2 no implementada/validada. Restauración de esta entrega solo añade códigos nuevos. No desinstalar habitual ni sustituirla. Probar migración con copia real posteriormente.
4. Cámara/galería, seis fotos, sustitución fallida, cierre de proceso, poco espacio, guardado externo, Atrás y rendimiento 18.000 referencias: pendientes OPPO.
5. Importación: Excel/CSV con vista previa, un libro de una hoja con valores literales; rechaza fórmulas y duplicados antes de escribir; exportación XLSX; PDF adjunto original. Generación PDF de ficha/informe sigue pendiente; no confundirla con abrir un plano.
6. Revisar identidad/logo real dentro de APK y las capturas, no solo el código. Comprobar también firma al actualizar QCS Prueba; no se ha validado continuidad de firma entre APK local anterior y nueva APK de CI.

## Primeros pasos para Claude
1. Abrir esta rama, leer app/README.md y comprobar run 36987305322.
2. Si éxito: obtener APK y capturas del artefacto del último run; inspeccionar aspecto frente a bocetos y entregar al usuario la APK correspondiente a 3929d5a (no una antigua).
3. Si fallo: leer error y corregir solo lo necesario en esta rama.
4. Continuar validación de primera etapa. Usuario prueba OPPO: instalación/acceso/Inicio/Atrás; búsqueda/sumatorio; fotos; catálogo/guardado; históricos solo cuando exista adaptador y copia de prueba.
5. No comenzar otros módulos antes de revisar el prototipo. Señalar ausencias y límites sin convertir propuestas D1-D25 en requisitos.
