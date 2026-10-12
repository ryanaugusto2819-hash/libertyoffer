import { createFileRoute,redirect,Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceProvider } from '@/components/dr/workspace';
import { Shell } from '@/components/dr/shell';
export const Route=createFileRoute('/_authenticated')({ssr:false,beforeLoad:async()=>{const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw redirect({to:'/auth'});},component:AuthenticatedLayout});
function AuthenticatedLayout(){return <WorkspaceProvider><Shell><Outlet/></Shell></WorkspaceProvider>;}
