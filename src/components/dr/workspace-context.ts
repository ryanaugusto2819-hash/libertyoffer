import { createContext, useContext } from 'react';
import type { Workspace } from '@/lib/dr.functions';

export const WorkspaceContext=createContext<Workspace|null>(null);

export function useWorkspace(){
 const data=useContext(WorkspaceContext);
 if(!data)throw new Error('Workspace indisponível');
 return data;
}

export function useOptionalWorkspace(){
 return useContext(WorkspaceContext);
}