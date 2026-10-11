-- Etapa 2: executar uma vez no SQL Editor do projeto CARROS, como postgres.
-- Não apaga nem substitui objetos existentes. Qualquer erro desfaz a transação.
begin;

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo = btrim(codigo) and codigo <> ''),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  marca text not null check (btrim(marca) <> ''),
  modelo text not null check (btrim(modelo) <> ''),
  versao text not null default '',
  ano_fabricacao smallint not null check (ano_fabricacao between 1900 and 2100),
  ano_modelo smallint not null check (ano_modelo between ano_fabricacao and 2100),
  preco numeric(12, 2) not null check (preco > 0 and preco <> 'NaN'::numeric),
  quilometragem integer not null check (quilometragem >= 0),
  cambio text not null check (cambio in ('manual', 'automatico', 'automatizado', 'cvt')),
  combustivel text not null check (combustivel in ('gasolina', 'etanol', 'flex', 'diesel', 'eletrico', 'hibrido')),
  categoria text not null check (categoria in ('hatch', 'sedan', 'suv', 'picape', 'coupe', 'conversivel', 'perua', 'minivan', 'van')),
  cor text not null check (btrim(cor) <> ''),
  motorizacao text,
  descricao text not null default '',
  opcionais text[] not null default '{}',
  destaques text[] not null default '{}',
  destaque boolean not null default false,
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido')),
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.veiculo_imagens (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  storage_path text not null check (
    btrim(storage_path) = storage_path and storage_path <> ''
    and storage_path !~ '(^/|/$|//|(^|/)\.{1,2}(/|$)|[[:cntrl:]])'
    and position(chr(92) in storage_path) = 0
    and position(':' in storage_path) = 0
    and position('?' in storage_path) = 0
    and position('#' in storage_path) = 0
  ),
  ordem integer not null default 0 check (ordem >= 0),
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (veiculo_id, ordem),
  unique (veiculo_id, storage_path)
);

-- Há no máximo uma capa. Sem capa explícita, a primeira por ordem será usada.
create unique index veiculo_imagens_uma_principal
  on public.veiculo_imagens (veiculo_id) where principal;
create index veiculo_imagens_capa
  on public.veiculo_imagens (veiculo_id, principal desc, ordem, id);
create index veiculos_recentes
  on public.veiculos (created_at desc, id) where publicado and status in ('disponivel', 'reservado');
create index veiculos_precos
  on public.veiculos (preco, id) where publicado and status in ('disponivel', 'reservado');
create index veiculos_categoria
  on public.veiculos (categoria, created_at desc, id) where publicado and status in ('disponivel', 'reservado');
create index veiculos_destaque
  on public.veiculos (created_at desc, id) where publicado and destaque and status in ('disponivel', 'reservado');
create index veiculos_ano on public.veiculos (ano_modelo) where publicado;
create index veiculos_quilometragem on public.veiculos (quilometragem) where publicado;

create function public.showroom_atualizar_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.showroom_atualizar_timestamp() from public, anon, authenticated;
create trigger veiculos_updated_at before update on public.veiculos
  for each row execute function public.showroom_atualizar_timestamp();

-- GRANT controla operações; RLS controla quais registros podem ser lidos.
alter table public.veiculos enable row level security;
alter table public.veiculo_imagens enable row level security;
revoke all on public.veiculos, public.veiculo_imagens from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.veiculos, public.veiculo_imagens to anon, authenticated;

create policy veiculos_leitura_publicada on public.veiculos
  for select to anon, authenticated using (publicado = true);
create policy imagens_leitura_publicada on public.veiculo_imagens
  for select to anon, authenticated using (
    exists (select 1 from public.veiculos v where v.id = veiculo_id and v.publicado = true)
  );

comment on column public.veiculos.codigo is 'Texto: preserva zeros iniciais. Não reutilizar códigos de anúncios.';
comment on column public.veiculos.slug is 'Link permanente. Não alterar depois de publicar.';
comment on column public.veiculo_imagens.storage_path is 'Caminho relativo no bucket veiculos; nunca uma URL completa.';

-- Bucket reservado para fotografias de divulgação; limite de 5 MiB por arquivo.
-- Se o nome já existir, o script falha para permitir revisão do bucket existente.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('veiculos', 'veiculos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Uma política RESTRICTIVE impede permissões amplas futuras neste bucket.
-- O download público continua disponível; uploads/alterações/listagem via
-- anon/authenticated ficam bloqueados. O Dashboard administra os arquivos.
-- Não modifica permissões ou políticas de outros buckets.
create policy showroom_bloquear_clientes on storage.objects
  as restrictive for all to anon, authenticated
  using (bucket_id <> 'veiculos')
  with check (bucket_id <> 'veiculos');

notify pgrst, 'reload schema';
commit;
