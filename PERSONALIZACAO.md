# Como adaptar o showroom para outra loja

Atualizado em 11/10/2026. Este guia usa a estrutura existente, sem painel de configuração, framework ou mudança de arquitetura.

## Comece aqui

**Abra [js/config.js](js/config.js).** Esse é o arquivo principal para trocar a loja e a conexão com o estoque. Para cada cliente, trabalhe em uma cópia separada do projeto, preservando a versão demonstrativa.

| O que trocar | Onde editar | Observação |
| --- | --- | --- |
| Nome da loja | `loja.nome` em `js/config.js` | Atualiza a identidade visível e títulos via JavaScript. Revise também os HTMLs abaixo. |
| Frase institucional | `loja.descricao` em `js/config.js` | Descrição do rodapé; não altera o texto do hero. |
| Logo | `loja.logo` em `js/config.js` | Caminho relativo à raiz do site, como `./assets/images/minha-loja.svg`. |
| WhatsApp | `loja.whatsapp` em `js/config.js` | String com `55` + DDD + número, somente dígitos; revise também o link sem JS. |
| Endereço | `loja.endereco` em `js/config.js` | Endereço completo em texto; revise o fallback no HTML. |
| Link de rota | `loja.localizacaoUrl` em `js/config.js` | Link HTTPS do ponto correto no Google Maps. |
| Mapa incorporado | `loja.mapaEmbedUrl` em `js/config.js` | Apenas o `src` de Google Maps → Compartilhar → Incorporar um mapa. Deve usar `https://www.google.com/maps/embed?pb=…`; não cole o iframe inteiro. |
| Instagram | `loja.instagramUrl` em `js/config.js` | URL HTTPS do perfil, ou `null` para ocultar. |
| Banco do cliente | `supabase.url` e `supabase.publishableKey` em `js/config.js` | URL base HTTPS e chave pública `sb_publishable_…` do projeto do cliente. |
| Bucket de fotografias | `supabase.bucket` em `js/config.js` | Mantenha `veiculos`, que é o nome criado pelo SQL atual. |
| Carros, preços, fotos e disponibilidade | Dashboard do Supabase | Table Editor e Storage. Não cadastrar carros em HTML ou `config.js`. |
| Foto do hero | `index.html`, imagem dentro de `.home-intro-media` | Atualmente `./assets/images/hero-civic.webp`; troque `src`, `alt`, `width` e `height`. |
| Título e texto do hero | `index.html`, `.home-intro-copy` | Atualmente “Seu próximo carro está aqui.” e texto de apoio. |
| Altura, recorte e gradiente do hero | `css/pages/home.css` | `.home-hero`, `::after` e `.home-intro-media img`. Preserve o formato retangular compacto. |
| Cores e fontes | `css/global.css` | Tokens em `:root` e `.theme-dark`. Há cores locais em `css/components.css` e `css/pages/*.css`; confira esses pontos se mudar a paleta. |
| Ícone da aba | `assets/icons/favicon.svg` | Pode substituir mantendo o caminho; outro formato exige atualizar o `<link rel="icon">` dos HTMLs. |
| Metadados e conteúdo sem JS | Os cinco HTMLs da raiz | Explicação abaixo. |
| Textos de contato | `js/contact-context.js`, `js/contact-message.js` e `js/vehicle-links.js` | Altere apenas se o cliente pedir outra redação. O telefone vem de `config.js`. |
| Material de venda | `apresentacao/` | Conteúdo e capturas são independentes do site; PDFs não se atualizam automaticamente. |

Todos os valores de `config.js` são públicos no navegador. Nunca coloque senhas, chave secret, service_role ou token administrativo nele.

## O que precisa de edição além de config.js

Com JavaScript ativo, o layout reutiliza a configuração para marca, logo, endereço, links e título do documento. **Trocar apenas config.js não personaliza todo o conteúdo estático.**

Revise `index.html`, `estoque.html`, `explorar.html`, `veiculo.html` e `localizacao.html`:

- `<title>` e `<meta name="description">`: continuam escritos no HTML original. Não dependem do JavaScript para informar a identidade inicial a navegadores e mecanismos de busca.
- Textos de marca, descrição e `aria-label` que servem como conteúdo inicial/fallback; mantenha os atributos `data-*` usados pelo layout.
- Caminho inicial do logo em cada `<img data-brand-logo>` se escolher um nome de arquivo diferente. Substituir `assets/images/marca.svg` mantendo o caminho simplifica essa parte.
- `localizacao.html`: endereço escrito em `<address data-store-address>` e o link `https://wa.me/...` dentro de `<noscript>`. Esse link precisa do telefone do cliente mesmo se o visitante estiver sem JavaScript.
- Cidade e informações específicas nos textos, especialmente a descrição da localização.
- Textos comerciais que precisem mudar; preserve IDs, classes, nomes de campos, rotas e atributos de acessibilidade.

A localização atual aponta para o ponto informado de Detroit Veículos, em Caruaru, enquanto a marca demonstrativa é Vértice Motors. Não entregar essa combinação para outra loja: confirme nome, telefone, endereço e pin com o cliente.

No VS Code, use **Ctrl+Shift+F** para localizar o nome antigo, telefone, cidade e endereço. Revise os resultados em vez de substituir indiscriminadamente os testes e o histórico técnico.

## Exemplo de preenchimento

Exemplo ilustrativo dos campos da loja; use os dados oficiais do cliente no arquivo existente e mantenha o bloco `supabase` com a conexão correta:

```js
loja: {
  nome: "Nome da sua loja",
  descricao: "Sua frase institucional.",
  logo: "./assets/images/marca.svg",
  whatsapp: "55DDNUMERO", // Substituir por uma string real, só com dígitos.
  endereco: "Rua, número — bairro, cidade — UF, CEP",
  localizacaoUrl: null, // Preencher com o link HTTPS da rota.
  mapaEmbedUrl: null, // Preencher com o src oficial de incorporação.
  instagramUrl: null,
},
```

O telefone de exemplo é inválido de propósito: não publique esses valores. Links ausentes ficam ocultos e o contato inválido permanece indisponível.

## Um estoque separado para cada loja

A base atual representa **uma loja por instalação**. Não há campo de loja, seleção de cliente ou isolamento entre lojas no mesmo banco. Trocar o nome em `config.js` mantendo a conexão antiga mostra o mesmo estoque antigo.

Para vender sem mudar a arquitetura:

1. Crie uma cópia do site para o cliente.
2. Use um projeto Supabase separado para esse cliente. A criação e instalação são realizadas quando houver autorização para a implantação.
3. Em um banco novo, siga [supabase/README.md](supabase/README.md) para instalar e validar o schema. **Não execute schema.sql novamente no banco demonstrativo existente.**
4. Preencha a URL e a chave pública do novo projeto em `js/config.js`, mantendo o bucket `veiculos`.
5. Cadastre os veículos e envie suas fotos pelo Dashboard. Use `publicado = false` durante a preparação; confira ficha e fotos antes de publicar cada anúncio.
6. Ajuste marca, contatos, hero e HTMLs; valide a cópia antes da entrega.

O procedimento é o mesmo para cada loja; custos, limites de contas e responsabilidade pelo cadastro devem ser combinados na implantação. Compartilhar um banco entre várias lojas exigiria outro escopo e mudanças nas tabelas, consultas e RLS.

Para cadastro, consulte a tabela de campos em [supabase/README.md](supabase/README.md). Reservados aparecem nas listas; vendidos saem das listas e conservam a ficha enquanto publicados. Preserve o slug após a publicação para não quebrar links compartilhados.

## Foto inicial e material comercial

O hero usa uma foto **local e fixa** do Civic, independente das fotos do estoque no Supabase. Vender esse carro ou trocar o banco não muda o hero. Use uma imagem aprovada pela loja, atualize a descrição `alt` e as dimensões reais; confira o recorte e a legibilidade do texto no celular e no computador.

Mantenha a altura compacta, o gradiente de contraste, a busca abaixo e os dois botões com padding equivalente. “Ver estoque” tem seta diagonal para cima; “Explorar veículos” usa uma superfície bem suave.

Em `apresentacao/`, personalize os textos HTML/Markdown, faça novas capturas se necessário e gere novamente os PDFs conforme [apresentacao/README.md](apresentacao/README.md). Editar `resumo.md` não altera HTML ou PDF. As capturas existentes podem mostrar uma versão anterior do hero.

## Conferência antes de entregar

- [ ] Nome, logo, favicon, descrições e cidade corretos nos cinco HTMLs e na configuração.
- [ ] WhatsApp correto no site e no link sem JavaScript; conferir o destino sem enviar mensagens de teste a terceiros.
- [ ] Endereço, rota e pin do mapa conferidos com o cliente; Instagram correto ou oculto.
- [ ] Conexão com o projeto Supabase do cliente, sem misturar o catálogo demonstrativo.
- [ ] Fotos de divulgação autorizadas, sem imagens faltando; hero com bom recorte e texto legível.
- [ ] Preços, equipamentos, status e veículos publicados conferidos; nenhuma demonstração apresentada como estoque real.
- [ ] Home, Estoque, Explorar, ficha e contato conferidos em 360/390/768/1440 px, com teclado e movimento reduzido.
- [ ] Busca, filtros, URL, voltar/avançar, galeria, compartilhamento e estados vazio/erro funcionando.
- [ ] “Limpar filtros” preserva a posição; buscas/aplicação continuam levando aos resultados.
- [ ] Contato prepara mensagem; a equipe confirma visita/test drive. Não prometer reserva, pagamento ou agendamento automático.
- [ ] Domínio, hospedagem, atualização de anúncios e suporte combinados; publicação autorizada separadamente.
- [ ] Material comercial revisado e PDFs regenerados quando necessário.

Testes e evidências estão em [VALIDACAO.md](VALIDACAO.md). Esta lista é um roteiro de entrega; não certifica que cada nova loja já foi validada.

Para hospedar o site, o conjunto de execução é os **cinco HTMLs da raiz**, `css/`, `js/` e os assets utilizados. Testes, SQL, documentação, backups, `.git`, configurações do editor e material comercial ficam fora do pacote público, salvo se houver uma decisão explícita de divulgar a apresentação. Não há painel administrativo próprio nem deploy nesta revisão.
