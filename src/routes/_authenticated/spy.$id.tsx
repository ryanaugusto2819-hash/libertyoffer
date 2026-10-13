import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { SpyOfferDetail } from '@/components/dr/spy-offers';
export const Route = createFileRoute('/_authenticated/spy/$id')({ head: () => drHead('Oferta SPY', 'Anúncios pesquisados, fluxo do WhatsApp e entregáveis da oferta.'), component: Page });
function Page() { const { id } = Route.useParams(); return <SpyOfferDetail id={id} />; }