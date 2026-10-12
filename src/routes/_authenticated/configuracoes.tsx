import { createFileRoute } from '@tanstack/react-router';
import { Settings } from '@/components/dr/team';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/configuracoes')({head:()=>drHead('Configurações','Perfil e preferências da operação.'),component:Settings});
