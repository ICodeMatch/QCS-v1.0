"""Contraste independiente del fixture recibido de Claude; no prueba funcional QCS."""
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo
from collections import Counter
TODAY=date(2026,10,26)
RAW=[('A1','P-A','U1','2026-10-20','Completada'),('A2','P-A','U2','2026-10-25','En curso'),('A3','P-A','U1','2026-10-26','Pendiente'),('A4','P-A','U1','2026-10-30','Completada'),('A5','P-A','U2','2026-11-15','Pendiente'),('A6','P-A','U1','2026-10-10','Cancelada'),('B1','P-B','U2','2026-10-27','Pendiente'),('B2','P-B','U1','2026-11-03','Pendiente'),('F1','FAC-1','U1','2026-10-21','Completada'),('F2','FAC-1','U1','2026-10-24','Pendiente'),('F3','FAC-1','U1',None,'Pendiente')]
rows=[dict(id=i,container=c,owner=u,due=date.fromisoformat(d) if d else None,status=s) for i,c,u,d,s in RAW]
opened={'Pendiente','En curso'}
late=[r['id'] for r in rows if r['status'] in opened and r['due'] and r['due']<TODAY]
assert late==['A2','F2']
assert [r['id'] for r in rows if r['status'] in opened and r['due']==TODAY]==['A3']
assert Counter(r['status'] for r in rows)=={'Completada':3,'En curso':1,'Pendiente':6,'Cancelada':1}
pa=[r for r in rows if r['container']=='P-A']
def progress(states):
 considered=[s for s in states if s!='Cancelada']
 completed=considered.count('Completada')
 return {'completed':completed,'considered':len(considered),'cancelled':states.count('Cancelada'),'percent':100*completed/len(considered) if considered else None}
base=[r['status'] for r in pa]
assert progress(base)['percent']==40
negative=list(base);negative[4]='Completada'
assert progress(negative)['percent']==60
mixed=['Completada','Cancelada','Cancelada','Completada','Cancelada','Cancelada']
assert progress(mixed)=={'completed':2,'considered':2,'cancelled':4,'percent':100.0}
assert progress(['Cancelada']*6)=={'completed':0,'considered':0,'cancelled':6,'percent':None}
for text,utc in [('2026-10-24T09:00','2026-10-24T07:00+00:00'),('2026-10-26T09:00','2026-10-26T08:00+00:00')]:
 assert datetime.fromisoformat(text).replace(tzinfo=ZoneInfo('Europe/Madrid')).astimezone(timezone.utc).isoformat(timespec='minutes')==utc
ambiguous=datetime(2026,10,25,2,30,tzinfo=ZoneInfo('Europe/Madrid'))
assert ambiguous.replace(fold=0).astimezone(timezone.utc).hour==0
assert ambiguous.replace(fold=1).astimezone(timezone.utc).hour==1
# Función usada en el script de Claude: completar actividad elimina bloqueo,
# aunque no incluye el resultado de eficacia en su modelo.
def claude_efficacy_gate(states):
 return not any(s=='Completada' for s in states)
assert claude_efficacy_gate(['Pendiente']) is True
assert claude_efficacy_gate(['Completada']) is False
try:
 total=6; cancelled=6; completed=0
 original_formula=100*completed/(total-cancelled)
except ZeroDivisionError:
 zero_error=True
else:
 zero_error=False
assert zero_error
print('Base: 11 acciones; 7 abiertas; 3 completadas; 1 cancelada; 2 vencidas. Correcto.')
print('D20 base: 2/5 = 40%; variantes base 2/6 = 33.3%, 3/6 = 50%. Correcto.')
print('A5 completada con No eficaz: bajo D20, 3/5 = 60%, no 3/6 = 50%.')
print('Caso 5.2 escrito: 2 completadas + 4 canceladas => 2/2 = 100%; no son todas canceladas.')
print('Todas canceladas real: 0 consideradas, 6 canceladas, sin porcentaje; fórmula de Claude divide por cero.')
print('Script no modela resultado eficacia; Completada + No eficaz elimina indebidamente su bloqueo de eficacia.')
print('Reuniones R1/R2 y dos posibilidades de 02:30 Madrid: conversiones correctas.')
print('Resultado: cálculos base reproducidos; subcasos y reglas pendientes, no validación funcional de QCS.')
