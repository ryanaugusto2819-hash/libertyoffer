import { describe,it,expect } from 'vitest';
import { isOverdue,myWorkGroups } from './my-work';
const base={id:'x',item_number:1,name:'Criativo',demand_id:'d'};
describe('My work grouping',()=>{
 it('flags overdue items unless approved or cancelled',()=>{
  expect(isOverdue({due_date:'2026-01-01',status:'Em edição'},'2026-01-02')).toBe(true);
  expect(isOverdue({due_date:'2026-01-01',status:'Aprovado'},'2026-01-02')).toBe(false);
  expect(isOverdue({due_date:null,status:'Pendente'},'2026-01-02')).toBe(false);
  expect(isOverdue({due_date:'2026-01-02',status:'Pendente'},'2026-01-02')).toBe(false);
 });
 it('groups items by state',()=>{
  const g=myWorkGroups([
   {...base,id:'1',due_date:'2026-01-01',status:'Em edição'},
   {...base,id:'2',due_date:'2026-02-01',status:'Pendente'},
   {...base,id:'3',due_date:'2026-02-01',status:'Ajustes solicitados'},
   {...base,id:'4',due_date:'2026-02-01',status:'Aguardando aprovação'},
   {...base,id:'5',due_date:'2026-02-01',status:'Aprovado'},
   {...base,id:'6',due_date:'2026-02-01',status:'Cancelado'},
  ],'2026-02-01');
  expect(g.overdue.map(i=>i.id)).toEqual(['1']);
  expect(g.todo.map(i=>i.id)).toEqual(['2','3']);
  expect(g.waiting.map(i=>i.id)).toEqual(['4']);
  expect(g.done.map(i=>i.id)).toEqual(['5']);
 });
 it('overdue items awaiting approval still count as waiting, not late work',()=>{
  const g=myWorkGroups([{...base,due_date:'2026-01-01',status:'Aguardando aprovação'}],'2026-02-01');
  expect(g.overdue).toHaveLength(0);
  expect(g.waiting).toHaveLength(1);
 });
});
