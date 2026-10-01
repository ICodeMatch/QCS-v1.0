# Verificación de CI — ChatGPT — 2026-10-01

Consulta autenticada en lectura mediante GitHub. No se han lanzado builds ni modificado código/CI.

## Historial observado
| Ejecución | Fecha/hora Europe/Madrid | Commit | Resultado |
|---|---|---|---|
| [36696793693](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36696793693) | 2026-09-30 11:32:42 | 1ed217011e242442f345de68a4a6318e06163060 | success |
| [36694291380](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36694291380) | 2026-09-30 11:09:27 | 65e33f55a22b43b00d52558b77d60848ed6f2678 | failure |
| [36692680889](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36692680889) | 2026-09-30 10:54:40 | 146846a14aa19699b6c2662ba1dfe4853cdd7b2a | failure |
| [36681599097](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36681599097) | 2026-09-30 09:03:59 | 5b174688005205e6099429a13a6f718474e75d84 | failure |
| [36680162218](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36680162218) | 2026-09-30 08:48:19 | f3ab1a785c82371af02c8b78dc8a860352984952 | failure |

## Última ejecución
QMS Android prueba: éxito el 2026-09-30, inicio 11:32:42 y final actualizado 11:34:13 (Europe/Madrid), commit 1ed217011e242442f345de68a4a6318e06163060.
El workflow ya revisado extrae QMS-0.1-proyecto.zip, usa Java 17 y assembleDebug. Esta ejecución acredita su compilación en ese entorno. No acredita compilación de QCS-FIXED ni prueba funcional de los módulos.

## Artefacto
- Nombre: QMS-0.1-APK-PRUEBA
- ID: 11087889669
- Tamaño del ZIP de artefacto: 4091254 bytes.
- No caducado al consultar; vencimiento comunicado: 2026-12-29T09:32:42Z.
- Digest informado por GitHub del artefacto: sha256:549292b79eba7117ec9acd2739f84e5bd02c47a1447a26a79154f9cb1928fc85.
- [Ejecución de origen](https://github.com/ICodeMatch/QCS-v1.0/actions/runs/36696793693).
- No se ha inspeccionado todavía el APK binario, certificado, package/appId ni versionCode; tampoco la app instalada en el móvil. El digest anterior no es el del APK interno.

## Fallo inmediatamente anterior
Run 36694291380, commit 65e33f55a22b43b00d52558b77d60848ed6f2678: falló en android-actions/setup-android@v3 antes de generar/compilar Android.
Errores exactos de los logs:
```
Warning: Failed to find package 'tools'
Error: The process '/usr/local/lib/android/sdk/cmdline-tools/16.0/bin/sdkmanager' failed with exit code 1
```
Las etapas Preparar Android, Compilar APK de prueba y Guardar APK se omitieron. Este fallo de preparación SDK no acredita que el código fuera incompilable. La ejecución siguiente sí terminó con éxito.
Los otros tres fallos históricos se enumeran arriba; sus logs no se han analizado en esta comprobación.

## Consecuencias
QMS deja de ser una base sin evidencia de compilación: existe un build exitoso y artefacto. Continúa siendo base provisional respecto a cumplimiento funcional, integridad de datos, firma/distribución y compatibilidad con la instalación actual.
Java 17 queda acreditado para el flujo QMS de esa ejecución; no extrapolar a QCS-FIXED.
