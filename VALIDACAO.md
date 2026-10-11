# Validação — estado atual e histórico

Atualizado em **11/10/2026**, na organização da documentação para personalizar e
entregar o showroom. Os registros abaixo são evidências da versão/data de cada
etapa: não devem ser lidos como inventário permanente ou validação automática
de outra loja. O estado de retomada está em [CONTINUIDADE.md](CONTINUIDADE.md).

## Revisão documental e personalização — 11/10/2026

- Criados [AGENTS.md](AGENTS.md) e [PERSONALIZACAO.md](PERSONALIZACAO.md).
  Todos os nove Markdown preexistentes foram revisados. README e continuidade
  consolidados; design, banco, apresentação e backup alinhados ao estado atual.
- Guia de edição identifica `js/config.js`, hero/foto, cores, favicon,
  metadados/fallbacks HTML e WhatsApp sem JavaScript. Uma instalação por loja:
  cópia do site + projeto Supabase separado, sem mudança da arquitetura.
- **31 testes locais passaram** nesta revisão, sem chamadas ao Supabase real.
  Aplicação, SQL, configuração, imagens, backup e PDFs foram preservados;
  nenhum deploy, alteração remota ou envio a terceiros.
- Comparação SHA-256 confirmou **66 arquivos de aplicação/banco/apresentação
  inalterados**. Os **11 documentos Markdown** foram conferidos em UTF-8 e
  seus **50 links locais** apontam para arquivos/pastas existentes.
  `git diff --check` passou; Git apenas informou conversão futura de LF para CRLF.
- PDFs/capturas da apresentação não foram regenerados; podem mostrar o hero
  anterior. Revisão de Markdown não altera esses artefatos.

Comando executado com Node 24:

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs tests/vehicle-links.test.mjs tests/store-map.test.mjs tests/contact-message.test.mjs tests/contact-context.test.mjs
```

## Ajustes anteriores desta sessão, agora documentados

Hero: texto sobre a foto local do Civic e altura compacta conferidos no Chrome
em 320/360/390/768/1024/1440 px, sem overflow, foto carregada, busca abaixo,
links e validação de busca. O ajuste posterior do botão Explorar para padding
equivalente, fundo suave e seta diagonal do estoque teve conferência estática;
não foi executada nova regressão completa de navegador para esse ajuste.

Limpar filtros: QA específico anterior em 390/1440 px com cliques reais e
respostas simuladas do catálogo. Reset limpou campos/URL, manteve foco na busca
e preservou scroll (tolerância de 1 px); Aplicar filtros continuou revelando
resultados e focando seu título. `node --check js/pages/estoque.js`, três testes
de catálogo e `git diff --check` passaram na entrega dessa correção.
Scripts/capturas dessa QA ficaram no diretório temporário e não são dependências
do site ou artefatos de publicação.

## Como validar cada loja antes da entrega

Siga a [checklist de personalização](PERSONALIZACAO.md). Confira identidade,
conexão com banco do cliente, estoque/fotos, WhatsApp, mapa e HTML sem JS.
Teste as cinco páginas, buscas/filtros/URL/paginação, gestos/galeria, estados,
foco/teclado e movimento reduzido em 360/390/768/1440 px; hero também em 320 px.
Inspecione mensagens/destinos de contato sem enviar testes a terceiros.

QA de navegador existente: `tests/galeria-browser.mjs`, `tests/etapa6-browser.mjs`,
`tests/etapa7-browser.mjs` e `tests/localizacao-browser.mjs`. Precisam de servidor
HTTP e Chrome isolado com depuração local; leia os cabeçalhos para a porta e
`QA_PORT` onde suportado. `QA_REAL=1` inclui leituras reais quando previsto e
depende do banco/fixtures; scripts antigos podem pressupor layouts anteriores.

Etapa 7 segue em revisão; sem publicação. Aparelhos físicos, Safari, leitor de
tela e domínio final não foram validados nesta revisão. Testes históricos de
Chrome emulado não substituem a conferência da instalação de cada cliente.

---

# Histórico — Validação da Etapa 1

Verificação realizada em **09/10/2026**, usando o Live Server instalado no VS Code
e **Chrome 154.0.8037.98** em modo headless, com perfil temporário isolado.
As verificações no navegador foram executadas por automação via Chrome DevTools.
Nenhuma dependência de teste foi adicionada à aplicação.

## Resultados

| Página | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Home | Passou | Passou | Passou | Passou |
| Estoque | Passou | Passou | Passou | Passou |
| Explorar | Passou | Passou | Passou | Passou |
| Detalhes | Passou | Passou | Passou | Passou |

Em cada uma das 16 combinações, foram verificados:

- Abertura por HTTP, imports dos módulos, CSS e imagens da marca locais.
- Ausência de exceções JavaScript, mensagens de erro no console e respostas HTTP de erro.
- Ausência de requisições a serviços externos na configuração inicial.
- Largura efetiva da página sem ultrapassar a largura da janela.
- Um `h1`, hierarquia de títulos sem saltos, `main`, header e footer.
- Idioma `pt-BR`, viewport, título próprio e indicação da página atual.
- Quatro links de navegação visíveis, com altura mínima de 44 px e destinos HTTP 200.
- Link inicial para pular ao conteúdo, visível ao receber foco por Tab.
- Links visíveis capazes de receber foco, com contorno de 3 px.
- Imagens carregadas com atributo `alt`; imagens decorativas têm texto alternativo vazio.
- Base clara nas páginas correspondentes e base escura no modo Explorar.
- Contato desativado e links de redes sociais e localização ocultos enquanto pendentes.

Também passaram:

- Verificação de sintaxe dos seis arquivos JavaScript com `node --check`.
- Leitura do JSON de configuração do Live Server.
- Abertura de `veiculo.html?carro=corolla-xei-2022-001`, preservando o parâmetro.
  O teste verifica a abertura da base, não a consulta do veículo.
- Configuração ausente ou inválida mantém as ações de contato inativas.
- Alteração temporária da configuração no navegador atualiza nome, título,
  endereço e links válidos. Nenhuma mensagem foi enviada ou link externo aberto.
- Navegação, conteúdo e imagens permanecem disponíveis nas quatro páginas com
  a execução de JavaScript desativada; o aviso `noscript` é exibido.

Capturas revisadas visualmente: Home a 360 px, estoque a 1440 px, Explorar a 390 px
e detalhes a 768 px.

## Limites desta validação

As larguras mobile foram emuladas no Chrome; não houve teste em aparelhos físicos,
Safari ou leitores de tela. Esta etapa entrega a fundação, com estados provisórios.
Supabase, dados de veículos, RLS, busca, galeria, gestos e mensagens por veículo
serão implementados e validados nas próximas etapas. Nenhum deploy foi realizado.

---

# Validação — Etapa 2

Verificação realizada em **09/10/2026**. Foram usados Node.js **24.11.1**,
PostgreSQL **18.4** instalado no ambiente e Chrome **154.0.8037.98**, além do
Live Server existente. A aplicação permanece sem dependências ou build.

## Configuração e conexão real

- A URL base HTTPS e a chave `sb_publishable_…` preenchidas pelo responsável
  foram encontradas em `js/config.js` e preservadas. Valores não foram exibidos.
- Uma consulta HTTPS **GET** à API do projeto CARROS, com `select=id&limit=1`,
  retornou **HTTP 404, código `PGRST205`**. A API foi alcançada; a tabela
  `veiculos` ainda não estava disponível no cache de esquema.
- A consulta `listarVeiculos()` também foi feita pelo módulo novo contra a API
  real: o mesmo retorno foi tratado como `SupabaseError`, sem virar lista vazia.
- Não houve execução remota dos scripts, inclusão de dados, upload ou deploy.

## Testes da camada de dados

**Nove testes passaram**, executados com:

```text
node --test tests/dados.test.mjs
```

Eles usam respostas controladas de `fetch`, sem chamadas ao projeto real, e
verificam:

- Rejeição de URL inválida/chave secreta antes de qualquer requisição.
- GET com `apikey`, sem Bearer, cookies ou operações de escrita.
- Distinção entre lista vazia, falha HTTP, resposta inválida e falha de rede.
- Timeout e cancelamento de consulta com `AbortSignal`.
- Lote de 12 com consulta de 13, próxima página e capa limitada a uma imagem.
- Filtros enviados ao servidor, busca por palavras e ordenações com desempate.
- Rejeição de filtros/identificadores inválidos e isolamento da gramática de busca.
- Limites da Home, Explorar e semelhantes; detalhe por slug e galeria ordenada.
- Veículos vendidos acessíveis na consulta individual e URL segura das imagens.

## Scripts e regras de banco

Executados em uma instância **temporária**, limitada a `127.0.0.1:55432`,
sem ligação ao banco CARROS. Os papéis `anon`/`authenticated`, as tabelas mínimas
de metadados do Storage e um event trigger de RLS foram reproduzidos para
testar o SQL. Essa reprodução não contém os serviços HTTP do Supabase.

Passaram:

- `schema.sql` completo, com o event trigger de RLS já ativo e permissões
  padrão amplas simuladas. As tabelas terminaram com leitura pública controlada.
- `seed.sql` executado duas vezes: 16 veículos e 17 metadados, sem duplicação.
- `validar.sql`: publicados e vendido acessíveis; rascunho e sua imagem ocultos;
  ausência de permissões de escrita para `anon` e `authenticated` e rejeição
  efetiva de INSERT/UPDATE/DELETE testados; fixtures removidas por rollback.
- Validações de preço negativo/NaN, km negativo, ano inconsistente, status,
  slug inválido/duplicado, duas capas, caminho inválido e imagem sem veículo.
- Código textual `001`, publicação inicial desativada, trigger de `updated_at`
  e exclusão em cascata dos metadados.
- Com o seed, `anon` viu 15 publicados, 14 disponíveis/reservados, seis
  destaques e 16 metadados de imagens; o rascunho permaneceu oculto.
- Na reprodução de Storage, uma policy permissiva ampla foi adicionada
  temporariamente: a policy restritiva continuou bloqueando leitura dos
  metadados e INSERT/UPDATE/DELETE no bucket `veiculos`, sem afetar outro bucket.

## Navegador

As quatro páginas foram abertas via HTTP em um perfil temporário de Chrome:

- Imports explícitos de `js/supabase.js` e `js/veiculos.js` funcionaram em todas.
- Configuração pública válida e marca carregada, sem exceções JavaScript,
  erros no console ou respostas HTTP de erro.
- O simples carregamento/import dos módulos não consultou o Supabase.
- Os três PNGs locais de demonstração carregaram a 1200 × 800 pixels.

O HTML e o CSS da fundação não foram alterados nesta etapa. A tabela das 16
combinações de largura acima continua sendo o resultado da Etapa 1; não houve
uma nova bateria de responsividade para a Etapa 2.

## Aplicação do schema no projeto CARROS

Em **09/10/2026**, o responsável informou que executou `schema.sql` no SQL
Editor e recebeu “Success”. Depois disso, foram feitas **11 consultas GET**
com a chave pública, todas com **HTTP 200**:

- Leitura direta de `veiculos` e `veiculo_imagens`, limitada a um registro.
- Estoque com relacionamento de capa limitado a uma imagem.
- Busca de três palavras com filtros de preço, ano, km, câmbio e categoria.
- Ordenações por menor e maior preço.
- Destaques, recentes, Explorar, detalhe por slug e semelhantes.

As respostas não trouxeram registros visíveis, esperado antes dos dados de
teste. A sintaxe das consultas foi aceita pelo PostgREST. Sem anúncios e
imagens de teste, isso ainda não comprova a ocultação de rascunhos, a seleção
da capa ou a paginação com resultados. Naquele momento, a validação SQL
e a validação do Storage real ainda estavam pendentes.

## Validação SQL no projeto CARROS

Em **09/10/2026**, o responsável informou que executou `validar.sql` no SQL
Editor e também recebeu “Success”. O resultado foi informado pelo usuário;
o assistente não executou a consulta administrativa nem recebeu seus logs.

Uma execução completa sem erro passa pelas asserções de leitura de publicados,
ocultação de rascunhos e suas imagens, ausência de permissões de escrita para
`anon` e `authenticated`, rejeição das operações de escrita testadas e
conferência de RLS/configuração do bucket/policy restritiva. A transação termina
com rollback dos dados temporários. O teste não faz upload nem download real.

## Consultas reais com os anúncios de demonstração

Em **09/10/2026**, após o responsável informar a execução de `seed.sql`,
foram realizadas **19 consultas de leitura** pelo módulo do projeto e pela
API REST, com a chave pública. **Nove grupos de asserções passaram:**

- Paginação de 12 + 2, sem repetição de UUIDs entre os lotes. Os 14 anúncios
  das listas são disponíveis/reservados; vendido e rascunho ficaram fora.
- Home: seis destaques e seis recentes; Explorar: quatro itens no primeiro lote.
- Capa do primeiro anúncio com `principal = true`, mesmo tendo ordem 1;
  a galeria de detalhes veio com dois metadados, em ordem 0 e 1.
- Reservado e vendido encontrados por seus slugs individuais publicados.
- Rascunho e seus metadados de imagem ocultos em consultas diretas **sem**
  filtro de publicação, verificando a RLS pela API; detalhe retornou `null`.
- 15 anúncios fictícios publicados e 16 metadados de imagens visíveis.
- Busca combinada por marca/modelo/versão e filtros retornou somente o
  Corolla XEi esperado; filtro de ano retornou cinco e de km retornou dois.
- Ordenações por preço verificadas com resultados reais: menor preço iniciou
  pelo HB20 e maior pelo Hilux, com valores em ordem correta nos lotes.
- Semelhantes: quatro sedans, excluindo o veículo atual e vendidos.

Antes do upload, os metadados das fotos estavam cadastrados, mas os arquivos
ainda não estavam no Storage. Consultas públicas a `demo/capa.png`, `demo/galeria.png` e
`demo/rascunho.png` retornaram HTTP 400 com código de Storage `404`,
`not_found` e mensagem `Object not found`, confirmando a ausência dos arquivos.

## Imagens e bloqueio de escrita no Supabase real

Em **09/10/2026**, após o responsável informar o upload pelo Dashboard, os
três arquivos `veiculos/demo/capa.png`, `galeria.png` e `rascunho.png` foram
baixados sem credenciais: **HTTP 200**, `image/png`, 1200 × 800 pixels.
Os hashes SHA-256 confirmaram igualdade com os arquivos locais. Tamanhos:
16.832, 17.036 e 18.074 bytes, respectivamente.

Usando exclusivamente a chave pública e sem sessão de usuário:

- As duas tabelas recusaram POST, PATCH e DELETE: **seis respostas HTTP 401,
  código PostgreSQL `42501`**. A leitura com essa mesma chave foi confirmada
  antes dos testes, distinguindo falta de permissão de uma chave inválida.
- Os POSTs tinham payload vazio, inválido pelas constraints. PATCH/DELETE
  tinham filtros contraditórios (`id = UUID` e `id <> UUID`), que não podem
  alcançar registros. Esses testes verificam rejeição da operação pela API
  sem expor anúncios a alterações caso uma permissão esteja incorreta.
- A listagem de `demo/` pela API de Storage retornou HTTP 200 e array vazio;
  a leitura das URLs públicas dos arquivos continuou funcionando.
- Um upload válido de PNG, com nome aleatório em `_validacao/` e sem upsert,
  foi recusado: **HTTP 400**, código de Storage **403**, erro `Unauthorized`.
  A ausência do arquivo de teste foi confirmada por leitura posterior (404
  no código de Storage). Nenhum arquivo ou anúncio foi alterado pelo assistente.

## Conexão real pelo navegador

No Chrome **154.0.8037.98**, com perfil temporário isolado e a prévia do Live
Server em `http://127.0.0.1:5500/estoque.html`:

- `listarVeiculos()` retornou 12 itens e `temMais: true`.
- O detalhe do Corolla retornou dois metadados de galeria; o rascunho retornou
  `null`. As consultas cruzaram a origem local e a origem HTTPS do Supabase.
- Os três PNGs foram decodificados pelo navegador a 1200 × 800 pixels.
- As requisições remotas observadas retornaram HTTP 200; não houve erro de
  console, exceção JavaScript ou falha de CORS. A segurança de origem do
  navegador permaneceu habilitada.
- O navegador temporário foi encerrado após os testes.

## Resultado da Etapa 2

**Concluída**, com banco, seed, imagens, consultas, leitura pública controlada
e bloqueio de escrita do visitante verificados. Os testes HTTP foram feitos
como visitante (`anon`). O papel `authenticated` foi verificado no SQL de
validação executado pelo responsável, conforme seu retorno de sucesso.
Não houve criação de usuário ou sessão autenticada para testes HTTP.

No Storage real, foi testada a rejeição de upload; alteração/exclusão de
arquivos existentes não foram tentadas. Essas operações são abrangidas pela
policy restritiva `FOR ALL`, conferida no SQL e exercitada no PostgreSQL local.
Fotos do bucket público continuam acessíveis por URL mesmo que o veículo
esteja despublicado; o PNG fictício de rascunho também é público.

A interface segue com os estados provisórios da Etapa 1. A camada de dados
será conectada à interface nas próximas etapas aprovadas. Nenhum deploy foi feito.

---

# Validação — Etapa 3

Verificação realizada em **09/10/2026**, com Live Server existente, Node.js
**24.11.1** e Chrome **154.0.8037.98** em perfil temporário isolado. Foram
usadas as orientações de design e prévia local da skill Sites, preservando
HTML/CSS/JavaScript Vanilla, Supabase e a execução sem build.

## Responsividade e componentes

**24 combinações passaram**, sem rolagem horizontal:

| Página/aparência | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Home | Passou | Passou | Passou | Passou |
| Estoque | Passou | Passou | Passou | Passou |
| Explorar | Passou | Passou | Passou | Passou |
| Detalhes | Passou | Passou | Passou | Passou |
| Prévia de componentes — claro | Passou | Passou | Passou | Passou |
| Prévia de componentes — escuro | Passou | Passou | Passou | Passou |

Foram verificados:

- Páginas, estilos, módulos, marca, sprite SVG e imagens locais via HTTP.
- Navegação inferior abaixo de 768 px e navegação horizontal no desktop;
  três destinos, visíveis, com pelo menos 44 px de altura.
- Um `h1`, idioma `pt-BR` e hierarquia de títulos sem saltos nas páginas principais.
- Contato pendente desativado e ausência de requisições a serviços externos.
- Cards com links individuais corretos, três status explícitos, preços em BRL,
  imagens de demonstração decodificadas e fallback para card sem fotografia.
- Contraste calculado em amostras de navegação, texto de apoio, botão primário,
  títulos/versões/preços dos cards, badges e mensagens de estado nos dois temas.
  A menor relação medida foi **4,80:1**, acima de 4,5:1. As medições da troca
  de tema foram realizadas após o término das transições.
- Três esqueletos de carregamento e estados distintos de vazio e erro;
  botão de nova tentativa executou o callback da prévia.

## Interação e segurança de renderização

Também passaram:

- Tab alcança o link inicial de pular conteúdo; Enter move o foco para `main`.
  Links da navegação recebem foco visível com contorno de 3 px.
- Toque emulado na navegação inferior abre o estoque.
- `prefers-reduced-motion: reduce` desativa animações dos esqueletos e
  transições dos cards.
- Texto de veículo contendo marcação HTML/script permaneceu texto, sem
  criar elementos executáveis. Slug e endereço `javascript:` inválidos não
  criaram link ou imagem; texto longo não causou rolagem horizontal.
- Uma resposta de imagem inválida foi simulada por interceptação de rede:
  o card exibiu “Foto indisponível”, sem quebrar sua estrutura.
- Configuração temporária de WhatsApp no navegador ativou o link genérico;
  ao voltar para configuração ausente, o link foi ocultado e seu `href`
  removido. Nenhuma mensagem foi enviada, e o arquivo de configuração não mudou.
- As quatro páginas permaneceram navegáveis com JavaScript desativado,
  exibindo seus avisos `noscript`.
- Sintaxe dos **13 arquivos JavaScript** verificada; os **nove testes da
  camada de dados** continuaram passando.

Capturas revisadas visualmente: Home em 1440 px, Explorar em 390 px, prévia
clara e escura em 1440 px e cards em 390 px.

## Entrega e limites

**Etapa 3 concluída.** Os componentes de apresentação estão disponíveis em
`js/components/`, com documentação em `DESIGN.md` e uma prévia separada em
`tests/componentes.html`. As quatro páginas receberam a navegação e os estilos
refinados. As credenciais e os objetos do Supabase foram preservados.

Nesta etapa, a prévia usa fixtures locais; Home/estoque ainda não renderizam
consultas automaticamente. A integração da interface é a Etapa 4. Os testes
mobile foram emulados no Chrome; não houve teste em aparelhos físicos, Safari
ou leitor de tela. Nenhum deploy foi realizado.

---

# Validação — Etapa 4

Verificação em **09/10/2026**, com Node.js **24.11.1**, Chrome em perfil
temporário isolado e Live Server em `http://127.0.0.1:5500`. Foram implementadas
somente Home e catálogo. Configuração pública do Supabase preservada; seu hash
SHA-256 permaneceu igual durante a implementação. Nenhuma alteração no banco,
Storage, contatos, Explorar ou detalhes. Nenhum deploy.

## Resultados reais

- **11 testes locais passaram**: os nove testes de dados existentes e dois
  testes de validação/persistência dos filtros na URL.
- Sintaxe dos **13 arquivos JavaScript da aplicação** verificada com `node --check`.
- O script `tests/etapa4-real.mjs` passou contra o projeto configurado, usando
  somente GET: Home com seis destaques e seis recentes; estoque com **12 + 2**,
  14 UUIDs únicos, 13 disponíveis e um reservado. Vendido e rascunho ausentes.
- Busca “Toyota Corolla XEi” combinada com preço, ano-modelo, quilometragem,
  câmbio CVT e categoria sedan retornou apenas o Corolla esperado.
- Menor/maior preço verificados nos dois lotes; busca inexistente retornou vazio.
  Vendido permaneceu acessível pelo slug e rascunho retornou `null`.
- Leituras diretas de rascunho e seus metadados de imagem retornaram vazio,
  confirmando a RLS. Capa pública retornou HTTP 200 e `image/png`.

## Interface no navegador

O script `tests/etapa4-browser.mjs` passou na versão final:

| Página | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Home | Passou | Passou | Passou | Passou |
| Estoque, filtros abertos | Passou | Passou | Passou | Passou |

- Oito combinações sem rolagem horizontal, com um `h1`, navegação inferior
  no mobile, navegação no header no desktop e contato pendente desativado.
- Home renderizou seis cards em cada seção, com fotos do Storage decodificadas.
  Os PNGs continuam sendo cartões de demonstração, sem fotografias reais.
- Paginação 12 + 2, sem repetição de links; clique duplicado bloqueado e botão
  removido ao esgotar o estoque. Foco segue para o primeiro card do novo lote.
- Filtros combinados consultados no banco; endereço compartilhado restaurou
  formulário e resultados. Voltar/avançar e retorno do detalhe ao estoque
  preservaram os filtros. Mudanças reiniciaram a paginação.
- Busca rápida, atraso de 300 ms e cancelamento passaram. Uma resposta antiga
  foi atrasada artificialmente, ignorando o AbortSignal: ela não substituiu
  os resultados da busca atual. Cancelamentos não exibiram erro.
- Valores numéricos em notação exponencial foram normalizados na URL.
  Busca somente com pontuação e intervalos invertidos exibiram orientação.
  Parâmetros inválidos vindos de links foram descartados com aviso.
- Vazio no estoque real e vazio nas duas seções da Home simulados separadamente
  de falhas. Erro inicial e erro de lote adicional permitiram nova tentativa;
  falha de paginação preservou os cards e repetiu o mesmo lote sem duplicações.
- Uma falha simulada nos destaques não bloqueou os recentes; nova tentativa
  recuperou a seção. Falhas foram simuladas somente na memória do navegador.
- Fallback de imagem exibiu “Foto indisponível”; Tab alcançou o link de pular
  conteúdo. Home e estoque mantiveram navegação e aviso `noscript` sem JavaScript.
- Nenhuma exceção JavaScript, mensagem de erro de console ou resposta HTTP de
  erro dos arquivos locais foi observada na execução final.

Capturas revisadas visualmente: Home e estoque em 390 e 1440 px. As capturas
ficam no diretório temporário `vertice-captures-etapa4`, fora dos arquivos do site.
A primeira execução salvava capturas no projeto, provocando recarga do Live
Server; o teste foi corrigido para usar o diretório temporário.

## Repetir e revisar

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs
node tests/etapa4-real.mjs
```

O segundo comando depende de rede e do seed existente. A automação opcional
`node tests/etapa4-browser.mjs` requer o Live Server em 5500 e Chrome isolado
com depuração local em 9334; não é dependência do site. Neste ambiente, rede e
Chrome precisaram executar fora do sandbox restrito. O navegador temporário foi
encerrado; o Live Server existente foi mantido para a revisão.

**Etapa 4 entregue para revisão.** Etapa 5 não iniciada. Mobile foi emulado,
sem verificação em aparelhos físicos, Safari ou leitor de tela. Os cards abrem
a base de detalhes, cuja ficha e galeria continuam previstas para a Etapa 6.

---

# Validação — Etapa 5

Verificação em **09/10/2026**, após aprovação explícita da Etapa 4.
Live Server existente em `http://127.0.0.1:5500`, Node.js **24.11.1** e Chrome
em perfil temporário isolado. Implementação limitada ao modo Explorar, com
JavaScript Vanilla, componentes existentes e consultas nativas de leitura.

## Resultados

- **16 testes locais passaram**: nove de dados, dois de URL e cinco novos
  de fila/gestos. Os novos testes cobrem lotes, voltar/reiniciar/fim, cliques
  concorrentes, repetição do mesmo offset após falha, cancelamento, resposta
  tardia que ignora AbortSignal e limites de distância/direção/duração do gesto.
- Sintaxe dos **15 arquivos JavaScript da aplicação** verificada.
- Consulta real do Explorar: **14 veículos**, em lotes **4/4/4/2**, offsets
  **0/4/8/12**, sem repetição de UUID. Reservado exibido com status textual;
  vendido e rascunho ausentes. Cada consulta GET pediu cinco registros para
  detectar o próximo lote e somente um metadado de capa por veículo.
- Avançar entre os quatro registros recebidos e voltar não gerou consultas
  adicionais. Renderização limitada a **um card**; sem galeria ou cards ocultos.
- Fim da seleção, retorno ao último veículo e “Explorar novamente” passaram.
- O script de leitura real da Etapa 4 foi repetido e passou: Home 6 + 6,
  estoque 12 + 2, filtros, preços, vazio, status, rascunho oculto por RLS
  e capa pública HTTP 200. Nenhuma consulta de escrita foi executada.

| Página | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Explorar | Passou | Passou | Passou | Passou |

As quatro larguras passaram sem rolagem horizontal, com um `h1`, navegação
adequada ao tamanho e contatos pendentes desativados. Capturas em 390 e
1440 px foram revisadas visualmente. No mobile, os controles permanecem
acima da barra inferior e o conteúdo mantém rolagem vertical.

## Interação e carregamento

Automação final em `tests/etapa5-browser.mjs` passou:

- Swipe horizontal real em toque emulado avançou/voltou sem abrir o link do
  card. Rolagem vertical nativa não alterou o veículo. Setas do teclado deram
  as mesmas ações; toque intencional continuou abrindo detalhes, inclusive
  logo após um gesto. O retorno dos detalhes conservou o segundo veículo
  no cache de navegação do Chrome.
- Um problema na transferência da captura implícita do toque foi corrigido:
  perder a captura no elemento filho não cancela a captura assumida pelo palco.
- Fotos distintas de fixtures e interceptação de rede comprovaram que apenas
  a capa atual e a próxima foram solicitadas; a terceira capa só foi antecipada
  ao passar para o segundo veículo. Metadados de lotes não baixam suas fotos.
- Com `saveData` simulado, somente a foto atual foi solicitada. Não se depende
  da disponibilidade dessa API para navegar.
- Falha do lote adicional preservou o quarto veículo. “Tentar novamente”
  repetiu offset 4; cliques concorrentes não geraram consulta duplicada.
- Erro inicial, vazio, atualização da seleção e fallback de foto passaram.
  Cancelamento ao sair e retorno simulado durante consulta mantiveram a
  posição e permitiram nova tentativa sem mostrar erro de cancelamento.
- Movimento reduzido desativou transições; sem JavaScript, navegação pública
  e aviso `noscript` continuaram disponíveis.

## Segurança verificada e limites

- Configuração do Supabase, cliente GET e SQL de schema tiveram hashes SHA-256
  idênticos aos anteriores à etapa. Nenhuma alteração de RLS, permissões,
  banco, Storage ou credenciais. Nenhum login, escrita, upload ou deploy.
- Testes de dados existentes continuam verificando recusa de chaves secretas,
  filtros inválidos e caminhos de Storage inseguros antes de qualquer fetch.
- O novo código não usa `innerHTML`, avaliação de strings ou dependências
  externas. Dados dos veículos permanecem texto nos componentes compartilhados.
- Fixture com marcação HTML/script e slug/caminho `javascript:` permaneceu
  texto; não criou script, link ou imagem executável. Foto ausente exibiu fallback.
- O preload reconstrói a URL com `getPublicImageUrl` e usa `no-referrer`.
  As requisições de fotografia observadas não continham `apikey` ou
  `Authorization`. Nenhum segredo foi acrescentado ao código público.
- Nenhuma exceção JS, mensagem de erro de console ou falha HTTP dos imports
  locais foi observada na execução final. Testes de erro usaram simulações
  na memória da página, sem alterar o projeto do Supabase.

Não há garantia absoluta de segurança. Esta etapa preserva os controles
verificados anteriormente; os testes de bloqueio de escrita da Etapa 2 não
foram repetidos, pois banco e permissões não mudaram. Mobile foi emulado no
Chrome, sem aparelhos físicos, Safari ou leitor de tela.

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs
```

A automação opcional `node tests/etapa5-browser.mjs` requer Live Server em 5500
e Chrome isolado com depuração local em 9335. Capturas ficam em
`vertice-captures-etapa5` no diretório temporário. Navegador de QA encerrado;
Live Server mantido para revisão. **Etapa 5 entregue para revisão; Etapa 6
não iniciada. Nenhum deploy realizado.**

---

# Revisão da Etapa 5 — Feed vertical

Em **09/10/2026**, o usuário pediu o formato inspirado em Reels e autorizou a
alteração, exigindo um caminho de retorno à versão anterior. A revisão ficou
limitada ao Explorar. Nenhuma etapa de detalhes ou publicação foi iniciada.

## Entrega e retorno

- Um veículo por tela, com swipe vertical, roda do mouse, botões ↑/↓,
  setas do teclado e PageUp/PageDown. Transição no sentido da navegação e
  deslocamento leve acompanhando o dedo; movimento reduzido desativa os efeitos.
- Foto principal inteira, com cópia decorativa desfocada ao fundo usando a mesma
  URL; nome, versão, ano, km, câmbio, preço e “Ver detalhes” sobre faixa escura.
  Navegação pública e acesso ao estoque continuam disponíveis.
- Backup exato de `explorar.html`, `css/pages/explorar.css` e
  `js/pages/explorar.js` em `revisoes/explorar-horizontal/`. Manifesto SHA-256
  verificado. `restaurar.ps1` foi executado em pasta temporária isolada, e os
  três arquivos restaurados tiveram hashes iguais aos da versão horizontal.
- O script só copia esses três caminhos, após verificar hashes e limites de
  diretório; não apaga arquivos nem altera configuração ou dados do Supabase.
  A versão do projeto continua vertical. Instruções estão no README do backup.

## Verificação final

**17 testes locais passaram**, com sintaxe dos **16 arquivos JavaScript da
aplicação** verificada. Os testes existentes de dados, filtros, fila e gesto
horizontal foram mantidos; um teste novo cobre o gesto vertical e seus limites.

O script `tests/explorar-feed-browser.mjs` passou em Chrome isolado:

| Largura | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Feed vertical | Passou | Passou | Passou | Passou |

- Sem rolagem horizontal ou do documento; um `h1`, navegação correta e controles
  com pelo menos 44 px dentro da área visível. Capturas em 390 e 1440 px revisadas.
- Leitura real dos 14 veículos, lotes 4/4/4/2 e offsets 0/4/8/12, sem UUIDs
  duplicados, vendido ou rascunho. Reservado manteve identificação textual.
- Swipe real para cima/baixo, gesto horizontal ignorado, teclado e roda do mouse
  passaram. Toque intencional abriu detalhes; retorno preservou a posição no
  cache de navegação. Fim da seleção, voltar e reiniciar passaram.
- Fixtures com fotos distintas comprovaram que apenas a URL da foto atual e a
  próxima foram solicitadas. Fundo e primeiro plano compartilham a foto atual.
  Economia de dados solicitou apenas a URL atual. Sem credenciais nas fotos.
- Falha inicial/adicional, nova tentativa, vazio, imagem indisponível,
  concorrência e cancelamento ao sair passaram. O veículo atual foi preservado
  na falha adicional; a tentativa repetiu o mesmo offset.
- Texto extenso em viewport de 390 × 600 px permaneceu dentro da largura;
  a ficha ganhou rolagem própria, sem trocar o veículo durante a leitura.
- Dados contendo HTML/script e URLs `javascript:` permaneceram texto e não
  criaram elementos executáveis. Movimento reduzido e aviso/navegação sem JS
  passaram. Nenhuma exceção JS, erro de console ou falha HTTP de import local.

Configuração do Supabase, cliente GET e fila de consultas tiveram hashes iguais
aos anteriores à revisão. Nenhuma alteração de banco, RLS, Storage, contatos,
Home, estoque ou detalhes. Sem dependências novas, escrita ou deploy.

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs
```

Automação opcional: `node tests/explorar-feed-browser.mjs`, com Live Server em
5500 e Chrome isolado com depuração em 9336. Capturas no diretório temporário
`vertice-captures-explorar-feed`. O navegador de QA foi encerrado, mantendo o
Live Server para revisão. O teste anterior `tests/etapa5-browser.mjs` aplica-se
à versão horizontal guardada. `revisoes/` e `tests/` ficam fora do deploy futuro.

Mobile foi emulado, sem teste em aparelhos físicos, Safari ou leitor de tela.
Os PNGs ainda são demonstrações; não foram adicionadas fotografias ou vídeos.
**Feed vertical entregue para revisão. Etapa 6 não iniciada.**

---

# Observação da Etapa 5 — Swipe lateral de fotos nas quatro páginas

Em **09/10/2026**, o usuário autorizou swipe lateral na Home, estoque, Explorar
e base de detalhes, mantendo expressamente o trabalho na **Etapa 5**.
Foi implementada a galeria compartilhada, sem iniciar a ficha completa da
Etapa 6, WhatsApp, compartilhamento ou publicação.

## Comportamento entregue

- Swipe para os lados, botões ←/→ com 44 px e teclado ←/→ trocam as fotos do
  veículo atual. Contador, navegação circular, animação lateral e movimento
  reduzido. A ordem usa `ordem` e a exibição começa pela capa cadastrada.
- No Explorar, gesto vertical e ↑/↓ continuam trocando veículos; o horizontal
  troca somente fotos. Um arrasto não abre detalhes. Um toque intencional na
  foto ou no link de informações abre a base do veículo, e o retorno mantém a
  posição da seleção no cache de navegação.
- Listas continuam consultando somente a capa. A galeria consulta metadados no
  primeiro gesto/seta, uma vez por instância, e carrega apenas a foto atual e
  antecipa a seguinte. Ao interagir com fotos no Explorar, a antecipação da capa
  do próximo veículo é interrompida. Economia de dados impede antecipações.
- Fotos únicas ocultam as setas após a consulta. Fotos ausentes/quebradas têm
  fallback. Falha na consulta mantém a capa e oferece nova tentativa. Filtrar,
  trocar veículo ou sair cancela a consulta pendente e libera a antecipação.
- A base de detalhes consulta apenas `id`, `slug`, `marca`, `modelo` e
  metadados das imagens de um anúncio publicado. Ficha, descrição, avisos de
  status, semelhantes e ações de contato permanecem para as próximas etapas.
- O componente de card aceita `gallery` como opção explícita. Sem essa opção,
  preserva o comportamento anterior, compatível com o backup horizontal.

## Verificações realizadas

**20 testes locais passaram**, incluindo validação de UUID/slug antes de
consultar a API, seleção exclusiva dos campos de galeria, ordem estável e
duplicatas. Sintaxe dos **19 arquivos JS da aplicação** validada.

O script atual `tests/galeria-browser.mjs` passou no Chrome isolado:

| Página | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Home | Passou | Passou | Passou | Passou |
| Estoque | Passou | Passou | Passou | Passou |
| Explorar | Passou | Passou | Passou | Passou |
| Base de detalhes | Passou | Passou | Passou | Passou |

- Sem rolagem horizontal; um `h1` por página; controles de fotos com 44 px;
  nenhuma consulta automática de galeria em cada card; somente GET.
- Swipe real emulado para os dois lados no estoque, Explorar e detalhes;
  teclado/botões/ciclo de fotos na Home. Gesto curto não troca fotos, estoque
  mantém rolagem vertical nativa e Explorar mantém o documento sem rolagem.
- Gestos vertical/horizontal e setas do teclado separados no Explorar. Toque
  simples abre detalhes, retorno preserva o veículo, pinça continua permitida.
  Texto extenso em 390 × 600 px tem rolagem própria dentro da legenda.
- Foto única, ausência de fotos, imagem quebrada, falha de metadados e nova
  tentativa passaram. Cliques concorrentes não duplicam consultas; filtragem
  e troca de veículo cancelam metadados da galeria removida.
- Fixtures com URLs distintas confirmaram apenas foto atual e próxima. Com
  economia de dados, apenas a atual é solicitada. Sem `apikey`/Authorization
  nas requisições de imagens. Texto contendo HTML permaneceu texto; URL
  `javascript:` foi rejeitada para imagem e link. Slug inválido não consulta API.
- Movimento reduzido passou. Nenhuma exceção JS, erro de console ou falha HTTP
  de arquivo local durante os testes. Capturas do estoque, Explorar e detalhes
  revisadas visualmente; oito capturas salvas no diretório temporário.

A execução com `QA_REAL=1` verificou por leitura real:

- As quatro páginas consultaram e exibiram galerias com o Supabase atual.
- Metadados por UUID concordaram com a galeria pelo slug, e os contadores
  concordaram com as **16 fotos públicas cadastradas** naquele momento.
- O JPG existente retornou HTTP 200 e `image/jpeg`, com assinatura binária JPEG
  confirmada. Não houve upload ou alteração de registros/arquivos.

`js/config.js`, `js/supabase.js`, `js/explore-queue.js` e `supabase/schema.sql`
mantiveram os hashes anteriores. Os três hashes do backup horizontal foram
conferidos novamente e permaneceram iguais ao manifesto. Nenhuma alteração
de configurações, permissões, banco, RLS ou Storage; sem dependências novas.

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs
node tests/galeria-browser.mjs
```

Para incluir leituras reais no PowerShell: `$env:QA_REAL='1'; node tests/galeria-browser.mjs`.
O navegador de QA requer porta 9337, e o Live Server, porta 5500.
Capturas: `vertice-captures-galerias` no diretório temporário do Windows.
Os testes anteriores permanecem como registros das versões anteriores.

Mobile foi emulado; aparelhos físicos, Safari e leitor de tela não foram
testados. O Chrome de QA foi encerrado e o Live Server foi mantido para revisão.
**Observação da Etapa 5 entregue para revisão. Etapa 6 não iniciada. Sem deploy.**

---

# Etapa 6 — Detalhes do veículo

Em **10/10/2026**, após revisar a Etapa 5, o usuário autorizou continuar.
A entrega foi limitada à **Etapa 6**, reutilizando a galeria e componentes
existentes. WhatsApp por veículo, compartilhamento e publicação continuam
dependendo das próximas etapas e de autorização.

## Implementação

- `veiculo.html?carro=slug` consulta `buscarVeiculoPorSlug` e exibe nome/versão,
  valor do anúncio, código, disponibilidade, ficha técnica com dez campos,
  destaques, descrição com quebras de linha e equipamentos/opcionais.
- Galeria compartilhada preserva capa, ordem, swipe, botões e teclado. Cards
  de semelhantes também têm galeria sob demanda. Título da página usa o nome,
  versão e marca da loja. No desktop, galeria e resumo ficam lado a lado.
- Reservado tem aviso. Vendido mantém as informações para consulta com aviso
  e link “Ver estoque atual”. Anúncio inexistente/oculto ou slug ausente/inválido
  mostra “Veículo não encontrado” e acesso ao estoque, sem semelhantes.
- Até quatro semelhantes publicados, disponíveis/reservados, da mesma categoria,
  excluindo o veículo atual. A consulta é separada da ficha; vazio e falha são
  diferentes. Falha nessa seção mantém o veículo e tem retry independente.
- Descrição, nomes, campos e listas são texto, sem `innerHTML`. Dados opcionais
  ausentes têm fallback; listas descartam entradas vazias/inválidas/duplicadas.
  Consultas abortam ao sair; retorno pelo cache de navegação atualiza os dados.
  Cliques concorrentes durante o carregamento não duplicam consultas.

## Verificação

**20 testes locais passaram.** As asserções de dados foram ampliadas para
verificar publicação, campos completos da ficha, exclusão do atual, status,
limite, ordem e capa dos semelhantes. Sintaxe dos **20 arquivos JS** validada.

`tests/etapa6-browser.mjs` passou em Chrome isolado em 9338:

| Detalhes | 360 px | 390 px | 768 px | 1440 px |
| --- | --- | --- | --- | --- |
| Disponível | Passou | Passou | Passou | Passou |
| Reservado | Passou | Passou | Passou | Passou |
| Vendido | Passou | Passou | Passou | Passou |

- Um `h1`, sem rolagem horizontal, ficha/preço/combustível/câmbio corretos,
  descrição com parágrafos, equipamentos, destaques e quatro semelhantes.
- Swipe real emulado nos dois sentidos e teclado na galeria, começando pela
  capa de ordem 1. Cards de semelhantes consultam fotos apenas ao interagir.
- Slug ausente/inválido não consulta API. Inexistente/oculto consulta só o
  anúncio, mostra estado correto e link para estoque, sem carregar semelhantes.
- Falha inicial, retry, falha/empty dos semelhantes, foco e concorrência
  passaram. Retry de semelhantes preserva a mesma galeria e não repete a ficha.
- Foto ausente, descrição/equipamentos/motor não informados, textos extensos,
  HTML/script e URL executável passaram: permaneceram texto/fallback, sem criar
  código executável e sem exceder a largura. Valores inválidos usam fallback.
- Cancelamento ao sair e atualização ao retornar passaram. Economia de dados
  carrega somente a foto principal; sem economia, somente atual/próxima da
  galeria. Requisições de imagens não recebem `apikey`/Authorization.
- Movimento reduzido, aviso/navegação sem JS e imports passaram. Nenhuma
  exceção JS, erro de console ou falha HTTP de arquivo local na execução final.

A execução com `QA_REAL=1` verificou **somente GETs** no Supabase atual:
ficha, preço, fotos e status disponível/reservado/vendido; os IDs exibidos nos
semelhantes coincidiram com a consulta real. O limite de quatro, categoria,
exclusão do atual e exclusão de vendidos foram conferidos. O slug do rascunho
do seed retornou `null` e mostrou “Veículo não encontrado” no navegador.

A regressão completa de `tests/galeria-browser.mjs` também passou nas quatro
páginas e quatro larguras, adaptada à ficha completa: gestos separados no
Explorar, toque/retorno, erro/retry, cancelamento, fotos únicas/vazias, economia
de dados, segurança de texto/URL e movimento reduzido.

Capturas em `vertice-captures-etapa6` e `vertice-captures-galerias`, no diretório
temporário. As capturas reais mobile e de disponível/reservado/vendido desktop
foram revisadas visualmente.

`js/config.js`, `js/supabase.js`, `js/veiculos.js` e `supabase/schema.sql`
mantiveram os hashes anteriores à Etapa 6. As consultas existentes já atendiam
à etapa; nenhum schema, política RLS, registro ou arquivo de Storage foi alterado.
Sem dependências novas, backend próprio, escrita no Supabase ou deploy.

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs
node tests/etapa6-browser.mjs
node tests/galeria-browser.mjs
```

Para leituras reais: `$env:QA_REAL='1'; node tests/etapa6-browser.mjs`.
O Chrome usa porta 9338 para detalhes e 9337 para galerias; `QA_PORT` permite
usar uma porta diferente. Live Server permanece em 5500 para revisão.

Mobile foi emulado; aparelhos físicos, Safari e leitor de tela não foram
testados. Navegador isolado de QA encerrado; Live Server mantido.
**Etapa 6 entregue para revisão. Etapa 7 não iniciada. Sem deploy.**

---

# Ajuste visual — Explorar sem cabeçalho

Em **10/10/2026**, o usuário pediu remoção da faixa superior de logo/contato e
setas menos agressivas, limitando o trabalho a esse ajuste.

- Cabeçalho removido de `explorar.html`; navegação inferior preservada e mantida
  também no desktop. Card começa no topo, ocupa toda a largura e termina junto
  ao menu. Removidas margem, borda e limitação de largura da moldura desktop.
- Ícones de setas passaram a 14 px, com alvos de toque de 44 px. Horizontais usam
  fundo de 26 px sem contorno; verticais compartilham cápsula translúcida, sem
  bordas individuais. Foco visível preservado. Contador centralizado para não
  sobrepor controles verticais.
- Mudanças de aparência limitadas ao CSS do Explorar. Galeria, gestos, teclado,
  fotos inteiras, estados e carregamento gradual preservados.

A execução de `tests/galeria-browser.mjs`, com `QA_PORT=9339`, passou nas quatro
páginas e larguras **360/390/768/1440 px**. As verificações existentes foram
ajustadas para conferir ausência de header/logo/contato, menu inferior fixo,
card preenchendo a área disponível e ícones menores com alvos de 44 px.
Swipes horizontal/vertical, teclado, toque/retorno, erros, retry, cancelamento,
economia de dados e segurança de texto/URL passaram, sem erros de console ou
falhas HTTP de arquivos locais.

Conferência adicional com o anúncio e as fotos reais do segundo veículo em
360 × 640, 390 × 670, 768 × 900 e 1440 × 900 px: sem rolagem horizontal ou do
documento; galeria carregou a foto seguinte e o contador. Capturas reais mobile
e desktop revisadas visualmente, em `vertice-captures-explorar-visual` no
diretório temporário. Mobile foi emulado, sem aparelhos físicos ou Safari.

JavaScript da aplicação e banco não foram alterados. Configuração, cliente REST,
consultas e schema mantiveram os hashes anteriores. Backup horizontal preservado.
Chrome isolado de QA encerrado; Live Server mantido para revisão.
**Somente o ajuste visual solicitado. Etapa 7 não iniciada. Sem deploy.**

## Etapa 7 — WhatsApp e compartilhamento — 10/10/2026

O usuário autorizou avançar e informou `81993369736`. Somente `loja.whatsapp`
foi preenchido com DDI 55 (`5581993369736`). A configuração do Supabase foi
preservada: substituir a linha de contato pela anterior reproduz SHA-256
`77AC58163B1C9546CCB5B20FD2E7677FB89D22733943EBFFE9C332D219D750AC` de `config.js`.
Hashes de `supabase.js`, `veiculos.js`, `explore-queue.js` e `schema.sql`
permaneceram iguais aos anteriores. Nenhuma alteração de banco, RLS ou Storage.

Foram reutilizados resumo da ficha, botões/tokens, ícones SVG e layout. Novo
componente `vehicle-actions.js` e helper `vehicle-links.js`: mensagem específica,
avisos de reservado/vendido, link com slug validado e sem parâmetros extras,
compartilhar nativo quando suportado, copiar link e fallback manual. Destino
WhatsApp fixo e mensagem codificada. Não há consultas extras ou widgets externos.

Referências técnicas: formato do [clique para conversa do WhatsApp](https://faq.whatsapp.com/5913398998672934/?locale=pt_BR),
ativação por clique/cancelamento no [Web Share da W3C](https://www.w3.org/TR/web-share/)
e escrita de texto na [Clipboard API da W3C](https://www.w3.org/TR/clipboard-apis/).
As ações respeitam suporte/permissões do navegador; nenhuma cópia após cancelamento.

**24 testes locais passaram**, incluindo quatro novos casos de telefone/encoding,
slug/subpasta/URL, mensagens dos três status e campos/contatos ausentes. Sintaxe
dos **22 arquivos JavaScript** da aplicação e do novo QA de navegador validada.

`tests/etapa7-browser.mjs` foi executado em Chrome isolado 9340, com `QA_REAL=1`:

- Disponível, reservado e vendido em **360/390/768/1440 px**, sem overflow;
  mensagens com nome/versão, ano, código e URL correta; botões/links com 44 px.
- Contato genérico válido na Home, estoque e ficha. Header/contato do Explorar
  continuam ausentes; mapa/Instagram pendentes permanecem ocultos.
- Compartilhamento com ativação real por clique, payload correto, sucesso,
  cancelamento e rejeição simulados; sem cópia automática ou cliques duplicados.
- Copiar link com sucesso, ausência da API e permissão negada; seleção/foco no
  campo manual, nova tentativa bem-sucedida e Clipboard API real do Chrome.
- Teclado, foco, saída/retorno pelo cache de navegação e descarte de resultado
  tardio. Ausente/inválido/oculto/erro não apresenta ações do veículo.
- Texto/HTML malicioso não executado; mensagem codificada sem novos parâmetros;
  links não incluem query de rastreamento ou fragmento.
- Anúncios reais nos três status, com links e avisos conferidos. Somente GETs,
  sem acessar `wa.me`, abrir conversas ou enviar mensagens.

Regressões completas de `tests/galeria-browser.mjs` e `tests/etapa6-browser.mjs`
também passaram no mesmo Chrome: quatro páginas/larguras, swipes, teclado,
galerias, ficha completa/semelhantes, erros/retry, cancelamento, economia de
dados, campos longos/maliciosos e navegação sem JS. Sem erros de console/imports
ou respostas HTTP de falha nos arquivos locais.

Capturas em `vertice-captures-etapa7`, no diretório temporário do Windows;
mobile/desktop e anúncio real reservado revisados visualmente. Chrome isolado
encerrado; Live Server mantido em `http://127.0.0.1:5500` para revisão.

**Limites:** mobile emulado; sem aparelhos físicos, Safari ou escolha/envio real
pelo compartilhamento nativo. Não foi verificada a existência da conta WhatsApp
por uma conversa. Endereços compartilhados na prévia são locais; o domínio
definitivo será usado automaticamente após publicação autorizada.

**Etapa 7 entregue para revisão. Etapa 8 não iniciada. Sem deploy.**

## Ajustes da revisão da Etapa 7 — confirmações e localização — 10/10/2026

Pedido do usuário: ocultar confirmações com `setTimeout` e incluir localização
com mapa no footer da Home. Link fornecido: [localização no Google Maps](https://share.google/Xnrqm8YwgTy9JIsH1).
O redirecionamento aponta para Detroit Veículos; no Maps foi conferido o endereço
Rua Visconde de Inhaúma, 451 — Maurício de Nassau, Caruaru — PE, 55012-010 e a
identidade do ponto `/g/11bzwmyc5_` / `0x7a98bb8a76fcb0f:0xf94781580c588d59`.
O URL de iframe foi obtido em Compartilhar → Incorporar um mapa, sem criar conta,
usar chave de API ou enviar mensagens. Marca e WhatsApp existentes preservados.

“Link copiado!”/“Link compartilhado.” somem após **3 segundos**; nova ação reinicia
o prazo. Timer removido na saída/descarte do componente. Erros e instruções de
cópia manual permanecem visíveis. O QA existente da Etapa 7 foi ampliado para
esperar o prazo real, repetir uma ação antes do fim e conferir altura zero do
feedback vazio. Todos os fluxos anteriores passaram, incluindo Clipboard real,
cancelamento, concorrência, foco, teclado, saída/retorno e estados de anúncio.

Footer de `index.html`: seção com convite à visita/test drive, endereço, ações
Como chegar/Agendar visita e mapa responsivo. Iframe com título acessível,
`loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"` e host HTTPS
fixo do Google Maps. URL validado sem HTML, credenciais, outras origens/portas,
redirects ou parâmetros extras; configuração ausente/inválida usa fallback.
O iframe é conteúdo externo do Google, solicitado pelo usuário, sem SDK adicional.

**25 testes locais** e sintaxe dos **23 JS** da aplicação passaram. O novo teste
de segurança `tests/store-map.test.mjs` cobre URLs hostis/malformados. Regressão
completa de `tests/galeria-browser.mjs` passou nas quatro páginas e larguras.

QA adicional da Home em **360/390/768/1440 px**, com fixtures apenas das consultas
GET do estoque e iframe real: mapa respondeu HTTP 200; pin/endereço, dimensões,
carregamento lazy, link enviado e mensagem de agendamento conferidos. URL de
origem inválida ocultou iframe/removeu `src` e mostrou fallback; restauração
válida voltou a exibir o mapa. Sem overflow horizontal ou exceções de JS.
Capturas em `vertice-captures-localizacao`, no diretório temporário do Windows;
mobile e desktop revisados visualmente. Mobile emulado, sem Safari/aparelhos físicos.

Somente dados públicos de endereço/mapa foram acrescentados à configuração da
loja. Reconstruir as linhas anteriores de contato/localização reproduz o hash
original `77AC58163B1C9546CCB5B20FD2E7677FB89D22733943EBFFE9C332D219D750AC`.
Cliente GET, consultas e schema mantiveram os hashes anteriores. Banco, RLS e
Storage não foram alterados. Chrome isolado encerrado; Live Server mantido.
**Continua na revisão da Etapa 7. Etapa 8 não iniciada. Sem deploy.**

## Ajustes da revisão da Etapa 7 — menu e rodapé — 10/10/2026

Pedido do usuário: menu hambúrguer moderno com acesso às seções e rodapé
institucional. Implementados componentes compartilhados `site-menu.js` e
`institutional-footer.js`, usando o layout, configuração, ícones e links existentes.
Menu nas quatro páginas; rodapé na Home, estoque e detalhes. Explorar permanece
em tela cheia, com botão na faixa de controles e sem header/rodapé visível.

QA adicional em Chrome isolado 9340, com fixtures em memória somente dos GETs:

- Quatro páginas em **360/390/768/1440 px**, sem overflow horizontal. Botões de
  abrir/fechar com 44 px ou mais; painel dentro da tela, rolagem interna e links
  acessíveis também em mobile de 640 px de altura.
- Diálogo fechado oculto; abrir configura `aria-expanded` e foco inicial no
  fechar. Teclado mantém o fundo inativo; Escape retorna foco ao botão. Toque
  fora fecha; toque no espaço interno não fecha. Movimento reduzido sem animação.
- Seis destinos corretos, página/seção atual, Estoque ativo na ficha, navegação
  entre páginas e anchor de localização com foco no título. WhatsApp inspecionado
  sem abrir conversa; links externos usam `noopener noreferrer`.
- Reabertura rápida preserva o bloqueio de rolagem e `aria-expanded`: o evento
  `close` tardio não desfaz uma nova abertura. Saída/retorno pelo cache mantém
  menu fechado. Repetir inicialização não duplica painel nem rodapé.
- Abrir o menu e usar teclado não troca o veículo do Explorar. Card mantém toda
  a tela até a navegação inferior; header e rodapé continuam ocultos.
- Rodapé com identidade, endereço e contatos configurados, navegação correta,
  links de 44 px e Instagram oculto. Mapa da Home preservado. Sem JS, navegação
  e rodapé HTML anteriores seguem disponíveis e o hambúrguer permanece oculto.

**25 testes locais** e sintaxe dos **25 arquivos JS** passaram. Regressões completas
de `tests/etapa7-browser.mjs` e `tests/galeria-browser.mjs` passaram: três status,
links/payload, sucesso/cancelamento/erro, cópia real do Chrome, confirmação por
3 segundos, concorrência e descarte; quatro páginas/larguras, swipes lateral e
vertical, foco, galerias sob demanda, economia de dados, retry e texto seguro.
Sem erros de console/imports ou respostas HTTP de falha nos arquivos locais.

Capturas em `vertice-captures-menu`, no diretório temporário do Windows;
menu mobile/desktop, Explorar mobile e rodapé mobile/desktop revisados visualmente.
Mobile emulado, sem Safari/aparelhos físicos ou leitor de tela.

SHA-256 de `config.js`, `supabase.js`, `veiculos.js`, `explore-queue.js` e
`supabase/schema.sql` idênticos aos anteriores a este ajuste. Nenhuma consulta
nova, SDK, escrita no banco ou alteração em RLS/Storage. Backup horizontal mantido.
Chrome isolado encerrado; Live Server mantido em `http://127.0.0.1:5500`.
**Continua na revisão da Etapa 7. Etapa 8 não iniciada. Sem deploy.**

## Nova revisão da Etapa 7 — menu compacto, suavidade e localização própria — 10/10/2026

Pedido: redesenhar o menu, suavizar a navegação e transferir a localização para
outro HTML, acessível apenas pelo menu e footer. Implementados `localizacao.html`,
seus CSS/JS e `components/navigation.js`; configuração e componentes existentes
de mapa/layout/rodapé/ícones reutilizados. A Home não contém mais seção/iframe
de mapa nem importa o inicializador de localização. O menu principal mantém
três destinos; menu hambúrguer e footer apontam para a nova página.

QA em Chrome isolado 9340, com fixtures somente dos GETs do estoque em memória:

- **Cinco páginas em 360/390/768/1440 px:** painel compacto claro, quatro destinos
  com ícones/descrições e dois atalhos. Mobile pela parte inferior, desktop próximo
  ao botão; sem overflow, alvos de 44 px ou mais, foco inicial, destaque atual,
  Escape, toque fora, espaço interno, contato correto e inicialização idempotente.
- Explorar continua sem header/rodapé visível e com card em tela cheia. Abrir
  o menu e usar teclado não muda o veículo. Rodapés usam o mesmo endereço/contato.
- **390×640 e 844×360:** painel dentro da tela, conteúdo com rolagem interna e
  fechar acessível. Selecionar a página atual fecha e retorna ao conteúdo sem
  recarga; a página de localização não faz consultas ao estoque.
- Destaques/Novidades pelo menu e footer: chamada real de rolagem suave, foco
  no título, URL correta, histórico/Voltar preservados e título abaixo do header.
  Fechamento animado, cliques repetidos sem navegação duplicada e cache de navegação
  sem menu aberto. Com movimento reduzido, animações desativadas e rolagem instantânea.
- Entrada das páginas com fade CSS de 320 ms e navegação por links HTML. Sem JS,
  hambúrguer oculto, navegação principal, endereço e link do mapa disponíveis;
  rodapé HTML mantém acesso à página de localização.
- Mapa real na localização: ponto/endereço conferidos visualmente, título, origem
  HTTPS permitida, lazy loading e botão de agendamento com mensagem de test drive.
  Configuração de iframe com outra origem oculta/remove `src` e mostra fallback;
  restaurar a configuração válida reexibe o mapa. Home sem iframe/CTA de localização.

**25 testes locais** passaram; sintaxe dos **27 JS da aplicação** e dos três
scripts de QA ajustados passou. Regressões completas de `etapa7-browser.mjs`
e `galeria-browser.mjs` passaram, incluindo Clipboard real, confirmações de 3 s,
status, concorrência, swipes lateral/vertical, economia de dados, retry, texto
seguro e cancelamento. Nos scripts de QA, posicionar elementos usa rolagem
instantânea explicitamente; os gestos/asserts foram mantidos. QA adicional sem
erros de JS/imports ou falhas HTTP nos arquivos locais. Capturas mobile/desktop
do menu e da localização em `vertice-captures-menu-revisado`, no diretório temporário,
revisadas visualmente. Mobile emulado; sem Safari, aparelhos físicos ou leitor de tela.

SHA-256 de configuração, cliente GET, consultas, fila e schema permaneceu idêntico.
Nenhuma escrita no Supabase, alteração de RLS/Storage ou envio de mensagem.
Backup horizontal preservado. Chrome isolado encerrado; prévia local mantida.
**Continua na revisão da Etapa 7. Etapa 8 não iniciada. Sem deploy.**

## Revisão visual da Etapa 7 — 11/10/2026

Home e Estoque receberam títulos mais curtos, hierarquia mais simples e menos
texto introdutório. A Home ganhou busca GET para o Estoque, reutilizando o
parâmetro `busca` existente. Botão hambúrguer com três traços nas cinco páginas.
No celular, gaveta à direita com entrada/saída horizontal; a partir de 768 px,
painel flutuante compacto preservado conforme a imagem aprovada pelo usuário.

- **25 testes locais** passaram e os **27 arquivos JS** têm sintaxe válida.
- Cinco páginas em **360/390/768/1440 px**: sem overflow horizontal, três traços,
  painel dentro da tela, Escape e retorno do foco. Mobile com topo 0/altura da
  tela/lateral direita; desktop com painel compacto próximo ao header.
- Busca Home → Estoque preserva o termo na URL e no campo. Filtros adicionais
  abrem/fecham normalmente. Entrada e saída do menu confirmadas com deslocamento
  horizontal durante a animação; toque fora, movimento reduzido e contato
  alcançável em **390×640 e 844×360** conferidos.
- QA adicional: âncoras suaves com foco/histórico, página atual sem recarga,
  cliques repetidos, retorno pelo cache, fallback sem JS e validação do mapa.
- Regressões completas de `galeria-browser.mjs` e `etapa7-browser.mjs` passaram:
  swipes, teclado, carregamento gradual, erros/retry, concorrência/cancelamento,
  texto seguro, WhatsApp, Clipboard e confirmações de compartilhamento de 3 s.
- Home/Estoque com dados públicos reais conferidos por GET em **390/1440 px**.
  Capturas de páginas/menu em `vertice-captures-visual-11-10`, no diretório
  temporário, revisadas visualmente. Sem erros de JS/imports ou arquivos locais
  ausentes. Testes não enviaram mensagens nem alteraram dados.

SHA-256 de `js/config.js`, `js/supabase.js`, `js/veiculos.js`,
`js/explore-queue.js` e `supabase/schema.sql` permanece igual ao início da revisão.
Supabase/RLS/Storage e backup horizontal preservados. QA mobile emulado em Chrome;
Safari, aparelhos físicos e leitor de tela não verificados nesta revisão.
Chrome isolado encerrado; prévia local mantida. Documentação de continuidade,
design e uso atualizada. **Etapa 7 em revisão. Etapa 8 não iniciada. Sem deploy.**
## Seis refinamentos da Etapa 7 — 11/10/2026

Localização redesenhada com título curto, endereço/ações/mapa em conjunto único.
Navegação flutuante da Home mobile baseada na referência do responsável; headers
com cápsula de navegação, fundo translúcido e interações discretas. Traços do
hambúrguer com 2 px de espessura, espaçamento de 4 px e dimensões iguais entre si.
Estoque com menor preço como padrão da URL/seletor, seguido de maior preço e
recém-adicionados; escolhas explícitas permanecem compartilháveis.

Busca pela Home e pelo Estoque revela suavemente o título dos carros após
renderizar o resultado atual. Digitação preserva foco no campo; envio do formulário
foca o título. O utilitário de rolagem é compartilhado com a navegação existente.
Busca vazia enviada pela Home também revela o estoque completo. Movimento reduzido
usa rolagem instantânea. Inválidos/respostas antigas/canceladas não rolam a página;
paginação e restauração do histórico preservam a navegação existente.

- **26 testes locais** passaram, incluindo padrão por preço e preservação dos
  três tipos de ordenação na URL. Sintaxe dos **27 JS** conferida; ajuste final
  da busca vazia validado por sintaxe e navegação real.
- **Cinco páginas × 360/390/768/1440 px:** sem overflow horizontal; três traços
  de mesma espessura/largura, navegação da Home a distância da borda inferior,
  alvos de 44 px ou mais, header responsivo e menu/Escape/foco preservados.
- Localização: título compacto, mapa maior à esquerda no desktop, texto antes
  do mapa no celular, origem HTTPS correta, rota e WhatsApp com destino válido.
  A página continua sem consultas de veículos. Endereço/configuração preservados.
- Buscas: rolagem suave registrada após renderização, sem antecipá-la durante
  requisição lenta. Digitação mantém foco; submit foca resultados. Resposta antiga
  ignorando cancelamento não provoca rolagem extra. Vazio/erro revelados, inválidos
  não consultam nem rolam; movimento reduzido usa instantâneo. Menor/maior preço
  e recém-adicionados enviados com o `order` correto; limpar volta ao menor preço.
- Regressão completa de `galeria-browser.mjs` passou: swipes, teclado, ambos
  os eixos no Explorar, fotos ausentes/quebradas, retry, concorrência/cancelamento,
  carregamento gradual, economia de dados, texto seguro e movimento reduzido.
- QA adicional de navegação passou: âncoras/foco/histórico, retorno pelo cache,
  cliques repetidos, fechamento animado, telas baixas, fallback sem JS e iframe.
- Dados reais somente por GET: Home/Estoque/Localização em **390/1440 px**, preços
  crescentes no estoque, busca Corolla pela Home e envio vazio revelando carros.
  Capturas em `vertice-captures-refinamentos-11-10`, no diretório temporário,
  revisadas visualmente. Sem erros de JS/imports ou falhas HTTP de arquivos locais.

SHA-256 de config, cliente GET, consultas, fila e schema idêntico ao início.
Sem escritas no Supabase, mudanças em RLS/Storage, envio de mensagens ou deploy.
QA mobile emulado em Chrome; Safari, aparelhos físicos e leitor de tela não
verificados nesta revisão. Chrome isolado encerrado; Live Server mantido.
**Etapa 7 permanece em revisão; Etapa 8 não iniciada.**
## Barra flutuante compartilhada e Home só com destaques — 11/10/2026

A navegação flutuante aprovada na Home mobile passou ao CSS compartilhado das
cinco páginas. Explorar usa a cápsula também no desktop. Corpo/feed reservam
96 px mais safe area para manter rodapé, dica e ações acessíveis. Desktop das
páginas com header mantém sua navegação em cápsula. Novidades foi removida do
HTML, carregamento da Home e atalhos do menu/footer; a Home consulta apenas
seis destaques. Ordenação por recém-adicionados permanece disponível no Estoque.

Busca por texto exige termo: Home usa required/padrão não vazio e validação de
letras/números. Estoque bloqueia busca vazia por Enter/digitação e envio sem
termo nem filtros, preservando resultados/paginação. Filtros/ordenação sem texto
continuam disponíveis; Limpar filtros restaura todos os veículos. Cancelar uma
busca ao apagar o campo impede resposta e rolagem tardias. Busca válida mantém
a rolagem suave já implementada. Sem mudança na configuração ou API do Supabase.

- **26 testes locais** e sintaxe dos **27 JS** passaram. Sintaxe dos três QA
  ajustados validada. QA da Etapa 4 foi atualizado para uma seleção na Home;
  a regressão de galerias verifica a barra flutuante e o espaço do feed.
- **Cinco páginas × 360/390/768/1440 px:** sem overflow; cápsula compartilhada
  no celular e Explorar desktop; alvos de 44 px, rodapé alcançável ao fim da
  rolagem, controles/dica do feed acima da barra. Menu, Escape e atalho Destaques
  preservados. Nenhuma seção/link Novidades no DOM; Home faz uma consulta de
  destaques com seis cards, sem segunda seleção.
- Home vazia, com espaços e pontuação: envio bloqueado, sem navegação/consulta.
  Busca válida abre o Estoque e revela os resultados suavemente. Estoque vazio
  por submit/Enter/debounce: sem GET ou rolagem; filtros sem texto e reset funcionam.
  Campo apagado durante consulta atrasada impede resposta/rolagem tardias;
  digitar termo válido novamente recupera a busca.
- Regressão completa de `galeria-browser.mjs` passou: fotos/contadores, swipes,
  teclado, distinção dos eixos do Explorar, retry, concorrência/cancelamento,
  carregamento gradual, economia de dados, renderização segura e movimento reduzido.
- **Dados públicos reais, só GET:** Home e Explorar em 390/1440 px; Home com uma
  consulta de seis destaques. Estoque conserva os 12 cards e Carregar mais após
  bloquear busca vazia/espaços; carregar mais completa 14 sem duplicar. Busca
  Corolla pela Home continua válida e foca os resultados. Explorar em 390×640
  e 844×360 mantém feed/barra dentro da tela. Capturas temporárias em
  `vertice-captures-destaques-nav-11-10`, revisadas visualmente.
- Sem JS, a Home mantém a navegação flutuante, links HTML, acesso à localização
  no footer e validação nativa de campo vazio/espaços. Hambúrguer permanece oculto.
  QA sem erros de JS/imports ou falhas HTTP dos arquivos locais.

Hashes de config, cliente GET, consultas, fila e schema idênticos. Sem escrita
no banco/RLS/Storage, envio de mensagens ou deploy. Mobile emulado em Chrome;
Safari, aparelhos físicos e leitor de tela não verificados nesta revisão.
Chrome isolado encerrado; prévia local mantida. **Etapa 7 em revisão; Etapa 8 não iniciada.**
## Revisão de 11/10/2026 — Detalhes, fotos e compartilhamento

Visual de `veiculo.html` alinhado à Home/Estoque: título compacto, fundo branco,
ficha sem cartões repetidos, resumo com três dados principais e listas discretas.
Galeria 4:3 preenchida com `cover`; fotos de outras proporções recebem recorte
central. Compartilhar/Copiar link agora ficam no menu de três pontos ao lado do
WhatsApp. Mantidos payloads, avisos de status, segurança de texto/URLs e feedback.

- **26 testes locais** e sintaxe dos **27 JS** passaram; QA da Etapa 7 atualizado
  para abrir o painel antes da ação e conferir alvos realmente visíveis/foco.
- Regressão completa `etapa6-browser.mjs`: disponível/reservado/vendido em
  360/390/768/1440 px, ficha/opcionais/descrição, quatro semelhantes, swipe/teclado,
  retry, erros distintos, campos ausentes, textos/URLs hostis, cancelamento e
  retorno, economia de dados, movimento reduzido e fallback sem JavaScript.
- Regressão completa `etapa7-browser.mjs`: contato/link/status corretos, ativação
  nativa preservada, cancelamento/erro sem cópia automática, concorrência, feedback
  que desaparece após 3 s e reinicia ao repetir, cópia manual com seleção/foco,
  APIs indisponíveis, Clipboard real do Chrome, teclado e descarte ao sair/retornar.
  Sem WhatsApp aberto ou mensagem enviada.
- QA específico nas quatro larguras: sem overflow, galeria 4:3 com `cover`, painel
  inicialmente oculto, dentro da tela, botões de 44 px, ArrowDown/Tab/Escape,
  retorno do foco ao botão, clique fora e saída por Tab. Em 390×640 o painel
  abre acima para preservar acesso às opções sem cobrir a navegação flutuante.
  Movimento reduzido elimina a animação do painel.
- **Dados públicos reais, somente GET:** HB20 e Chevrolet Onix do print com
  fotos carregadas. Onix 1200×900 corresponde à nova proporção e preenche o quadro
  sem faixas laterais. Capturas mobile/desktop e painel revisadas visualmente,
  em `vertice-captures-veiculo-revisao-11-10`, no diretório temporário do Windows.
- Sem erros de console/imports ou falhas HTTP dos arquivos locais. Configuração,
  cliente GET, consultas, fila e schema conservam os cinco hashes registrados.

Banco, RLS e Storage preservados. Nenhum deploy. Mobile emulado em Chrome;
aparelhos físicos, Safari e leitor de tela não verificados nesta revisão.
Chrome isolado encerrado; Live Server mantido. **Etapa 7 em revisão; Etapa 8 não iniciada.**
## Revisão de 11/10/2026 — Reformulação de Localização e contato

Mudança restrita à página de localização, seus estilos/módulo e novo helper de
mensagem, além de testes/documentação. Demais páginas, componentes compartilhados
e configuração do Supabase preservados. Formulário usa o WhatsApp cadastrado;
não há serviço de email, envio automático, gravação de contatos ou reserva confirmada.

- **29 testes locais** passaram, incluindo três testes novos de mensagem:
  validação de nome/mensagem/tamanhos/assunto, texto/URL codificados sem alterar
  destino, data opcional, calendário válido, data passada e preferência a confirmar.
  Sintaxe dos **28 JS** e dos dois novos scripts de testes conferida.
- QA `tests/localizacao-browser.mjs` em **360/390/768/1440 px**: sem overflow,
  telefone/link oficiais, formulário rotulado e alvos de pelo menos 44 px.
  Mapas com host validado, lazy loading, endereço fornecido e fallback seguros.
  Capturas de contato e área de visita revisadas visualmente no Chrome.
- CTA test drive escolhe assunto, revela data, preenche texto inicial apenas se
  estiver vazio e rola suavemente/foca o título do formulário. Tab alcança o nome.
  Link de mapa rola/foca endereço. Movimento reduzido usa rolagem instantânea.
- Submit nativo **interceptado antes de navegar**: action exata para WhatsApp
  cadastrado, nova aba com `noopener noreferrer`, um único parâmetro `text`, nome
  normalizado, assunto, veículo e dia de preferência com aviso de confirmação.
  Não foi aberta conversa ou enviada mensagem. Renderização de texto segura;
  dados contendo `&`, `?` e `#` não mudam o destino.
- Vazio/espaços são bloqueados; digitar novamente recupera validade. Data passada
  bloqueada; data vazia aceita. Outro assunto oculta/desabilita/limpa a data.
  CTA preserva rascunho existente. Retorno pelo cache remove texto preparado
  oculto, conservando os campos visíveis e atualizando a data mínima.
- Tela **390×640**: menu indica localização, Escape fecha, rodapé alcançável acima
  da navegação flutuante. Sem JS, formulário permanece oculto e há contato direto
  e link de mapa funcionais. Página não faz consultas REST ao estoque.
- Nenhum erro de console/imports ou arquivo local ausente. Cinco hashes de
  configuração, cliente GET, consultas, fila e schema idênticos aos anteriores.

Capturas em `vertice-captures-localizacao-contato-11-10`, no diretório temporário
Windows. Mobile emulado; aparelhos físicos, Safari/leitor de tela e envio final
real no WhatsApp não foram verificados. Chrome isolado encerrado; Live Server
mantido para revisão. Sem alterações de banco/RLS/Storage ou deploy.
**Etapa 7 em revisão; Etapa 8 não iniciada.**
## Revisão de 11/10/2026 — Explorar azul, mensagens e menu Contato

Quatro ajustes solicitados: barra azul escura no Explorar, mensagens de contexto
em todos os acessos ao WhatsApp, Contato no menu para o formulário e contato
direto verde suave. Valores de configuração e textos editados pelo usuário preservados.

- **31 testes locais** passaram, incluindo contexto por página/origem, destino
  validado, mensagem breve, estado de disponível/reservado/vendido, URL do anúncio,
  base em subpasta, origem desconhecida e telefone inválido. Sintaxe dos **29 JS**
  e QA ajustados conferida.
- Regressão completa `localizacao-browser.mjs`: quatro larguras, formulário/CTA,
  datas/rascunho, payload nativo interceptado, teclado/foco, movimento reduzido,
  ciclo de vida, mapa/fallback, tela curta e contato com texto sem JS.
- Regressão completa `etapa7-browser.mjs`: contatos de header/menu/footer na ficha
  agora iguais à mensagem do veículo nos três status; URLs e texto seguros,
  compartilhamento/cópia/concorrência, feedback de três segundos, Clipboard real,
  falhas/cancelamentos e APIs ausentes. Sem conversa aberta ou mensagem enviada.
- QA específico de **cinco páginas × 360/390/768/1440 px**: sem overflow; todos
  os links de WhatsApp mantêm o número cadastrado, um parâmetro `text` preenchido
  e `noopener noreferrer`. Explorar tem fundo navy/ativo azul e respeita os limites
  do feed/barra; localização tem botão verde. Menu com cinco destinos.
- Contato pelo menu da Home abre a seção do formulário, com foco e rolagem suave
  abaixo do header; reabrir indica a seção ativa. Na própria página, o atalho
  preserva o documento e volta ao formulário sem recarga. Explorar → Contato
  em 390×640 mantém menu dentro da tela; movimento reduzido usa rolagem instantânea.
- Capturas mobile/desktop da barra, contato verde e menu revisadas visualmente,
  em `vertice-captures-contexto-nav-11-10`, no diretório temporário do Windows.
  Nenhum erro de console/imports ou arquivo local ausente nos QA concluídos.

Os cinco hashes protegidos continuam idênticos. Sem escrita em banco/RLS/Storage,
envio de mensagem ou deploy. Chrome isolado encerrado; Live Server mantido.
Mobile emulado em Chrome; aparelhos físicos, Safari e leitor de tela não verificados.
**Etapa 7 em revisão; Etapa 8 não iniciada.**
