ALTER TABLE public.files DROP CONSTRAINT files_spy_section_check;
ALTER TABLE public.files ADD CONSTRAINT files_spy_section_check CHECK (spy_section IN ('ads','whatsapp_flow','deliverables','cover'));
COMMENT ON COLUMN public.files.spy_section IS 'Private SPY offer file category: ads, WhatsApp flow, deliverables, or generated cover.';