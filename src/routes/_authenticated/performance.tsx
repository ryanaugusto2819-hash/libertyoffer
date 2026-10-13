import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { Performance } from '@/components/dr/performance';
export const Route=createFileRoute('/_authenticated/performance')({head:()=>drHead('Performance','Resultados financeiros das ofertas.'),component:Performance});
