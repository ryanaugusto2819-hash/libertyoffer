import { createFileRoute } from '@tanstack/react-router';
import { ResetPassword } from '@/components/dr/auth';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/reset-password')({head:()=>drHead('Definir senha','Acesso seguro ao workspace DR Control.'),component:ResetPassword});
