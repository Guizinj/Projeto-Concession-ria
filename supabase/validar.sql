-- Após schema.sql: valida segurança com fixtures temporárias, sem depender do seed.
-- Executar como postgres no SQL Editor. O ROLLBACK remove todos os dados de teste.
-- Se ocorrer erro, execute ROLLBACK; antes de qualquer outro comando.
begin;

insert into public.veiculos (
  codigo, slug, marca, modelo, ano_fabricacao, ano_modelo, preco,
  quilometragem, cambio, combustivel, categoria, cor, publicado, status
) values
  ('TESTE-RLS-PUBLICADO', 'teste-rls-publicado', 'Teste', 'Publicado', 2020, 2020, 1, 0, 'manual', 'flex', 'hatch', 'Teste', true, 'disponivel'),
  ('TESTE-RLS-OCULTO', 'teste-rls-oculto', 'Teste', 'Oculto', 2020, 2020, 1, 0, 'manual', 'flex', 'hatch', 'Teste', false, 'disponivel'),
  ('TESTE-RLS-VENDIDO', 'teste-rls-vendido', 'Teste', 'Vendido', 2020, 2020, 1, 0, 'manual', 'flex', 'hatch', 'Teste', true, 'vendido');
insert into public.veiculo_imagens (veiculo_id, storage_path, principal)
select id, 'teste/' || slug || '.png', true from public.veiculos
where codigo in ('TESTE-RLS-PUBLICADO', 'TESTE-RLS-OCULTO');

-- Também verifica authenticated: desativar cadastros não revoga tokens existentes.
set local role anon;
do $$
begin
  if (select count(*) from public.veiculos where codigo = 'TESTE-RLS-PUBLICADO') <> 1
    or exists (select 1 from public.veiculos where codigo = 'TESTE-RLS-OCULTO')
    or (select count(*) from public.veiculos where codigo = 'TESTE-RLS-VENDIDO') <> 1 then
    raise exception 'Falha: visibilidade de veículos para anon';
  end if;
  if (select count(*) from public.veiculo_imagens where storage_path = 'teste/teste-rls-publicado.png') <> 1
    or exists (select 1 from public.veiculo_imagens where storage_path = 'teste/teste-rls-oculto.png') then
    raise exception 'Falha: visibilidade de imagens para anon';
  end if;
  if has_table_privilege(current_user, 'public.veiculos', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
    or has_table_privilege(current_user, 'public.veiculo_imagens', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
    raise exception 'Falha: anon recebeu permissão além de leitura';
  end if;
  begin
    update public.veiculos set preco = 2 where codigo = 'TESTE-RLS-PUBLICADO';
    raise exception 'Falha: update de anon foi aceito';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.veiculo_imagens where storage_path = 'teste/teste-rls-publicado.png';
    raise exception 'Falha: delete de anon foi aceito';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.veiculos (codigo) values ('TESTE-RLS-ESCRITA');
    raise exception 'Falha: insert de anon foi aceito';
  exception when insufficient_privilege then null;
  end;
  raise notice 'OK: anon lê publicados, não vê rascunhos e não escreve.';
end;
$$;

reset role;
set local role authenticated;
do $$
begin
  if (select count(*) from public.veiculos where codigo = 'TESTE-RLS-PUBLICADO') <> 1
    or exists (select 1 from public.veiculos where codigo = 'TESTE-RLS-OCULTO')
    or exists (select 1 from public.veiculo_imagens where storage_path = 'teste/teste-rls-oculto.png') then
    raise exception 'Falha: visibilidade para authenticated';
  end if;
  if has_table_privilege(current_user, 'public.veiculos', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
    or has_table_privilege(current_user, 'public.veiculo_imagens', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
    raise exception 'Falha: authenticated recebeu permissão além de leitura';
  end if;
  begin
    delete from public.veiculos where codigo = 'TESTE-RLS-PUBLICADO';
    raise exception 'Falha: delete de authenticated foi aceito';
  exception when insufficient_privilege then null;
  end;
  raise notice 'OK: authenticated tem somente a leitura permitida.';
end;
$$;

reset role;
do $$
begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where (n.nspname, c.relname) in (('public', 'veiculos'), ('public', 'veiculo_imagens'), ('storage', 'objects'))
      and not c.relrowsecurity
  ) then raise exception 'Falha: RLS desabilitada'; end if;
  if not exists (
    select 1 from storage.buckets where id = 'veiculos' and public = true
      and file_size_limit = 5242880 and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  ) then raise exception 'Falha: configuração do bucket'; end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'showroom_bloquear_clientes' and permissive = 'RESTRICTIVE' and cmd = 'ALL'
      and roles @> array['anon', 'authenticated']::name[]
  ) then raise exception 'Falha: bloqueio restritivo do Storage ausente'; end if;
  raise notice 'OK: RLS e configuração do bucket conferidos.';
end;
$$;

rollback;
