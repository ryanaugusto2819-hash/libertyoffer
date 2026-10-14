import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ArrowUpRight, Archive, Pencil, Layers3, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { deleteSpyOffer, saveSpyOffer, setSpyOfferStatus } from '@/lib/operations.functions';
import { spyOfferSchema, isSpyResearchOffer } from '@/lib/operations-schemas';
import { offerStatuses } from '@/lib/dr-schemas';
import { refreshWorkspace } from '@/lib/workspace-refresh';
import { fileUrl } from '@/lib/dr.functions';
import { useWorkspace, useIsAdmin } from './workspace';
import { useOperations } from './operations-data';
import { PageHeader, Empty, Modal, Field, Status, errorMessage } from './common';
import { SpyAds } from './spy';
import { FilePanel } from './uploads';
import { SpyCoverGenerator, SpyCoverImage } from './spy-cover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const blank = { name: '', product: '', niche: '', country: '', language: 'Português', library_url: '', sales_url: '', whatsapp_url: '', notes: '', archived: false };
type SpyOffer = typeof blank & { id?: string };
function useCanWrite() {
  const w = useWorkspace();
  return useIsAdmin() || w.roles.some(r => r.user_id === w.userId && r.role === 'spy');
}
function SpyStatusControl({offer}:{offer:NonNullable<ReturnType<typeof useOperations>['data']>['spyOffers'][number]}) {
  const canWrite=useCanWrite(); const save=useServerFn(setSpyOfferStatus); const qc=useQueryClient(); const navigate=useNavigate(); const [busy,setBusy]=useState(false);
  return <div className="flex flex-wrap items-center gap-2 mt-3"><Status value={offer.status}/>{canWrite && <select className="min-w-0 flex-1" aria-label={`Status de ${offer.name}`} value={offer.status} disabled={busy || !!offer.operational_offer_id} onChange={async e=>{
    const status=e.target.value as typeof offerStatuses[number];
    if(status==='Em teste'&&!window.confirm('Mover esta oferta para Ofertas com o status Em Teste? Os anúncios e anexos serão preservados.'))return;
    setBusy(true); try {const result=await save({data:{id:offer.id,status}}); await Promise.all([qc.invalidateQueries({queryKey:['operations','spy']}),result.offerId?refreshWorkspace(qc,'offers'):Promise.resolve()]); toast.success(result.offerId?'Oferta movida para Ofertas · Em Teste':'Status atualizado'); if(result.offerId)await navigate({to:'/ofertas/$id',params:{id:result.offerId}});}catch(error){toast.error(errorMessage(error));}finally{setBusy(false);}
  }}>{offerStatuses.map(status=><option key={status} value={status}>{status==='Em teste'?'Em Teste':status}</option>)}</select>}</div>;
}
function SpyOfferForm({ open, setOpen, offer }: { open: boolean; setOpen: (v: boolean) => void; offer?: SpyOffer }) {
  const [form, setForm] = useState<SpyOffer>(offer ?? blank);
  const [busy, setBusy] = useState(false);
  const save = useServerFn(saveSpyOffer);
  const qc = useQueryClient();
  const navigate = useNavigate();
  return <Modal open={open} onOpenChange={setOpen} title={offer ? 'Editar oferta SPY' : 'Nova oferta SPY'}>
    <form className="form-grid" onSubmit={async e => {
      e.preventDefault(); setBusy(true);
      try {
        const saved = await save({ data: spyOfferSchema.parse(form) });
        await qc.invalidateQueries({ queryKey: ['operations', 'spy'] });
        setOpen(false);
        toast.success(offer ? 'Oferta atualizada' : 'Oferta SPY cadastrada');
        if (!offer) await navigate({ to: '/spy/$id', params: { id: saved.id } });
      } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
    }}>
      {(['name', 'product', 'niche', 'country', 'language', 'library_url', 'sales_url', 'whatsapp_url'] as const).map(key => <Field key={key} label={{ name: 'Nome da oferta *', product: 'Produto', niche: 'Nicho', country: 'País', language: 'Idioma', library_url: 'Biblioteca de anúncios', sales_url: 'Página de vendas', whatsapp_url: 'WhatsApp' }[key]}>
        <Input required={key === 'name'} maxLength={key === 'name' ? 160 : key.endsWith('url') ? 1000 : 200} type={key.endsWith('url') ? 'url' : 'text'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      </Field>)}
      <Field label="Observações" wide><Textarea maxLength={5000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
      <div className="form-footer"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={busy}>{busy ? 'Salvando…' : 'Salvar oferta'}</Button></div>
    </form>
  </Modal>;
}
export function ResearchCover({ file }: { file: ReturnType<typeof useWorkspace>['files'][number] | undefined }) {
  const getUrl = useServerFn(fileUrl);
  const q = useQuery({ queryKey: ['file-url', file?.id], enabled: !!file, queryFn: () => file ? getUrl({ data: { id: file.id, download: false } }) : Promise.resolve(null), staleTime: 480000 });
  if (q.data && file?.mime_type.startsWith('image')) return <img className="offer-image" src={q.data} alt="Anúncio da oferta pesquisada" />;
  if (q.data && file?.mime_type.startsWith('video')) return <video className="offer-image" src={q.data} muted preload="metadata" playsInline />;
  return <div className="offer-image empty-product"><Layers3 size={34} /><span>Pesquisa de oferta</span></div>;
}
export function SpyOffers() {
  const q = useOperations('spy'); const w = useWorkspace(); const canWrite = useCanWrite();
  const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const [archived, setArchived] = useState(false); const [legacy, setLegacy] = useState(false);
  const offers = (q.data?.spyOffers ?? []).filter(o => isSpyResearchOffer(o) && o.archived === archived && `${o.name} ${o.product} ${o.niche} ${o.country}`.toLowerCase().includes(search.toLowerCase()));
  const ungrouped = q.data?.spy.filter(r => !r.spy_offer_id && !r.archived).length ?? 0;
  return <>
    <PageHeader eyebrow="PESQUISA" title="Central de SPY" actions={canWrite && <Button onClick={() => setOpen(true)}><Plus />Nova oferta</Button>} />
    <div className="filterbar"><div className="filter-search"><Search size={16} /><Input aria-label="Buscar ofertas SPY" placeholder="Buscar ofertas, produtos ou nichos…" value={search} onChange={e => setSearch(e.target.value)} /></div><Button variant={archived ? 'secondary' : 'ghost'} onClick={() => setArchived(!archived)}><Archive />Arquivadas</Button>{ungrouped > 0 && <Button variant="outline" onClick={() => setLegacy(true)}>Anúncios não agrupados · {ungrouped}</Button>}</div>
    <div className="section-heading"><span className="muted text-xs">{offers.length} ofertas pesquisadas</span></div>
    {q.isError ? <Empty title="Não foi possível carregar as ofertas" description={q.error.message} /> : q.isPending ? <Empty title="Carregando ofertas…" /> : !offers.length ? <Empty title="Nenhuma oferta encontrada" action={canWrite && <Button onClick={() => setOpen(true)}><Plus />Nova oferta</Button>} /> : <div className="offer-grid">{offers.map(o => {
      const ads = q.data?.spy.filter(r => r.spy_offer_id === o.id && !r.archived) ?? [];
      const generatedCover = w.files.filter(f => f.spy_offer_id === o.id && f.spy_section === 'cover' && f.mime_type.startsWith('image')).sort((a,b)=>b.created_at.localeCompare(a.created_at))[0];
      const fallbackCover = w.files.find(f => ads.some(r => r.id === f.spy_id) && (f.mime_type.startsWith('image') || f.mime_type.startsWith('video')));
      return <article className="offer-card" key={o.id}><Link to="/spy/$id" params={{id:o.id}} className="block">{generatedCover?<SpyCoverImage file={generatedCover} alt={`Capa de ${o.name}`}/>:<ResearchCover file={fallbackCover}/>}</Link><div className="offer-card-body"><Link to="/spy/$id" params={{id:o.id}} className="flex justify-between gap-2"><h3 className="break-words min-w-0">{o.name}</h3><ArrowUpRight size={16} className="shrink-0"/></Link><p>{o.country||'—'} · {o.niche||o.product||'—'}</p><SpyStatusControl offer={o}/><div className="offer-card-footer"><span>{ads.length} anúncios</span><span>{w.files.filter(f=>f.spy_offer_id===o.id&&f.spy_section!=='cover').length} arquivos</span></div></div></article>;
    })}</div>}
    <SpyOfferForm open={open} setOpen={setOpen} />
    <Modal open={legacy} onOpenChange={setLegacy} title="Anúncios não agrupados"><SpyAds ungrouped /></Modal>
  </>;
}
export function SpyOfferDetail({ id }: { id: string }) {
  const q = useOperations('spy'); const w = useWorkspace(); const canWrite = useCanWrite(); const admin = useIsAdmin(); const qc = useQueryClient(); const save = useServerFn(saveSpyOffer); const remove = useServerFn(deleteSpyOffer); const navigate = useNavigate();
  const [tab, setTab] = useState('Informações'); const [edit, setEdit] = useState(false); const [busy, setBusy] = useState(false); const [deleteOpen,setDeleteOpen]=useState(false); const [confirmation,setConfirmation]=useState(''); const [deleting,setDeleting]=useState(false);
  const offer = q.data?.spyOffers.find(o => o.id === id);
  if (q.isPending) return <Empty title="Carregando oferta…" />;
  if (q.isError) return <Empty title="Não foi possível carregar a oferta" description={q.error.message} />;
  if (!offer) return <Empty title="Oferta SPY não encontrada" />;
  if (offer.operational_offer_id) return <Empty title="Oferta em operação" action={<Link to="/ofertas/$id" params={{id:offer.operational_offer_id}}>Abrir em Ofertas →</Link>}/>;
  const tabs = ['Informações', 'Anúncios', 'Fluxo do WhatsApp', 'Entregáveis'];
  const cover = w.files.filter(f=>f.spy_offer_id===id&&f.spy_section==='cover'&&f.mime_type.startsWith('image')).sort((a,b)=>b.created_at.localeCompare(a.created_at))[0];
  return <>
    <Link to="/spy" className="back-link">← Central de SPY</Link>
    <PageHeader title={offer.name} subtitle={`${offer.country || '—'} · ${offer.language} · ${offer.niche || 'Sem nicho'}`} actions={canWrite && <><Button variant="outline" onClick={() => setEdit(true)}><Pencil />Editar</Button><Button variant="ghost" size="icon" title={offer.archived ? 'Restaurar oferta' : 'Arquivar oferta'} disabled={busy} onClick={async () => {
      if (!window.confirm(offer.archived ? 'Restaurar esta oferta SPY?' : 'Arquivar esta oferta SPY?')) return;
      setBusy(true); try { await save({ data: spyOfferSchema.parse({ ...offer, archived: !offer.archived }) }); await qc.invalidateQueries({ queryKey: ['operations', 'spy'] }); toast.success(offer.archived ? 'Oferta restaurada' : 'Oferta arquivada'); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    }}><Archive /></Button>{admin&&<Button variant="ghost" size="icon" title="Excluir oferta SPY" aria-label="Excluir oferta SPY" onClick={()=>setDeleteOpen(true)}><Trash2/></Button>}</>} />
    <div className="mb-4 max-w-sm"><SpyStatusControl offer={offer}/></div>
    <div className="tabs-bar">{tabs.map(t => <Button variant="ghost" key={t} className={tab === t ? 'tab-active' : ''} onClick={() => setTab(t)}>{t}</Button>)}</div>
    {tab === 'Informações' ? <><SpyCoverGenerator offerId={id} offerName={offer.name} current={cover} canGenerate={canWrite} onSaved={()=>refreshWorkspace(qc,'files')}/><section className="settings-section"><h2>Informações da oferta</h2><dl className="details-list"><div><dt>Produto</dt><dd>{offer.product || '—'}</dd></div><div><dt>Nicho</dt><dd>{offer.niche || '—'}</dd></div><div><dt>País</dt><dd>{offer.country || '—'}</dd></div><div><dt>Idioma</dt><dd>{offer.language}</dd></div></dl><div className="link-list">{[['Biblioteca de anúncios', offer.library_url], ['Página de vendas', offer.sales_url], ['WhatsApp', offer.whatsapp_url]].map(([label, url]) => url && <a key={label} href={url} target="_blank" rel="noreferrer">{label}<ExternalLink size={16} /></a>)}</div><h3>Observações</h3><p className="muted whitespace-pre-wrap">{offer.notes || 'Nenhuma observação.'}</p></section></> : tab === 'Anúncios' ? <SpyAds spyOfferId={id} /> : <section className="settings-section"><h2>{tab}</h2><FilePanel key={tab} spy_offer_id={id} spy_section={tab === 'Fluxo do WhatsApp' ? 'whatsapp_flow' : 'deliverables'} label={tab} editable={canWrite} /></section>}
    <SpyOfferForm key={offer.id} open={edit} setOpen={setEdit} offer={offer} />
    <AlertDialog open={deleteOpen} onOpenChange={open=>{setDeleteOpen(open);if(!open)setConfirmation('');}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir oferta da Central de SPY?</AlertDialogTitle><AlertDialogDescription>Esta ação excluirá permanentemente a oferta pesquisada, os anúncios, as transcrições e todos os arquivos anexados. Digite <strong>{offer.name}</strong> para confirmar.</AlertDialogDescription></AlertDialogHeader><Input aria-label="Nome da oferta SPY para confirmar exclusão" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder={offer.name}/><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting||confirmation!==offer.name} onClick={async e=>{e.preventDefault();setDeleting(true);try{const result=await remove({data:{id,confirmation_name:confirmation}});await Promise.all([qc.invalidateQueries({queryKey:['operations','spy']}),refreshWorkspace(qc,'files')]);toast.success(result.storageCleanupPending?'Oferta excluída; alguns arquivos aguardam limpeza':'Oferta SPY excluída permanentemente');setDeleteOpen(false);await navigate({to:'/spy'});}catch(error){toast.error(errorMessage(error));}finally{setDeleting(false);}}}>{deleting?'Excluindo…':'Excluir permanentemente'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}