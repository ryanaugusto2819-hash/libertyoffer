import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { Creatives } from '@/components/dr/creatives';
export const Route=createFileRoute('/_authenticated/criativos')({head:()=>drHead('Biblioteca de criativos','Criativos, desempenho e histórico de versões.'),component:Creatives});
