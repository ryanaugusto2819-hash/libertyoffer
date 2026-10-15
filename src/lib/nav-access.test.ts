import { describe,it,expect } from 'vitest';
import { filterNav,isPathBlocked,isEditorOnly } from './nav-access';
const nav=[{name:'Dashboard',path:'/dashboard'},{name:'Ofertas',path:'/ofertas'},{name:'Demandas',path:'/demandas'},{name:'Performance',path:'/performance'},{name:'Equipe',path:'/equipe'}];
const uid='00000000-0000-4000-8000-000000000001';
describe('Editor navigation restrictions',()=>{
 it('editors do not see Dashboard, Demandas or Performance',()=>{
  const items=filterNav(nav,[{user_id:uid,role:'editor'}],uid);
  expect(items.map(i=>i.path)).toEqual(['/ofertas','/equipe']);
 });
 it('admins see every page',()=>{
  const items=filterNav(nav,[{user_id:uid,role:'admin'}],uid);
  expect(items).toHaveLength(nav.length);
 });
 it('other roles keep current navigation',()=>{
  expect(filterNav(nav,[{user_id:uid,role:'traffic'}],uid)).toHaveLength(nav.length);
  expect(filterNav(nav,[{user_id:uid,role:'editor'},{user_id:uid,role:'traffic'}],uid)).toHaveLength(nav.length);
 });
 it('editors typing a restricted URL are redirected',()=>{
  expect(isPathBlocked('/dashboard',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/demandas/abc',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/performance',[{user_id:uid,role:'editor'}],uid)).toBe(true);
  expect(isPathBlocked('/ofertas',[{user_id:uid,role:'editor'}],uid)).toBe(false);
  expect(isEditorOnly([{user_id:uid,role:'editor'}],uid)).toBe(true);
 });
});
