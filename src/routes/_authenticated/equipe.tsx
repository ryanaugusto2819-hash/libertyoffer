import { createFileRoute } from '@tanstack/react-router';
import { Team } from '@/components/dr/team';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/equipe')({head:()=>drHead('Equipe','Equipe compartilhada e permissões por função.'),component:Team});
