import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { Creatives } from '@/components/dr/creatives';
export const Route=createFileRoute('/_authenticated/publicacao')({head:()=>drHead('Fila de publicação','Criativos aprovados para publicação.'),component:Page});
function Page(){return <Creatives mode="publication"/>;}
