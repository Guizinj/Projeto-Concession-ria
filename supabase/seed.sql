-- Opcional: 16 anúncios FICTÍCIOS para testar paginação, filtros e RLS.
-- Apenas para desenvolvimento, antes de divulgar o site.
-- Reexecução preserva os registros já existentes (não altera preços/status).
begin;

insert into public.veiculos (
  codigo, slug, marca, modelo, versao, ano_fabricacao, ano_modelo, preco,
  quilometragem, cambio, combustivel, categoria, cor, motorizacao,
  status, publicado, destaque, created_at, descricao, opcionais, destaques
)
select
  codigo, slug, marca, modelo, versao, ano_fabricacao, ano_modelo, preco,
  quilometragem, cambio, combustivel, categoria, cor, motorizacao,
  status, publicado, destaque, now() - (numero * interval '1 day'),
  'DEMONSTRAÇÃO — anúncio fictício para desenvolvimento. Não representa um veículo disponível para venda.',
  array['Ar-condicionado', 'Direção assistida'],
  array['Dados de demonstração']
from (values
  (1, 'DEMO-001', 'demo-corolla-xei-2022-001', 'Toyota', 'Corolla', 'XEi', 2021, 2022, 129900.00, 38500, 'cvt', 'flex', 'sedan', 'Prata', '2.0', 'disponivel', true, true),
  (2, 'DEMO-002', 'demo-civic-touring-2021-002', 'Honda', 'Civic', 'Touring', 2020, 2021, 142900.00, 42000, 'cvt', 'gasolina', 'sedan', 'Preto', '1.5 Turbo', 'reservado', true, true),
  (3, 'DEMO-003', 'demo-tcross-highline-2023-003', 'Volkswagen', 'T-Cross', 'Highline', 2022, 2023, 134900.00, 27000, 'automatico', 'flex', 'suv', 'Branco', '1.4 TSI', 'disponivel', true, true),
  (4, 'DEMO-004', 'demo-compass-longitude-2022-004', 'Jeep', 'Compass', 'Longitude', 2021, 2022, 149900.00, 46000, 'automatico', 'flex', 'suv', 'Cinza', '1.3 Turbo', 'disponivel', true, true),
  (5, 'DEMO-005', 'demo-onix-ltz-2023-005', 'Chevrolet', 'Onix', 'LTZ', 2022, 2023, 79900.00, 24500, 'manual', 'flex', 'hatch', 'Azul', '1.0 Turbo', 'disponivel', true, true),
  (6, 'DEMO-006', 'demo-hb20-comfort-2022-006', 'Hyundai', 'HB20', 'Comfort', 2021, 2022, 69900.00, 35000, 'manual', 'flex', 'hatch', 'Branco', '1.0', 'disponivel', true, true),
  (7, 'DEMO-007', 'demo-hilux-srx-2021-007', 'Toyota', 'Hilux', 'SRX', 2020, 2021, 239900.00, 61000, 'automatico', 'diesel', 'picape', 'Prata', '2.8 Turbo', 'disponivel', true, false),
  (8, 'DEMO-008', 'demo-ranger-xlt-2020-008', 'Ford', 'Ranger', 'XLT', 2019, 2020, 169900.00, 78000, 'automatico', 'diesel', 'picape', 'Preto', '3.2 Turbo', 'disponivel', true, false),
  (9, 'DEMO-009', 'demo-polo-comfortline-2023-009', 'Volkswagen', 'Polo', 'Comfortline', 2022, 2023, 94900.00, 19000, 'automatico', 'flex', 'hatch', 'Cinza', '1.0 TSI', 'disponivel', true, false),
  (10, 'DEMO-010', 'demo-kicks-exclusive-2022-010', 'Nissan', 'Kicks', 'Exclusive', 2021, 2022, 109900.00, 32000, 'cvt', 'flex', 'suv', 'Vermelho', '1.6', 'disponivel', true, false),
  (11, 'DEMO-011', 'demo-320i-sport-2020-011', 'BMW', '320i', 'Sport', 2019, 2020, 199900.00, 51000, 'automatico', 'flex', 'sedan', 'Branco', '2.0 Turbo', 'disponivel', true, false),
  (12, 'DEMO-012', 'demo-cronos-drive-2022-012', 'Fiat', 'Cronos', 'Drive', 2021, 2022, 74900.00, 40000, 'manual', 'flex', 'sedan', 'Prata', '1.3', 'disponivel', true, false),
  (13, 'DEMO-013', 'demo-dolphin-2024-013', 'BYD', 'Dolphin', 'EV', 2023, 2024, 139900.00, 9000, 'automatico', 'eletrico', 'hatch', 'Cinza', 'Elétrico', 'disponivel', true, false),
  (14, 'DEMO-014', 'demo-corolla-altis-2023-014', 'Toyota', 'Corolla', 'Altis Hybrid', 2022, 2023, 159900.00, 22000, 'cvt', 'hibrido', 'sedan', 'Preto', '1.8 Hybrid', 'disponivel', true, false),
  (15, 'DEMO-015', 'demo-renegade-vendido-2021-015', 'Jeep', 'Renegade', 'Longitude', 2020, 2021, 99900.00, 48000, 'automatico', 'flex', 'suv', 'Branco', '1.8', 'vendido', true, false),
  (16, 'DEMO-016', 'demo-yaris-rascunho-2022-016', 'Toyota', 'Yaris', 'XL', 2021, 2022, 84900.00, 31000, 'cvt', 'flex', 'hatch', 'Prata', '1.5', 'disponivel', false, false)
) as dados(numero, codigo, slug, marca, modelo, versao, ano_fabricacao, ano_modelo,
  preco, quilometragem, cambio, combustivel, categoria, cor, motorizacao,
  status, publicado, destaque)
on conflict (codigo) do nothing;

-- Metadados apenas. Envie os PNGs locais ao Storage mantendo a pasta demo/.
-- Não insira registros diretamente em storage.objects: o upload é pelo Dashboard.
insert into public.veiculo_imagens (veiculo_id, storage_path, ordem, principal)
select id, case when codigo = 'DEMO-016' then 'demo/rascunho.png' else 'demo/capa.png' end, 1, true
from public.veiculos where codigo in (
  'DEMO-001', 'DEMO-002', 'DEMO-003', 'DEMO-004', 'DEMO-005', 'DEMO-006',
  'DEMO-007', 'DEMO-008', 'DEMO-009', 'DEMO-010', 'DEMO-011', 'DEMO-012',
  'DEMO-013', 'DEMO-014', 'DEMO-015', 'DEMO-016'
)
on conflict do nothing;

-- A capa tem ordem 1 de propósito: permite validar a prioridade de principal.
insert into public.veiculo_imagens (veiculo_id, storage_path, ordem, principal)
select id, 'demo/galeria.png', 0, false from public.veiculos where codigo = 'DEMO-001'
on conflict do nothing;

commit;
