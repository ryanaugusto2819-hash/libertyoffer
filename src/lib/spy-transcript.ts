import { createParser } from 'eventsource-parser';
export function transcriptParser(onText:(text:string,done:boolean)=>void,onError:(message:string)=>void) {
  return createParser({onEvent(event){
    if(event.data==='[DONE]')return;
    try {
      const data=JSON.parse(event.data);
      const type=data.type||event.event;
      if(type==='transcript.text.delta')onText(String(data.delta??''),false);
      if(type==='transcript.text.done')onText(String(data.text??''),true);
      if(type==='error'||data.error)onError(data.error?.message||data.message||'A transcrição foi interrompida.');
    } catch {onError('Resposta inválida da transcrição.');}
  }});
}
export function isAdVideo(file:{name:string,mime_type:string}){return file.mime_type.startsWith('video/')||/\.(mp4|mov)$/i.test(file.name);}