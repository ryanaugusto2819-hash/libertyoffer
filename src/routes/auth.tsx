import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/dr/auth';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/auth')({head:()=>drHead('Entrar','Acesso seguro ao workspace LibertyOffer.'),component:AuthPage});
