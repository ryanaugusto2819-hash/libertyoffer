import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ImagePlus, LoaderCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fileUrl } from '@/lib/dr.functions';
import { streamImage } from '@/lib/stream-image';
import { Button } from '@/components/ui/button';
import { uploadFile } from './uploads';
import { errorMessage } from './common';

type CoverFile = { id: string; created_at: string };

export function SpyCoverImage({ file, alt, className = 'offer-image' }: { file?: CoverFile; alt: string; className?: string }) {
  const getUrl = useServerFn(fileUrl);
  const query = useQuery({ queryKey: ['file-url', file?.id], enabled: !!file, queryFn: () => file ? getUrl({ data: { id: file.id, download: false } }) : Promise.resolve(''), staleTime: 480000 });
  if (!query.data) return null;
  return <img className={className} src={query.data} alt={alt} />;
}

async function dataUrlToFile(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || 'image/png' });
}

export function SpyCoverGenerator({ offerId, offerName, current, onSaved }: { offerId: string; offerName: string; current?: CoverFile; onSaved: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState('');
  const [final, setFinal] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setPreview(''); setFinal(false); setError(''); }, [offerId]);
  return <section className="settings-section">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2>Imagem de capa</h2><p className="muted text-sm">A IA usa as informações cadastradas nesta oferta.</p></div><Button disabled={busy} onClick={async () => {
      setBusy(true); setError(''); setPreview(''); setFinal(false);
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) throw new Error('Entre na sua conta.');
        let completed = '';
        await streamImage(`/api/spy-cover/${offerId}`, {}, (url, isFinal) => { setPreview(url); setFinal(isFinal); if (isFinal) completed = url; }, { Authorization: `Bearer ${token}` });
        if (!completed) throw new Error('A IA não retornou uma imagem final.');
        await uploadFile(await dataUrlToFile(completed, `capa-${offerName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`), { spy_offer_id: offerId, spy_section: 'cover' }, 'reference');
        await onSaved();
        setPreview('');
      } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
    }}>{busy ? <LoaderCircle className="animate-spin" /> : current ? <Sparkles /> : <ImagePlus />}{busy ? 'Gerando capa…' : current ? 'Gerar nova capa' : 'Gerar capa com IA'}</Button></div>
    <div className="mt-4 overflow-hidden rounded-md border bg-muted/20 aspect-[3/2] max-w-2xl">{preview ? <img src={preview} alt="Prévia da capa gerada" className={`h-full w-full object-cover transition-[filter] duration-500 ${final ? 'blur-0' : 'blur-2xl'}`} /> : current ? <SpyCoverImage file={current} alt={`Capa de ${offerName}`} className="h-full w-full object-cover" /> : <div className="h-full grid place-items-center muted"><ImagePlus size={34} /></div>}</div>
    {error && <p className="text-destructive text-sm mt-3">{error}</p>}
  </section>;
}