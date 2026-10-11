# Vértice Motors — Showroom Digital Automotivo

Showroom para uma concessionária, com prioridade na experiência mobile.
HTML5, CSS3 e JavaScript Vanilla em ES Modules, sem build, npm ou backend próprio.
Dados e fotografias usam a API REST e o Storage do Supabase, via `fetch` nativo.

## Estado atual

**Etapas 4, 5 e 6 aprovadas. Etapa 7 implementada, aguardando revisão.**

O ponto de retomada e os limites da próxima etapa estão em
[CONTINUIDADE.md](CONTINUIDADE.md).

A fundação tem quatro páginas semânticas em `pt-BR`, navegação por teclado,
foco visível, identidade fictícia e estilos compartilhados. Home, estoque e
detalhes usam base clara; Explorar usa base escura. WhatsApp e localização
informados pelo responsável; Instagram ainda aguarda o endereço oficial.

A Etapa 2 acrescenta SQL para tabelas, RLS e bucket, dados fictícios opcionais,
consultas limitadas e tratamento de erros/cancelamento. A configuração pública
foi preenchida pelo responsável pelo projeto. Os resultados reais das
verificações estão em [VALIDACAO.md](VALIDACAO.md).

Home e estoque estão conectados às consultas reais e aos componentes existentes.
A Home tem apresentação curta e busca direta por marca/modelo/versão, que abre o
estoque com o termo preenchido. Mostra apenas até seis veículos em destaque.
Novidades foi removida da Home, do menu e do rodapé; não há carregamento dessa seleção.
O estoque usa título compacto e área de filtros com controles nativos; oferece
busca, filtros, ordenação e lotes de 12 com “Carregar mais”. A ordem padrão é
menor preço, seguida de maior preço e recém-adicionados no seletor. Escolhas
explícitas continuam na URL, inclusive `ordenacao=recentes`. Após buscar pela
Home ou pelo Estoque, a página rola suavemente até os carros carregados. Digitação
mantém foco no campo; envio do formulário foca o título dos resultados. Buscas
inválidas ficam no formulário, respostas antigas não rolam a página e carregar
mais preserva a posição. Movimento reduzido usa rolagem instantânea.
Busca textual exige um termo: campos vazios, só espaços ou sem letras/números
não geram busca. No Estoque, filtros e ordenação continuam independentes da
busca textual; Limpar filtros restaura todos os carros. Enter no campo de busca
exige texto, e enviar o formulário sem termo nem critérios mostra orientação,
preservando os carros e a paginação já carregados.
Explorar apresenta
um veículo por tela em feed vertical, com gesto, roda do mouse, botões e setas
do teclado. O feed começa no topo, sem cabeçalho de logo/contato, com menu
inferior também no desktop e setas discretas. A ficha completa de detalhes
está conectada, incluindo disponibilidade, descrição, equipamentos e semelhantes.

A Etapa 3 refinou tipografia, botões e navegação, com barra inferior no mobile.
Cards, ícones e estados de carregamento/vazio/erro estão prontos para reutilizar.
Confira [DESIGN.md](DESIGN.md) e a
[prévia local de componentes](http://127.0.0.1:5500/tests/componentes.html),
que usa dados fictícios locais e permite revisar os dois temas.

## Abrir a prévia local

1. Abra esta pasta no VS Code: **Arquivo → Abrir Pasta**.
2. Use a extensão **Live Server**, já instalada neste ambiente.
3. Clique com o botão direito em `index.html` → **Open with Live Server**, ou
   clique em **Go Live** na barra de status.
4. Acesse `http://127.0.0.1:5500/index.html`.
5. Para encerrar, clique na indicação de porta do Live Server.

`.vscode/settings.json` define o endereço local `127.0.0.1` e a porta `5500`.
Se a porta estiver ocupada, use a prévia já aberta ou altere a porta e a URL.
Abra por **HTTP**: `file://` não é adequado para os imports de ES Modules.
Não é necessário instalar Node.js para abrir ou desenvolver o site.

| Página | Endereço local |
| --- | --- |
| Home | `http://127.0.0.1:5500/index.html` |
| Estoque | `http://127.0.0.1:5500/estoque.html` |
| Explorar | `http://127.0.0.1:5500/explorar.html` |
| Detalhes | `http://127.0.0.1:5500/veiculo.html?carro=demo-corolla-xei-2022-001` |
| Localização e contato | `http://127.0.0.1:5500/localizacao.html` |

O menu principal tem Início, Estoque e Explorar. Detalhes é acessado pelo link
individual de cada card. O parâmetro `carro` abre a ficha completa, incluindo
galeria, preço, disponibilidade, descrição, equipamentos e semelhantes.

As cinco páginas têm menu hambúrguer de três traços com ícones e descrições: Início,
Estoque, Explorar, Localização e Contato, atalho para Destaques e WhatsApp.
No celular, desliza pela lateral direita e ocupa a altura da tela. A partir de
768 px, mantém o painel compacto próximo ao botão, conforme a revisão aprovada.
Fecha com
animação pelo botão, Escape ou toque fora; indica a página/seção atual. No
Explorar, o botão continua na faixa de controles do feed. Home, estoque,
detalhes e localização compartilham o rodapé institucional.

Localização é acessada apenas pelo menu e rodapé; a navegação principal mantém
Início, Estoque e Explorar. A Home não contém mapa nem seção de localização.
As seções usam rolagem suave com foco no destino e URL/histórico preservados.
Nas cinco páginas no mobile, a navegação tem cápsula flutuante acima da borda inferior,
com três destinos e destaque azul. No desktop, a navegação dos headers usa
cápsula discreta; marca e contato têm resposta visual suave. Os traços do menu
têm 2 px de espessura e espaçamento de 4 px. No Explorar, a cápsula flutuante
permanece também no desktop; o feed reserva espaço para não cobrir seus controles.
Localização e contato reúne atendimento direto, CTA de test drive e formulário
para preparar a conversa pelo WhatsApp. No desktop, introdução/CTA e formulário
ficam lado a lado; no celular são empilhados. A área de visita abaixo reúne
endereço, rota/agendamento e mapa: endereço acima no celular, mapa à esquerda
no desktop. Header, navegação e rodapé existentes foram preservados.
Selecionar a página atual retorna ao conteúdo sem recarregar; páginas têm fade
de entrada e links/botões com resposta suave. A preferência por movimento
reduzido desativa animações e suavidade da rolagem. Links HTML seguem funcionais.

## Configuração

Edite [js/config.js](js/config.js). Seu conteúdo é público no navegador.

| Campo | Conteúdo |
| --- | --- |
| `loja.nome` | Nome da marca, rodapé e títulos das páginas. |
| `loja.descricao` | Descrição curta do rodapé. |
| `loja.logo` | Caminho da marca relativo às páginas HTML. |
| `loja.whatsapp` | String brasileira com DDI `55`, DDD e número, somente dígitos. |
| `loja.endereco` | Endereço oficial em texto. |
| `loja.localizacaoUrl` | Link HTTPS para a localização. |
| `loja.mapaEmbedUrl` | Somente o URL `src` de “Incorporar um mapa” do Google Maps (`https://www.google.com/maps/embed?pb=…`), sem o HTML do iframe. |
| `loja.instagramUrl` | Link HTTPS para o Instagram. |
| `supabase.url` | URL base HTTPS do projeto, sem `/rest/v1`, query ou fragmento. |
| `supabase.publishableKey` | Exclusivamente chave pública `sb_publishable_…`. |
| `supabase.bucket` | `veiculos`, igual ao nome definido em `schema.sql`. |

Nunca coloque chave `secret`, `service_role`, senha do banco ou dados privados
nestes arquivos. A chave pública identifica o aplicativo; permissões e RLS
definem o acesso aos dados. O cliente rejeita chaves de outros formatos.

Sem WhatsApp válido, permanece **Contato em breve**. Com um número válido,
aparece um link `wa.me` com mensagem breve conforme a página e o acesso; isso não verifica a existência da conta.
O contato informado é **+55 (81) 99336-9736**, configurado como `5581993369736`.
Links de mapa/Instagram ausentes ou fora de HTTPS ficam ocultos. A ficha oferece
WhatsApp com mensagem específica, compartilhamento nativo e cópia do link.

O formulário tem nome, assunto, veículo opcional e mensagem. Ao escolher visita
ou test drive, mostra dia de preferência opcional. Agendar test drive seleciona
esse assunto e rola ao formulário, preservando o que já foi escrito. Campos
obrigatórios, tamanhos, assunto e data são validados. O botão Continuar no WhatsApp
prepara um GET nativo para o número cadastrado, em nova aba com proteção do opener.
Só o texto da mensagem é enviado como parâmetro; o usuário confirma o envio no
WhatsApp. Não há envio de email, reserva automática, coleta em banco ou servidor
de mensagens. Sem JavaScript, links diretos de contato e mapa continuam disponíveis.

A página `localizacao.html` apresenta endereço, mapa interativo, “Como chegar”
e WhatsApp para agendar visita/test drive. O ponto foi conferido no link enviado:
[Detroit Veículos, Caruaru](https://share.google/Xnrqm8YwgTy9JIsH1), Rua Visconde
de Inhaúma, 451. A identidade atual Vértice Motors e o telefone informado foram
preservados. O iframe usa carregamento lazy, título acessível e somente o host
HTTPS exato do Google Maps; endereço/embed ausentes têm fallback. Não requer SDK
ou chave de API. O rodapé institucional nas quatro páginas com rolagem usa os mesmos
dados, com links para o mapa e o WhatsApp. Contato direto do header aparece a partir
de 1024 px; em telas menores, está no menu e no rodapé. Explorar mantém tela cheia.

Cores, fontes e espaços estão em `css/global.css`. A classe `theme-dark` muda
as superfícies para Explorar. Revise os metadados de cada HTML quando trocar
pela identidade oficial.

## Preparar o Supabase

Siga [supabase/README.md](supabase/README.md) no projeto **CARROS**. Ele contém
a ordem de execução dos scripts, upload de imagens de teste e cadastro manual.

1. Revise e execute `supabase/schema.sql` uma vez no SQL Editor.
2. Execute `supabase/validar.sql`: as verificações usam uma transação revertida.
3. Opcionalmente, execute `supabase/seed.sql` e envie os três PNGs de demonstração.
4. Valide a leitura pela API com a configuração pública já preenchida.

O primeiro script falha e desfaz a transação se já existirem as tabelas ou o
bucket com os mesmos nomes. Não é um script de atualização de banco existente.
O responsável executou `schema.sql` no projeto CARROS e informou sucesso.
As duas tabelas e as consultas já respondem HTTP 200 pela API. O responsável
também informou sucesso em `validar.sql` e a execução de `seed.sql`. As
consultas reais com anúncios fictícios passaram. Os três PNGs enviados foram
conferidos por download e no navegador. A API recusou inserção, alteração e
exclusão nas duas tabelas com a chave pública, e o Storage recusou o upload
público de teste. Consulte os procedimentos e limites em `VALIDACAO.md`.

## Organização e responsabilidades

```text
.
├── index.html / estoque.html / explorar.html / veiculo.html
├── css/
│   ├── global.css
│   ├── components.css
│   └── pages/                 # Um CSS por página
├── js/
│   ├── config.js              # Identidade, contatos e configuração pública
│   ├── supabase.js            # GET, erros, cancelamento e URL das fotografias
│   ├── veiculos.js            # Consultas de veículos, filtros e paginação
│   ├── formatters.js          # Valores em reais, km, anos e câmbio
│   ├── components/            # Layout, cards, galeria, ícones e estados
│   ├── gallery-images.js     # Ordenação e remoção de fotos duplicadas
│   ├── vehicle-links.js      # WhatsApp e link individual seguro para compartilhar
│   ├── catalogo-url.js        # Validação e persistência dos filtros na URL
│   ├── explore-queue.js       # Metadados por lote, posição, cancelamento e fim
│   ├── explore-gesture.js     # Reconhecimento de deslocamentos horizontais
│   ├── explore-vertical-gesture.js # Gesto vertical entre veículos
│   └── pages/                 # Quatro páginas conectadas, incluindo ficha completa
├── assets/
│   ├── icons/                 # Favicon e sprite SVG compartilhado
│   └── images/
│       ├── marca.svg
│       └── demo/              # PNGs identificados como demonstração
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   ├── validar.sql
│   └── README.md
├── tests/                     # Testes de dados e prévia local de componentes
├── .vscode/settings.json
├── README.md
├── CONTINUIDADE.md
├── DESIGN.md
└── VALIDACAO.md
```

A navegação e o conteúdo inicial permanecem no HTML para funcionar mesmo
sem JavaScript. Os dados da API são objetos/texto; os componentes futuros
devem renderizar descrições com `textContent`, sem interpretar HTML do banco.

## Usar a camada de dados

Em um módulo de página, depois da configuração do banco:

```js
import { listarVeiculos, buscarVeiculoPorSlug } from "../veiculos.js";

const controller = new AbortController();
const lote = await listarVeiculos({
  filtros: { busca: "Toyota Corolla", precoMax: 160000, cambio: "cvt" },
  ordenacao: "menor_preco",
  offset: 0,
  signal: controller.signal,
});
// lote: { veiculos: [...até 12], temMais, proximoOffset }

const slug = new URLSearchParams(location.search).get("carro");
const veiculo = await buscarVeiculoPorSlug(slug);
// null para slug ausente/inválido ou anúncio não encontrado/publicado.
```

| Função | Comportamento |
| --- | --- |
| `listarVeiculos` | Até 12 itens, consulta um adicional para determinar `temMais`. |
| `listarDestaques` | Até seis destaques, recentes primeiro. |
| `listarRecentes` | Até seis anúncios recentes. |
| `listarExplorar` | Quatro itens por lote e um adicional; somente capa. |
| `listarImagensDoVeiculo` | Metadados de fotos por UUID validado, ordenados; acesso conforme RLS. |
| `buscarGaleriaPorSlug` | Identidade e metadados das fotos de um slug publicado; sem ficha completa. |
| `buscarVeiculoPorSlug` | Um publicado, incluindo reservado/vendido, com metadados de todas as imagens. |
| `listarSemelhantes` | Até quatro da mesma categoria, excluindo o anúncio atual e vendidos. |

Todas as listas incluem disponíveis e reservados, com desempate pelo UUID.
Galerias não vêm nas listas: o relacionamento de capa é limitado a uma imagem.
Nos cards, a galeria consulta os metadados ao primeiro swipe ou uso das setas.
O módulo cria URLs das fotos, mas não faz download ou pré-carregamento delas.

Filtros: `busca`, `precoMin`, `precoMax`, `anoMin`, `anoMax`, `cambio`,
`categoria`, `kmMax`. Anos usam **ano-modelo**. Números aceitam valores numéricos
ou strings com ponto decimal, sem formatação de moeda. Ordenações: `recentes`,
`menor_preco`, `maior_preco`. A busca usa palavras de até 100 caracteres no total:
cada palavra deve ocorrer em marca, modelo ou versão. Pontuação é tratada como
separação; a gramática de filtros não recebe texto bruto do visitante.

Filtros inválidos geram `TypeError` antes da consulta. Falhas de conexão,
permissões, HTTP ou resposta geram `SupabaseError`, com `code` e `status`.
Uma resposta vazia é um resultado válido e permanece distinta de falha.
Há prazo de 12 segundos e suporte a `AbortSignal`; cancelamento gera `AbortError`.
Busca e campos numéricos aguardam 300 ms após a digitação; selects aplicam
imediatamente. Alterações cancelam a consulta anterior e reiniciam a paginação.
Busca, filtros e ordenação ficam na URL; voltar/avançar restaura o formulário.
Endereços com parâmetros inválidos são normalizados com aviso. Valores inválidos
digitados no formulário exibem orientação antes de consultar o banco.
Falha ao carregar mais preserva os cards existentes e permite repetir o lote.

## Verificações e próximas etapas

Explorar carrega quatro metadados por lote e renderiza somente o card atual.
Antes de interagir nas fotos, somente a capa do próximo veículo é antecipada.
O primeiro gesto/seta nas fotos interrompe essa antecipação e passa a antecipar
apenas a próxima foto do veículo atual. Com economia de dados informada pelo
navegador, as antecipações são desativadas. O próximo lote é
consultado ao avançar além dos quatro já recebidos. Anterior reutiliza os
metadados locais. No fim da seleção, é possível voltar ou explorar novamente.

Deslizar para cima avança e para baixo volta; as setas ↑/↓, PageUp/PageDown,
roda do mouse e botões oferecem as mesmas ações. O feed ocupa a altura disponível,
com foto inteira sobre fundo desfocado, informações e acesso a detalhes.
Textos extensos têm rolagem própria, e o zoom por pinça permanece permitido.
Movimento reduzido desativa transições e o deslocamento durante o gesto. Falhas preservam o
veículo atual e permitem repetir a consulta; sair da página cancela a requisição.
O retorno pelo cache de navegação do navegador conserva a posição da seleção.

Como observação da Etapa 5, as quatro páginas têm swipe lateral de fotos,
setas ←/→, contador e alternativa por teclado. A galeria reutiliza as imagens
de `veiculo_imagens`, segue `ordem`, começa pela capa e permite voltar ao início
depois da última foto. Fotos únicas ocultam as setas após a consulta; sem fotos
ou com falha, há fallback e tentativa recuperável. Trocar o veículo ou filtrar
o estoque cancela consultas da galeria removida.

O visual de detalhes foi revisado: fundo branco, título compacto, resumo com
ano/quilometragem/câmbio e ficha com separadores discretos. A galeria 4:3 preenche
o quadro sem faixas laterais, usando recorte central em fotos de outras proporções.

A Etapa 6 conecta a ficha completa ao slug: marca/modelo, versão, valor do
anúncio, código, status, ficha técnica, destaques, descrição e equipamentos.
Textos são renderizados sem HTML, e quebras de linha da descrição são preservadas.
Reservado recebe aviso; vendido permanece para consulta com aviso e acesso ao
estoque atual. Anúncio ausente/oculto ou slug inválido mostra “Veículo não
encontrado”. Falha de conexão tem erro recuperável, distinto de anúncio ausente.

Até quatro semelhantes da mesma categoria carregam separadamente, sem incluir
o atual, vendidos ou rascunhos. Falha nessa seção mantém a ficha e permite tentar
novamente só a consulta de semelhantes. Os cards reutilizam o swipe lateral.
Ao sair, consultas são canceladas; retornar pelo cache de navegação atualiza os
dados.

A Etapa 7 acrescenta WhatsApp com nome/versão, ano, código e link do veículo.
Reservado consulta reserva/alternativas; vendido consulta outras opções, sem
oferecê-lo como disponível. O contato genérico aparece nos headers existentes;
Explorar permanece sem cabeçalho ou contato.

Na ficha, o botão de três pontos ao lado do WhatsApp reúne Compartilhar e Copiar
link. O painel fecha por Escape, clique fora, saída do foco ou escolha de uma ação.
Compartilhar abre o recurso nativo do dispositivo, quando suportado, por clique
explícito. Copiar link usa a Clipboard API; falha/ausência permite selecionar e
copiar o endereço manualmente. Cancelar o compartilhamento não copia o link.
Feedback acessível e bloqueio de cliques repetidos preservam a navegação.
Confirmações de cópia/compartilhamento somem após 3 segundos; repetir uma ação
reinicia o prazo. Instruções de cópia manual e erros continuam visíveis.

Links usam o slug estável, somente o parâmetro `carro` e a base do aplicativo,
incluindo eventual subpasta. Na prévia, são endereços locais e não abrem o site
em outro aparelho. Após publicação autorizada, usarão o domínio publicado.
Nenhum envio automático, serviço de mensagens ou widget externo foi adicionado.

O site não exige ferramentas de teste para funcionar. Quem tiver Node.js 24
pode repetir os testes locais, sem dependências e sem acessar o Supabase real:

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs tests/vehicle-links.test.mjs tests/store-map.test.mjs tests/contact-message.test.mjs tests/contact-context.test.mjs
```

As verificações de banco podem ser repetidas pelo SQL Editor com `validar.sql`.
Os resultados e os limites desta entrega estão em [VALIDACAO.md](VALIDACAO.md).

A versão horizontal anterior está preservada em
[revisoes/explorar-horizontal](revisoes/explorar-horizontal/README.md), com
manifesto de hashes e script de restauração dos três arquivos do Explorar.
A restauração foi testada em pasta temporária. Essa pasta e `tests/` devem
ficar fora de qualquer futura publicação.

A regressão de galerias é `tests/galeria-browser.mjs`, com Chrome isolado em 9337 e
Live Server em 5500. Para incluir leituras reais no PowerShell:
`$env:QA_REAL='1'; node tests/galeria-browser.mjs`.
`tests/explorar-feed-browser.mjs` registra a versão vertical anterior à galeria;
`tests/etapa5-browser.mjs` permanece para a versão horizontal guardada.

Detalhes tem QA em `tests/etapa6-browser.mjs`, com Chrome isolado em 9338:
`$env:QA_REAL='1'; node tests/etapa6-browser.mjs` inclui somente GETs reais.
`QA_PORT` permite usar outra porta de depuração; nenhum script é dependência
de execução do site. Capturas ficam no diretório temporário do Windows.

WhatsApp/compartilhamento tem QA em `tests/etapa7-browser.mjs`, com Chrome isolado
em 9340. `$env:QA_REAL='1'; node tests/etapa7-browser.mjs` inclui GETs reais.
Compartilhar usa resultados simulados e os links de WhatsApp são inspecionados,
sem abrir conversas nem enviar mensagens; a cópia real do Chrome também foi validada.

Cada etapa termina com verificação e revisão; a próxima depende de aprovação.

1. **Fundação:** entregue.
2. **Supabase:** concluída — banco, dados, imagens, permissões e conexão no navegador validados.
3. **Design System:** concluída — tipografia, navegação, cards, botões, ícones e estados.
4. **Home e catálogo:** implementada, validada e aprovada pelo responsável.
5. **Explorar:** implementada, validada e aprovada, incluindo swipe lateral nas quatro páginas.
6. **Detalhes:** implementada, validada e aprovada para continuidade.
7. **WhatsApp e compartilhamento:** implementada e validada; aguardando revisão.
8. **Qualidade e publicação:** revisão final e hospedagem estática com HTTPS.

Deploy depende de autorização específica. Prévias individuais avançadas de
compartilhamento permanecem fora do MVP.

A página de Localização e contato tem QA específico em `tests/localizacao-browser.mjs`,
com Chrome isolado em 9340 (`QA_PORT` permite outra porta). Valida layout, formulário,
CTA de test drive, datas, foco, mapa e alternativas sem JS. Intercepta o submit
antes da navegação para conferir o payload, sem abrir conversa ou enviar mensagem.
Na revisão de contato, o menu ganhou Contato, que abre `localizacao.html#contato-titulo`
com foco e rolagem no formulário. A barra flutuante do Explorar usa fundo azul escuro
com item ativo azul e texto claro; as outras páginas mantêm a barra clara.
Contato direto na localização tem destaque verde suave. Mensagens de WhatsApp
variam por página/origem; nos detalhes incluem o veículo, status e link, mantendo
os avisos de reserva/venda. Formulário e contato sem JS também têm texto preenchido.