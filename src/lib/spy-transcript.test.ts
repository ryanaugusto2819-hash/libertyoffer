import { describe,it,expect } from 'vitest';
import { transcriptParser,isAdVideo } from './spy-transcript';
describe('SPY video transcripts',()=>{
 it('recognizes uploaded ad videos, not images',()=>{expect(isAdVideo({name:'anuncio.mp4',mime_type:'application/octet-stream'})).toBe(true);expect(isAdVideo({name:'anuncio.png',mime_type:'image/png'})).toBe(false);});
 it('reads fragmented streaming transcription and final text',()=>{const seen:string[]=[];const errors:string[]=[];const parser=transcriptParser((t,done)=>seen.push(`${done}:${t}`),e=>errors.push(e));parser.feed('data: {"type":"transcript.text.');parser.feed('delta","delta":"Oferta real"}\n\n');parser.feed('data: {"type":"transcript.text.done","text":"Oferta real."}\n\n');expect(seen).toEqual(['false:Oferta real','true:Oferta real.']);expect(errors).toEqual([]);});
 it('surfaces terminal streaming errors',()=>{let error='';const parser=transcriptParser(()=>{},e=>{error=e;});parser.feed('event: error\ndata: {"message":"Créditos insuficientes"}\n\n');expect(error).toBe('Créditos insuficientes');});
});