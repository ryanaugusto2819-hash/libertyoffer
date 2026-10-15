import { describe,it,expect } from 'vitest';
import { filterNav,isPathBlocked,isEditorOnly } from './nav-access';
const nav=[{name:'Dashboard',path:'/dashboard'},{name:'Meu trabalho',path:'/meu-trabalho'},{name:'Ofertas',path:'/ofertas'},{name:'Demandas',path:'/demandas'},{name:'Performance',path:'/performance'},{name:'Equipe',path:'/equipe'}];
const uid='00000000-0000-4000-8000-000000000001';
describe('Editor navigation restrictions',()=>{
 it('editors do not see Dashboard, Demandas or Performance',()=>{
  const items=filterNav(nav,[{user_id:uid,role:'editor'}],uid);
  expect(items.map(i=>i.path)).toEqual(['/meu-trabalho','/ofertas','/equipe']);
 });
 it('admins see every page except editor-only pages',()=>{
  const items=filterNav(nav,[{user_id:uid,role:'admin'}],uid);
  expect(items.map(i=>i.path)).toEqual(nav.filter(p=>p.path!=='/meu-trabalho').map(p=>p.path));
 });
 it('other roles keep current navigation and never see editor-only pages',()=>{
  expect(filterNav(nav,[{user_id:uid,role:'traffic'}],uid).map(i=>i.path)).toEqual(nav.filter(p=>p.path!=='/meu-trabalho').map(p=>p.path));
  expect(filterNav(nav,[{user_id:uid,role:'editor'},{user_id:uid,role:'traffic'}],uid)).toHaveLength(nav.length);
 });
 it('editors typing a restricted URL are redirected',()=>{
  expect(isPathBlocked('/dashboard',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/demandas/abc',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/performance',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/ofertas',[{user_id:uid,role:'editor'}],uid)).toBe(false);
  expect(isPathBlocked('/meu-trabalho',[{user_id:uid,role:'editor'}],uid)).toBe(false);
  expect(isEditorOnly([{user_id:uid,role:'editor'}],uid)).toBe(true);
 });
 it('Meu trabalho is blocked for users without the editor role',()=>{
  expect(isPathBlocked('/meu-trabalho',[{user_id:uid,role:'admin'}],uid)).toBe(true);
  expect(isPathBlocked('/meu-trabalho',[{user_id:uid,role:'traffic'}],uid)).toBe(true);
  expect(isPathBlocked('/meu-trabalho',[{user_id:uid,role:'admin'},{user_id:uid,role:'editor'}],uid)).toBe(false);
 });
});
