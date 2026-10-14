CREATE OR REPLACE FUNCTION public.delete_operational_offer(target_offer uuid, confirmation_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  current_name text;
  file_paths text[];
  demand_ids uuid[];
  item_ids uuid[];
  version_ids uuid[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir ofertas';
  END IF;

  SELECT name INTO current_name
  FROM public.offers
  WHERE id = target_offer
  FOR UPDATE;

  IF current_name IS NULL THEN
    RAISE EXCEPTION 'Oferta não encontrada';
  END IF;

  IF confirmation_name IS DISTINCT FROM current_name THEN
    RAISE EXCEPTION 'Digite o nome exato da oferta para confirmar';
  END IF;

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO demand_ids
  FROM public.demands
  WHERE offer_id = target_offer;

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO item_ids
  FROM public.demand_items
  WHERE demand_id = ANY(demand_ids);

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO version_ids
  FROM public.creative_versions
  WHERE item_id = ANY(item_ids);

  SELECT coalesce(array_agg(path), '{}'::text[]) INTO file_paths
  FROM public.files
  WHERE offer_id = target_offer
     OR demand_id = ANY(demand_ids)
     OR item_id = ANY(item_ids);

  DELETE FROM public.publications WHERE version_id = ANY(version_ids);
  DELETE FROM public.creative_reviews WHERE version_id = ANY(version_ids);
  DELETE FROM public.notifications WHERE item_id = ANY(item_ids);
  DELETE FROM public.item_comments WHERE item_id = ANY(item_ids);
  DELETE FROM public.creative_versions WHERE item_id = ANY(item_ids);
  DELETE FROM public.performance_daily WHERE offer_id = target_offer OR item_id = ANY(item_ids);
  DELETE FROM public.files
  WHERE offer_id = target_offer
     OR demand_id = ANY(demand_ids)
     OR item_id = ANY(item_ids);
  DELETE FROM public.demand_items WHERE demand_id = ANY(demand_ids);
  DELETE FROM public.demands WHERE id = ANY(demand_ids);

  UPDATE public.spy_references SET offer_id = NULL WHERE offer_id = target_offer;
  UPDATE public.spy_offers SET operational_offer_id = NULL WHERE operational_offer_id = target_offer;

  DELETE FROM public.activity_log
  WHERE (entity_type = 'offer' AND entity_id = target_offer)
     OR (entity_type = 'demand' AND entity_id = ANY(demand_ids))
     OR (entity_type = 'item' AND entity_id = ANY(item_ids));

  DELETE FROM public.offers WHERE id = target_offer;
  RETURN file_paths;
END
$$;

REVOKE ALL ON FUNCTION public.delete_operational_offer(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_operational_offer(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.delete_operational_offer(uuid, text) IS 'Permanently deletes an operational offer and its dependent production data after an exact-name confirmation; admin only.';