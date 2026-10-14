import { z } from 'zod';
export const roles = ['admin','editor','spy','traffic'] as const;
export const roleNames = {admin:'Administrador',editor:'Editor',spy:'SPY',traffic:'Gestor de tráfego'};
export const offerStatuses = ['Ideia','Em preparação','Em teste','Validou','Escalando','Pausada','Não validou','Encerrada'] as const;
export const itemStatuses = ['Pendente','Em edição','Aguardando aprovação','Ajustes solicitados','Aprovado','Cancelado'] as const;
export const priorities = ['Baixa','Média','Alta','Urgente'] as const;
const text = (max=3000) => z.string().trim().max(max);
const uuid = z.string().uuid();
const optionalId = z.union([uuid,z.literal('')]).default('');
const date = z.string().refine(v=>v==='' || /^\d{4}-\d{2}-\d{2}$/.test(v),'Data inválida').default('');
const url = z.union([z.literal(''),z.string().url().max(1000).refine(v=>/^https?:\/\//.test(v),'Use um link http ou https')]).default('');
export const offerSchema = z.object({id:uuid.optional(),name:text(160).min(1,'Informe o nome da oferta'),product_name:text(160).default(''),niche:text(100).default(''),country:text(100).min(1),language:text(100).min(1),currency:z.enum(['BRL','USD','MXN','ARS','ZAR']),sale_price:z.coerce.number().min(0),product_type:z.enum(['digital','physical']),payment_model:text(160).default(''),sales_url:url,checkout_url:url,whatsapp_url:url,start_date:date,responsible_id:optionalId,description:text().default(''),notes:text().default(''),status:z.enum(offerStatuses)});
export const itemSchema = z.object({name:text(200).min(1,'Informe o nome do criativo'),assigned_to:optionalId,hook:text(1000).default(''),copy:text(10000).default(''),instructions:text(5000).default(''),format:text(30).default('9:16'),language:text(100).default('Português'),due_date:date});
export const demandSchema = z.object({title:text(200).min(1,'Informe o título'),offer_id:uuid,kind:z.enum(['individual','batch']),briefing:text(10000).default(''),priority:z.enum(priorities),due_date:date,items:z.array(itemSchema).min(1).max(100)}).refine(v=>v.kind!=='individual'||v.items.length===1,'Uma demanda individual deve ter um criativo');
export const inviteSchema = z.object({email:z.string().trim().email().max(255),display_name:text(100).min(1),roles:z.array(z.enum(roles)).min(1),origin:z.string().url()});
export const extensions = ['mp4','mov','jpg','jpeg','png','webp','pdf','txt','docx'];
export function validateFile(name:string,size:number){if(!extensions.includes(name.split('.').pop()?.toLowerCase()??'')) throw new Error('Formato não permitido. Use MP4, MOV, JPG, PNG, WEBP, PDF, TXT ou DOCX.'); if(size<=0) throw new Error('O arquivo não pode estar vazio.');}
export function batchProgress(items: {status:string}[]){return items.length?Math.round(items.filter(i=>i.status==='Aprovado').length/items.length*100):0;}
export type OfferInput=z.input<typeof offerSchema>;
export type ItemInput=z.input<typeof itemSchema>;
