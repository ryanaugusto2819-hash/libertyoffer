import { createFileRoute } from '@tanstack/react-router';
import { Demands } from '@/components/dr/demands';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/demandas')({head:()=>drHead('Demandas','Produção individual e em lote de criativos.'),component:Demands});
