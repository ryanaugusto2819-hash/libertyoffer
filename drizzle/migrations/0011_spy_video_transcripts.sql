CREATE TABLE public.spy_transcriptions (
 file_id uuid PRIMARY KEY REFERENCES public.files(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','completed','error','denied')),
 text text NOT NULL DEFAULT '',
 error text,
 error_status integer,
 run_id text,
 started_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spy_transcriptions TO authenticated;
GRANT ALL ON public.spy_transcriptions TO service_role;
ALTER TABLE public.spy_transcriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY spy_transcriptions_read ON public.spy_transcriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.files f WHERE f.id=file_id));