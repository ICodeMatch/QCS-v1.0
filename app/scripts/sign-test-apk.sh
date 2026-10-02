#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -ne 4 ]; then
  echo 'Uso: sign-test-apk.sh apksigner.jar clave.p12 entrada.apk salida.apk' >&2
  exit 2
fi
QCS_TOOL=$1
QCS_KEYSTORE=$2
QCS_INPUT=$3
QCS_OUTPUT=$4
: "${QCS_SIGN_PASSWORD:?Introduce la contraseña de firma mediante la variable local QCS_SIGN_PASSWORD}"
java -jar "$QCS_TOOL" sign --ks "$QCS_KEYSTORE" --ks-key-alias qcs-prueba-codematch --ks-pass env:QCS_SIGN_PASSWORD --key-pass env:QCS_SIGN_PASSWORD --min-sdk-version 22 --out "$QCS_OUTPUT" "$QCS_INPUT"
java -jar "$QCS_TOOL" verify --verbose --print-certs "$QCS_OUTPUT"
