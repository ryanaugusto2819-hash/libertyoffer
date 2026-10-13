import { describe,it,expect } from 'vitest';
import { financialMetrics,performanceSchema,reviewSchema,publicationSchema,spyOfferSchema,spySectionSchema,spySchema,spyOfferStatusSchema,isSpyResearchOffer } from './operations-schemas';
const row={currency:'BRL',ad_spend:100,revenue:400,orders:10,leads:20,product_cost:50,delivery_cost:20,payment_fees:10,other_cost:20};
describe('SPY offer workspace',()=>{
 it('Em Teste is an accepted persisted status',()=>{expect(spyOfferStatusSchema.parse({id:'00000000-0000-4000-8000-000000000001',status:'Em teste'}).status).toBe('Em teste');expect(spyOfferStatusSchema.safeParse({id:'00000000-0000-4000-8000-000000000001',status:'invalid'}).success).toBe(false);});
 it('promoted offers leave SPY while unpromoted offers stay',()=>{expect(isSpyResearchOffer({operational_offer_id:'00000000-0000-4000-8000-000000000001'})).toBe(false);expect(isSpyResearchOffer({operational_offer_id:null})).toBe(true);});
 it('a researched offer must have a name before saving',()=>expect(spyOfferSchema.safeParse({name:'   '}).success).toBe(false));
 it('WhatsApp flow has its own file category',()=>{expect(spySectionSchema.parse('whatsapp_flow')).toBe('whatsapp_flow');expect(spySectionSchema.safeParse('whatsapp').success).toBe(false);});
 it('deliverables have their own file category',()=>{expect(spySectionSchema.parse('deliverables')).toBe('deliverables');expect(spySectionSchema.safeParse('other').success).toBe(false);});
 it('ads retain their researched offer association',()=>{const id='00000000-0000-4000-8000-000000000001';const parsed=spySchema.parse({name:'Ad',platform:'Meta',copy:'',hook:'',cta:'',country:'',language:'Português',niche:'',product:'',offer_id:null,spy_offer_id:id,captured_at:'2026-10-13',notes:'',tags:[]});expect(parsed.spy_offer_id).toBe(id);});
});
describe('Financial operating rules',()=>{
 it('ROAS is revenue divided by advertising spend',()=>expect(financialMetrics([row],'BRL').roas).toBe(4));
 it('ROI is profit divided by total investment times one hundred',()=>expect(financialMetrics([row],'BRL').roi).toBe(100));
 it('estimated profit subtracts advertising and all four costs',()=>expect(financialMetrics([row],'BRL').profit).toBe(200));
 it('CPL is advertising divided by leads',()=>expect(financialMetrics([row],'BRL').cpl).toBe(5));
 it('CPA is advertising divided by orders',()=>expect(financialMetrics([row],'BRL').cpa).toBe(10));
 it('zero denominators never produce infinity',()=>{const m=financialMetrics([{...row,ad_spend:0,orders:0,leads:0,product_cost:0,delivery_cost:0,payment_fees:0,other_cost:0}],'BRL');expect([m.roas,m.roi,m.cpa,m.cpl]).toEqual([0,0,0,0]);});
 it('different currencies are not added without an explicit conversion',()=>expect(financialMetrics([row,{...row,currency:'USD'}],'BRL').revenue).toBe(400));
 it('stored conversion rate is applied to all monetary values',()=>{const m=financialMetrics([{...row,currency:'USD',conversion_currency:'BRL',conversion_rate:5}],'BRL');expect(m.revenue).toBe(2000);expect(m.investment).toBe(1000);});
 it('conversion requires both a currency and a positive rate',()=>{const data={...row,offer_id:'00000000-0000-4000-8000-000000000001',item_id:null,date:'2026-10-13',conversion_currency:'USD',conversion_rate:null};expect(performanceSchema.safeParse(data).success).toBe(false);});
});
describe('Version workflow validation',()=>{
 it('adjustment requests must include observations',()=>expect(reviewSchema.safeParse({version_id:'00000000-0000-4000-8000-000000000001',decision:'Ajustes solicitados',notes:'   '}).success).toBe(false));
 it('reviews target a specific persisted version',()=>expect(reviewSchema.safeParse({version_id:'',decision:'Aprovado',notes:''}).success).toBe(false));
 it('publications must reference a persisted version',()=>expect(publicationSchema.safeParse({version_id:'',ad_id:'123',ad_url:'',campaign:'Campanha',ad_set:'',published_at:'2026-10-13',status:'Publicado'}).success).toBe(false));
});