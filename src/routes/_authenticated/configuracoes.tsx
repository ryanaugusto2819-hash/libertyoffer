import { createFileRoute } from '@tanstack/react-router';
import { Account } from '@/components/dr/account';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/configuracoes')({head:()=>drHead('Configurações','Perfil e preferências da operação.'),component:Account});
