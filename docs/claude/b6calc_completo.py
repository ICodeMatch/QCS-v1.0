"""PRJ-S1 corregido: referencia sintética, NO motor ni prueba funcional de QCS.
Todas las compuertas, estados, FAC-A y D20 del ensayo son supuestos [N].
Ejecutar: python3 b6calc_completo.py ; pruebas: python3 b6calc_completo.py --test
"""
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from fractions import Fraction
import json
import sys
import unittest
from zoneinfo import ZoneInfo

MAD = ZoneInfo('Europe/Madrid')
REFERENCE = datetime(2026, 10, 26, 10, 0, tzinfo=MAD)
HOY = REFERENCE.date()
OPEN = {'Pendiente', 'En curso'}
PROFILE = {
    'label': 'Perfil estricto sintético [N], no aprobado',
    'progress': 'exclude_cancelled',
    'require_verified_cause': True,
    'require_effective_verified_result': True,
    'required_steps_before_D8': tuple(f'D{i}' for i in range(1, 8)),
}
RAW = [
    ('A1', 'P-A', 'contención', 'U1', '2026-10-20', 'Completada', '2026-10-19'),
    ('A2', 'P-A', 'correctiva', 'U2', '2026-10-25', 'En curso', None),
    ('A3', 'P-A', 'correctiva', 'U1', '2026-10-26', 'Pendiente', None),
    ('A4', 'P-A', 'preventiva', 'U1', '2026-10-30', 'Completada', '2026-10-22'),
    ('A5', 'P-A', 'verificación de eficacia', 'U2', '2026-11-15', 'Pendiente', None),
    ('A6', 'P-A', 'correctiva', 'U1', '2026-10-10', 'Cancelada', None),
    ('B1', 'P-B', 'correctiva', 'U2', '2026-10-27', 'Pendiente', None),
    ('B2', 'P-B', 'correctiva', 'U1', '2026-11-03', 'Pendiente', None),
    ('F1', 'FAC-1', 'contención', 'U1', '2026-10-21', 'Completada', '2026-10-21'),
    ('F2', 'FAC-1', 'correctiva', 'U1', '2026-10-24', 'Pendiente', None),
    ('F3', 'FAC-1', 'verificación de eficacia', 'U1', None, 'Pendiente', None),
]

def date_only(text):
    return date.fromisoformat(text) if text else None

A = [dict(id=i, container=c, tipo=t, resp=u, prev=date_only(p), est=s,
          real=date_only(r), result=None, verified_by=None, verified_at=None)
     for i, c, t, u, p, s, r in RAW]
PROJECTS = [
    dict(id='P-A', method='8D', state='En curso', revision=1,
         cause=dict(state='Verificada', by='U1', at='2026-10-22T08:00:00Z',
                    provenance='Dato sintético añadido explícitamente al fixture'),
         steps={f'D{i}': 'Completado' if i <= 5 else 'En curso' if i == 6 else 'No iniciado'
                for i in range(1, 9)}),
    dict(id='P-B', method='PDCA', state='Planificado', revision=1,
         cause=dict(state='Candidata', by=None, at=None), steps={}),
]
FACS = [dict(id='FAC-1', state='Acciones',
             cause=dict(state='Candidata', by=None, at=None))]

def owned(actions, container):
    return [a for a in actions if a['container'] == container]

def progress(actions, *, profile):
    if profile['progress'] != 'exclude_cancelled':
        raise ValueError('Este ensayo solo implementa el supuesto D20 declarado.')
    cancelled = sum(a['est'] == 'Cancelada' for a in actions)
    considered = len(actions) - cancelled
    completed = sum(a['est'] == 'Completada' for a in actions)
    value = Fraction(100 * completed, considered) if considered else None
    label = (f'{completed} de {considered}; {cancelled} canceladas no cuentan'
             if considered else f'Sin acciones consideradas; {cancelled} canceladas')
    return dict(completed=completed, considered=considered, cancelled=cancelled,
                percent=float(value) if value is not None else None, label=label)

def late(a, today):
    return a['est'] in OPEN and a['prev'] is not None and a['prev'] < today

def tasks(actions, user, today):
    end = today + timedelta(days=6-today.weekday())
    result = {}
    for a in actions:
        if a['resp'] != user or a['est'] not in OPEN:
            continue
        d = a['prev']
        group = ('Sin fecha' if d is None else 'Vencidas' if d < today else
                 'Hoy' if d == today else 'Esta semana' if d <= end else 'Más adelante')
        result.setdefault(group, []).append(a['id'])
    return result

def cause_verified(cause):
    return cause['state'] == 'Verificada' and bool(cause.get('by') and cause.get('at'))

def efficacy_issues(actions, *, profile):
    if not profile['require_effective_verified_result']:
        return []
    checks = [a for a in actions if a['tipo'] == 'verificación de eficacia' and a['est'] != 'Cancelada']
    if not checks:
        return [('Verificación de eficacia ausente', [])]
    issues = {}
    for a in checks:
        if a['est'] != 'Completada':
            issues.setdefault('Actividad de verificación pendiente', []).append(a['id'])
            continue
        if a['real'] is None:
            issues.setdefault('Fecha real de actividad ausente', []).append(a['id'])
        if a['result'] not in {'Eficaz', 'No eficaz'}:
            issues.setdefault('Resultado de eficacia ausente', []).append(a['id'])
            continue
        if a['result'] == 'No eficaz':
            issues.setdefault('Resultado No eficaz', []).append(a['id'])
        if not (a['verified_by'] and a['verified_at']):
            issues.setdefault('Resultado sin verificación identificada', []).append(a['id'])
    return list(issues.items())

def before_d8(project, actions, *, profile):
    if project['method'] != '8D':
        raise ValueError('El ensayo de compuertas cubre P-A 8D, no el cierre PDCA.')
    own = owned(actions, project['id'])
    issues = []
    active = [a['id'] for a in own if a['est'] in OPEN]
    if active:
        issues.append(('Acciones abiertas', active))
    missing = [step for step in profile['required_steps_before_D8']
               if project['steps'].get(step) != 'Completado']
    if missing:
        issues.append(('Pasos previos a D8 sin completar', missing))
    if profile['require_verified_cause'] and not cause_verified(project['cause']):
        issues.append(('Causa raíz sin verificación identificada', []))
    issues.extend(efficacy_issues(own, profile=profile))
    return issues

def project_close_issues(project, actions, *, profile):
    issues = before_d8(project, actions, profile=profile)
    if project['steps'].get('D8') != 'Completado':
        issues.append(('D8 cierre pendiente', ['D8']))
    return issues

def d6_issues(project, actions, *, profile):
    # D6 no consulta D7 ni exige completar preventivas futuras.
    own = owned(actions, project['id'])
    pending = [a['id'] for a in own if a['tipo'] in {'correctiva', 'contención'} and a['est'] in OPEN]
    return ([('Implantación D5/contención pendiente', pending)] if pending else []) + efficacy_issues(own, profile=profile)

def fac_issues(fac, actions, target, *, profile):
    if target not in {'Verificación eficacia', 'Pendiente aprobación'}:
        raise ValueError('Transición no modelada por este fixture.')
    own = owned(actions, fac['id'])
    issues = []
    if profile['require_verified_cause'] and not cause_verified(fac['cause']):
        issues.append(('Causa raíz sin verificación identificada', []))
    active = [a['id'] for a in own if a['tipo'] in {'correctiva', 'preventiva'} and a['est'] in OPEN]
    if active:
        issues.append(('Acciones correctivas/preventivas abiertas', active))
    if target == 'Pendiente aprobación':
        issues.extend(efficacy_issues(own, profile=profile))
    return issues

def monitor(actions, projects, facs, today):
    delayed = {a['container'] for a in actions if late(a, today)}
    return dict(total=len(actions), opened=sum(a['est'] in OPEN for a in actions),
                completed=sum(a['est'] == 'Completada' for a in actions),
                cancelled=sum(a['est'] == 'Cancelada' for a in actions),
                overdue=sum(late(a, today) for a in actions),
                active_projects=sum(p['state'] in {'Planificado', 'En curso', 'Bloqueado'} for p in projects),
                projects_with_overdue=sum(p['id'] in delayed for p in projects),
                open_facs=sum(f['state'] != 'Cerrada' for f in facs),
                facs_with_overdue=sum(f['id'] in delayed for f in facs))

def calendar(actions):
    result = {}
    for a in actions:
        if a['est'] in OPEN and a['prev']:
            result.setdefault(a['prev'].isoformat(), []).append(a['id'])
    return dict(sorted(result.items()))

def local_candidates(naive):
    # Detecta hora inexistente y repetida mediante ida/vuelta real por UTC.
    candidates = set()
    for fold in (0, 1):
        candidate = naive.replace(tzinfo=MAD, fold=fold).astimezone(timezone.utc)
        if candidate.astimezone(MAD).replace(tzinfo=None) == naive:
            candidates.add(candidate)
    return sorted(candidates)

def verified_variant(result='Eficaz'):
    actions = deepcopy(A)
    for a in owned(actions, 'P-A'):
        if a['est'] in OPEN:
            a['est'] = 'Completada'
            a['real'] = HOY
        if a['tipo'] == 'verificación de eficacia':
            a.update(result=result, verified_by='U2', verified_at='2026-10-26T09:00:00Z')
    project = deepcopy(PROJECTS[0])
    project['steps'].update({f'D{i}': 'Completado' for i in range(1, 8)})
    return project, actions

class Checks(unittest.TestCase):
    def test_base_progress_and_counts(self):
        self.assertEqual(progress(owned(A,'P-A'),profile=PROFILE)['percent'],40)
        self.assertEqual(monitor(A,PROJECTS,FACS,HOY),dict(total=11,opened=7,completed=3,cancelled=1,overdue=2,active_projects=2,projects_with_overdue=1,open_facs=1,facs_with_overdue=1))
    def test_due_dates_and_tasks(self):
        self.assertEqual([a['id'] for a in A if late(a,HOY)],['A2','F2'])
        self.assertEqual(tasks(A,'U1',HOY),{'Hoy':['A3'],'Más adelante':['B2'],'Vencidas':['F2'],'Sin fecha':['F3']})
        self.assertEqual(tasks(A,'U2',HOY),{'Vencidas':['A2'],'Más adelante':['A5'],'Esta semana':['B1']})
    def test_negative_efficacy_progress(self):
        actions=deepcopy(A);a=next(a for a in actions if a['id']=='A5')
        a.update(est='Completada',real=HOY,result='No eficaz',verified_by='U2',verified_at=REFERENCE.isoformat())
        self.assertEqual(progress(owned(actions,'P-A'),profile=PROFILE)['percent'],60)
        self.assertEqual(efficacy_issues(owned(actions,'P-A'),profile=PROFILE),[('Resultado No eficaz',['A5'])])
    def test_mixed_cancelled(self):
        actions=deepcopy(owned(A,'P-A'))
        for a in actions:
            if a['est'] in OPEN: a['est']='Cancelada'
        self.assertEqual(progress(actions,profile=PROFILE),dict(completed=2,considered=2,cancelled=4,percent=100.0,label='2 de 2; 4 canceladas no cuentan'))
    def test_all_cancelled(self):
        actions=deepcopy(owned(A,'P-A'))
        for a in actions: a['est']='Cancelada'
        self.assertEqual(progress(actions,profile=PROFILE),dict(completed=0,considered=0,cancelled=6,percent=None,label='Sin acciones consideradas; 6 canceladas'))
    def test_no_actions(self):
        self.assertIsNone(progress([],profile=PROFILE)['percent'])
    def test_complete_does_not_prove_effective(self):
        project,actions=verified_variant();check=next(a for a in actions if a['id']=='A5');check.update(result=None,verified_by=None,verified_at=None)
        self.assertIn(('Resultado de eficacia ausente',['A5']),before_d8(project,actions,profile=PROFILE))
    def test_positive_without_verification(self):
        project,actions=verified_variant();next(a for a in actions if a['id']=='A5')['verified_by']=None
        self.assertIn(('Resultado sin verificación identificada',['A5']),before_d8(project,actions,profile=PROFILE))
    def test_d8_no_circular_prerequisite(self):
        project,actions=verified_variant()
        self.assertEqual(before_d8(project,actions,profile=PROFILE),[])
        self.assertEqual(project_close_issues(project,actions,profile=PROFILE),[('D8 cierre pendiente',['D8'])])
        project['steps']['D8']='Completado'
        self.assertEqual(project_close_issues(project,actions,profile=PROFILE),[])
    def test_d6_independent_of_d7(self):
        project,actions=verified_variant();project['steps']['D7']='No iniciado'
        next(a for a in actions if a['id']=='A4')['est']='Pendiente'
        self.assertEqual(d6_issues(project,actions,profile=PROFILE),[])
        self.assertIn(('Acciones abiertas',['A4']),before_d8(project,actions,profile=PROFILE))
    def test_cause_is_evaluated(self):
        project,actions=verified_variant();project['cause']['state']='Candidata'
        self.assertIn(('Causa raíz sin verificación identificada',[]),before_d8(project,actions,profile=PROFILE))
    def test_fac_data_driven(self):
        fac=deepcopy(FACS[0]);actions=deepcopy(A)
        self.assertEqual(len(fac_issues(fac,actions,'Verificación eficacia',profile=PROFILE)),2)
        self.assertEqual(len(fac_issues(fac,actions,'Pendiente aprobación',profile=PROFILE)),3)
        fac['cause']=deepcopy(PROJECTS[0]['cause'])
        next(a for a in actions if a['id']=='F2').update(est='Completada',real=HOY)
        self.assertEqual(fac_issues(fac,actions,'Verificación eficacia',profile=PROFILE),[])
        next(a for a in actions if a['id']=='F3').update(est='Completada',real=HOY,result='No eficaz',verified_by='U1',verified_at=REFERENCE.isoformat())
        self.assertEqual(fac_issues(fac,actions,'Pendiente aprobación',profile=PROFILE),[('Resultado No eficaz',['F3'])])
    def test_monitor_changes_with_data(self):
        actions=deepcopy(A);next(a for a in actions if a['id']=='F2').update(est='Completada',real=HOY)
        m=monitor(actions,PROJECTS,FACS,HOY)
        self.assertEqual(m['overdue'],1);self.assertEqual(m['facs_with_overdue'],0)
    def test_calendar(self):
        self.assertEqual(calendar(A),{'2026-10-24':['F2'],'2026-10-25':['A2'],'2026-10-26':['A3'],'2026-10-27':['B1'],'2026-11-03':['B2'],'2026-11-15':['A5']})
    def test_meetings_offsets(self):
        for naive,expected in [(datetime(2026,10,24,9),datetime(2026,10,24,7,tzinfo=timezone.utc)),(datetime(2026,10,26,9),datetime(2026,10,26,8,tzinfo=timezone.utc))]:
            self.assertEqual(local_candidates(naive),[expected])
    def test_ambiguous_and_nonexistent_meetings(self):
        self.assertEqual([d.isoformat() for d in local_candidates(datetime(2026,10,25,2,30))],['2026-10-25T00:30:00+00:00','2026-10-25T01:30:00+00:00'])
        self.assertEqual(local_candidates(datetime(2026,3,29,2,30)),[])


def output():
    project=PROJECTS[0]
    print('PRJ-S1 corregido — supuestos [N], sin validación funcional QCS')
    print('Referencia:',REFERENCE.isoformat())
    payload=dict(progress=progress(owned(A,'P-A'),profile=PROFILE),
        alternatives=dict(including_cancelled=100*Fraction(2,6),cancelled_as_completed=100*Fraction(3,6)),
        overdue=[a['id'] for a in A if late(a,HOY)],
        tasks={u:tasks(A,u,HOY) for u in ('U1','U2')},
        before_D8=before_d8(project,A,profile=PROFILE),
        project_close=project_close_issues(project,A,profile=PROFILE),
        fac_verification=fac_issues(FACS[0],A,'Verificación eficacia',profile=PROFILE),
        fac_approval=fac_issues(FACS[0],A,'Pendiente aprobación',profile=PROFILE),
        calendar=calendar(A),monitor=monitor(A,PROJECTS,FACS,HOY),
        meetings={name:[x.isoformat() for x in local_candidates(d)] for name,d in [('R1',datetime(2026,10,24,9)),('R2',datetime(2026,10,26,9)),('repeated',datetime(2026,10,25,2,30))]})
    print(json.dumps(payload,ensure_ascii=False,indent=2,default=float))

if __name__=='__main__':
    if '--test' in sys.argv:
        unittest.main(argv=[sys.argv[0]],verbosity=2)
    else:
        output()
