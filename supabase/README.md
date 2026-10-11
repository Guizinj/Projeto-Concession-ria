# Banco e fotografias — instalação e cadastro

Atualizado em 11/10/2026. **CARROS é o projeto demonstrativo já instalado**:
não repetir `schema.sql` nele. Para outra loja, use um projeto Supabase separado,
troque a conexão em `js/config.js` e siga [PERSONALIZACAO.md](../PERSONALIZACAO.md).
O schema atual atende uma loja por instalação, sem isolamento de várias lojas
no mesmo banco. Nome da marca não filtra os anúncios.

Os scripts foram preparados para um projeto novo,
com Data API habilitada, esquema `public` exposto, exposição automática de
novas tabelas desligada e RLS automático habilitado. RLS também é ativada
explicitamente em cada tabela do showroom.

**Progresso atual: Etapa 2 concluída.** O responsável executou os três scripts
e enviou as imagens para `veiculos/demo/`. Foram verificados 14 itens nas
listas, paginação de 12 + 2, rascunho oculto por RLS, download das três imagens,
bloqueio de escrita pública nas tabelas/upload no Storage e consultas no
navegador sem erros de CORS. Os resultados estão em [VALIDACAO.md](../VALIDACAO.md).
Essas quantidades registram a validação do seed na época, não o inventário atual.
O roteiro abaixo serve para instalação em banco novo e cadastro. Não houve nova
execução de SQL, escrita remota ou upload nesta revisão documental.

O site não usa Supabase Auth. Cadastros, login anônimo e vinculação manual
podem continuar desativados. A administração fica no Dashboard com sua conta.
A MFA dessa conta protege o acesso administrativo; RLS protege os dados da API.

## Ordem de execução no Dashboard

1. Entre no **projeto novo da loja → SQL Editor → New query**. Confira o projeto
   selecionado; não executar a primeira instalação no demonstrativo existente.
2. Copie todo o conteúdo de [schema.sql](schema.sql), confira o projeto e
   execute como `postgres`. A transação cria as duas tabelas, índices,
   permissões de leitura, RLS, trigger de data e bucket `veiculos`.
3. Execute [validar.sql](validar.sql) em outra consulta, como `postgres`.
   Ele cria fixtures, troca temporariamente para `anon` e `authenticated`,
   verifica visibilidade e bloqueio de escrita e termina em `ROLLBACK`.
   O resultado esperado é execução sem erro. Se falhar, execute `ROLLBACK;`
   e envie o erro para revisão antes de continuar.
4. Para testar com catálogo fictício, execute [seed.sql](seed.sql). É opcional;
   não use esses anúncios como estoque real. O seed pode ser repetido sem
   sobrescrever registros que já tenham o mesmo código.
5. Em **Storage → veiculos**, crie a pasta `demo`. Dentro dela, faça upload de
   `assets/images/demo/capa.png`, `galeria.png` e `rascunho.png`. Preserve os
   nomes. As imagens são cartões de teste, identificados como demonstração.
6. Confirme a configuração pública em `js/config.js` e valide a API pela prévia
   HTTP. Se a API ainda não localizar as tabelas, aguarde alguns segundos pela
   atualização do cache e confira se `public` continua exposto.

`schema.sql` é para a primeira instalação: não contém `DROP`, não reaproveita
tabelas ou bucket existentes e desfaz a transação se houver conflito.
Se você já executou o script com sucesso, não execute de novo. Alterações
posteriores precisarão de um script próprio de migração.

Os arquivos PNG são locais, mas o seed grava apenas **metadados** das imagens.
Sem o upload, as URLs do Storage ainda não terão arquivos para servir.
Uploads são pelo Dashboard; nunca insira metadados diretamente em
`storage.objects`, pois isso não cria o arquivo real.

## Verificar a leitura pela prévia

Com o Live Server aberto, use **F12 → Console** em uma das cinco páginas:

```js
const dados = await import("./js/veiculos.js");
const primeira = await dados.listarVeiculos();
console.log(primeira);
```

Em um banco recém-instalado com o seed, os resultados esperados são:

| Consulta | Resultado |
| --- | --- |
| `dados.listarVeiculos()` | 12 anúncios, `temMais: true`, `proximoOffset: 12`. |
| `dados.listarVeiculos({ offset: 12 })` | Dois anúncios, `temMais: false`. |
| `dados.listarDestaques()` | Seis destaques. |
| `dados.buscarVeiculoPorSlug('demo-civic-touring-2021-002')` | Reservado, acessível. |
| `dados.buscarVeiculoPorSlug('demo-renegade-vendido-2021-015')` | Vendido, acessível; ausente das listas. |
| `dados.buscarVeiculoPorSlug('demo-yaris-rascunho-2022-016')` | `null`; rascunho oculto pela RLS. |
| `dados.buscarVeiculoPorSlug('demo-corolla-xei-2022-001')` | Galeria com dois metadados, ordem 0 e 1. |

Para ver a capa, abra a URL de `primeira.veiculos[0].imagem_capa.url` após o
upload. Para validar o bloqueio no banco, use `validar.sql`; ocultar dados na
interface não é uma verificação de segurança.

O seed tem **16 veículos**: 13 disponíveis publicados, um reservado publicado,
um vendido publicado e um rascunho. São **17 metadados de imagens**, dos quais
16 ficam visíveis à leitura pública. O primeiro veículo tem a capa em ordem 1
para testar a prioridade de `principal` sobre a ordem da galeria.

Sem seed, uma tabela vazia retorna uma lista vazia normalmente. Erros de
permissão ou conexão devem gerar exceção, nunca um falso estoque vazio.

## Cadastro manual de anúncios reais

No Table Editor, crie um registro em `veiculos`. O UUID e as datas são gerados
automaticamente; `publicado` começa em `false`.

| Campos | Regra |
| --- | --- |
| `codigo` | Texto único, sem espaços nas extremidades. `001` conserva os zeros. |
| `slug` | Único, minúsculas ASCII, números e hífens: `corolla-xei-2022-001`. |
| `marca`, `modelo`, `cor` | Texto obrigatório. |
| `versao`, `descricao` | Texto livre; podem ficar vazios. Descrição não deve conter marcação HTML. |
| `ano_fabricacao`, `ano_modelo` | Inteiros de 1900 a 2100; modelo não anterior à fabricação. |
| `preco` | Decimal positivo, em reais. No banco use `129900.00`, sem `R$`. |
| `quilometragem` | Inteiro maior ou igual a zero. |
| `cambio` | `manual`, `automatico`, `automatizado`, `cvt`. |
| `combustivel` | `gasolina`, `etanol`, `flex`, `diesel`, `eletrico`, `hibrido`. |
| `categoria` | `hatch`, `sedan`, `suv`, `picape`, `coupe`, `conversivel`, `perua`, `minivan`, `van`. |
| `motorizacao` | Texto opcional, por exemplo `2.0` ou `1.0 Turbo`. |
| `opcionais`, `destaques` | Arrays de texto; não são listas separadas por vírgula em uma string. |
| `destaque` | Booleano para a seção de destaques da Home. |
| `status` | `disponivel`, `reservado`, `vendido`. |
| `publicado` | Somente `true` torna o anúncio legível pelo visitante. |

Depois, otimize e envie as fotos pelo Dashboard para uma pasta do veículo,
por exemplo `corolla-xei-2022-001/01.webp`. O bucket aceita JPEG, PNG e WebP,
até 5 MiB por arquivo; prefira fotografias otimizadas em vez desse limite máximo.

Em `veiculo_imagens`, preencha:

- `veiculo_id`: UUID do anúncio.
- `storage_path`: `corolla-xei-2022-001/01.webp`, sem URL completa e sem `/` inicial.
- `ordem`: inteiro a partir de zero, único dentro do veículo.
- `principal`: `true` para a capa; no máximo uma por veículo.

Sem uma imagem principal, as listas usarão a primeira por ordem. Sem metadados,
o cliente retorna `imagem_capa: null`; o componente existente mostra “Foto em breve”.
Falhas de download têm fallback próprio. As imagens públicas não precisam de chave na URL.

Revise ficha, imagens e preço antes de publicar. Preserve o slug depois da
publicação, inclusive quando alterar preço ou descrição, para manter links.
Reservados continuam nas listas; vendidos são removidos das listas, mas seu
link continua acessível enquanto `publicado = true`.

Excluir um veículo exclui seus metadados de imagens por relacionamento; os
arquivos no Storage precisam ser administrados separadamente pelo Dashboard.

## O que protege os dados

As duas tabelas têm somente `SELECT` para `anon` e `authenticated`.
Não há permissões de inserção, edição, exclusão ou policies de escrita.
As policies de leitura mostram apenas veículos publicados e imagens desses
veículos. A função do trigger não tem permissão pública de execução via API.

O bucket `veiculos` é público para servir fotos de divulgação. A policy
restritiva em `storage.objects` bloqueia operações por `anon` e
`authenticated` nesse bucket, inclusive quando houver outra policy permissiva
ampla. Ela não altera o acesso a outros buckets. A administração privilegiada
do Dashboard continua funcionando.

**Despublicar um anúncio não torna suas fotos privadas.** Quem tiver a URL de
um arquivo desse bucket ainda pode acessá-lo. Use o bucket apenas para imagens
destinadas à divulgação, incluindo o PNG fictício de rascunho do teste.

Esse SQL protege os objetos do showroom. Para outros projetos ou tabelas,
revise separadamente permissões, RLS e políticas de Storage; não copie uma
permissão de escrita pública para facilitar o cadastro.

## Referências oficiais

Links de referência da implementação original; esta revisão atualiza a orientação
de uso do repositório, sem nova verificação de documentação externa.

- [Chaves públicas e cabeçalho apikey](https://supabase.com/docs/guides/getting-started/api-keys).
- [Permissões e RLS na Data API](https://supabase.com/docs/guides/api/securing-your-api).
- [Relacionamentos, limites e ordem por imagem](https://docs.postgrest.org/en/v13/references/api/resource_embedding.html).
- [Acesso público aos arquivos dos buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).
- [Controle de operações no Storage](https://supabase.com/docs/guides/storage/security/access-control).
