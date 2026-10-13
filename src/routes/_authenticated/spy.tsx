import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { Spy } from '@/components/dr/spy';
export const Route=createFileRoute('/_authenticated/spy')({head:()=>drHead('Central de SPY','Referências de anúncios concorrentes.'),component:Spy});
