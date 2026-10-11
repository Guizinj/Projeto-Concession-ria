# Vértice Motors — Design System

Etapa 3. HTML, CSS e componentes DOM em JavaScript Vanilla, sem bibliotecas,
fontes externas, build ou novas consultas ao Supabase.

## Direção visual

Superfícies claras, texto grafite, azul-cobalto nas ações e espaços regulares.
Explorar usa os mesmos componentes com superfícies escuras. A marca existente
é preservada. Fotos ocupam a parte superior dos cards; preço, nome e status
têm prioridade na leitura. Os PNGs da prévia são demonstrações, não fotos de carros.

Tipografia de sistema (`Segoe UI`, `system-ui` e alternativas nativas) para
evitar downloads e manter carregamento rápido. Títulos usam tamanho fluido,
entrelinha curta e peso forte; texto de apoio tem entrelinha mais confortável.

## Tokens

Tokens base ficam em `css/global.css`; `.theme-dark` sobrescreve os tokens de cor.
O menu compacto tem cores claras locais e o rodapé institucional tem cores escuras
em `components.css`, preservando as cores do restante da página.

| Grupo | Variáveis e critérios |
| --- | --- |
| Superfícies | `--color-background`, `--color-surface`, `--color-surface-soft`. |
| Texto | `--color-text`, `--color-muted`. |
| Ações | `--color-accent`, `--color-accent-hover`, `--color-accent-soft`, `--color-link`. |
| Acessibilidade | `--color-focus`, contorno de 3 px, ícones acompanhados por texto. |
| Status | `--color-success*`, `--color-warning*`, `--color-danger*`. |
| Espaços | `--space-1` a `--space-8`, de 4 a 64 px. |
| Bordas | `--radius-small`, `--radius-medium`, `--radius-large`, `--radius-pill`. |
| Estrutura | `--container-width`, `--page-gutter`, `--mobile-nav-height`. |
| Movimento | `--transition-fast`; hover leve apenas em dispositivos com ponteiro preciso. |

## Navegação e botões

Nas telas abaixo de 768 px, a navegação fica no rodapé, com três destinos:
Início, Estoque e Explorar. O corpo reserva espaço para a barra e para
`safe-area-inset-bottom`. No desktop, a mesma navegação aparece no header.
Ela está no HTML e funciona sem JavaScript. O header permanece visível ao rolar.
O Explorar mantém a navegação inferior em todas as larguras, sem header.
Nas cinco páginas no mobile, a barra é uma cápsula flutuante compartilhada, centralizada, com largura máxima
de 352 px, radius de 30 px, sombra discreta e distância de 14 px mais safe area.
O corpo reserva 96 px mais safe area para o rodapé continuar alcançável. Os três
destinos e ícones são preservados. No desktop, os headers usam navegação em
cápsula, com destaque branco/azul para a página atual. Header translúcido, desfoque
em pseudo-elemento (sem alterar o posicionamento da barra fixa), contato suave
em azul e movimento discreto da marca no hover; movimento reduzido desativa animações.
Explorar usa a mesma cápsula clara em todas as larguras, inclusive desktop;
reserva 96 px mais safe area no feed, preservando a dica e as ações acima da barra.

Detalhes deixou de ser um destino geral do menu: é acessado pelos links dos
cards. Na página de detalhes, Estoque indica a seção atual com `aria-current="true"`.
Os demais destinos usam `aria-current="page"` quando correspondem à página.

Classes dos botões: `button`, `button-primary`, `button-secondary`,
`button-outline`, `button-ghost`, `button-small`, `button-icon`.
Use `<a>` para navegar e `<button type="button">` para ações. Para desativar
uma ação, use o atributo nativo `disabled` de um botão; aparência não bloqueia
a interação de um link. Alvos interativos têm ao menos 44 px de altura.

Ícones vetoriais compartilham `assets/icons/sprite.svg`. No HTML, use um SVG
com `aria-hidden="true"`, `focusable="false"` e `<use href="…#nome">`.
Em componentes DOM, `createIcon(nome)` faz o mesmo, com caminho relativo ao módulo.

## Cards e formatação

```js
import { createVehicleCard } from "./js/components/vehicle-card.js";

const card = createVehicleCard(veiculo, { headingLevel: 3 });
document.querySelector(".vehicle-grid").append(card);
```

`veiculo` recebe os objetos da camada `js/veiculos.js`, incluindo
`imagem_capa: { url }` ou `null`. O componente não consulta o banco.

- Exibe marca/modelo, versão, fabricação/modelo, km, câmbio, preço e status.
- Um link por card, com nome acessível e `veiculo.html?carro=slug`.
- Slug inválido gera um card sem link; ele não cria endereços arbitrários.
- Disponível, reservado e vendido usam rótulos explícitos além da cor.
  O card suporta os três para revisão; as consultas de listagem continuam
  excluindo vendidos e rascunhos.
- Foto com proporção 3:2, dimensões declaradas e `decoding="async"`.
  O carregamento é `lazy` por padrão. Use `{ eager: true }` apenas quando
  fizer sentido para uma imagem já visível ao abrir a página.
- Sem foto: “Foto em breve”. Falha de download/decodificação: “Foto indisponível”.
- Campos são renderizados como texto, sem `innerHTML`. Preços usam BRL com
  centavos; km e anos não recebem formatação de moeda.
- `headingLevel` aceita 2, 3 ou 4. Escolha conforme a hierarquia da seção.

`js/formatters.js` oferece `formatPrice`, `formatMileage`, `formatYear` e
`formatTransmission` para reutilizar a mesma apresentação nas próximas páginas.
Valores ausentes/inválidos têm rótulos de consulta ou “Não informado”.

`.vehicle-grid` tem uma coluna no mobile, duas a partir de 768 px e três a
partir de 1024 px. O componente cresce com o texto, sem truncar informações.

## Estados de interface

```js
import { createLoadingGrid, createStatePanel } from "./js/components/states.js";

area.replaceChildren(createLoadingGrid({ count: 6 }));
area.replaceChildren(createStatePanel({ type: "empty" }));
area.replaceChildren(createStatePanel({ type: "error", onRetry: carregarVeiculos }));
```

Carregamento tem uma mensagem acessível e esqueletos decorativos, sem links
ou botões fictícios. `count` aceita 1 a 12. Vazio e erro são estados separados.
O erro tem `role="alert"`; vazio/carregamento têm `role="status"`.
O callback `onRetry` conecta a tentativa à consulta do módulo de página.
`heading`, `message` e `headingLevel` podem ser personalizados.

`prefers-reduced-motion: reduce` desativa transições e animações, incluindo
o pulso dos placeholders. Essas regras se aplicam aos dois temas.

## Revisar localmente

Com o Live Server aberto, acesse
`http://127.0.0.1:5500/tests/componentes.html`.

A prévia usa três fixtures locais e permite alternar claro/escuro, revisar
status, botões, carregamento, erro e ausência de resultados. “Tentar novamente”
exibe uma confirmação de teste, sem fazer requisições. Links dos cards levam
à página de detalhes, cuja ficha completa foi conectada na Etapa 6.

`tests/componentes.html`, `componentes.css` e `componentes.js` são arquivos
de revisão, sem entrada no menu público. As quatro páginas principais
permanecem na raiz. Na publicação final, exclua os arquivos de teste do pacote.

Resultados obtidos estão em [VALIDACAO.md](VALIDACAO.md). A Etapa 4 reutiliza
cards e estados na Home e no estoque, com filtros recolhíveis no mobile,
ordenação e paginação. A Etapa 5 reutiliza o card no tema escuro para Explorar,
agora em feed vertical inspirado em Reels, a pedido do usuário. Cada veículo
ocupa a tela desde o topo até a navegação inferior, sem header de logo/contato.
O menu inferior é mantido também no desktop, com o feed em toda a largura,
sem margem externa ou borda arredondada ao redor do card.
A foto principal usa `contain` para preservar o enquadramento; uma cópia
decorativa da mesma foto preenche o fundo com desfoque, usando a mesma URL.
Informações sobre uma superfície escura ficam na parte inferior. Botões ↑/↓
ficam à direita, e o acesso ao estoque permanece no topo.

Na revisão visual de 10/10/2026, as setas do Explorar usam ícones de 14 px e
alvos de toque de 44 px. Horizontais têm fundo circular de 26 px, sem contorno;
verticais compartilham uma cápsula discreta com fundo translúcido. Foco por
teclado continua visível. O contador de fotos fica centralizado no final da
área da imagem, separado dos controles verticais. As regras estão somente em
`css/pages/explorar.css`; a aparência das galerias nas outras páginas é mantida.

Gesto vertical, roda do mouse, botões e teclado navegam entre veículos. A
transição acompanha o sentido e oferece deslocamento leve durante o arrasto;
movimento reduzido desativa esses efeitos. Uma ficha extensa pode rolar
internamente. A versão horizontal anterior está guardada em
`revisoes/explorar-horizontal/` para restauração. A ficha completa de detalhes
foi implementada na Etapa 6.

Como observação da Etapa 5, `createPhotoGallery` é compartilhada pela Home,
estoque, Explorar e base de detalhes. Nos cards, use a opção `gallery` de
`createVehicleCard`, com `loadImages` para consultar metadados no primeiro
gesto/seta. A opção é explícita para manter compatibilidade com a versão
horizontal guardada. Ao remover cards, chame `disposePhotoGalleries` antes de
substituir o conteúdo: a consulta pendente é cancelada e o preload é liberado.

Swipe lateral e ←/→ trocam fotos; no Explorar, swipe vertical e ↑/↓ continuam
trocando veículos. Cada eixo tem reconhecimento próprio, sem abrir detalhes
durante o arrasto. Um toque intencional na foto ou nas informações abre o link.
Botões de fotos têm 44 px, ficam fora dos links, e o grupo recebe foco por teclado.
Contador anuncia mudanças após a interação. A ordem vem de `ordem`, começando
pela capa, com navegação circular. Fotos únicas escondem controles; falhas têm
fallback ou retry. A animação lateral respeita movimento reduzido.

Só a foto atual e a seguinte são carregadas após a consulta da galeria, sem
baixar todas as imagens. Economia de dados impede antecipações. No Explorar,
interagir com a galeria interrompe a antecipação da capa do próximo veículo.
A página de detalhes usa galeria 4:3 com `cover` desde a revisão de 11/10/2026,
preenchendo o quadro com recorte central quando necessário. Desde a Etapa 6,
consulta a ficha completa e galeria de um anúncio publicado.

## Etapa 6 — Detalhes

`createVehicleDetails` compõe galeria, preço/status, ficha, descrição e opcionais.
No mobile, a foto vem antes do resumo. No desktop, foto e resumo ficam lado a
lado; ficha e descrição/equipamentos formam duas colunas abaixo. O `h1` contém
marca/modelo e o subtítulo contém a versão. O título do documento é específico.

Superfícies e tokens compartilhados preservam o tema claro. Status usa o badge
existente e, em reservado/vendido, um aviso textual próprio. O preço aparece
como “Valor do anúncio”; vendido oferece “Ver estoque atual”. Contato permanece
no header conforme a configuração; ações por veículo foram acrescentadas na Etapa 7.

A ficha usa `dl` para dez campos, incluindo combustível e categoria com rótulos
em português. Descrição mantém quebras de linha com `white-space: pre-line`,
sem interpretar HTML. Equipamentos/destaques usam listas de texto; entradas
vazias, inválidas e duplicadas são descartadas. Campos ausentes têm fallback.

Semelhantes usam até quatro cards, com galeria sob demanda e `headingLevel: 3`.
Carregamento/erro/vazio da seção são independentes da ficha. Retentar mantém a
galeria principal e move foco para o título estável da seção. Na falha inicial,
o retry oferece foco no `h1`. Anúncio ausente mostra “Veículo não encontrado”
com link para o estoque. Consultas abortadas não aparecem como erros.

## Etapa 7 — WhatsApp e compartilhamento

O resumo da ficha usa WhatsApp como ação principal, com o botão azul e ícone
local de conversa. Reservado usa “Consultar reserva”; vendido usa “Consultar
outras opções”. O acesso ao estoque permanece logo abaixo, como link de texto.
Os avisos de status continuam visíveis antes das ações.

Compartilhar e Copiar link ficam no painel do botão de três pontos ao lado do
WhatsApp. O botão tem nome acessível, `aria-expanded` e `aria-controls`;
painel fechado por padrão, com ícones locais e alvos mínimos de 44 px.
Compartilhar aparece quando a API nativa aceita o conteúdo. Copiar
continua disponível; quando a cópia automática não funciona, um campo somente
leitura recebe foco e seleção do endereço. Feedback usa `role="status"` sem
alertas bloqueantes. Durante cada ação, os dois botões impedem cliques repetidos.
Confirmações de sucesso somem após 3 segundos, removendo o espaço do feedback;
uma nova ação reinicia o prazo. Erros/instruções de cópia manual permanecem.

O painel fecha por Escape (devolve foco ao botão), clique fora, saída do foco
ou escolha de ação. Abre acima quando falta espaço abaixo da navegação flutuante.
Animação discreta de 160 ms respeita movimento reduzido. Chamadas nativas continuam
no clique, antes de qualquer espera; timers e listeners são descartados ao sair.

Componentes usam os tokens e ícones existentes; nenhuma mudança no feed ou nas
galerias. Home, estoque e ficha ativam o contato genérico já previsto no header.
Explorar continua sem header/logo/contato, conforme a revisão aprovada.

Na revisão atual, `localizacao.html` usa título “Localização” e introdução curta.
Endereço, Traçar rota, Agendar visita e mapa fazem parte de um único conjunto com
borda fina e radius de 16 px. Texto antes do mapa no mobile; mapa maior à esquerda
e endereço à direita no desktop. Endereço em destaque, rótulo discreto com ícone
de pin e orientação de test drive separada por linha. Altura do mapa de 384 px no
mobile e mínima de 480 px no desktop; título acessível e configuração preservada.

## Revisão da Etapa 7 — menu e rodapé institucional

Menu hambúrguer com três traços iguais, radius de 14 px e alvo de 46 px (44 px
no Explorar). No desktop a partir de 1024 px, também tem rótulo “Menu”. No header,
acompanha a marca; no feed, fica ao lado de Ver estoque, mantendo tela cheia.
Traços com espessura inteira de 2 px, em grid de três linhas e intervalos de 4 px,
evitando o desalinhamento visual das medidas fracionárias anteriores.

O painel é um `dialog` modal claro. No celular, ocupa a altura da tela e desliza
pela lateral direita: largura máxima de 368 px, espaço externo mínimo de 40 px,
cantos esquerdos de 20 px, abertura de 320 ms e fechamento de 240 ms. O contato
fica no fim da gaveta; o conteúdo rola em telas baixas. A partir de 768 px, mantém
o painel compacto aprovado: largura máxima de 400 px, radius de 24 px, próximo
ao header, abertura de 260 ms e fechamento de 160 ms. Fundo desfocado.
Quatro destinos com ícones, rótulos e descrições curtas; atalho de
Destaques ocupando a linha e WhatsApp discreto no fim. Página/seção atual
destacada em azul. Conteúdo rola internamente em telas baixas; fechar fica no topo.
Escape, botão e toque fora fecham; foco inicial no fechar, fundo inativo e retorno
do foco ao botão. A navegação espera o fechamento e evita cliques concorrentes.

Seções rolam suavemente com foco no título e URL/histórico preservados. Selecionar
a página atual volta ao conteúdo sem recarregar. Entrada do conteúdo com fade
CSS de 320 ms, hover/toque suaves nos links e botões. Movimento reduzido desativa
animações/rolagem suave. O link Pular para o conteúdo é imediato. Links HTML
permanecem como base da navegação, sem roteador ou dependência de API de transições.

Rodapé institucional escuro na Home, estoque, detalhes e localização: marca/descrição,
navegação e visita/contato. Uma coluna no mobile, duas a partir de 480 px e três
a partir de 1024 px. Links com alvos de 44 px, endereço em `address` e base com
copyright/ano automático. Usa logo, ícones, espaços e contatos existentes;
Instagram fica oculto enquanto não houver URL. A localização tem página própria,
acessível apenas pelo menu e rodapé. A Home não tem seção nem iframe de mapa.
Na localização, cartão de endereço/agendamento e mapa empilhados no mobile e
lado a lado a partir de 768 px. Mapa com altura mínima de 384 px no mobile e
480 px no desktop, título acessível e carregamento lazy. Explorar mantém o rodapé
oculto. Configuração e Supabase preservados.

## Revisão de 11/10/2026 — Home e Estoque

Home com título direto, texto curto e links de estoque/exploração. Busca nativa
GET, com ícones existentes, envia `busca` ao Estoque sem nova consulta ou módulo.
Introdução e busca lado a lado a partir de 768 px; empilhadas no celular.
Destaques tem título curto, separação por espaço e cards existentes. A seção
Novidades e seus atalhos foram removidos; os demais carros são consultados no Estoque.
Fundo branco, bordas finas e radius de 14 px nos cards dessas duas páginas.

Estoque com título compacto, acesso discreto ao Explorar e formulário em fundo
cinza claro. Busca e ordenação lado a lado no desktop; filtros adicionais no
`details` nativo, com indicador de abertura. Aplicar filtros usa grafite; limpeza
é uma ação de texto. Componentes de consultas, paginação e galerias preservados.
Na revisão seguinte, o padrão do catálogo passou a menor preço; maior preço e
recém-adicionados vêm depois no seletor. URLs explícitas continuam compartilháveis.
Buscar pela Home ou pelo Estoque revela suavemente o título dos resultados após
renderizar carros/vazio/erro. Envio do formulário foca esse título; a digitação
automática preserva o campo. Busca inválida, resposta cancelada, paginação e
restauração do histórico não provocam nova rolagem automática. Movimento reduzido
usa rolagem instantânea. Busca textual vazia ou com espaços é bloqueada na Home
e no Estoque. Home usa `required`, padrão de texto não vazio e validação de letras/números.
No Estoque, Enter no campo exige termo; o botão Aplicar filtros permite critérios
sem busca textual. Envio sem termo nem filtros mostra orientação, sem consulta
ou rolagem e preservando os carros/paginação. Limpar filtros restaura o catálogo.

## Revisão de 11/10/2026 — Página do veículo

Fundo branco e título compacto, sem chamada genérica sobre o nome do carro.
Galeria 4:3 com cantos de 14 px; `cover` elimina as faixas laterais e mantém
recorte central para fotos de outras proporções. A dica de swipe aparece só
com várias imagens. Componente, controles e carregamento gradual preservados.
Resumo com borda fina, preço, três colunas de ano/quilometragem/câmbio, status
e código. Destaques/opcionais usam listas discretas com marcação azul. Ficha,
descrição e equipamentos ficam separados por espaço/regras, sem cartões em
cada seção. Resumo abaixo da foto no celular e ao lado a partir de 1024 px.
Semelhantes, avisos e dados ausentes mantêm os estados existentes.