-- Review decisions notify the assigned editor with the reviewer's notes.
CREATE OR REPLACE FUNCTION public.notify_item_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE review_notes text;
BEGIN
  IF new.assigned_to IS NOT NULL AND (TG_OP='INSERT' OR new.assigned_to IS DISTINCT FROM old.assigned_to) THEN
    INSERT INTO public.notifications(user_id,item_id,title,body) VALUES(new.assigned_to,new.id,'Nova demanda atribuída',new.name);
  END IF;
  IF TG_OP='UPDATE' AND new.status IS DISTINCT FROM old.status THEN
    IF new.status='Aguardando aprovação' THEN
      INSERT INTO public.notifications(user_id,item_id,title,body) SELECT user_id,new.id,'Criativo enviado para aprovação',new.name FROM public.user_roles WHERE role='admin';
    ELSIF new.status IN ('Aprovado','Ajustes solicitados') THEN
      SELECT r.notes INTO review_notes FROM public.creative_reviews r JOIN public.creative_versions v ON v.id=r.version_id WHERE v.item_id=new.id ORDER BY r.created_at DESC LIMIT 1;
      IF new.assigned_to IS NOT NULL THEN
        INSERT INTO public.notifications(user_id,item_id,title,body) VALUES(new.assigned_to,new.id,
          CASE new.status WHEN 'Aprovado' THEN 'Criativo aprovado' ELSE 'Ajustes solicitados' END,
          new.name || CASE WHEN coalesce(trim(review_notes),'')<>'' THEN ' — ' || left(trim(review_notes),500) ELSE '' END);
      END IF;
      IF new.status='Aprovado' THEN
        INSERT INTO public.notifications(user_id,item_id,title,body) SELECT user_id,new.id,'Criativo na fila de publicação',new.name FROM public.user_roles WHERE role='traffic';
      END IF;
    END IF;
  END IF;
  RETURN new;
END $$;
