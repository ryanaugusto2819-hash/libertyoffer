import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GuestDashboard } from '@/components/dr/dashboard';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/')({head:()=>drHead('DR Control — Sua operação','Gestão privada de ofertas, produção de criativos e resultados de Direct Response.'),component:Index});
function Index(){const navigate=useNavigate();useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user)navigate({to:'/dashboard',replace:true});});},[navigate]);return <GuestDashboard/>;}
