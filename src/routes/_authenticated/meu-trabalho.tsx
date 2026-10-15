import { createFileRoute } from '@tanstack/react-router';
import { MyWork } from '@/components/dr/my-work';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/meu-trabalho')({head:()=>drHead('Meu trabalho','Seus criativos, prazos e feedbacks da equipe LibertyOffer.'),component:MyWork});
