CREATE OR REPLACE FUNCTION public.delete_offer_creative(target_item uuid, confirmation_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_name text;
  parent_demand uuid;
  remove_parent boolean;
  version_ids uuid[];
  file_paths text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir anúncios';
  END IF;

  SELECT name, demand_id INTO current_name, parent_demand
  FROM public.demand_items
  WHERE id = target_item
  FOR UPDATE;

  IF current_name IS NULL THEN
    RAISE EXCEPTION 'Anúncio não encontrado';
  END IF;

  IF confirmation_name IS DISTINCT FROM current_name THEN
    RAISE EXCEPTION 'Digite o nome exato do anúncio para confirmar';
  END IF;

  SELECT count(*) = 1 INTO remove_parent
  FROM public.demand_items
  WHERE demand_id = parent_demand;

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO version_ids
  FROM public.creative_versions
  WHERE item_id = target_item;

  SELECT coalesce(array_agg(path), '{}'::text[]) INTO file_paths
  FROM public.files
  WHERE item_id = target_item OR (remove_parent AND demand_id = parent_demand);

  DELETE FROM public.publications WHERE version_id = ANY(version_ids);
  DELETE FROM public.creative_reviews WHERE version_id = ANY(version_ids);
  DELETE FROM public.notifications WHERE item_id = target_item;
  DELETE FROM public.item_comments WHERE item_id = target_item;
  DELETE FROM public.performance_daily WHERE item_id = target_item;
  DELETE FROM public.creative_versions WHERE item_id = target_item;
  DELETE FROM public.files WHERE item_id = target_item OR (remove_parent AND demand_id = parent_demand);
  DELETE FROM public.activity_log WHERE entity_id = target_item OR (remove_parent AND entity_id = parent_demand);
  DELETE FROM public.demand_items WHERE id = target_item;

  IF remove_parent THEN
    DELETE FROM public.demands WHERE id = parent_demand;
  END IF;

  RETURN file_paths;
END
$$;

REVOKE ALL ON FUNCTION public.delete_offer_creative(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_offer_creative(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.delete_offer_creative(uuid, text) IS 'Permanently deletes one offer creative and its linked versions, reviews, publications, performance, notifications, comments and private file records after exact-name confirmation; admin only. Removes an empty parent demand.';