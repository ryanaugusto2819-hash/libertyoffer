// Navigation access rules by role. Pure module (no React) so it can be unit-tested.
// Editors only: Dashboard, Demandas and Performance are hidden (nav + direct URL).
export const editorHiddenPaths=['/dashboard','/demandas','/performance'] as const;
// Pages exclusive to the editor role (hidden from users without the editor role).
export const editorOnlyPaths=['/meu-trabalho'] as const;

export type RoleRow={user_id:string;role:string};

export function isEditorOnly(roles:readonly RoleRow[],userId:string):boolean{
 const mine=roles.filter(r=>r.user_id===userId).map(r=>r.role);
 if(!mine.length)return false;
 if(mine.includes('admin'))return false;
 return mine.every(r=>r==='editor');
}

function hasEditor(roles:readonly RoleRow[],userId:string):boolean{
 return roles.some(r=>r.user_id===userId&&r.role==='editor');
}

export function hiddenNavPaths(roles:readonly RoleRow[],userId:string):Set<string>{
 return isEditorOnly(roles,userId)?new Set<string>(editorHiddenPaths):new Set<string>();
}

export function filterNav<T extends{path:string}>(items:readonly T[],roles:readonly RoleRow[],userId:string):T[]{
 const hidden=hiddenNavPaths(roles,userId);
 const editor=hasEditor(roles,userId);
 return items.filter(n=>!hidden.has(n.path)&&(editor||!(editorOnlyPaths as readonly string[]).includes(n.path)));
}

export function isPathBlocked(pathname:string,roles:readonly RoleRow[],userId:string):boolean{
 const hidden=hiddenNavPaths(roles,userId);
 const editor=hasEditor(roles,userId);
 const blocked:string[]=[...hidden,...(editor?[]:editorOnlyPaths)];
 if(!blocked.length)return false;
 return blocked.some(p=>pathname===p||pathname.startsWith(p+'/'));
}
