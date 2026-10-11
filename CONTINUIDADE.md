# Continuidade — Showroom Digital Automotivo

Atualizado em **11/10/2026**, após ajustar a navegação do Explorar, as mensagens do WhatsApp e o acesso Contato na Etapa 7.

## Ponto de retomada

**Etapas 4, 5 e 6 aprovadas para continuidade. Etapa 7 implementada, validada e aguardando revisão.**
Em 10/10/2026, o usuário autorizou seguir para a Etapa 7 e informou o contato
`81993369736`, cadastrado como `5581993369736` (+55 81 99336-9736).
Não iniciar a Etapa 8 sem aprovação. Nenhum deploy foi realizado.

**Revisão mais recente — quatro ajustes:** navegação flutuante do Explorar em
azul escuro (#121722), com item ativo azul (#2454d6) e texto claro, no celular
e desktop. Demais barras preservadas. Contato direto na localização usa verde
suave, com texto/ícone escuros para legibilidade. Menu agora tem cinco destinos,
incluindo Contato → `localizacao.html#contato-titulo`, com indicação de seção
ativa, rolagem/foco no formulário tanto na mesma página quanto ao chegar de outra.

`js/contact-context.js` centraliza mensagens breves para cabeçalho, menu,
rodapé, contato direto e visita, conforme página/origem. Na ficha carregada,
esses acessos reutilizam a mensagem do anúncio com identidade, status e URL.
O formulário mantém a mensagem personalizada; o contato sem JS também tem
texto preenchido. Usuário confirma o envio no WhatsApp; nenhuma mensagem foi
enviada durante a implementação. Textos ajustados pelo usuário, incluindo
“Fale Conosco.”, foram preservados.

31 testes locais, sintaxe dos 29 JS, regressões completas de Localização e
Etapa 7, mais QA de cinco páginas × quatro larguras passaram. Contato entre
páginas/na mesma página, foco, seção ativa, tela curta e movimento reduzido
conferidos. Capturas temporárias em `vertice-captures-contexto-nav-11-10`.
Configuração/cliente GET/consultas/fila/schema conservam os hashes; banco,
RLS e Storage preservados. Chrome isolado encerrado; Live Server mantido.
Etapa 7 em revisão, sem Etapa 8/deploy. Mobile emulado em Chrome.

**Revisão anterior — Localização e contato:** a pedido do usuário, somente
a página `localizacao.html` foi reformulada. Introdução/WhatsApp e CTA de test
drive ao lado do formulário no desktop; conteúdo empilhado no celular. A área
de visita abaixo reúne endereço, mapa, rota e agendamento direto. Header,
navegação flutuante, menu/rodapé existentes e demais páginas preservados.

Formulário funcional com nome, assunto, veículo opcional e mensagem. Visita/test
drive revelam dia de preferência opcional, limitado a hoje ou depois. CTA de
test drive seleciona o assunto, prepara uma mensagem inicial se o campo estiver
vazio e rola suavemente ao formulário, sem apagar rascunhos. O formulário faz
GET nativo para o WhatsApp validado, em nova aba com `noopener noreferrer`,
enviando só o parâmetro `text`. Usuário confere/confirma o envio no WhatsApp;
não representa reserva confirmada. Sem email inventado, serviço de envio,
armazenamento de contatos, consultas ao estoque ou novas credenciais.
Nome/mensagem vazios e tamanhos/assuntos/datas inválidos são bloqueados.
Formulário oculto até inicializar; sem JS há links de contato e mapa funcionais.

29 testes locais, sintaxe dos 28 JS e QA específico `tests/localizacao-browser.mjs`
passaram em 360/390/768/1440 px e tela curta 390×640. Verificados formulário,
payload (submit interceptado, sem conversa ou mensagem enviada), teclado/foco,
rolagem suave/movimento reduzido, retorno pelo cache, mapa/fallback e sem JS.
Capturas temporárias: `vertice-captures-localizacao-contato-11-10`, revisadas.
Hashes dos cinco arquivos protegidos idênticos. Chrome isolado encerrado;
Live Server mantido. Etapa 7 aguarda revisão desta página; sem deploy/Etapa 8.

**Revisão aprovada — página do veículo:** `veiculo.html` segue o visual
direto da Home/Estoque: fundo branco, título compacto, galeria em destaque,
resumo com ano/quilometragem/câmbio e ficha sem cartões em cada seção. Fotos
usam proporção 4:3 e `object-fit: cover`, eliminando faixas laterais; imagens
com outra proporção podem receber recorte central. A dica de swipe aparece
apenas com várias fotos. Compartilhar/Copiar link ficam num menu de três pontos
ao lado do WhatsApp, fechado inicialmente, com nome acessível, Escape,
clique fora e saída por Tab. Escolher uma ação fecha o menu e devolve foco ao
botão; a cópia manual mantém foco no campo. Se faltar espaço abaixo, abre acima.
Feedback de sucesso continua com prazo de três segundos. Avisos de status,
ficha completa, semelhantes, segurança dos textos/URLs e consultas preservados.

Validação desta revisão: 26 testes locais, sintaxe dos 27 JS e regressões completas
de detalhes/Etapa 7 passaram. QA visual/funcional em 360/390/768/1440 px,
tela curta 390×640, teclado/foco, movimento reduzido e dados públicos reais
(HB20 e Onix do print), somente GET. Capturas temporárias em
`vertice-captures-veiculo-revisao-11-10`. Hashes dos cinco arquivos protegidos
idênticos. Chrome isolado encerrado; Live Server mantido. Mobile emulado em
Chrome; aparelhos físicos/Safari/leitor de tela não verificados. Etapa 7 em revisão.

A Home apresenta apenas até seis destaques do Supabase. Novidades e seus atalhos
foram removidos; os demais veículos são consultados no Estoque. O estoque
tem busca com atraso de 300 ms, filtros, ordenação, URL compartilhável e paginação
12 + 2 nos dados fictícios atuais. Cards e estados reutilizam a Etapa 3.
Configuração do Supabase, tabelas e Storage foram preservados. Dados públicos
de WhatsApp e localização preenchidos na Etapa 7; Instagram continua pendente.
Explorar foi revisado a pedido do usuário para um **feed vertical inspirado em
Reels**, com um veículo por tela: deslizar para cima avança, para baixo volta.
Botões ↑/↓, roda do mouse e setas ↑/↓/PageUp/PageDown oferecem alternativas.
Foto principal inteira sobre fundo desfocado; informações sobre faixa escura.
Lotes de quatro metadados e antecipação da capa do próximo veículo, sem cards
ocultos. Inclui fim da seleção, reiniciar, erro recuperável e cancelamento.

**Ajuste visual solicitado em 10/10/2026:** Explorar não tem mais o cabeçalho de
logo/contato. O card ocupa toda a largura e começa no topo da tela, até o menu
inferior, mantido também no desktop. Setas têm ícones de 14 px, bordas removidas
e fundos discretos, preservando alvos de toque de 44 px. O contador de fotos
fica centralizado, sem sobrepor os botões verticais. Foto inteira, fundo
desfocado, gestos, teclado e consultas foram mantidos. Alteração restrita ao
HTML/CSS do Explorar; Home, estoque, detalhes e Supabase preservados.
A regressão de galerias passou nas quatro larguras; anúncio/fotos reais também
foram conferidos em mobile de 640/670 px de altura. Esse ajuste foi entregue
durante a revisão da Etapa 6. O backup horizontal não foi substituído.

**Observação da Etapa 5 implementada:** Home, estoque, Explorar e a base de
detalhes usam a mesma galeria com swipe lateral, botões ←/→ e teclado ←/→.
As fotos seguem `ordem` e a exibição começa pela capa; navegação circular,
contador, fallback e nova tentativa. Nos cards, a consulta dos metadados das
fotos acontece no primeiro gesto/seta, uma vez por instância. A galeria só
antecipará a próxima foto; ao interagir no Explorar, a antecipação da capa do
próximo veículo é interrompida. Economia de dados desativa as antecipações.
Na entrega dessa observação, a base de detalhes consultava só identidade e
metadados das fotos com `buscarGaleriaPorSlug`. A Etapa 6 agora usa a consulta
completa abaixo. Não houve mudanças de configuração, banco, RLS ou Storage.
O JPG já cadastrado foi confirmado por GET.

**Etapa 6 entregue:** `veiculo.html?carro=slug` usa `buscarVeiculoPorSlug` para
mostrar nome/versão, preço do anúncio, código, status, ficha técnica completa,
descrição em texto com quebras de linha, destaques, equipamentos e a galeria
compartilhada. Reservado tem aviso explícito; vendido mantém a ficha para
consulta, com aviso e acesso ao estoque atual. Slug ausente/inválido ou anúncio
inexistente/oculto mostra “Veículo não encontrado”, sem consultar semelhantes.
Semelhantes são até quatro publicados, disponíveis/reservados, da mesma
categoria, excluindo o atual. Carregam separadamente, com vazio/erro/retry,
preservando a ficha quando falham. Seus cards também têm swipe lateral.
Campos ausentes têm fallback; nenhum texto cadastrado é interpretado como HTML.
Consultas são canceladas ao sair e atualizadas ao retornar pelo cache do navegador.
Título do documento inclui veículo/versão e a marca da loja.

Validação da Etapa 4 está registrada ao final de `VALIDACAO.md`: 11 testes locais,
leitura real e automação no Chrome em 360/390/768/1440 px. Os scripts opcionais
estão em `tests/catalogo-url.test.mjs`, `tests/etapa4-real.mjs` e
`tests/etapa4-browser.mjs`. A prévia continua em `http://127.0.0.1:5500`.

Validação da Etapa 5 registrada ao final de `VALIDACAO.md`: **16 testes locais**,
quatro larguras, leitura dos 14 veículos e testes de gesto, teclado, erro,
concorrência, cancelamento, carregamento de fotos e renderização segura.
Arquivos novos: `js/explore-queue.js`, `js/explore-gesture.js`,
`tests/explorar.test.mjs` e `tests/etapa5-browser.mjs`. O último requer Chrome
isolado com depuração local em 9335; não é dependência do site.
Supabase, schema, permissões e configuração foram preservados.

**Versão atual do Explorar: vertical.** A revisão acrescentou
`js/explore-vertical-gesture.js`, `tests/explorar-vertical.test.mjs` e
`tests/explorar-feed-browser.mjs` (Chrome isolado em 9336). Agora são **17 testes
locais**, e os testes completos do feed passaram em quatro larguras, com dados
reais, economia de dados, roda do mouse, toque, segurança e textos extensos.
O teste `tests/etapa5-browser.mjs` continua destinado à versão horizontal.
`tests/explorar-feed-browser.mjs` registra a revisão vertical anterior à galeria.
O teste `tests/galeria-browser.mjs` (Chrome isolado em 9337) cobre as
quatro páginas em quatro larguras, ambos os gestos, teclado, retorno, erros,
concorrência, cancelamento, carregamento gradual e segurança. `QA_REAL=1` inclui
somente leituras reais. São **20 testes locais** e **19 arquivos JS** com sintaxe
validada. Resultados completos no último registro de `VALIDACAO.md`.

**Validação atual da Etapa 6:** 20 testes locais e sintaxe dos **20 arquivos JS**
da aplicação passaram. `tests/etapa6-browser.mjs` (Chrome isolado em 9338)
verificou disponível/reservado/vendido em 360/390/768/1440 px, dados reais,
rascunho oculto, semelhantes, erros, concorrência, foco, cancelamento, textos
longos/maliciosos, economia de dados e navegação sem JS. A regressão completa
de `tests/galeria-browser.mjs` também passou, adaptada à ficha completa.
O novo componente é `js/components/vehicle-details.js`; foram reutilizados os
formatadores, cards, estados e galeria. Configuração, cliente GET, consultas e
schema mantiveram seus hashes. O Chrome de QA foi encerrado; Live Server mantido.
Mobile emulado; sem verificação em aparelhos físicos, Safari ou leitor de tela.

**Retorno preparado:** backup exato dos três arquivos anteriores em
`revisoes/explorar-horizontal/`, com manifesto SHA-256 e `restaurar.ps1`.
A restauração foi executada e conferida numa pasta temporária. O site atual
continua vertical. Se o usuário pedir para voltar, ler o README desse backup e
executar o script; atualizar este ponto de retomada. Supabase, fila, Home,
estoque e detalhes não são substituídos. Excluir `revisoes/` de um deploy futuro.

**Etapa 7 entregue:** WhatsApp genérico ativado nos headers existentes; Explorar
permanece sem header/contato. A ficha usa `createVehicleActions`: WhatsApp com
nome/versão, ano, código e link individual; disponível pergunta disponibilidade,
reservado consulta reserva/alternativas e vendido consulta outros veículos.
Avisos de status e acesso ao estoque preservados. Compartilhar usa a API nativa
por clique quando suportada; Copiar link permanece disponível. Cancelar não copia
nem envia mensagens. Falha/ausência da Clipboard API mostra campo somente leitura
com o link selecionado para cópia manual. Feedback acessível, proteção contra
cliques duplicados e descarte de resultados tardios ao sair/recarregar a ficha.

`js/vehicle-links.js` centraliza telefone e links: destino fixo `wa.me`, mensagem
codificada, slug validado e URL individual sem query extra ou fragmento. A base
vem do endereço do aplicativo, preservando subpastas. Na prévia, links usam
`127.0.0.1`; depois de publicação autorizada, usarão o domínio do site. As ações
de WhatsApp/compartilhamento não acrescentam SDK ou consultas ao banco.

**Validação da Etapa 7:** 24 testes locais e sintaxe dos 22 arquivos JS passaram.
`tests/etapa7-browser.mjs` (Chrome isolado 9340) verificou três status em quatro
larguras, ativação por clique, payload, cancelamento/erro, concorrência, teclado,
cópia real do Chrome, fallback manual, retorno, texto malicioso e GETs reais.
Compartilhamento nativo teve resultados simulados, sem enviar mensagens ou abrir
o WhatsApp. Regressões completas de `galeria-browser.mjs` e `etapa6-browser.mjs`
passaram. Cliente, consultas, fila e schema mantiveram hashes; reconstruir a linha
anterior de WhatsApp reproduz o hash original de `config.js`. Mobile emulado;
aparelhos físicos, Safari e escolha real de destino do compartilhamento pendentes.
Chrome de QA encerrado; Live Server mantido para revisão.

**Ajustes durante a revisão da Etapa 7:** “Link copiado!” e “Link compartilhado.”
somem após 3 segundos, com prazo reiniciado em nova ação e timer cancelado ao sair
ou substituir a ficha. Erros e instruções para cópia manual permanecem visíveis.
No `<footer>` de `index.html`, seção de visita com endereço, mapa interativo,
“Como chegar” e WhatsApp com mensagem de visita/test drive. O link enviado pelo
usuário, `https://share.google/Xnrqm8YwgTy9JIsH1`, foi conferido no Google Maps:
Detroit Veículos, Rua Visconde de Inhaúma, 451 — Maurício de Nassau, Caruaru — PE.
Mapa incorpora exatamente esse ponto; marca Vértice Motors e WhatsApp preservados.

`loja.endereco`/`loja.localizacaoUrl` preenchidos e `loja.mapaEmbedUrl` acrescentado
em `config.js`. `store-location.js` permite somente `https://www.google.com/maps/embed?pb=…`,
sem credenciais, portas alternativas, HTML ou URLs arbitrárias. Iframe lazy,
título acessível e política de referrer limitada à origem. Sem SDK/chave de API.
Endereço e links são reutilizados no rodapé institucional abaixo; Explorar permanece sem header.

**Validação dos ajustes de confirmação e mapa:** 25 testes locais e sintaxe dos 23 JS passaram. QA da Etapa 7
validou os timers em tempo real; regressão completa de galerias passou. Mapa real
HTTP 200 e Home em 360/390/768/1440 px: endereço, pin, links, fallback para origem
inválida e dimensões conferidos, sem overflow ou exceções. Capturas mobile/desktop
em `vertice-captures-localizacao` no diretório temporário, revisadas visualmente.
Cliente, consultas e schema preservados; reconstruir contatos/endereço anteriores
reproduz o hash original da configuração. Chrome isolado encerrado; prévia mantida.

**Novo ajuste da revisão da Etapa 7 — menu e rodapé:** menu hambúrguer nas quatro
páginas, com painel lateral escuro, fundo desfocado, seção atual e links para
Início, Estoque, Explorar, Destaques, Novidades e Nossa localização. Inclui contato
genérico com a loja. Usa `dialog` nativo, foco inicial no fechar, Escape, toque
fora e bloqueio de rolagem; navegação para uma seção da mesma página fecha o
painel e foca seu título. Fechamento/reabertura rápida e retorno pelo cache
preservam o estado. Sem JS ou suporte a diálogo modal, permanece a navegação HTML.
No Explorar, o botão está na faixa de controles existente: feed em tela cheia,
sem header, logo ou contato fixo. A galeria e os gestos foram preservados.

Home, estoque e detalhes têm rodapé institucional escuro com marca, descrição,
navegação, endereço, Como chegar, WhatsApp e copyright com ano automático.
Instagram sem configuração permanece oculto. O mapa continua na seção de visita
da Home. Contato direto do header aparece a partir de 1024 px; nas telas menores
fica disponível no painel e no rodapé. Componentes compartilhados novos:
`js/components/site-menu.js` e `js/components/institutional-footer.js`, inicializados
por `layout.js`. Não acrescentam consultas ou serviços externos.

**Validação da primeira versão do menu:** 25 testes locais e sintaxe dos 25 JS passaram. Menu/rodapé
conferidos nas quatro páginas em 360/390/768/1440 px, com teclado, foco, Escape,
toque fora, links, seção ativa, anchors, reabertura rápida, cache de navegação,
movimento reduzido e fallback sem JS; altura mobile de 640 px também verificada.
Sem overflow ou erros de JS/imports. Regressões completas de `etapa7-browser.mjs`
e `galeria-browser.mjs` passaram, incluindo cópia real do Chrome e timers.
Capturas mobile/desktop em `vertice-captures-menu`, no diretório temporário,
revisadas visualmente. Mobile emulado; Safari e aparelhos físicos não testados.
Hashes de configuração, cliente GET, consultas, fila e schema são idênticos aos
anteriores ao ajuste. Banco, RLS e Storage preservados. Chrome isolado encerrado;
Live Server mantido. Continua na revisão da Etapa 7, sem deploy.

**Revisão anterior — menu, suavidade e localização:** o usuário pediu novo
visual/experiência para o menu e a remoção da localização da Home. O menu atual
é claro e compacto: quatro destinos com ícones/descrições (Início, Estoque,
Explorar e Localização), dois atalhos para Destaques/Novidades e contato discreto.
No celular abre pela parte inferior; no desktop aparece próximo ao botão.
Abertura de 260 ms e fechamento de 160 ms, com fundo desfocado, foco e Escape.
As ações aguardam o fechamento antes de navegar; cliques repetidos durante o
fechamento não duplicam navegações. O Explorar mantém seu feed em tela cheia.

`localizacao.html`, `css/pages/localizacao.css` e `js/pages/localizacao.js` usam
o layout/rodapé e `initializeStoreLocation` existentes. Têm endereço, mapa lazy,
Como chegar e Agendar visita/test drive. Acesso à página apenas pelo menu e
rodapé: navegação principal continua com três destinos, sem CTA de localização
na Home. Seção/iframe e inicializador do mapa foram removidos da Home; não há
pedido ao Google Maps ao abrir essa página. Dados públicos da loja preservados.

`js/components/navigation.js` faz rolagem suave até as seções, preserva URL e
histórico e foca o destino. Selecionar a página atual retorna ao conteúdo sem
recarregar; mudanças de query continuam usando navegação normal. Entrada do
conteúdo usa fade CSS de 320 ms; links/botões têm resposta visual suave. Movimento
reduzido desativa animações e usa rolagem instantânea; Pular para o conteúdo é
imediato. Navegação entre páginas mantém links HTML normais, sem roteador/SDK.

**Validação atual:** 25 testes locais, sintaxe dos 27 JS e QA de cinco páginas em
360/390/768/1440 px passaram. Menu compacto, alvos de toque, foco, Escape, toque
fora, seção ativa, navegação e rodapés conferidos. Teste adicional em 390×640 e
844×360, rolagem suave, histórico, página atual sem recarga, fechamento repetido,
retorno pelo cache, movimento reduzido, fallback sem JS e validação do iframe.
Mapa real e ponto conferidos visualmente; página de localização não consulta o
estoque. Regressões completas da Etapa 7 e galerias passaram. Preparação de
posição dos scripts de QA usa `behavior: 'instant'`, sem mudar gestos ou asserts.
Capturas em `vertice-captures-menu-revisado`, no diretório temporário, revisadas.
Mobile emulado; Safari/aparelhos físicos/leitor de tela não verificados.
Configuração, cliente GET, consultas, fila e schema mantêm os mesmos hashes.
Banco, RLS, Storage e backup horizontal preservados. Chrome isolado encerrado;
Live Server mantido para revisão. Etapa 7 permanece em revisão, sem deploy.

**Revisão anterior — 11/10/2026:** o usuário pediu Home/Estoque mais diretos, botão
hambúrguer padrão de três traços e menu lateral com entrada/saída suave no celular.
Depois especificou que o painel compacto da imagem deve permanecer no desktop.
Aplicado nas cinco páginas: abaixo de 768 px, gaveta pela direita, altura total,
rolagem interna e contato no fim; a partir de 768 px, painel flutuante compacto.
Fechamento sincronizado ao fim da animação, com temporizador de segurança.

Home usa título curto, links e busca GET para `estoque.html?busca=...`; título
e busca ficam lado a lado no desktop. Destaques/Novidades e cards existentes
preservados. Estoque tem título compacto e formulário mais simples, com busca,
ordenação e filtros nativos. Nenhuma alteração nos módulos de consultas/páginas,
configuração do Supabase, schema, RLS, Storage, fila ou backup do Explorar.

**Validação desta revisão:** 25 testes locais e sintaxe dos 27 JS passaram.
Cinco páginas em 360/390/768/1440 px, três traços, posições/dimensões do menu,
Escape, foco e ausência de overflow conferidos. Busca Home → Estoque, filtros,
animação lateral, toque fora, telas baixas e movimento reduzido passaram.
Regressões completas de galerias e Etapa 7 passaram; QA de navegação/âncoras,
histórico, ciclo de vida, fallback sem JS e mapa também passou. Home/Estoque
com dados públicos reais conferidos em 390/1440 px; capturas temporárias em
`vertice-captures-visual-11-10`. Hashes dos cinco arquivos protegidos idênticos.
Mobile emulado; aparelhos físicos/Safari não verificados. Chrome isolado
encerrado; Live Server mantido. Etapa 7 continua em revisão. Sem deploy.

**Revisão anterior — seis refinamentos de 11/10/2026:** Localização tem título curto,
endereço em destaque, rota/agendamento e mapa em conjunto único. Texto antes do
mapa no celular; mapa à esquerda e texto à direita no desktop. Configuração do
iframe, endereço e contatos preservados. Localização continua só no menu/footer.

Estoque abre por **menor preço**. Seletor: menor, maior e recém-adicionados. O HTML
já tinha essa sequência; `catalogo-url.js` agora usa menor preço como padrão e
mantém `ordenacao=recentes` explícito, inclusive no link Novidades da Home.
Buscar pela Home ou pelo Estoque rola até `estoque-titulo` após renderizar o
resultado atual (carros/vazio/erro). Envio do formulário foca o título; digitação
mantém foco no campo. Busca vazia da Home também revela os carros. Busca inválida,
resposta antiga/cancelada, paginação e histórico não rolam automaticamente.
Utilitário `scrollToElement` compartilhado com a navegação, respeitando movimento reduzido.

Home mobile tem navegação flutuante em cápsula branca/azul, com os mesmos destinos
e espaço reservado no fim do corpo. Desktop mantém navegação no header em cápsula.
Headers têm transparência/desfoque discreto, contato em azul e hover suave da marca.
Hambúrguer com três traços de 2 px e intervalos de 4 px nas cinco páginas. Menu
lateral no mobile e painel compacto no desktop preservados.

**Validação atual:** 26 testes locais e sintaxe dos 27 JS passaram. Cinco páginas
em 360/390/768/1440 px, alvos de toque, barra flutuante, menu/foco/Escape, espessuras
e ausência de overflow conferidos. Buscas, foco, carregamento atrasado, respostas
antigas, inválidos, vazio/erro, movimento reduzido e escolhas da ordenação passaram.
Regressão completa de galerias passou. QA de âncoras/histórico/cache/menu/mapa e
fallback sem JS passou. Dados reais: Home/Estoque/Localização em 390/1440 px,
preços crescentes, busca Corolla e busca vazia revelando os resultados. Capturas
temporárias em `vertice-captures-refinamentos-11-10`, revisadas visualmente.
Hashes de config/cliente GET/consultas/fila/schema idênticos. Sem escritas no
Supabase, alterações de RLS/Storage ou envio de mensagens. Mobile emulado; sem
Safari/aparelhos físicos. Chrome isolado encerrado; prévia local mantida.
**Etapa 7 em revisão, Etapa 8 não iniciada. Sem deploy.**

**Revisão atual — barra compartilhada, busca e destaques:** a barra flutuante
aprovada na Home mobile agora é compartilhada pelas cinco páginas no celular,
com cores claras/azul e espaço reservado de 96 px mais safe area. Explorar usa
a mesma cápsula também no desktop, com dica/ações acima dela e sem overflow.
As demais páginas preservam a navegação em cápsula no header do desktop.

Busca textual exige termo: Home com validação nativa de vazio/espaços e validação
de letras/números; Estoque bloqueia Enter, digitação vazia e envio sem critérios.
Filtros e ordenação funcionam sem termo textual; Limpar filtros restaura todos.
O bloqueio mantém os carros e a paginação carregados. Limpar o texto durante
requisição descarta o resultado tardio e sua rolagem, sem fazer busca vazia.
Buscas válidas continuam rolando suavemente até os carros, com movimento reduzido respeitado.

Novidades foi removida do HTML da Home, inicialização/carregamento, menu e footer.
A Home faz só uma consulta de destaques, limitada a seis veículos; só o atalho
Destaques permanece no menu. Ordenação por recém-adicionados continua no Estoque.
Módulo de consultas/Supabase mantido; a função antiga não é usada pela Home.
QA antigo da Etapa 4 atualizado para uma seleção, e a regressão de galerias
agora verifica o feed acima da barra flutuante.

**Validação atual:** 26 testes locais, 27 JS e sintaxe dos QA ajustados passaram.
Cinco páginas em 360/390/768/1440 px, barra flutuante, alvos de toque, rodapé
alcançável, ausência de Novidades, uma consulta da Home, menu/Escape e atalho
Destaques conferidos. Home vazia/espaços/pontuação bloqueada; Estoque vazio por
submit/Enter/debounce sem GET ou rolagem, filtros sem texto e reset conferidos.
Resposta cancelada após apagar texto não reaparece/não rola. Regressão completa
de galerias passou. Leitura real: seis destaques, Explorar com cápsula, busca
Corolla válida e paginação 12 + 2 preservada após bloqueio de busca vazia/espaços.
Feed baixo conferido em 390×640 e 844×360; HTML sem JS mantém navegação e validação
nativa da Home. Capturas temporárias em `vertice-captures-destaques-nav-11-10`,
revisadas visualmente. Mobile emulado; Safari/aparelhos físicos não verificados.
Hashes protegidos idênticos; sem escritas no Supabase/RLS/Storage ou mensagens.
Chrome isolado encerrado; prévia mantida. **Etapa 7 em revisão, sem deploy.**

**Próxima etapa após aprovação: 8 — Qualidade e publicação.** Revisão final de
responsividade, acessibilidade, desempenho, segurança, dados e links. Confirmar
identidade/redes sociais e estoque real antes do lançamento. Publicação
em hospedagem estática HTTPS exige autorização específica. Sem deploy nesta entrega.

O conteúdo abaixo preserva o registro histórico da passagem das Etapas 1 a 3
para a Etapa 4; os trechos que dizem “ainda não começou” referem-se àquele momento.

**Registro anterior:** o usuário pediu
este resumo e decidiu continuar a implementação da Etapa 4 em diante em
outro chat, neste mesmo repositório. Neste encerramento, somente a
documentação de continuidade foi acrescentada.

As páginas principais ainda mostram mensagens de preparação. A camada de
dados funciona, e os componentes visuais estão prontos, mas ainda não estão
conectados às consultas nos módulos de página. A prévia de componentes é
uma demonstração das peças visuais, com exemplos locais; não é a Home ou o
estoque final. Isso foi explicado ao usuário.

Antes de implementar, leia também [README.md](README.md),
[DESIGN.md](DESIGN.md), [VALIDACAO.md](VALIDACAO.md) e
[supabase/README.md](supabase/README.md). Preserve as alterações existentes
e confira os arquivos atuais; este documento registra o estado desta entrega.

## Projeto e decisões confirmadas

- Showroom de concessionária com identidade fictícia **Vértice Motors**.
- Quatro páginas: `index.html`, `estoque.html`, `explorar.html`, `veiculo.html`.
- HTML semântico em `pt-BR`, CSS compartilhado e JavaScript Vanilla em ES
  Modules. Sem npm, build, framework, SDK do Supabase ou backend próprio.
- Integração por `fetch` nativo com a API REST do Supabase. Comunicação e
  consultas separadas da renderização da interface.
- Home, estoque e detalhes claros; Explorar escuro. Preto, branco, cinzas e
  azul-cobalto. Fontes de sistema e ícones SVG locais.
- Prioridade mobile. Navegação inferior abaixo de 768 px; no desktop, no
  header. Menu: Início, Estoque e Explorar. Detalhes vem pelo link de cada card.
- Administração diretamente no Dashboard do Supabase; não criar painel
  administrativo ou login de visitantes neste MVP.
- Listas mostram **disponíveis e reservados publicados**. Vendidos saem das
  listas, mas o detalhe permanece acessível enquanto o anúncio estiver publicado.
- Link individual: `veiculo.html?carro=slug`. O slug deve permanecer estável
  após publicar, inclusive em alterações de preço/descrição.
- Dados do banco são texto; renderizar com `textContent`, sem interpretar HTML.
- Cada etapa termina com verificações e revisão do usuário antes da seguinte.
  Deploy exige autorização específica; nenhum deploy foi realizado.
- Prévias individuais avançadas de compartilhamento estão fora do MVP.

## Entregas concluídas

| Etapa | Entrega |
| --- | --- |
| 1 — Fundação | Quatro páginas semânticas, estilos/entradas JS, marca textual SVG, configuração, navegação, foco e documentação de execução. |
| 2 — Supabase | Tabelas, constraints, índices, RLS, permissões, bucket, seed, consultas GET, erros/cancelamento e validações reais. |
| 3 — Design System | Tokens, tipografia, navegação mobile/desktop, cards, botões, ícones, formatação, estados e prévia de componentes. |

### Supabase existente

O usuário criou uma nova conta e o projeto **CARROS**, após encontrar o
limite de projetos na conta anterior. A configuração de segurança foi
acompanhada: Data API habilitada, somente `public` exposto, exposição
automática de novas tabelas desligada e RLS automático habilitado. O showroom
não usa Supabase Auth; cadastro de usuários, login anônimo e vinculação manual
ficaram desativados, com confirmação de e-mail habilitada.

O usuário executou `schema.sql`, `validar.sql` e `seed.sql` no SQL Editor,
informou sucesso e enviou as imagens de demonstração ao Storage. URL e chave
**publishable** já estão em `js/config.js`. Preserve-as; não copie credenciais
para este resumo ou para mensagens. Nunca colocar chave secret/service_role
ou senha de banco no navegador. WhatsApp e localização informados na Etapa 7;
Instagram continua pendente.

- Tabelas: `veiculos` e `veiculo_imagens`. Código textual conserva zeros;
  slug único; UUID; valores validados; no máximo uma imagem principal por veículo.
- Novos anúncios começam com `publicado = false`.
- `anon` e `authenticated` têm apenas leitura, limitada por RLS a anúncios
  publicados e suas imagens. Escrita por visitantes é bloqueada.
- Bucket **`veiculos`** público, aceitando JPEG/PNG/WebP até 5 MiB por arquivo;
  operações de visitantes são bloqueadas por policy restritiva.
- **Despublicar um anúncio não torna a URL de uma foto privada.** Usar o
  bucket somente para imagens destinadas à divulgação.
- `schema.sql` é de primeira instalação e **não deve ser executado novamente**
  nesse banco. Qualquer mudança posterior exige migração própria e revisável.
- Seed: 16 veículos fictícios (13 disponíveis publicados, um reservado
  publicado, um vendido publicado e um rascunho) e 17 metadados de imagens.
  Foram observados 14 itens nas listas e 16 metadados legíveis publicamente.
- PNGs em `assets/images/demo/`: `capa.png`, `galeria.png`, `rascunho.png`.
  Já enviados para `veiculos/demo/`. São cartões marcados como demonstração,
  não fotografias reais de automóveis.

Para liberar um anúncio para leitura, salvar `publicado = true` no Table
Editor, após conferir ficha e fotos. A visualização local do site é independente
disso; o que ainda falta é ligar os dados à interface nas próximas etapas.

### Arquivos a reutilizar

| Arquivo | Responsabilidade |
| --- | --- |
| `js/config.js` | Marca, contatos e configuração pública já preenchida do Supabase. |
| `js/supabase.js` | GET, validação de configuração, erros HTTP/rede/timeout, AbortSignal e URLs do Storage. |
| `js/veiculos.js` | Consultas, busca/filtros no banco, ordenação e paginação. |
| `js/formatters.js` | Preços BRL, quilometragem, anos e câmbio. |
| `js/components/layout.js` | Inicialização compartilhada, identidade e contatos condicionais. |
| `js/components/vehicle-card.js` | `createVehicleCard`, status textual e fallback de foto. |
| `js/components/states.js` | `createLoadingGrid` e `createStatePanel` para carregamento/vazio/erro e nova tentativa. |
| `js/components/icons.js` / `assets/icons/sprite.svg` | Ícones SVG locais compartilhados. |
| `js/pages/*.js` | Atualmente inicializam o layout; receberão o comportamento das páginas. |
| `css/global.css` / `css/components.css` / `css/pages/*.css` | Tokens, tema escuro, componentes e estilos por página. |

Os cards recebem objetos das consultas com `imagem_capa: { url }` ou `null`,
usam link individual por slug, foto 3:2, lazy loading e status explícito.
Escolha `headingLevel` conforme a seção; `eager` é opcional para foto já visível.
Sem foto exibem “Foto em breve”; falha de imagem exibe “Foto indisponível”.

Consultas existentes:

- `listarDestaques({ signal })` e `listarRecentes({ signal })`: até seis cada.
- `listarVeiculos({ filtros, ordenacao, offset, limite: 12, signal })`:
  retorna `{ veiculos, temMais, proximoOffset }`; consulta um item adicional.
- Filtros: `busca`, `precoMin`, `precoMax`, `anoMin`, `anoMax`, `cambio`,
  `categoria`, `kmMax`. Anos se referem ao ano-modelo.
- Ordenações: `recentes`, `menor_preco`, `maior_preco`, com desempate por UUID.
- Busca combina palavras em marca/modelo/versão; não envia gramática bruta
  do visitante ao PostgREST. Valores inválidos geram `TypeError`.
- `listarExplorar({ offset, signal })`: quatro por lote e um adicional.
- `buscarVeiculoPorSlug(slug, { signal })`: publicado, incluindo reservado
  ou vendido, com metadados da galeria completa; ausente/oculto retorna `null`.
- `listarSemelhantes(veiculo, { signal })`: até quatro da mesma categoria.

Listas trazem somente uma capa por veículo, não a galeria completa.
Erros usam `SupabaseError`; cancelamentos usam `AbortError`; timeout de
12 segundos. Resultado vazio não deve ser confundido com falha de conexão.

## Etapa 4 — implementar no próximo chat

Montar **Home e catálogo/estoque**, reutilizando a base e os componentes.

1. Home: apresentar a marca e ações de navegação, renderizar até seis
   destaques e seis recém-adicionados pelas consultas existentes.
2. Estoque: renderizar lotes de 12, com botão “Carregar mais” somente quando
   `temMais`; usar `proximoOffset` e impedir cliques/requisições duplicados.
3. Busca por marca/modelo/versão com pequeno atraso na digitação e
   cancelamento da consulta anterior. Impedir resultados antigos de
   sobrescreverem a busca atual.
4. Filtros de preço, ano-modelo, câmbio, categoria e quilometragem;
   ordenação por recentes, menor preço e maior preço, sempre no banco.
5. Persistir busca/filtros/ordenação na URL, restaurar ao abrir o endereço
   e preservar a navegação. Validar parâmetros; mudanças reiniciam a paginação.
6. Integrar carregamento, vazio e erro recuperável com “Tentar novamente”.
   Não deixar abortamentos aparecerem como erros para o visitante.
7. Manter status, fallback de fotos, navegação por teclado, foco e layout
   responsivo. Contatos pendentes continuam inativos.

Verificar os quatro tamanhos combinados (360, 390, 768 e 1440 px), console e
imports; consultas reais de Home/estoque; paginação; filtros combinados;
URL e retorno de navegação; digitação rápida; vazio/erro/nova tentativa;
carregamento de fotos e distinção entre reservado/vendido/rascunho.
Repetir os testes de dados e registrar os resultados reais em `VALIDACAO.md`.
Encerrar a Etapa 4 para revisão antes de iniciar a Etapa 5.

As etapas restantes são: **5 — Explorar** (gestos e carregamento gradual,
antecipando somente o próximo veículo); **6 — Detalhes** (ficha, galeria,
status, descrição e até quatro semelhantes); **7 — WhatsApp e compartilhamento**
(mensagens por veículo, compartilhar nativo ou copiar link);
**8 — Qualidade e publicação** (revisão final e hospedagem estática HTTPS).
Ausente/não publicado terá “Veículo não encontrado”; reservado terá aviso;
vendido terá aviso e acesso ao estoque atual, na implementação dos detalhes.

## Como abrir e verificar

Workspace Windows: `C:\Users\djpri\Documents\Projetos Reais\Projeto-Concessionária`.
Live Server do VS Code, configurado em `.vscode/settings.json` para
`127.0.0.1:5500`. Se não estiver ativo, abrir `index.html` com **Open with
Live Server** ou usar **Go Live**. Servir por HTTP, evitando `file://`.

- Site: `http://127.0.0.1:5500/index.html`.
- Peças visuais: `http://127.0.0.1:5500/tests/componentes.html`.
- Exemplo de link: `veiculo.html?carro=demo-corolla-xei-2022-001`.
- Testes locais, caso Node esteja disponível: `node --test tests/dados.test.mjs`.
  Node não é dependência de execução do site.

A prévia de componentes permite alternar claro/escuro e revisar três cards,
botões e estados com fixtures locais, sem consultas ao banco. Fica fora do
menu público; excluir os arquivos de teste do pacote de deploy futuro.

## Verificações já feitas e limites

- Etapa 1: quatro páginas por HTTP, imports, teclado e quatro larguras.
- Etapa 2: leitura real da API, paginação 12 + 2, destaques e semelhantes;
  rascunho/imagem ocultos por RLS; galerias e status corretos; três PNGs
  HTTP 200 e hashes iguais aos locais; consultas reais no navegador sem CORS.
- API recusou POST/PATCH/DELETE nas duas tabelas com chave pública
  (seis respostas HTTP 401, código `42501`). Payloads/filtros usados evitavam
  alterar anúncios mesmo se uma permissão estivesse incorreta.
- Storage recusou upload público de teste; a ausência do arquivo foi
  confirmada. Não foram alterados/excluídos arquivos existentes para testar.
- Papel `authenticated` foi validado pelo SQL executado pelo usuário,
  sem criar sessão autenticada HTTP. Ver detalhes e limites em `VALIDACAO.md`.
- Etapa 3: **24 combinações de página/largura/tema**, sem rolagem horizontal;
  teclado, toque emulado, fallback de foto inválida, renderização segura de
  texto, movimento reduzido e navegação sem JS passaram. Menor contraste
  medido nas amostras: **4,80:1**. Sintaxe de 13 arquivos JS e **nove testes
  de dados** passaram. Cinco capturas foram revisadas visualmente.
- Chrome usado com perfil temporário isolado; encerrado ao final dos testes.
  Mobile foi emulado, sem teste em aparelhos físicos, Safari ou leitor de tela.
- Live Server foi mantido ao encerrar a implementação; conferir se continua
  ativo no próximo chat. Nenhum deploy, publicação ou servidor backend criado.

## Mensagem sugerida para o próximo chat

> Leia CONTINUIDADE.md e os documentos indicados neste repositório. Continue
> a implementação pela Etapa 4 — Home e catálogo, preservando a configuração
> existente do Supabase e reutilizando os componentes das Etapas 1 a 3.
> Implemente e valide somente a Etapa 4; ao concluir, entregue para minha
> revisão antes de seguir para a próxima etapa. Não faça deploy.
