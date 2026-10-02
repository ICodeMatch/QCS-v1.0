# Corrección de conflicto de instalación — 2026-10-02
El usuario recibe «App not installed as package conflicts with an existing package».
Comparadas las APK anteriores: ambas usaban com.qualitycontrol.suite.stage1, pero certificados SHA256 distintos:
- APK inicial: e4d4e47fdec643dfc421e0243c26719f0b6055236fda6ca25a40f926f0b98db1.
- APK 0.1.1 de CI: 844aa560a538523ee3a873c7c6321c4dfb1f010d0736d0ac9e6faf6df7659f15.
No se afirma haber inspeccionado directamente el paquete instalado; el contraste explica el conflicto si corresponde a la APK inicial.

Corrección conservadora: aplicación separada QCS Prueba Diseño, applicationId com.qualitycontrol.suite.stage1design, versionName 0.1.2 / versionCode 3. Conserva namespace y clase de actividad internos.
No requiere desinstalar app habitual ni QCS Prueba; no borra, migra o comparte sus datos.
La copia nueva necesita contraseña y los datos de prueba deben crearse/importarse allí.
Se añade caché de debug.keystore en CI para reutilizar firma de estas pruebas mientras la caché exista. No acredita firma empresarial ni continuidad definitiva; una actualización futura necesita verificar certificados. No versionar claves privadas.
El diseño y resto de funcionalidad no cambian en esta corrección.

## Resultado
Commit de implementación fd826f1e7c71a2aa805694f8f922df008f0878de. Actions 36988421203 completado con éxito: siete pruebas pasan, compilación Android y renderizados pasan.
APK final comprobada: ZIP íntegro, bloque de firma presente, applicationId nuevo en configuración Capacitor y manifest binario. Vista de acceso revisada con versión 0.1.2 visible.
Archivo QCS-Prueba-Diseno-0.1.2.apk, 6896965 bytes, SHA256 4d3db16ce49455539eee558876b8d4142e0c73885782d838e1c8eca9c85bc420.
Guardada como /Quality Control Suite/QCS-Prueba-Diseno-0.1.2.apk, Library ID libfile_9b746343a9548191bf32b1644761ec16.
Pendiente: instalación y recorridos reales en el OPPO. No se declara probado el móvil ni migrados los datos históricos.
