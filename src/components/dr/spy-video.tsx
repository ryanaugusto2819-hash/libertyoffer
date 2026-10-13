import { useEffect,useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Play,LoaderCircle,FileText,RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fileUrl } from '@/lib/dr.functions';
import { transcriptParser } from '@/lib/spy-transcript';
import { Button } from '@/components/ui/button';

export async function transcribeAd(fileId:string,onText?:(text:string)=>void){
 const session=await supabase.auth.getSession();const token=session.data.session?.access_token;
 if(!token)throw new Error('Entre na sua conta.');
 const r=await fetch(`/api/spy-transcription/${fileId}`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});
 if(!r.ok){const data=await r.json();throw new Error(data.message||'Não foi possível transcrever.');}
 if(r.headers.get('content-type')?.includes('application/json')){const data=await r.json();onText?.(data.text);return data.text as string;}
 if(!r.body)throw new Error('Transcrição vazia.');
 let text='';let done=false;let error='';const parser=transcriptParser((part,final)=>{text=final?part:text+part;done=final||done;onText?.(text);},message=>{error=message;});
 const reader=r.body.getReader();const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;parser.feed(decoder.decode(part.value,{stream:true}));}parser.feed(decoder.decode());
 if(error||!done)throw new Error(error||'Transcrição interrompida.');return text;
}
export function SpyVideo({file,canWrite=false}:{file:{id:string,name:string},canWrite?:boolean}){
 const url=useServerFn(fileUrl);const qc=useQueryClient();const [src,setSrc]=useState('');const [busy,setBusy]=useState(false);const [text,setText]=useState('');const [error,setError]=useState('');
 const q=useQuery({queryKey:['spy-transcript',file.id],queryFn:async()=>{const r=await supabase.from('spy_transcriptions').select('*').eq('file_id',file.id).maybeSingle();if(r.error)throw new Error(r.error.message);return r.data;},refetchInterval:query=>query.state.data?.status==='processing'?2000:false});
 useEffect(()=>{setText(q.data?.text??'');},[q.data?.text]);
 return <div className="space-y-3 my-4"><div className="flex items-center gap-2"><Play size={16}/><strong className="text-sm break-all">{file.name}</strong></div>{src?<video className="media-preview w-full" src={src} controls autoPlay onError={()=>setError('Não foi possível reproduzir este formato. Baixe o vídeo ou envie MP4.')}/>:<Button variant="outline" onClick={async()=>{try{setSrc(await url({data:{id:file.id,download:false}}));}catch(e){setError(e instanceof Error?e.message:'Não foi possível abrir o vídeo.');}}}><Play/>Reproduzir vídeo</Button>}<div className="flex items-center gap-2 text-sm"><FileText size={16}/><strong>Transcrição do anúncio</strong>{(busy||q.data?.status==='processing')&&<LoaderCircle size={16} className="animate-spin"/>}</div>{text&&<p className="whitespace-pre-wrap text-sm">{text}</p>}{(error||q.data?.error||q.error)&&<p className="text-destructive text-sm">{error||q.data?.error||q.error?.message}</p>}{canWrite&&!busy&&q.data?.status!=='completed'&&q.data?.status!=='processing'&&q.data?.status!=='denied'&&<Button variant="outline" size="sm" onClick={async()=>{setBusy(true);setError('');try{await transcribeAd(file.id,setText);await qc.invalidateQueries({queryKey:['spy-transcript',file.id]});}catch(e){setError(e instanceof Error?e.message:'Falha na transcrição.');}finally{setBusy(false);}}}><RotateCw/>{q.data?'Tentar transcrição novamente':'Transcrever com IA'}</Button>}</div>;
}