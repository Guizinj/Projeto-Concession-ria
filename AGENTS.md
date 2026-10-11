# Instruções para trabalhar neste projeto

## Leitura e estado atual

Leia [README.md](README.md), [CONTINUIDADE.md](CONTINUIDADE.md) e os arquivos reais antes de alterar. Para trocar de cliente, leia [PERSONALIZACAO.md](PERSONALIZACAO.md). Design e evidências ficam em [DESIGN.md](DESIGN.md) e [VALIDACAO.md](VALIDACAO.md); o SQL e cadastro são descritos em [supabase/README.md](supabase/README.md).

Estado consolidado em 11/10/2026: showroom demonstrativo Vértice Motors, cinco páginas funcionais, Etapas 4/5/6 aprovadas e Etapa 7 implementada em revisão. Não há deploy. A revisão documental e as correções pontuais solicitadas não significam aprovação automática da próxima etapa.

O pedido atual do usuário autoriza os ajustes que ele descreve. Não peça novamente permissão para tarefas já autorizadas. Não iniciar uma etapa nova, publicar, alterar banco remoto ou enviar mensagens a terceiros sem instrução correspondente. Não introduzir agentes paralelos por rotina.

## Arquitetura e responsabilidades

- HTML5, CSS3 e JavaScript Vanilla em ES Modules; sem framework, build, npm, SDK do Supabase ou backend próprio.
- Cinco entradas: `index.html`, `estoque.html`, `explorar.html`, `veiculo.html`, `localizacao.html`. Detalhe individual: `veiculo.html?carro=slug`.
- `js/config.js`: configuração pública da loja e conexão Supabase. Preserve os valores existentes salvo solicitação de troca.
- `js/supabase.js`: cliente GET, erros/timeout/cancelamento e URLs de fotos; `js/veiculos.js`: consultas, filtros e paginação.
- `js/components/`: layout, menu, navegação, rodapé, cards, estados, galerias, ficha e ações reutilizáveis.
- `js/pages/`: coordenação de cada página. `css/global.css`: tokens; `css/components.css`: componentes; `css/pages/`: diferenças por página.
- `apresentacao/`: material comercial separado, com PDFs e capturas estáticas. Alterar Markdown não regenera HTML ou PDF.
- `revisoes/explorar-horizontal/`: backup histórico protegido por manifesto. Não editar os três arquivos de backup nem o manifesto; restaurar somente se solicitado, conforme o README dessa pasta.

Uma instalação corresponde a uma loja. Adaptação simples: cópia do site + Supabase separado por cliente. Não criar suporte a várias lojas no mesmo banco ou painel de administração sem novo escopo. A identidade é centralizada parcialmente: HTMLs ainda contêm metadados/fallbacks e um WhatsApp sem JS que precisam de revisão manual.

## Preferências visuais e decisões a preservar

O usuário quer mudanças discretas, restritas ao trecho solicitado, com prioridade no celular. Preserve o restante em boas condições. Home/Estoque/ficha/contato claros; Explorar escuro; azul-cobalto, fontes de sistema e ícones SVG locais. Não transformar o visual inteiro por uma correção pequena.

- Hero atual: foto local `assets/images/hero-civic.webp`, título e apoio sobre a imagem, gradiente escuro e formato retangular compacto. Mínimo móvel de `14.5rem`; desktop `clamp(17rem, 25vw, 20rem)`, permitindo crescimento do conteúdo. Não voltar à imagem quadrada, alta ou ao texto separado da foto.
- “Ver estoque” usa seta rotacionada `-45deg`, apontando para cima/direita. “Explorar veículos” também é botão, com padding equivalente e fundo translúcido bem suave. Busca continua abaixo do hero; só até seis destaques, sem Novidades.
- Preserve os textos escolhidos pelo usuário, incluindo “Conheca nosso estoque.” e “Fale Conosco.”, salvo pedido para alterá-los.
- Estoque: menor preço como ordem padrão, critérios explícitos na URL, lotes de 12, debounce de 300 ms. Aplicar/buscar revela resultados após carregar; envio foca o título e digitação conserva foco no campo.
- **“Limpar filtros” limpa e recarrega sem rolagem automática**, usando `apply({ revealResults: false })` e foco no campo com `preventScroll: true`. Não reintroduzir scroll no reset, retry desse reset, respostas canceladas ou carregamento de mais itens.
- Explorar: feed vertical de um veículo por tela, sem header/logo/contato fixo, foto principal inteira e fundo desfocado. Gesto vertical/↑↓ troca carros; lateral/←→ troca fotos. Navegação inferior também no desktop, azul escuro nessa página.
- Ficha: galeria 4:3 com `cover`, avisos de reservado/vendido, ficha técnica, descrição, equipamentos e semelhantes independentes. Compartilhar/copiar ficam no menu de três pontos ao lado do WhatsApp.
- Localização/contato: formulário com CTA de test drive; mapa apenas nessa página. Contato pelo menu leva a `localizacao.html#contato-titulo`. WhatsApp direto com verde suave.
- Navegação inferior flutuante no celular, menu lateral móvel e compacto no desktop, rodapé institucional nas quatro páginas com rolagem. Movimento reduzido, teclado/foco e alternativas sem JS devem ser preservados.

Uma tentativa anterior de melhorias visuais amplas foi desfeita a pedido do usuário. Não reaplicar essas mudanças como se fossem decisões aprovadas.

## Dados e segurança existentes

- Nunca inserir credenciais secretas, service_role, senha do banco ou tokens administrativos em arquivos públicos. O cliente aceita chave pública `sb_publishable_…`.
- Não mudar schema, RLS, Storage, configuração ou consultas por um ajuste visual/documental. `schema.sql` é somente para primeira instalação e não pode ser repetido no banco atual como atualização.
- Tabelas `veiculos` e `veiculo_imagens`, bucket público `veiculos`; visitantes têm apenas leitura conforme RLS. Cadastros são pelo Dashboard do Supabase, sem login de visitantes/painel próprio.
- Listas: publicados disponíveis/reservados. Vendidos saem das listas mas conservam o detalhe publicado. Slug estável após publicação; oculto/inválido/ausente mostra veículo não encontrado.
- Dados do banco são texto, nunca HTML executável. Use `textContent` e validação de URLs/identificadores existentes.
- Home até seis destaques; Explorar quatro metadados por lote; semelhantes até quatro. Galeria nos cards consultada sob demanda, cancelada ao descartar; antecipar apenas a próxima foto/capa conforme o contexto e respeitar economia de dados.
- Erro não é vazio; abortamento não é erro para o visitante. Preserve geração/cancelamento para que respostas antigas não substituam o estado atual.
- Fotos no bucket público continuam acessíveis por URL mesmo após despublicar anúncio. Não guardar conteúdo privado nele.
- Formulário prepara mensagem via GET ao WhatsApp; o cliente confirma envio e a loja confirma negociação/agendamento. Não há email, pagamentos, reserva automática ou gravação de leads.
- QA deve inspecionar/interceptar contato e compartilhamento sem enviar mensagens a terceiros.

## Como verificar e documentar

Sirva por HTTP com Live Server (`127.0.0.1:5500`, `.vscode/settings.json`); não usar `file://` para executar os módulos do showroom. Confira se a prévia já está ativa antes de abrir outro servidor. Node é opcional para testes, não para executar o site.

Testes locais existentes, sem chamadas ao Supabase real (Node 24):

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs tests/vehicle-links.test.mjs tests/store-map.test.mjs tests/contact-message.test.mjs tests/contact-context.test.mjs
```

Execute os testes adequados ao que mudou e `node --check` nos módulos alterados. Para alterações visuais/funcionais, confira as páginas afetadas em 360/390/768/1440 px, ausência de overflow/erros de console, teclado, foco e movimento reduzido; hero também em 320 px. Não escrever testes que apenas repitam uma mudança cosmética.

QA opcional atual: `tests/galeria-browser.mjs`, `tests/etapa6-browser.mjs`, `tests/etapa7-browser.mjs`, `tests/localizacao-browser.mjs`. Leia o cabeçalho para configurar Chrome isolado e porta (`QA_PORT` onde suportado). `QA_REAL=1` acrescenta leituras reais e depende da conexão/configuração/fixtures, não é teste unitário offline. Testes de etapas antigas podem pressupor layouts anteriores; não interpretá-los como prova do layout atual sem revisão.

Feche somente os processos/perfis que abriu; preserve servidores e alterações do usuário. Documente verificações realmente executadas, distinguindo histórico, teste simulado e leitura real. Não declarar aparelhos físicos, Safari, leitor de tela, publicação ou nova loja validados sem evidência.

Atualize o ponto de retomada em `CONTINUIDADE.md`, instruções no `README.md` e evidências em `VALIDACAO.md` quando houver mudança relevante. Em retomadas, priorize esse ponto atual; os registros antigos de validação descrevem a versão da respectiva data. Antes da entrega a uma loja, seguir a checklist de `PERSONALIZACAO.md`. Documentação organizada não substitui a validação da instalação do cliente.
