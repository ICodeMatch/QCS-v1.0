# QCS — primera etapa de implementación

Prototipo para revisión. Incluye acceso local provisional, Inicio QCS y CodeMatch. No acredita identidad, permisos corporativos ni integración con SharePoint.

La aplicación de prueba se instala por separado de la aplicación habitual. No migra, sustituye ni elimina sus datos. Las copias antiguas deben conservarse hasta probar la migración y recuperación. No desinstalar la aplicación habitual para probar esta entrega.

## Funciones incluidas

- Acceso con contraseña local y almacenamiento cifrado de los nuevos datos. Recuperación de contraseña pendiente, sin restablecimiento destructivo.
- Inicio con CodeMatch disponible y otros bloques pendientes.
- Catálogo, ficha, importación Excel/CSV con vista previa y exportación Excel con textos literales.
- Búsqueda decimal inclusiva con Coincidencia, No evaluable y Descartada. Desarrollo y plegada combinables; perfil provisional con orientación independiente y tolerancia visible.
- Sumatorio 2×4 para estimar desarrollo desde pieza plegada, sin descuentos.
- Varias fotos de referencia reducidas, etiquetas, comentarios, orden y conservación de la foto sustituida o retirada. Sin análisis automático.
- Planos PDF originales adjuntos a la ficha.
- Copia cifrada y recuperación comprobada que añade códigos nuevos sin sustituir los existentes.
- Autoguardado de campos de ficha; confirmación de éxito solo después de persistir. Conflictos de edición rechazados sin sobrescritura.

## Límites de esta entrega

No incluye migración histórica, identidad corporativa, SharePoint ni los otros módulos. La importación inicial admite libros de una hoja con valores literales; rechaza fórmulas y duplicados antes de escribir. No actualiza automáticamente códigos existentes. Los planos se entregan al visor o a la función de guardar/compartir del dispositivo.

Las fotos de referencia usan el piloto de 1.280 px y JPEG 0,72; debe revisarse su legibilidad en el OPPO. No es la política de evidencias de otros módulos. El histórico de fotos retiradas se conserva y ocupa espacio; no hay borrado de esos archivos en esta entrega.

La captura recuperada tras cierre del proceso Android está preparada, pero requiere prueba real. Cámara, galería, guardado externo, botón Atrás, comportamiento con poco espacio, rendimiento con el catálogo real y actualización con la misma firma siguen pendientes de aceptación en el OPPO.

Los siete controles automatizados locales no sustituyen los 13 recorridos de Claude ni modifican el total de casos propuestos. No se ha dado por pasada ninguna prueba del OPPO. La revisión de dependencias automatizada tampoco equivale a una auditoría de seguridad.

## Desarrollo y compilación

Requisitos: Node 20 o posterior, Java 17 **JDK completo**, Android SDK 34.

```sh
cd app
npm ci
npm test
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

Configurar el SDK local según Android Studio o la variable del entorno de desarrollo. No versionar configuraciones locales ni claves de firma. La adaptación del CLI a la versión actualizada de tar se aplica en `postinstall` y falla si cambia el API esperado.

Para revisar la versión web local:

```sh
cd app
npm run build
npm run serve
```

Abrir localhost:8080. Las funciones nativas necesitan Android; no se simula una integración real al probar la versión web.
