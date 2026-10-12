import { createFileRoute } from '@tanstack/react-router';
import { Offers } from '@/components/dr/offers';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/ofertas')({head:()=>drHead('Ofertas','Gestão de ofertas, produtos, países e idiomas.'),component:Offers});
