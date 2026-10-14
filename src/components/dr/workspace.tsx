import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getWorkspace } from '@/lib/dr.functions';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceContext,useWorkspace } from './workspace-context';
export { useWorkspace } from './workspace-context';
export function WorkspaceProvider({children}:{children:ReactNode}){const fetch=useServerFn(getWorkspace);const query=useQuery({queryKey:['workspace'],queryFn:()=>fetch({data:{scope:'all'}}),staleTime:60000,refetchOnWindowFocus:false});if(query.isPending)return <div className="loading-state"><LoaderCircle className="animate-spin"/><span>Carregando sua operação…</span></div>;if(query.isError&&!query.data)return <div className="empty-state"><ShieldCheck/><h2>Não foi possível abrir a operação</h2><p>{query.error.message}</p><Button onClick={()=>query.refetch()}>Tentar novamente</Button></div>;if(!query.data)return null;if(!query.data.roles.some(r=>r.user_id===query.data.userId))return <div className="empty-state"><ShieldCheck/><h2>Acesso aguardando autorização</h2><p>Seu perfil ainda não possui uma função na equipe. Solicite acesso ao administrador.</p><Button variant="outline" onClick={()=>supabase.auth.signOut()}>Sair da conta</Button></div>;return <WorkspaceContext.Provider value={query.data}>{children}</WorkspaceContext.Provider>;}
export function useIsAdmin(){const w=useWorkspace();return w.roles.some(r=>r.user_id===w.userId&&r.role==='admin');}
