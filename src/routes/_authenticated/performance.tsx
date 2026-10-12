import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { PageHeader,Empty } from '@/components/dr/common';
export const Route=createFileRoute('/_authenticated/performance')({head:()=>drHead('Performance','Resultados financeiros das ofertas.'),component:Page});
function Page(){return <><PageHeader eyebrow="OPERAÇÃO" title="Performance"/><Empty title="Disponível na próxima etapa" description="A base da operação está em implantação. Este módulo faz parte das próximas etapas do DR Control."/></>;}
