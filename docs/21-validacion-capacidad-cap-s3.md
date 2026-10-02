# Capacidad — referencia CAP-S3 y criterios sin redondeo previo
2026-10-02 ChatGPT. Cálculos ejecutados en Python con Fraction/Decimal40 y contraste statistics. Fuera de QCS; no motor implementado ni prueba app.
Complementa documentos19/20, sin modificar requisitos/defaults. Datos sintéticos.

## Referencias ejecutadas
| Dataset | n | df dentro | SSE dentro exacta | Sigma dentro agrupada | Sigma global muestral |
| --- | --- | --- | --- | --- | --- |
| [1,2];[4,5,6];[10] | 6 | 3 | 5/2 | 0.9128709291752768557616163046680035565879 | 3.204163957519444 |
| [1,2,3] | 3 | 2 | 2 | 1 | 1 |
| [2,2];[2,2] | 4 | 2 | 0 | 0 | 0 |
| [1];[2];[3] | 3 | 0 | 0 | no definida | 1 |

Un grupo singleton aporta0SSE/0df dentro, pero cuenta en global. Sigmaagrupada calculable con un solo grupo de≥2 no significa diseño estadístico adecuado ni Cp aprobado empresarialmente.
Sigma0 no permite índice finito ordinario; mostrar degenerado/no evaluable según contrato, no Infinity como éxito.
Todo singleton: cálculo global posible, dentro desconocido; no presentarCp=Cpglobal.
MétodoRbar/d2 de tamañoigual no se usa con estos tamañosvariables sin otro método documentado.

## Criterio y representación
EjemploSINTÉTICO criterio>=1.33, no umbral aprobado:
índice1.3296 se muestra1.33 a2decimales pero NOcumple.
índice1.3300 se muestra1.33 y cumple.
índice1.3304 se muestra1.33 y cumple.
Comparar valorinterno contra criterio, nunca cadena redondeada del informe.
Si precisión calculada no permite distinguir frontera, resultado debe declarar incertidumbre numérica/no decidir silenciosamente.
Interfaz puede mostrar másdecimales/contexto cuando estado parece contradictorio con redondeo.
Criterio sin configurar→sin semáforo. Cumplir criterio no aprueba homologación/proceso.

## Comparabilidad de estudios
Propuesta técnica de compareStudyCompatibility(a,b):
resultado compatible/caution/incompatible conmotivos porcampo.
Revisar código/característica/especificación y versión, unidad/escala,límites,global-vswithin,métodoestimación,tamaño/diseñosubgrupos,población/máquina/condiciones/periodo/exclusiones.
Cambios de criterio afectan evaluación, no necesariamente cálculo delíndice: guardar ambasversiones y no volver a rotular historial con criterioactual.
Métodos agrupado yRbar/d2 pueden mostrarse ladoalado conadvertencia, no “mejora/empeora” automática.
Cantidadmásalta de datos no acredita misma población ni condiciones.
Permisos/scope: comparar solo estudios autorizados;no índice revela contenidoinaccesible.

## Script reproducible
```python
from fractions import Fraction as F
from decimal import Decimal as D, localcontext
from statistics import variance, stdev
cases={'different_sizes':[[1,2],[4,5,6],[10]],
       'single_group':[[1,2,3]],'constant':[[2,2],[2,2]],
       'only_singletons':[[1],[2],[3]]}
for name, groups in cases.items():
    values=sum(groups,[]); df=sum(len(g)-1 for g in groups)
    sse=sum(sum((F(x)-sum(map(F,g))/len(g))**2 for x in g) for g in groups)
    with localcontext() as c:
        c.prec=40
        sigma=(D(sse.numerator)/D(sse.denominator)/D(df)).sqrt() if df else None
        print(name,len(values),df,sse,sigma,stdev(values))
        if df:
            other=sum(variance(g)*(len(g)-1) for g in groups if len(g)>1)/df
            assert abs(float(sse/df)-other)<1e-12
for raw in ['1.3296','1.3300','1.3304']:
    print(raw,format(D(raw),'.2f'),D(raw)>=D('1.33'))
```

## Entrega y límite
Esperados calculados y contrastados; casoB5 completo aún no recibido (solo cabeceras). No afirmar revisión deB5 ni subir inferencia como contenidoClaude.
No aumentar inventario173 automáticamente; estosfixtures amplían familiaT-CAP.
ChatGPT siguiente: contraste de métodos/tablas con fuente primaria y validación parser conforme datos reales disponibles. Claude B5 flujos/fixtures/métodos, sin duplicar motor.
