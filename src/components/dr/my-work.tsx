import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { AlarmClock, Clapperboard, CheckCheck, Send, ClipboardList, ChevronRight, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateItem } from '@/lib/dr.functions';
import { itemStatuses } from '@/lib/dr-schemas';
import { myWorkGroups,isOverdue,type WorkItem } from '@/lib/my-work';
import { useWorkspace } from './workspace';
import { useOperations } from './operations-data';
import { PageHeader,Status,Empty,errorMessage,formatDate } from './common';
import { ItemDetail } from './demands';
type Review={decision:string;notes:string;created_at:string};
function WorkCard({i,offer,demandTitle,review,onOpen}:{i:WorkItem,offer:string,demandTitle:string,review?:Review|undefined,onOpen:()=>void}){
 const today=new Date().toISOString().slice(0,10);
 const late=isOverdue(i,today);
 return <button type="button" className={`work-card${late?' work-card-late':''}`} onClick={onOpen}>
  <div className="work-card-head"><span className="item-number">#{String(i.item_number).padStart(2,'0')}</span><strong>{i.name}</strong><Status value={i.status}/></div>
  <div className="work-card-meta">
   <span title="Oferta"><Clapperboard size={13}/>{offer||'—'}</span>
   <span title="Demanda"><ClipboardList size={13}/>{demandTitle||'—'}</span>
   <span className={late?'work-late':''}>{late&&<AlarmClock size={13}/>}Prazo: {formatDate(i.due_date)}</span>
  </div>
  {review&&<div className="work-review"><Status value={review.decision}/><p>{review.notes}</p></div>}
  <span className="work-open"><ChevronRight size={15}/></span>
 </button>;
}
function WorkSection({title,items,children}:{title:string,items:WorkItem[],children:React.ReactNode}){
 if(!items.length)return null;
 return <section className="work-section"><div className="section-heading"><h2>{title} <span className="count-badge">{items.length}</span></h2></div><div className="work-grid">{children}</div></section>;
}
export function MyWork(){
 const w=useWorkspace();
 const qc=useQueryClient();
 const [open,setOpen]=useState<string|null>(null);
 const change=useServerFn(updateItem);
 const today=new Date().toISOString().slice(0,10);
 const mine=w.items.filter(i=>i.assigned_to===w.userId);
 const g=myWorkGroups(mine,today);
 const reviewsQ=useOperations('creative');
 const latestReview=(itemId:string):Review|undefined=>{
  const versionIds=new Set(w.versions.filter(v=>v.item_id===itemId).map(v=>v.id));
  return reviewsQ.data?.reviews.find(r=>versionIds.has(r.version_id));
 };
 const demandOf=(i:WorkItem)=>w.demands.find(d=>d.id===i.demand_id);
 const offerOf=(i:WorkItem)=>{const d=demandOf(i);return d?w.offers.find(o=>o.id===d.offer_id)?.name??'':'';};
 async function sendAgain(id:string,status:typeof itemStatuses[number]){
  try{await change({data:{id,status}});await qc.invalidateQueries({queryKey:['workspace']});toast.success('Andamento atualizado');}
  catch(e){toast.error(errorMessage(e));}
 }
 const opened=mine.find(i=>i.id===open);
 const openedDemand=opened?demandOf(opened):undefined;
 return <><PageHeader eyebrow="PRODUÇÃO" title="Meu trabalho" subtitle="Seus criativos, prazos e feedbacks em um só lugar."/>
 {!mine.length?<Empty title="Nada atribuído a você por aqui" description="Quando um criativo for seu, ele aparece nesta tela."/>:<>
  <WorkSection title="Atrasados" items={g.overdue}>{g.overdue.map(i=><WorkCard key={i.id} i={i} offer={offerOf(i)} demandTitle={demandOf(i)?.title??''} review={latestReview(i.id)} onOpen={()=>setOpen(i.id)}/>)}</WorkSection>
  <WorkSection title="Para produzir" items={g.todo}>{g.todo.map(i=><WorkCard key={i.id} i={i} offer={offerOf(i)} demandTitle={demandOf(i)?.title??''} review={latestReview(i.id)} onOpen={()=>setOpen(i.id)}/>)}</WorkSection>
  <WorkSection title="Aguardando aprovação" items={g.waiting}>{g.waiting.map(i=><WorkCard key={i.id} i={i} offer={offerOf(i)} demandTitle={demandOf(i)?.title??''} review={latestReview(i.id)} onOpen={()=>setOpen(i.id)}/>)}</WorkSection>
  <WorkSection title="Aprovados" items={g.done}>{g.done.map(i=><WorkCard key={i.id} i={i} offer={offerOf(i)} demandTitle={demandOf(i)?.title??''} onOpen={()=>setOpen(i.id)}/>)}</WorkSection>
 </>}
 {opened&&<ItemDetail id={opened.id} close={()=>setOpen(null)} briefing={openedDemand?.briefing} review={latestReview(opened.id)}/>}
 </>;
}
