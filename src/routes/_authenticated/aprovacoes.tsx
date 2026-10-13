import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { Creatives } from '@/components/dr/creatives';
export const Route=createFileRoute('/_authenticated/aprovacoes')({head:()=>drHead('Aprovações','Revisão dos criativos produzidos.'),component:Page});
function Page(){return <Creatives mode="approval"/>;}
