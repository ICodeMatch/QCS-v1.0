# Corrección de conflicto de instalación — 2026-10-02
El usuario recibe «App not installed as package conflicts with an existing package».
Comparadas las APK anteriores: ambas usaban com.qualitycontrol.suite.stage1, pero certificados SHA256 distintos:
- APK inicial: e4d4e47fdec643dfc421e0243c26719f0b6055236fda6ca25a40f926f0b98db1.
- APK 0.1.1 de CI: 844aa560a538523ee3a873c7c6321c4dfb1f010d0736d0ac9e6faf6df7659f15.
No se afirma haber inspeccionado directamente el paquete instalado; el contraste explica el conflicto si corresponde a la APK inicial.

Corrección conservadora: aplicación separada QCS Prueba Diseño, applicationId com.qualitycontrol.suite.stage1design, versionName 0.1.2 / versionCode 3. Conserva namespace y clase de actividad internos; se comprueba manifest final antes de entregar.
No requiere desinstalar app habitual ni QCS Prueba; no borra, migra o comparte sus datos.
La copia nueva necesita contraseña y los datos de prueba deben crearse/importarse allí.
Se añade caché de debug.keystore en CI para reutilizar firma de estas pruebas mientras la caché exista. No acredita firma empresarial ni continuidad definitiva; una actualización futura necesita verificar certificados. No versionar claves privadas.
El diseño y resto de funcionalidad no cambian en esta corrección.
