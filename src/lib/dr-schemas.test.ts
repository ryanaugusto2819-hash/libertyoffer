import { describe,it,expect } from 'vitest';
import { batchProgress,demandSchema,validateFile } from './dr-schemas';
describe('LibertyOffer business rules',()=>{
 it('a batch with six approved out of ten has sixty percent progress',()=>{expect(batchProgress(Array.from({length:10},(_,i)=>({status:i<6?'Aprovado':i<8?'Em edição':'Pendente'})))).toBe(60);});
 it('individual demands only contain one creative',()=>{const item={name:'Criativo'};expect(demandSchema.safeParse({title:'Demanda',offer_id:'00000000-0000-4000-8000-000000000001',kind:'individual',priority:'Média',items:[item,item]}).success).toBe(false);});
 it('allows MP4 MOV JPG PNG WEBP PDF TXT DOCX formats',()=>{for(const ext of ['mp4','mov','jpg','png','webp','pdf','txt','docx'])expect(()=>validateFile(`arquivo.${ext}`,1024)).not.toThrow();});
 it('rejects executable files',()=>{expect(()=>validateFile('arquivo.exe',1024)).toThrow();});
 it('accepts original files larger than twenty megabytes',()=>{expect(()=>validateFile('video.mp4',2*1024*1024*1024)).not.toThrow();});
 it('rejects empty files',()=>{expect(()=>validateFile('video.mp4',0)).toThrow();});
});
