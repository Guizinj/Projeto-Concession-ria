# Showroom Digital Automotivo — Vértice Motors

Projeto demonstrativo para concessionárias e showrooms, com prioridade no celular.
HTML, CSS e JavaScript Vanilla em ES Modules, sem build, npm, framework ou backend próprio.
Estoque e fotografias usam a API REST e o Storage do Supabase por `fetch` nativo.

## Quero adaptar para outra loja

**Comece em [js/config.js](js/config.js)** para trocar nome, descrição institucional,
logo, WhatsApp, endereço, rota, mapa, Instagram e conexão com o estoque.
**O passo a passo está em [PERSONALIZACAO.md](PERSONALIZACAO.md)**, com campos,
exemplos, pontos de edição manual e checklist de entrega.

| Personalização | Local |
| --- | --- |
| Identidade, contatos e conexão do estoque | [js/config.js](js/config.js) |
| Foto inicial | `assets/images/hero-civic.webp` e imagem em `index.html` |
| Título e apoio sobre a foto | `index.html`, bloco `.home-intro-copy` |
| Cores e fontes | `css/global.css`; conferir cores locais em componentes/páginas |
| Logo e ícone da aba | `assets/images/marca.svg` e `assets/icons/favicon.svg` |
| Metadados, textos iniciais e contato sem JS | Cinco HTMLs da raiz |
| Carros, preços, fotos e status | Dashboard do Supabase; [cadastro](supabase/README.md) |

A configuração não altera automaticamente o hero, as descrições dos HTMLs ou o
WhatsApp de `<noscript>` na localização. Para manter a arquitetura simples,
use uma cópia do site e um projeto Supabase separado por loja. Trocar a marca
mantendo o banco mostra o mesmo estoque.

## Estado atual — 12/10/2026

Etapas 4, 5 e 6 aprovadas; Etapa 7 implementada e em revisão. Cinco páginas
funcionais, prévia local, sem deploy. Documentação consolidada para personalização
e entrega; a revisão final da instalação de cada cliente ainda precisa ser feita.

- Home: hero retangular compacto com foto local do Civic, título e apoio sobre a
  imagem. Ver estoque com seta diagonal e Explorar veículos com fundo bem suave.
  Busca abaixo, até seis destaques e nenhuma seção Novidades.
- Estoque: busca por marca/modelo/versão, filtros, URL compartilhável, menor preço
  como ordem padrão e lotes de 12. Buscar/aplicar leva aos resultados;
  **Limpar filtros atualiza sem rolar a página**.
- Fotos na Home, Estoque e ficha: swipe lateral com reconhecimento antecipado
  da direção, tolerância a gestos diagonais/curvos e proteção contra abrir o
  anúncio durante um arrasto. Gestos verticais conservam a rolagem da página.
- Explorar: feed vertical com um carro por tela, swipe lateral entre fotos,
  botões, gestos, roda do mouse e teclado; sem header, navegação inferior também no desktop.
- Ficha: galeria, preço/status, dados técnicos, descrição/equipamentos, até quatro
  semelhantes, WhatsApp contextual e menu de compartilhar/copiar link.
- Localização/contato: formulário, intenção de visita/test drive, WhatsApp, endereço,
  rota e mapa. Cliente confirma envio; loja confirma disponibilidade/agendamento.

Menu com Início, Estoque, Explorar, Localização e Contato, além de Destaques.
Rodapé institucional nas quatro páginas com rolagem; navegação flutuante no celular,
foco por teclado e movimento reduzido. Instagram ainda não configurado.
Vértice Motors é a marca demonstrativa; os contatos e o ponto do mapa atuais
precisam ser confirmados/substituídos para outra loja.

## Abrir a prévia local

1. Abra a pasta no VS Code.
2. Abra `index.html` com **Open with Live Server**, ou use **Go Live**.
3. Acesse `http://127.0.0.1:5500/index.html`.

`.vscode/settings.json` usa `127.0.0.1:5500`. Se a porta estiver ocupada,
confira a prévia existente ou ajuste a porta. Sirva por HTTP: `file://` não é
adequado aos imports do showroom. Node não é necessário para executar o site.

| Página | Endereço na prévia |
| --- | --- |
| Home | `http://127.0.0.1:5500/index.html` |
| Estoque | `http://127.0.0.1:5500/estoque.html` |
| Explorar | `http://127.0.0.1:5500/explorar.html` |
| Ficha demonstrativa | `http://127.0.0.1:5500/veiculo.html?carro=demo-corolla-xei-2022-001` |
| Localização/contato | `http://127.0.0.1:5500/localizacao.html` |
| Prévia de componentes | `http://127.0.0.1:5500/tests/componentes.html` |
| Apresentação comercial | `http://127.0.0.1:5500/apresentacao/` |

O link demonstrativo depende de o anúncio existir e estar publicado no banco conectado.

## Organização

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| Cinco HTMLs da raiz | Estrutura, conteúdo inicial, metadados e entradas de módulos |
| `css/global.css`, `css/components.css`, `css/pages/` | Tokens, componentes e estilos das páginas |
| `js/config.js` | Configuração pública da loja e do Supabase |
| `js/supabase.js`, `js/veiculos.js` | GET, erros/cancelamento, fotos, consultas e paginação |
| `js/catalogo-url.js`, `js/formatters.js` | Filtros na URL e formatação de valores |
| `js/components/`, `js/pages/` | Componentes compartilhados e coordenação das páginas |
| `js/explore-*.js`, `js/gallery-images.js` | Fila/gestos do Explorar e organização das fotos |
| `js/contact-*.js`, `js/vehicle-links.js` | Mensagens e links de contato/compartilhamento |
| `assets/` | Ícones, logo, hero e imagens de demonstração |
| `supabase/` | Schema, validação SQL, seed opcional e cadastro |
| `tests/` | Testes locais, QA de navegador e prévia de componentes |
| `apresentacao/` | HTML, PDFs, capturas e apoio comercial separados do site |
| `revisoes/explorar-horizontal/` | Backup protegido da versão horizontal antiga |

## Dados e configuração pública

Nunca coloque chave secret/service_role, senha do banco ou token administrativo em
`config.js`. O cliente aceita chave pública `sb_publishable_…`; permissões e RLS
limitam o acesso. O Supabase demonstrativo já foi instalado: **não executar
`schema.sql` novamente nele**. Para um projeto novo, siga [supabase/README.md](supabase/README.md).

Cadastro pelo Table Editor e upload pelo Storage, sem painel próprio. Anúncios
começam despublicados. Listas incluem publicados disponíveis/reservados; vendidos
mantêm a ficha enquanto publicados. Preserve o slug. O bucket público `veiculos`
aceita JPEG/PNG/WebP até 5 MiB; despublicar não torna uma foto privada.

| Consulta em `js/veiculos.js` | Limite/comportamento |
| --- | --- |
| `listarVeiculos` | Até 12; consulta um adicional para determinar `temMais` |
| `listarDestaques` | Até seis; usados pela Home |
| `listarRecentes` | Existe, mas não é usada pela Home atual |
| `listarExplorar` | Quatro metadados por lote e um adicional; somente capa |
| `listarImagensDoVeiculo` | Fotos por UUID validado, conforme RLS |
| `buscarGaleriaPorSlug` | Identidade e galeria; mantida para usos existentes |
| `buscarVeiculoPorSlug` | Ficha completa de publicado, inclusive reservado/vendido |
| `listarSemelhantes` | Até quatro da mesma categoria, excluindo atual/vendidos |

Filtros: `busca`, `precoMin`, `precoMax`, `anoMin`, `anoMax`, `cambio`,
`categoria`, `kmMax`; anos referem-se ao ano-modelo. Ordenações: `menor_preco`,
`maior_preco`, `recentes`. Cancelamento descarta respostas antigas; erros diferem
de listas vazias. Galerias de cards consultam metadados sob demanda.

## Validar e entregar

Procedimento em [VALIDACAO.md](VALIDACAO.md), com checklist de entrega no guia de
personalização. Testes locais com Node 24, sem dependências ou acesso ao Supabase real:

```text
node --test tests/dados.test.mjs tests/catalogo-url.test.mjs tests/explorar.test.mjs tests/explorar-vertical.test.mjs tests/galeria.test.mjs tests/vehicle-links.test.mjs tests/store-map.test.mjs tests/contact-message.test.mjs tests/contact-context.test.mjs
```

QA de navegador atual: `tests/galeria-browser.mjs`, `tests/etapa6-browser.mjs`,
`tests/etapa7-browser.mjs` e `tests/localizacao-browser.mjs`; requer servidor HTTP
e Chrome isolado com depuração local. Leia os cabeçalhos; `QA_PORT` permite outra
porta onde suportado, e `QA_REAL=1` acrescenta leituras reais quando previsto.
Scripts antigos podem depender de versões anteriores do layout.

Regressão específica do swipe: `tests/galeria-swipe-browser.mjs`, com Chrome
isolado em 9341 (`QA_PORT` permite outra porta). Simula fotos/dados e envia toques
ao navegador para conferir diagonais, curvas, cancelamento, rolagem e links nas
três páginas em quatro larguras; não consulta o Supabase real.

Publicação é uma etapa separada com autorização específica. O pacote de execução
usa cinco HTMLs, CSS, JS e assets necessários. Documentação, SQL, testes, backups,
`.git`, configurações do editor e material comercial ficam fora da hospedagem,
salvo decisão de divulgar a apresentação.

Não há pagamento, financiamento, reserva/agendamento automático, envio por email
ou armazenamento de leads nesta entrega. Combine domínio, hospedagem, manutenção
de anúncios e suporte antes da implantação.

## Documentação e apresentação

- [PERSONALIZACAO.md](PERSONALIZACAO.md): onde trocar cada dado e preparar outra loja.
- [AGENTS.md](AGENTS.md): regras para futuras alterações por agentes de código.
- [CONTINUIDADE.md](CONTINUIDADE.md): estado consolidado e ponto de retomada.
- [DESIGN.md](DESIGN.md): direção visual e componentes.
- [VALIDACAO.md](VALIDACAO.md): evidências, comandos, histórico e pendências.
- [supabase/README.md](supabase/README.md): instalação e cadastro.
- [apresentacao/README.md](apresentacao/README.md): PDF de cinco páginas, versão resumida e roteiro.
- [Backup horizontal](revisoes/explorar-horizontal/README.md): retorno apenas se solicitado.

Capturas e PDFs comerciais são estáticos, podem mostrar o hero anterior e precisam
ser revisados/regenerados para cada cliente. Não se atualizam ao editar `config.js`
ou Markdown. Nenhum material foi enviado a terceiros nesta revisão.
