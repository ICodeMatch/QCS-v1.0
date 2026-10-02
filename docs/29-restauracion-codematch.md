# Corrección solicitada por el usuario — 02/10/2026

El usuario rechaza la reconstrucción de CodeMatch. Alcance: conservar el layout/flujo ya existente; aplicar tema QCS; retirar Experimental y captura/análisis para identificar; conservar cámara y galería para referencias visuales por código, sin límite de cuatro fotos. Contraseña mínima 8 caracteres, permitiendo más. Renombrar el módulo «Informes de calidad» a «Herramientas de calidad».

## Implementación
Se reutilizan HTML, CSS y rutinas de fichas, catálogo, Excel y planos del CodeMatch incluido en QMS-0.1-proyecto.zip (referencia funcional que ya estaba versionada). Navegación Identificar/Biblioteca/Planos/Excel, selector desarrollo/plegada, código/denominación, filtros y tolerancias rápidas. El sumatorio conserva los destinos históricos Largo/Ancho y aplica a la medida desarrollada; ahora ocho celdas fijas 2×4 con cálculo decimal exacto.

CodeMatch se integra en QCS bajo un único acceso local. El adaptador reutiliza el almacén cifrado QCS; no crea un segundo PIN ni cambia almacenamiento de otras instalaciones. Las fotos/planos creados en el prototipo previo siguen visibles. Las sustituciones/retiradas conservan copia cifrada. No se incluye el antiguo borrado de recuperación de PIN ni Restablecer.

Volver funciona mediante una pila de pantallas y cierre de diálogos; el botón de cabecera y Atrás Android comparten el recorrido. Las fichas editadas se guardan antes de salir; un fallo detiene la navegación y no anuncia éxito. Biblioteca/Planos/Excel regresan a Identificar y desde allí a Inicio QCS.

Versión 0.1.3, versionCode 4. La comprobación detectó que la caché de firma 0.1.2 nunca se guardó (Path Validation Error). Su clave privada desapareció con el runner; no es posible actualizar ese paquete con otra clave.
Se prepara una última variante separada QCS Prueba CodeMatch, applicationId com.qualitycontrol.suite.stage1layout. No desinstalar aplicaciones con datos. Firma de entrega estable conservada fuera del repositorio en Library; las siguientes APK de este identificador deben firmarse con esa misma clave. CI entrega el APK y apksigner.jar; la firma definitiva de prueba se aplica localmente antes de entregar. La clave no se sube a GitHub ni se incluye en la APK.

## Validación pendiente de cierre
Nueve pruebas locales pasan. La compilación anterior y recorridos de navegador pasaron; las pantallas renderizadas se revisaron. Se añaden recorridos de navegador reales para 7 caracteres rechazados/8 aceptados, suma decimal, fichas al volver, Biblioteca/Planos/Excel, Ajustes e Inicio. Compilación y renderizados por GitHub Actions; comprobar resultado antes de entregar.
Instalación, permisos/cámara y los recorridos completos en OPPO siguen pendientes. No se declara migración validada de copias antiguas v1/v2 de la aplicación habitual.
