CREATE OR REPLACE FUNCTION public.delete_demand(target_demand uuid, confirmation_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_title text;
  item_ids uuid[];
  version_ids uuid[];
  file_paths text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir demandas';
  END IF;
  SELECT title INTO current_title FROM public.demands WHERE id = target_demand FOR UPDATE;
  IF current_title IS NULL THEN RAISE EXCEPTION 'Demanda não encontrada'; END IF;
  IF confirmation_name IS DISTINCT FROM current_title THEN
    RAISE EXCEPTION 'Digite o título exato da demanda para confirmar';
  END IF;
  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO item_ids FROM public.demand_items WHERE demand_id = target_demand;
  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO version_ids FROM public.creative_versions WHERE item_id = ANY(item_ids);
  SELECT coalesce(array_agg(path), '{}'::text[]) INTO file_paths FROM public.files WHERE item_id = ANY(item_ids) OR demand_id = target_demand;
  DELETE FROM public.publications WHERE version_id = ANY(version_ids);
  DELETE FROM public.creative_reviews WHERE version_id = ANY(version_ids);
  DELETE FROM public.notifications WHERE item_id = ANY(item_ids);
  DELETE FROM public.item_comments WHERE item_id = ANY(item_ids);
  DELETE FROM public.performance_daily WHERE item_id = ANY(item_ids);
  DELETE FROM public.creative_versions WHERE item_id = ANY(item_ids);
  DELETE FROM public.spy_transcriptions WHERE file_id IN (SELECT id FROM public.files WHERE item_id = ANY(item_ids) OR demand_id = target_demand);
  DELETE FROM public.files WHERE item_id = ANY(item_ids) OR demand_id = target_demand;
  DELETE FROM public.activity_log WHERE entity_id = ANY(item_ids) OR entity_id = target_demand;
  DELETE FROM public.demand_items WHERE demand_id = target_demand;
  DELETE FROM public.demands WHERE id = target_demand;
  RETURN file_paths;
END
$$;
REVOKE ALL ON FUNCTION public.delete_demand(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_demand(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.delete_demand(uuid, text) IS 'Permanently deletes a demand with all its creatives and dependent records after exact-title confirmation; admin only.';