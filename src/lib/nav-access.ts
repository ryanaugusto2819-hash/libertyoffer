// Navigation access rules by role. Pure module (no React) so it can be unit-tested.
// Editors only: Dashboard, Demandas and Performance are hidden (nav + direct URL).
export const editorHiddenPaths=['/dashboard','/demandas','/performance'] as const;

export type RoleRow={user_id:string;role:string};

export function isEditorOnly(roles:readonly RoleRow[],userId:string):boolean{
 const mine=roles.filter(r=>r.user_id===userId).map(r=>r.role);
 if(!mine.length)return false;
 if(mine.includes('admin'))return false;
 return mine.every(r=>r==='editor');
}

export function hiddenNavPaths(roles:readonly RoleRow[],userId:string):Set<string>{
 return isEditorOnly(roles,userId)?new Set<string>(editorHiddenPaths):new Set<string>();
}

export function filterNav<T extends{path:string}>(items:readonly T[],roles:readonly RoleRow[],userId:string):T[]{
 const hidden=hiddenNavPaths(roles,userId);
 return items.filter(n=>!hidden.has(n.path));
}

export function isPathBlocked(pathname:string,roles:readonly RoleRow[],userId:string):boolean{
 const hidden=hiddenNavPaths(roles,userId);
 if(!hidden.size)return false;
 return [...hidden].some(p=>pathname===p||pathname.startsWith(p+'/'));
}
