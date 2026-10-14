ALTER TABLE public.files DROP CONSTRAINT IF EXISTS files_size_bytes_check;
ALTER TABLE public.files ADD CONSTRAINT files_size_bytes_positive_check CHECK (size_bytes > 0);
COMMENT ON CONSTRAINT files_size_bytes_positive_check ON public.files IS 'Files must be non-empty; upload size is governed by storage capacity rather than an application cap.';