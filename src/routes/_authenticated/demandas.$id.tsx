import { createFileRoute } from '@tanstack/react-router';
import { DemandDetail } from '@/components/dr/demands';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/demandas/$id')({head:()=>drHead('Demanda','Detalhes e arquivos da operação LibertyOffer.'),component:Detail});
function Detail(){const {id}=Route.useParams();return <DemandDetail id={id}/>;}
