CREATE OR REPLACE FUNCTION public.delete_creative_version(target_version uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v record; p text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Apenas administradores podem excluir versões'; END IF;
  SELECT * INTO v FROM public.creative_versions WHERE id = target_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'Versão não encontrada'; END IF;
  IF EXISTS (SELECT 1 FROM public.publications WHERE version_id = target_version) THEN RAISE EXCEPTION 'Esta versão já foi publicada e não pode ser excluída'; END IF;
  DELETE FROM public.creative_reviews WHERE version_id = target_version;
  DELETE FROM public.creative_versions WHERE id = target_version;
  DELETE FROM public.spy_transcriptions WHERE file_id = v.file_id;
  DELETE FROM public.files WHERE id = v.file_id RETURNING path INTO p;
  RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.delete_creative_version(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_creative_version(uuid) TO authenticated;