CREATE TABLE public.spy_offers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 product text NOT NULL DEFAULT '',
 niche text NOT NULL DEFAULT '',
 country text NOT NULL DEFAULT '',
 language text NOT NULL DEFAULT 'Português',
 library_url text NOT NULL DEFAULT '',
 sales_url text NOT NULL DEFAULT '',
 whatsapp_url text NOT NULL DEFAULT '',
 notes text NOT NULL DEFAULT '',
 archived boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.spy_offers TO authenticated;
GRANT ALL ON public.spy_offers TO service_role;
ALTER TABLE public.spy_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY spy_offers_read ON public.spy_offers FOR SELECT TO authenticated USING(public.is_member());
CREATE POLICY spy_offers_insert ON public.spy_offers FOR INSERT TO authenticated WITH CHECK(created_by=auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'spy')));
CREATE POLICY spy_offers_update ON public.spy_offers FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'spy')) WITH CHECK(public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'spy'));
ALTER TABLE public.spy_references ADD COLUMN spy_offer_id uuid REFERENCES public.spy_offers(id);
ALTER TABLE public.files ADD COLUMN spy_offer_id uuid REFERENCES public.spy_offers(id), ADD COLUMN spy_section text NOT NULL DEFAULT 'ads';
ALTER TABLE public.files DROP CONSTRAINT files_entity_check;
ALTER TABLE public.files ADD CONSTRAINT files_entity_check CHECK(num_nonnulls(offer_id,demand_id,item_id,spy_id,profile_id,spy_offer_id)=1);
ALTER TABLE public.files ADD CONSTRAINT files_spy_section_check CHECK(spy_section IN ('ads','whatsapp_flow','deliverables'));
ALTER TABLE public.files ADD CONSTRAINT files_spy_attachment_check CHECK(spy_offer_id IS NULL OR purpose='reference');
CREATE POLICY files_spy_offer_read ON public.files FOR SELECT TO authenticated USING(spy_offer_id IS NOT NULL AND public.is_member());
CREATE POLICY files_spy_offer_insert ON public.files FOR INSERT TO authenticated WITH CHECK(uploaded_by=auth.uid() AND spy_offer_id IS NOT NULL AND purpose='reference' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'spy')));
CREATE INDEX spy_references_workspace_idx ON public.spy_references(spy_offer_id,captured_at);
CREATE INDEX files_spy_offer_idx ON public.files(spy_offer_id,spy_section);
