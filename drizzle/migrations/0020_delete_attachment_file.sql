create or replace function public.delete_file(target_file uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  f public.files%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Apenas administradores podem remover arquivos anexados';
  end if;
  select * into f from public.files where id = target_file;
  if not found then
    raise exception 'Arquivo não encontrado';
  end if;
  if f.profile_id is not null then
    raise exception 'O avatar é gerenciado na conta e não pode ser removido aqui';
  end if;
  if exists (select 1 from public.creative_versions v where v.file_id = target_file) then
    raise exception 'Este arquivo é uma versão do criativo e não pode ser removido';
  end if;
  delete from public.spy_transcriptions where file_id = target_file;
  delete from public.files where id = target_file;
  return f.path;
end;
$$;

comment on function public.delete_file(uuid) is 'Admin-only removal of an attached file (reference/product), refusing creative versions and avatars; cleans transcription and returns the storage path for object cleanup.';