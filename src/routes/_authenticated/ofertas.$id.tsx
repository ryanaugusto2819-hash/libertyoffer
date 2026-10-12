import { createFileRoute } from '@tanstack/react-router';
import { OfferDetail } from '@/components/dr/offers';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/ofertas/$id')({head:()=>drHead('Oferta','Detalhes e arquivos da operação DR Control.'),component:Detail});
function Detail(){const {id}=Route.useParams();return <OfferDetail id={id}/>;}
