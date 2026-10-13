import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { transcribe } from '@/lib/ai/transcribe.server';
import { createLovableAiGatewayRunIdFetch,getLovableAiGatewayResponseHeaders } from '@/lib/ai/run-id.server';
import { transcriptParser,isAdVideo } from '@/lib/spy-transcript';

export const Route=createFileRoute('/api/spy-transcription/$id')({server:{handlers:{POST:async({request,params})=>{
  const id=z.string().uuid().safeParse(params.id);
  if(!id.success)return Response.json({message:'Arquivo inválido.'},{status:400});
  const token=request.headers.get('authorization');
  if(!token?.startsWith('Bearer '))return Response.json({message:'Entre na sua conta.'},{status:401});
  const endpoint=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
  if(!endpoint||!key)return Response.json({message:'Serviço não configurado.'},{status:500});
  const s=createClient(endpoint,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:token},fetch:(input,init)=>{const h=new Headers(init?.headers);h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
  const auth=await s.auth.getUser(token.slice(7));
  if(auth.error||!auth.data.user)return Response.json({message:'Sessão inválida.'},{status:401});
  const f=await s.from('files').select('*').eq('id',id.data).single();
  if(f.error||!f.data?.spy_id||!isAdVideo(f.data))return Response.json({message:'Vídeo não encontrado ou sem acesso.'},{status:404});
  const userId=auth.data.user.id;
  const roles=await Promise.all(['admin','spy'].map(role=>s.rpc('has_role',{_user_id:userId,_role:role})));
  if(!roles.some(r=>r.data===true))return Response.json({message:'Sem permissão para transcrever anúncios.'},{status:403});
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const cached=await admin.from('spy_transcriptions').select('*').eq('file_id',id.data).maybeSingle();
  if(cached.data?.status==='completed')return Response.json({text:cached.data.text});
  const block=await admin.from('spy_ai_access_state').select('*').eq('service','transcription').maybeSingle();
  if(block.data)return Response.json({message:block.data.message},{status:block.data.error_status});
  if(cached.data?.status==='processing')return Response.json({message:'Este vídeo já está sendo transcrito.'},{status:409});
  const apiKey=process.env['LOVABLE_API_KEY'];
  if(!apiKey)return Response.json({message:'A chave de IA não está configurada.'},{status:401});
  // An atomic unique-key claim prevents duplicate billing across users/tabs.
  if(cached.data){const claim=await admin.from('spy_transcriptions').update({status:'processing',error:null,error_status:null,started_at:new Date().toISOString()}).eq('file_id',id.data).eq('status','error').select('file_id');if(!claim.data?.length)return Response.json({message:cached.data.error||'Transcrição bloqueada.'},{status:409});}
  else {const claim=await admin.from('spy_transcriptions').insert({file_id:id.data});if(claim.error)return Response.json({message:'Este vídeo já está sendo transcrito.'},{status:409});}
  const fail=async(message:string,status:number,denied=false)=>{await admin.from('spy_transcriptions').update({status:denied?'denied':'error',error:message,error_status:status,updated_at:new Date().toISOString()}).eq('file_id',id.data);};
  try{
    const audio=await s.storage.from('dr-files').download(f.data.path);
    if(audio.error||!audio.data)throw new Error('Não foi possível ler o vídeo privado.');
    // MP4 containers are sent intact; MOV may require converting to MP4 if rejected upstream.
    const media=new File([audio.data],f.data.name,{type:f.data.mime_type.startsWith('video/')?f.data.mime_type:'video/mp4'});
    const run=createLovableAiGatewayRunIdFetch();
    const upstream=await transcribe({baseURL:'https://ai.gateway.lovable.dev',apiKey,model:'openai/gpt-transcribe',maxFileBytes:20*1024*1024,audioOnly:false,fetch:run.fetch},media,{signal:request.signal});
    await admin.from('spy_transcriptions').update({run_id:run.getRunId()??null}).eq('file_id',id.data);
    if(!upstream.ok){const raw=await upstream.text();let message=raw;try{const err=JSON.parse(raw);message=err.error?.message||err.message||raw;}catch{}const denied=upstream.status===403;await fail(message,upstream.status,denied);if(upstream.status===402||denied)await admin.from('spy_ai_access_state').upsert({service:'transcription',status:denied?'denied':'paused',error_status:upstream.status,message});return Response.json({message},{status:upstream.status});}
    if(!upstream.body)throw new Error('A IA não retornou a transcrição.');
    const reader=upstream.body.getReader();const decoder=new TextDecoder();let full='';let complete=false;let streamError='';
    const parser=transcriptParser((text,done)=>{full=done?text:full+text;if(done)complete=true;},message=>{streamError=message;});
    const enc=new TextEncoder();
    const body=new ReadableStream({async start(controller){try{while(true){const part=await reader.read();if(part.done)break;parser.feed(decoder.decode(part.value,{stream:true}));controller.enqueue(part.value);}parser.feed(decoder.decode());if(streamError||!complete||!full.trim())throw new Error(streamError||'Não foi possível reconhecer fala no vídeo.');const saved=await admin.from('spy_transcriptions').update({status:'completed',text:full,error:null,updated_at:new Date().toISOString()}).eq('file_id',id.data);if(saved.error)throw new Error('A transcrição não pôde ser salva.');controller.close();}catch(error){const message=error instanceof Error?error.message:'Transcrição interrompida.';await fail(message,500);controller.enqueue(enc.encode(`event: error\ndata: ${JSON.stringify({message})}\n\n`));controller.close();}},async cancel(){await reader.cancel();await fail('Transcrição interrompida.',499);}});
    return new Response(body,{headers:getLovableAiGatewayResponseHeaders(upstream.headers,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform'})});
  }catch(error){const message=error instanceof Error?error.message:'Não foi possível transcrever o vídeo.';const status=request.signal.aborted?499:500;await fail(message,status);return Response.json({message},{status});}
}}}});