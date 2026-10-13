-- Run through psql with -v test_user=<an existing account UUID>.
-- Every fixture and role change is rolled back; no production data is retained.
BEGIN;
SELECT set_config('request.jwt.claim.sub', :'test_user', true);
SELECT set_config('request.jwt.claims', json_build_object('sub', :'test_user', 'role', 'authenticated')::text, true);
CREATE TEMP TABLE permission_fixture (offer_id uuid, demand_id uuid, owned_item uuid, other_item uuid);
GRANT SELECT ON permission_fixture TO authenticated;
WITH o AS (
 INSERT INTO public.offers(name,created_by) VALUES('Transient permission test', :'test_user') RETURNING id
), d AS (
 INSERT INTO public.demands(title,offer_id,kind,created_by) SELECT 'Transient permission test',id,'batch', :'test_user' FROM o RETURNING id,offer_id
)
INSERT INTO permission_fixture(offer_id,demand_id) SELECT offer_id,id FROM d;
DELETE FROM public.user_roles WHERE user_id=:'test_user';
INSERT INTO public.user_roles(user_id,role) VALUES(:'test_user','editor');
WITH i AS (
 INSERT INTO public.demand_items(demand_id,name,item_number,assigned_to)
 SELECT demand_id,'Assigned',1, :'test_user' FROM permission_fixture RETURNING id
)
UPDATE permission_fixture SET owned_item=(SELECT id FROM i);
WITH i AS (
 INSERT INTO public.demand_items(demand_id,name,item_number)
 SELECT demand_id,'Unassigned',2 FROM permission_fixture RETURNING id
)
UPDATE permission_fixture SET other_item=(SELECT id FROM i);
SET LOCAL ROLE authenticated;
DO $$ DECLARE count_rows integer; BEGIN
 UPDATE public.demand_items SET status='Em edição' WHERE id=(SELECT owned_item FROM permission_fixture);
 GET DIAGNOSTICS count_rows=ROW_COUNT;
 IF count_rows<>1 THEN RAISE EXCEPTION 'Assigned editor could not start editing'; END IF;
 UPDATE public.demand_items SET status='Em edição' WHERE id=(SELECT other_item FROM permission_fixture);
 GET DIAGNOSTICS count_rows=ROW_COUNT;
 IF count_rows<>0 THEN RAISE EXCEPTION 'Editor changed an unassigned item'; END IF;
 BEGIN
  UPDATE public.demand_items SET copy='Disallowed edit' WHERE id=(SELECT owned_item FROM permission_fixture);
  RAISE EXCEPTION 'Editor changed copy';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='Editor changed copy' THEN RAISE; END IF;
 END;
 BEGIN
  UPDATE public.demand_items SET status='Aguardando aprovação' WHERE id=(SELECT owned_item FROM permission_fixture);
  RAISE EXCEPTION 'Submitted without final file';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='Submitted without final file' THEN RAISE; END IF;
 END;
 BEGIN
  PERFORM public.review_creative(gen_random_uuid(),'Aprovado','');
  RAISE EXCEPTION 'Editor reviewed a creative';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='Editor reviewed a creative' THEN RAISE; END IF;
 END;
 IF EXISTS(SELECT 1 FROM public.performance_daily) THEN RAISE EXCEPTION 'Editor accessed financial rows'; END IF;
END $$;
RESET ROLE;
DELETE FROM public.user_roles WHERE user_id=:'test_user';
INSERT INTO public.user_roles(user_id,role) VALUES(:'test_user','spy');
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 INSERT INTO public.spy_references(name) VALUES('Transient SPY permission test');
 BEGIN
  INSERT INTO public.offers(name) VALUES('Disallowed SPY offer');
  RAISE EXCEPTION 'SPY created an offer';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='SPY created an offer' THEN RAISE; END IF;
 END;
END $$;
RESET ROLE;
DELETE FROM public.user_roles WHERE user_id=:'test_user';
INSERT INTO public.user_roles(user_id,role) VALUES(:'test_user','traffic');
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
  PERFORM public.review_creative(gen_random_uuid(),'Aprovado','');
  RAISE EXCEPTION 'Traffic reviewed a creative';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='Traffic reviewed a creative' THEN RAISE; END IF;
 END;
 BEGIN
  INSERT INTO public.publications(version_id,ad_id,campaign) VALUES(gen_random_uuid(),'Transient','Transient');
  RAISE EXCEPTION 'Published an unapproved version';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM='Published an unapproved version' THEN RAISE; END IF;
 END;
END $$;
RESET ROLE;
ROLLBACK;