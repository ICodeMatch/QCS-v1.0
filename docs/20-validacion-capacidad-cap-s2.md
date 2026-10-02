# Capacidad — validación independiente de referencia CAP-S2
2026-10-02, ChatGPT. Cálculos ejecutados fuera de QCS. No prueba del motor de aplicación, estabilidad del proceso ni aprobación de piezas.
Complementa contrato19. No sustituye caso antiguo sin dataset enlazado.

## Dataset reproducible
Límites9.8..10.2, cinco subgrupos de tres:
1:9.98,10.00,10.02
2:10.01,10.03,10.05
3:9.96,9.98,10.00
4:10.04,10.06,10.08
5:9.99,10.01,10.03
n15; dfglobal14; dfwithin10.
Datos sintéticos, no de empresa.

## Ejecución y contraste
Python Decimal50dígitos: media10.016, sigmaGlobal0.032906794782493521624238838930252631546212295212419, sigmaWithin pooled0.02.
Pp2.0259240411385633;Ppk1.8638501178474783;Cp3.3333333333333333;Cpk3.0666666666666667.
Segundo cálculo: statistics.mean/stdev y variance por subgrupo ponderada por ni−1, con entradasfloat. Máxima diferencia absoluta de métricas1.199040866595169e−14. Implementaciones distintas en mismo entorno, no certificación externa.
Método agrupado: sigmaWithin=sqrt(sum SSEgrupo/sum(ni−1)).
Global: desviación muestral sobre15datos. Índices según contrato19, sin redondear entrada.

## Casos de borde ejecutados
Grupos[1,3] y[100]: singleton aporta0SSE/0df, within=sqrt(2), aunque sigmaGlobal aumenta. No descartar singleton para calcular global.
Todos singleton:[1],[2]→dfwithin0,no índicewithin.
Constante:[2,2],[2,2]→sigma0; no dividir ni imprimir Infinity como capacidadválida.
Media11,sigma1,límites9..10→índicecentrado−1/3; no truncarlo a0.
Estos esperados son del cálculo independiente, no salida QCS.

## Reproducción mínima
```python
from decimal import Decimal as D, localcontext
import statistics, math
rows=[['9.98','10.00','10.02'],['10.01','10.03','10.05'],
      ['9.96','9.98','10.00'],['10.04','10.06','10.08'],['9.99','10.01','10.03']]
with localcontext() as c:
    c.prec=50
    groups=[[D(x) for x in r] for r in rows]
    values=sum(groups,[]); mu=sum(values)/len(values)
    sg=(sum((x-mu)**2 for x in values)/(len(values)-1)).sqrt()
    sw=(sum(sum((x-sum(g)/len(g))**2 for x in g) for g in groups)
        /sum(len(g)-1 for g in groups)).sqrt()
    for name,s in [('global',sg),('within',sw)]:
        print(name,mu,s,(D('10.2')-D('9.8'))/(6*s),
              min((D('10.2')-mu)/(3*s),(mu-D('9.8'))/(3*s)))
f=[[float(x) for x in r] for r in rows];v=sum(f,[])
mu=statistics.mean(v);sg=statistics.stdev(v)
sw=math.sqrt(sum(statistics.variance(g)*(len(g)-1) for g in f)/sum(len(g)-1 for g in f))
for s in [sg,sw]:
    print(mu,s,.4/(6*s),min(10.2-mu,mu-9.8)/(3*s))
```

## Próximo uso
Claude B5 puede usarCAP-S2 como fixture y estos esperados, con método/df visibles; no afirmar pruebaQCS.
ChatGPT debe contrastar motor real cuando se implemente; métodoRbar/d2 y estudio máquina aún necesitan fuente/método/configuración antes validación.
No añadir semáforo ni aprobación por índices altos. No incrementar automáticamente inventario de casos; vincular como fixture a familiaT-CAP.
