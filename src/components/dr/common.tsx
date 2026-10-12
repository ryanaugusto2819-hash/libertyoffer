import { type ReactNode } from 'react';
import { Inbox, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function PageHeader({eyebrow,title,subtitle,actions}:{eyebrow?:string,title:string,subtitle?:string,actions?:ReactNode}){return <div className="page-heading"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div className="page-actions">{actions}</div></div>;}
export function Status({value}:{value:string}){const cls=['Aprovado','Validou','Escalando'].includes(value)?'success':['Em edição','Em preparação','Em teste'].includes(value)?'orange':['Aguardando aprovação','Ajustes solicitados'].includes(value)?'warning':['Cancelado','Não validou','Urgente'].includes(value)?'danger':'neutral';return <span className={`status status-${cls}`}><span/>{value}</span>;}
export function Empty({title,description,action}:{title:string,description?:string,action?:ReactNode}){return <div className="empty-state"><div className="empty-icon"><Inbox size={24}/></div><h3>{title}</h3>{description&&<p>{description}</p>}{action}</div>;}
export function Modal({open,onOpenChange,title,description,children}:{open:boolean,onOpenChange:(v:boolean)=>void,title:string,description?:string,children:ReactNode}){return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="dr-modal"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description??'DR Control · Workspace'}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>;}
export function Field({label,children,wide=false}:{label:string,children:ReactNode,wide?:boolean}){return <label className={`field ${wide?'field-wide':''}`}><span>{label}</span>{children}</label>;}
export function formatDate(date:string|null){return date?new Date(`${date.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'Sem prazo';}
export function errorMessage(error:unknown){return error instanceof Error?error.message:'Não foi possível salvar. Tente novamente.';}
