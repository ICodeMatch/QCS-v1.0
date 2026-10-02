# Referencia de d2 y contraste Rbar/d2 — 2026-10-02
ChatGPT · Entrega documental general para B5 y contratos 19/22. Sin implementación ni prueba funcional de QCS. No fija el método elegido por el usuario.

## Fuente comprobada
Documentación oficial de Minitab, consultada 2026-10-02:
https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/control-charts/how-to/variables-charts-for-subgroups/xbar-r-chart/methods-and-formulas/unbiasing-constants-d2-d3-and-d4/
Su tabla publica d2(3)=1.693; también d2(2)=1.128, d2(4)=2.059 y d2(5)=2.326. Define d2 mediante el rango esperado de observaciones normales con desviación uno. Son constantes tabuladas redondeadas, no valores exactos de infinitos dígitos.

NIST/SEMATECH e-Handbook, sección 6.3.2.1:
https://itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm
Explica sigma estimada como promedio de rangos dividido por d2 y su relación con el tamaño de subgrupo y el modelo normal. No se extrapola esta fuente a tamaños variables con un único divisor.

## Cambio de estado documental
Sustituir «d2=1.693 sin fuente verificada» por «valor tabulado contrastado en documentación oficial de Minitab, consulta 2026-10-02; fundamento Rbar/d2 contrastado en NIST».
La selección del método, condiciones de uso, límites de tamaño y adecuación de un estudio real permanecen pendientes. Una fuente comprobada no valida una implementación ni acredita estabilidad/normalidad de datos del usuario.
Contrato describeMethods debe separar sourceVerified de profileEnabled y de disponibilidad para la forma de los datos. needsSource deja de aplicar al valor n=3 aquí contrastado; no habilita automáticamente todos los tamaños.

## Cálculo independiente
Usando los datos sintéticos CAP-S1 y CAP-S2 recibidos en B5, Decimal con precisión 40 y d2 tabulado 1.693:

| Fixture | Rbar | sigma Rbar/d2 | Cp | Cpk |
|---|---:|---:|---:|---:|
| CAP-S1 | 0.054 | 0.03189604252805670408 | 1.567592592592592593 | 1.372514403292181070 |
| CAP-S2 | 0.04 | 0.02362669816893089191 | 2.821666666666666667 | 2.595933333333333333 |

A tres decimales reproduce 1.568/1.373 y 2.822/2.596. La división usa una precisión declarada; no afirmar decimal exacto de extremo a extremo.

Comprobación numérica adicional del significado de d2(3):
para normales independientes estándar, densidad del máximo de tres = 3*phi(x)*Phi(x)^2. Por simetría, el rango esperado es dos veces el máximo esperado.
Integral numérica de 6*x*phi(x)*Phi(x)^2 por Simpson, intervalo [-10,10], 40000 subintervalos: 1.692568750643269; a tres decimales 1.693.
Es una comprobación numérica propia, no una certificación de error ni sustitución de la constante tabulada. No cambiar silenciosamente la tabla 1.693 por esta aproximación: daría resultados ligeramente distintos y requiere otra versión de método/fuente.

## Script reproducible de contraste
```python
from decimal import Decimal as D, getcontext
import math
getcontext().prec=40
datasets=[
("CAP-S1",[["50.02","50.05","49.98"],["50.10","50.07","50.12"],
 ["49.95","50.00","49.97"],["50.06","50.03","50.08"],["50.01","49.99","50.04"]],"49.90","50.20"),
("CAP-S2",[["9.98","10.00","10.02"],["10.01","10.03","10.05"],
 ["9.96","9.98","10.00"],["10.04","10.06","10.08"],["9.99","10.01","10.03"]],"9.8","10.2")]
for name,raw,lsl,usl in datasets:
    groups=[[D(x) for x in g] for g in raw]
    values=[x for g in groups for x in g]
    mean=sum(values)/D(len(values))
    rbar=sum(max(g)-min(g) for g in groups)/D(len(groups))
    sigma=rbar/D("1.693")
    cp=(D(usl)-D(lsl))/(6*sigma)
    cpk=min(D(usl)-mean,mean-D(lsl))/(3*sigma)
    print(name,rbar,sigma,cp,cpk)
def f(x):
    phi=math.exp(-x*x/2)/math.sqrt(2*math.pi)
    Phi=(1+math.erf(x/math.sqrt(2)))/2
    return 6*x*phi*Phi*Phi
a,b,n=-10.,10.,40000
h=(b-a)/n
integral=h/3*(f(a)+f(b)+sum((4 if k%2 else 2)*f(a+k*h) for k in range(1,n)))
print("Simpson",integral,round(integral,3))
```

## Coordinación
Claude incorpora la referencia y mantiene condiciones/método como decisiones abiertas. No añade casos independientes: ampliar T-CAP-07/T-CAP-11 con fuente/versionado. Total propuesto permanece 189.
