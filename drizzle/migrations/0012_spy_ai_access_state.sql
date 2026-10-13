CREATE TABLE public.spy_ai_access_state (
 service text PRIMARY KEY,
 status text NOT NULL CHECK (status IN ('paused','denied')),
 error_status integer NOT NULL,
 message text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.spy_ai_access_state TO service_role;
ALTER TABLE public.spy_ai_access_state ENABLE ROW LEVEL SECURITY;