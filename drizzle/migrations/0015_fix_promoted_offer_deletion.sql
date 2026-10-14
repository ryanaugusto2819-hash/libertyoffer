CREATE OR REPLACE FUNCTION public.apply_spy_offer_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  target uuid;
  deletion_target text := current_setting('app.deleting_operational_offer', true);
BEGIN
  IF actor IS NULL OR NOT (public.has_role(actor,'admin') OR public.has_role(actor,'spy')) THEN
    RAISE EXCEPTION 'Sem permissão para alterar oferta SPY';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.operational_offer_id := NULL;
    NEW.created_by := actor;
  ELSE
    NEW.created_by := OLD.created_by;
    IF NEW.operational_offer_id IS DISTINCT FROM OLD.operational_offer_id
       AND NOT (
         NEW.operational_offer_id IS NULL
         AND OLD.operational_offer_id::text = deletion_target
         AND public.has_role(actor, 'admin')
       ) THEN
      NEW.operational_offer_id := OLD.operational_offer_id;
    END IF;
  END IF;

  IF NEW.status = 'Em teste' AND NEW.operational_offer_id IS NULL AND deletion_target IS DISTINCT FROM OLD.operational_offer_id::text THEN
    IF NEW.archived THEN
      RAISE EXCEPTION 'Restaure a oferta antes de iniciar o teste';
    END IF;
    INSERT INTO public.offers(name,product_name,niche,country,language,sales_url,whatsapp_url,notes,status,created_by)
    VALUES(NEW.name,NEW.product,NEW.niche,NEW.country,NEW.language,NEW.sales_url,NEW.whatsapp_url,NEW.notes,'Em teste',actor)
    RETURNING id INTO target;
    NEW.operational_offer_id := target;
    UPDATE public.spy_references SET offer_id=target WHERE spy_offer_id=NEW.id;
  END IF;
  RETURN NEW;
END
$$;

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

  SELECT name INTO current_name FROM public.offers WHERE id = target_offer FOR UPDATE;
  IF current_name IS NULL THEN RAISE EXCEPTION 'Oferta não encontrada'; END IF;
  IF confirmation_name IS DISTINCT FROM current_name THEN RAISE EXCEPTION 'Digite o nome exato da oferta para confirmar'; END IF;

  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO demand_ids FROM public.demands WHERE offer_id = target_offer;
  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO item_ids FROM public.demand_items WHERE demand_id = ANY(demand_ids);
  SELECT coalesce(array_agg(id), '{}'::uuid[]) INTO version_ids FROM public.creative_versions WHERE item_id = ANY(item_ids);
  SELECT coalesce(array_agg(path), '{}'::text[]) INTO file_paths FROM public.files
  WHERE offer_id = target_offer OR demand_id = ANY(demand_ids) OR item_id = ANY(item_ids);

  DELETE FROM public.publications WHERE version_id = ANY(version_ids);
  DELETE FROM public.creative_reviews WHERE version_id = ANY(version_ids);
  DELETE FROM public.notifications WHERE item_id = ANY(item_ids);
  DELETE FROM public.item_comments WHERE item_id = ANY(item_ids);
  DELETE FROM public.creative_versions WHERE item_id = ANY(item_ids);
  DELETE FROM public.performance_daily WHERE offer_id = target_offer OR item_id = ANY(item_ids);
  DELETE FROM public.files WHERE offer_id = target_offer OR demand_id = ANY(demand_ids) OR item_id = ANY(item_ids);
  DELETE FROM public.demand_items WHERE demand_id = ANY(demand_ids);
  DELETE FROM public.demands WHERE id = ANY(demand_ids);

  PERFORM set_config('app.deleting_operational_offer', target_offer::text, true);
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