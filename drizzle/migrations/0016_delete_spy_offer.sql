CREATE OR REPLACE FUNCTION public.delete_spy_offer(target_spy_offer uuid, confirmation_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_name text;
  reference_ids uuid[];
  file_paths text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir ofertas da Central de SPY';
  END IF;

  SELECT name INTO current_name
  FROM public.spy_offers
  WHERE id = target_spy_offer
  FOR UPDATE;

  IF current_name IS NULL THEN
    RAISE EXCEPTION 'Oferta SPY não encontrada';
  END IF;

  IF confirmation_name IS DISTINCT FROM current_name THEN
    RAISE EXCEPTION 'Digite o nome exato da oferta para confirmar';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.spy_offers
    WHERE id = target_spy_offer AND operational_offer_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Esta pesquisa está vinculada a uma oferta em operação e não pode ser excluída';
  END IF;

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO reference_ids
  FROM public.spy_references
  WHERE spy_offer_id = target_spy_offer;

  SELECT coalesce(array_agg(path), '{}'::text[]) INTO file_paths
  FROM public.files
  WHERE spy_offer_id = target_spy_offer OR spy_id = ANY(reference_ids);

  UPDATE public.demand_items SET source_spy_id = NULL WHERE source_spy_id = ANY(reference_ids);
  DELETE FROM public.spy_favorites WHERE reference_id = ANY(reference_ids);
  DELETE FROM public.files WHERE spy_offer_id = target_spy_offer OR spy_id = ANY(reference_ids);
  DELETE FROM public.activity_log WHERE entity_type IN ('spy_offer', 'spy') AND (entity_id = target_spy_offer OR entity_id = ANY(reference_ids));
  DELETE FROM public.spy_references WHERE spy_offer_id = target_spy_offer;
  DELETE FROM public.spy_offers WHERE id = target_spy_offer;

  RETURN file_paths;
END
$$;

REVOKE ALL ON FUNCTION public.delete_spy_offer(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_spy_offer(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.delete_spy_offer(uuid, text) IS 'Permanently deletes an unpromoted researched offer, its ads, transcriptions and private attachments after exact-name confirmation; admin only.';