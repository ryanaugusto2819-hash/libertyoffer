import { describe,it,expect } from 'vitest';
import { financialMetrics,performanceSchema } from './operations-schemas';
const row={currency:'BRL',ad_spend:100,revenue:400,orders:10,leads:20,product_cost:50,delivery_cost:20,payment_fees:10,other_cost:20};
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