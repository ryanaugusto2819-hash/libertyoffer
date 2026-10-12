import { createFileRoute } from '@tanstack/react-router';
import { Demands } from '@/components/dr/demands';
import { drHead } from '@/lib/dr-head';
export const Route=createFileRoute('/_authenticated/producao')({head:()=>drHead('Minhas demandas','Tarefas atribuídas e entregas dos editores.'),component:() => <Demands mine />});
