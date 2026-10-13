import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getWorkspace, type Workspace } from '@/lib/dr.functions';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
const Context=createContext<Workspace|null>(null);
export function useWorkspace(){const data=useContext(Context);if(!data)throw new Error('Workspace indisponível');return data;}
export function WorkspaceProvider({children}:{children:ReactNode}){const fetch=useServerFn(getWorkspace);const query=useQuery({queryKey:['workspace'],queryFn:()=>fetch({data:{scope:'all'}}),staleTime:60000,refetchOnWindowFocus:false});if(query.isPending)return <div className="loading-state"><LoaderCircle className="animate-spin"/><span>Carregando sua operação…</span></div>;if(query.isError&&!query.data)return <div className="empty-state"><ShieldCheck/><h2>Não foi possível abrir a operação</h2><p>{query.error.message}</p><Button onClick={()=>query.refetch()}>Tentar novamente</Button></div>;if(!query.data)return null;if(!query.data.roles.some(r=>r.user_id===query.data.userId))return <div className="empty-state"><ShieldCheck/><h2>Acesso aguardando autorização</h2><p>Seu perfil ainda não possui uma função na equipe. Solicite acesso ao administrador.</p><Button variant="outline" onClick={()=>supabase.auth.signOut()}>Sair da conta</Button></div>;return <Context.Provider value={query.data}>{children}</Context.Provider>;}
export function useIsAdmin(){const w=useWorkspace();return w.roles.some(r=>r.user_id===w.userId&&r.role==='admin');}
