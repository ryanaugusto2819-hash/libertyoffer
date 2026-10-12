import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/components/dr/dashboard';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/dashboard')({head:()=>drHead('Dashboard','Panorama das ofertas e da produção da equipe.'),component:Dashboard});
