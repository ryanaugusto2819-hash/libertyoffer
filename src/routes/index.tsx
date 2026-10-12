import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GuestDashboard } from '@/components/dr/dashboard';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/')({head:()=>drHead('Dashboard','DR Control, gestão de ofertas e produção de criativos de Direct Response.'),component:Index});
function Index(){const navigate=useNavigate();useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user)navigate({to:'/dashboard',replace:true});});},[navigate]);return <GuestDashboard/>;}
