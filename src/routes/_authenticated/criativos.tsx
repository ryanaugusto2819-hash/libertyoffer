import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { PageHeader,Empty } from '@/components/dr/common';
export const Route=createFileRoute('/_authenticated/criativos')({head:()=>drHead('Biblioteca de criativos','Criativos e arquivos produzidos.'),component:Page});
function Page(){return <><PageHeader eyebrow="OPERAÇÃO" title="Biblioteca de criativos"/><Empty title="Disponível na próxima etapa" description="A base da operação está em implantação. Este módulo faz parte das próximas etapas do DR Control."/></>;}
