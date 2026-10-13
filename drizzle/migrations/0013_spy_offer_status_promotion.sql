ALTER TABLE public.spy_offers ADD COLUMN status text NOT NULL DEFAULT 'Ideia' CHECK (status IN ('Ideia','Em preparação','Em teste','Validou','Escalando','Pausada','Não validou','Encerrada'));
ALTER TABLE public.spy_offers ADD COLUMN operational_offer_id uuid UNIQUE REFERENCES public.offers(id);
CREATE FUNCTION public.apply_spy_offer_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid := auth.uid(); target uuid;
BEGIN
 IF actor IS NULL OR NOT (public.has_role(actor,'admin') OR public.has_role(actor,'spy')) THEN RAISE EXCEPTION 'Sem permissão para alterar oferta SPY'; END IF;
 IF TG_OP='INSERT' THEN NEW.operational_offer_id := NULL; NEW.created_by := actor; ELSE NEW.operational_offer_id := OLD.operational_offer_id; NEW.created_by := OLD.created_by; END IF;
 IF NEW.status='Em teste' AND NEW.operational_offer_id IS NULL THEN
  IF NEW.archived THEN RAISE EXCEPTION 'Restaure a oferta antes de iniciar o teste'; END IF;
  INSERT INTO public.offers(name,product_name,niche,country,language,sales_url,whatsapp_url,notes,status,created_by)
  VALUES(NEW.name,NEW.product,NEW.niche,NEW.country,NEW.language,NEW.sales_url,NEW.whatsapp_url,NEW.notes,'Em teste',actor) RETURNING id INTO target;
  NEW.operational_offer_id := target;
  UPDATE public.spy_references SET offer_id=target WHERE spy_offer_id=NEW.id;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.apply_spy_offer_status() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER apply_spy_offer_status BEFORE INSERT OR UPDATE ON public.spy_offers FOR EACH ROW EXECUTE FUNCTION public.apply_spy_offer_status();
CREATE FUNCTION public.set_spy_offer_status(target_spy uuid, new_status text) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE target uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'spy')) THEN RAISE EXCEPTION 'Sem permissão para alterar oferta SPY'; END IF;
 UPDATE public.spy_offers SET status=new_status WHERE id=target_spy RETURNING operational_offer_id INTO target;
 IF NOT FOUND THEN RAISE EXCEPTION 'Oferta SPY não encontrada'; END IF;
 RETURN target;
END $$;
REVOKE ALL ON FUNCTION public.set_spy_offer_status(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_spy_offer_status(uuid,text) TO authenticated;
COMMENT ON COLUMN public.spy_offers.operational_offer_id IS 'Operational destination after promotion; research files remain privately attached to their original SPY entity.';