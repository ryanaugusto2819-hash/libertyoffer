import { createFileRoute } from '@tanstack/react-router';
import { drHead } from '@/lib/dr-head';
import { SpyOffers } from '@/components/dr/spy-offers';
export const Route = createFileRoute('/_authenticated/spy/')({ head: () => drHead('Central de SPY', 'Ofertas pesquisadas com anúncios, fluxo do WhatsApp e entregáveis privados.'), component: SpyOffers });