# Continuidade — estado consolidado

Atualizado em **11/10/2026**, após ajustes do hero, correção de Limpar filtros e
organização da documentação para adaptar/vender o showroom a outras lojas.

Este é o ponto atual de retomada. [VALIDACAO.md](VALIDACAO.md) preserva as evidências
históricas; instruções antigas de implementação não descrevem páginas ainda provisórias.

## Estado e autorização

Showroom demonstrativo **Vértice Motors**, HTML/CSS/JavaScript Vanilla em ES Modules,
sem build, framework, npm, SDK do Supabase ou backend próprio.
Cinco páginas funcionais: Home, Estoque, Explorar, ficha e Localização/Contato.

Etapas 4/5/6 aprovadas; Etapa 7 implementada em revisão. Sem deploy.
Os ajustes pontuais e esta organização documental foram solicitados pelo usuário;
não significam aprovação automática da Etapa 8/publicação. Atender tarefas já
autorizadas sem confirmação repetida.

Leia [AGENTS.md](AGENTS.md), [README.md](README.md), [PERSONALIZACAO.md](PERSONALIZACAO.md),
[DESIGN.md](DESIGN.md) e a documentação do banco antes de mudanças relevantes.

## Decisões da interface

- Hero retangular compacto: foto local `assets/images/hero-civic.webp`, título
  “Seu próximo carro está aqui.” e apoio sobre a imagem, com gradiente escuro.
  Mínimo móvel `14.5rem`; desktop `clamp(17rem, 25vw, 20rem)`, permitindo crescer
  com conteúdo. Não voltar à imagem quadrada/alta ou ao texto separado da foto.
- Ver estoque azul, seta diagonal para cima/direita; Explorar veículos também
  botão, com padding equivalente e fundo bem suave. Busca abaixo, até seis
  destaques, sem Novidades.
- Estoque: texto “Conheca nosso estoque.” do usuário, filtros nativos, menor preço
  como padrão, URL compartilhável, debounce 300 ms, lotes de 12.
  Busca inválida não consulta nem desloca a página.
- **Limpar filtros preserva a posição**: `apply({ revealResults: false })` e
  foco em busca com `preventScroll: true`. Retry do reset conserva a opção.
  Buscar/aplicar revela resultados após carregar; envio foca o título e
  digitação mantém o campo. Carregar mais e respostas canceladas não rolam.
- Explorar vertical: um carro por tela, sem header/logo/contato fixo. Foto inteira,
  fundo desfocado, lateral troca fotos e vertical troca carros. Botões, teclado
  e roda do mouse preservados. Cápsula inferior também no desktop, azul escuro.
- Ficha por `veiculo.html?carro=slug`: galeria 4:3 com `cover`, resumo, ficha,
  descrição/equipamentos, avisos de status e até quatro semelhantes.
  Menu de três pontos reúne compartilhar/copiar, junto do WhatsApp. Confirmações
  duram três segundos; erro/instruções de cópia manual permanecem.
- Localização/contato: introdução/CTA e formulário lado a lado no desktop e
  empilhados no celular; endereço, rota e mapa abaixo. “Fale Conosco.” preservado.
  CTA de test drive prepara formulário sem apagar rascunhos; WhatsApp direto verde suave.
- Menu: Início, Estoque, Explorar, Localização e Contato, mais Destaques.
  Contato → `localizacao.html#contato-titulo`. Gaveta móvel/painel compacto desktop.
  Rodapé institucional nas quatro páginas com rolagem; mapa só na localização.
  Movimento reduzido, teclado, foco e navegação HTML preservados.

Uma tentativa anterior de melhorias visuais amplas foi desfeita a pedido do usuário.
Não reaplicar. O usuário quer mudanças discretas e restritas ao trecho solicitado.

## Dados e infraestrutura

`js/config.js` guarda dados públicos existentes da loja e conexão Supabase;
não substituir valores por exemplos. Instagram está `null`.
Vértice Motors é demonstrativa; o mapa aponta ao ponto informado de Detroit
Veículos, Caruaru. Confirmar/substituir nome, telefone, endereço e pin para cada loja.

Supabase demonstrativo instalado pelo responsável: tabelas `veiculos` e
`veiculo_imagens`, RLS de leitura e bucket público `veiculos`. Visitantes não
escrevem. Cadastro pelo Dashboard, sem painel próprio. `schema.sql` é apenas
primeira instalação; não repetir no banco existente.
Sem alterações remotas nesta revisão documental.

Listas: publicados disponíveis/reservados. Vendidos fora das listas, mas ficha
publicada acessível. Slug estável; valores validados; texto renderizado com
`textContent`. Despublicar não torna fotos do bucket público privadas.
Nunca colocar chaves secret/service_role ou senhas em arquivos públicos.

Consultas: seis destaques na Home, lotes de 12 no estoque, quatro metadados no
Explorar e até quatro semelhantes. Galerias sob demanda, antecipação limitada,
economia de dados e cancelamento preservados. Quantidades históricas do seed não
representam inventário permanente; a base pode ser editada pelo responsável.

Formulário prepara mensagem ao WhatsApp; cliente confirma envio e equipe confirma
negociação/visita/test drive. Sem email, pagamentos, reserva/agendamento automático
ou armazenamento de leads.

## Adaptação para venda e documentação

Criado [PERSONALIZACAO.md](PERSONALIZACAO.md): mapa de arquivos/campos, exemplo,
passo a passo e checklist. **Começar em `js/config.js`**; hero, favicon, cores,
metadados/fallbacks HTML e WhatsApp sem JS são pontos separados.

Uma instalação atende uma loja. Caminho simples: cópia do site e projeto Supabase
separado por cliente; não há isolamento de várias lojas no mesmo banco.
Organização documental sem mudança de arquitetura, interface ou configuração.

Criado **AGENTS.md**, nome convencional reconhecido pelos agentes, registrando
responsabilidades, preferências, segurança existente e validação.
Todos os Markdown existentes foram revisados; histórico técnico mantido em VALIDACAO.

## Apresentação e backup

`apresentacao/` é separado do site: PDF de cinco páginas A4, HTML responsivo,
resumo/roteiro; versão resumida de uma página preservada. Capturas e PDFs estáticos
podem mostrar o hero anterior. Não foram regenerados nesta revisão; atualizar
antes de apresentar outra loja conforme [apresentacao/README.md](apresentacao/README.md).
Sem envio a terceiros.

Backup horizontal antigo em `revisoes/explorar-horizontal/`, com manifesto SHA-256
e `restaurar.ps1`. Não sobrescrever; restaurar apenas se solicitado, seguindo
o README da pasta. A versão atual permanece vertical. Backup/testes ficam fora da hospedagem.

## Verificações e retomada

- Hero sobre foto/altura compacta: QA anterior em 320/360/390/768/1024/1440 px,
  imagem carregada, sem overflow, busca abaixo, links e validação de busca.
  O ajuste posterior do botão Explorar teve conferência estática; não atribuir
  a ele uma nova regressão completa de navegador.
- Limpar filtros: QA anterior em 390/1440 px, reset/URL/foco e mesma posição;
  Aplicar filtros segue levando aos resultados. Sintaxe e três testes de catálogo passaram.
- Revisão documental: **31 testes locais passaram**, sem consultas remotas.
  Conferência de links/arquivos e preservação da aplicação em VALIDACAO.
- QA histórico de galerias, detalhes e contato em Chrome com mobile emulado.
  Aparelhos físicos, Safari, leitor de tela e domínio final continuam pendentes.

Prévia Live Server em `http://127.0.0.1:5500`; conferir se está ativa.
Node 24 opcional para testes. Não executar o showroom por `file://`.
Comandos/pré-requisitos no README e VALIDACAO.

Próximo trabalho conforme o pedido do usuário. Antes de entregar a uma loja,
seguir a checklist, validar as cinco páginas/dados/contatos e combinar hospedagem,
domínio e manutenção. Publicação exige autorização correspondente.
Documentação organizada não significa site publicado ou cliente novo validado.
