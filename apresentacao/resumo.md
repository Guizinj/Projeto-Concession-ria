# Showroom digital para concessionárias e showrooms

Uma vitrine digital que apresenta o estoque da loja, facilita a escolha do veículo e aproxima o cliente da equipe de vendas pelo WhatsApp. A experiência foi pensada para o celular e também funciona no computador.

## Recursos já implementados

- **Home com foto de abertura, destaques e busca:** hero retangular compacto com título sobre a foto, acesso ao estoque e ao Explorar; apresenta até seis veículos selecionados e busca direta.
- **Catálogo com filtros:** pesquisa por marca, modelo e versão, ordenação por preço e filtros para comparar opções.
- **Explorar no estilo Reels:** um carro por tela, navegação vertical entre veículos e swipe lateral entre as fotos.
- **Ficha completa do veículo:** preço, disponibilidade, galeria, dados técnicos, equipamentos, descrição e sugestões de veículos semelhantes.
- **Atendimento pelo WhatsApp:** mensagens breves conforme o contexto. Na ficha, a mensagem identifica o carro e inclui o link do anúncio.
- **Compartilhamento de anúncios:** link individual para divulgar um veículo ou enviar a alguém.
- **Localização e contato:** endereço, mapa, rota, contato direto e formulário que prepara uma mensagem no WhatsApp para dúvidas, visitas e interesse em test drive. O cliente confirma o envio; a loja confirma a disponibilidade e o agendamento.
- **Estoque conectado ao Supabase:** informações e fotografias vêm do banco e do armazenamento já configurados.

## Proposta para a loja

Reunir fotos, informações e atendimento em uma presença digital organizada, ajudando o cliente a conhecer o estoque e começar uma conversa com seu interesse já identificado. A apresentação valoriza os veículos e oferece um caminho direto até a visita à loja.

## Situação atual — 11/10/2026

As etapas 4, 5 e 6 foram aprovadas. A etapa 7 está implementada e em revisão. O projeto está disponível em prévia local, sem deploy. Vértice Motors é a identidade usada nesta demonstração; a implantação e a personalização para cada loja precisam ser combinadas.

A personalização mantém a estrutura simples: cópia do site e Supabase separado
por loja. Nome, logo, contatos e localização ficam em `js/config.js`; foto do
hero, metadados e conteúdo estático têm pontos de edição próprios. Consulte
[PERSONALIZACAO.md](../PERSONALIZACAO.md) para execução e conferência da entrega.

O cadastro atual é feito pelo Supabase. Não há painel administrativo próprio, pagamento online, financiamento automático, envio por email ou confirmação automática de test drive nesta entrega. Esses recursos não devem ser anunciados como disponíveis.

## Material para conduzir a apresentação

A apresentação principal foi ampliada para cinco páginas com uma sequência de
conversa: oportunidade, escolha do veículo, atendimento, visita e implantação
para a loja. O PDF e a versão HTML incluem explicações, exemplos e benefícios
para a rotina do negócio. O arquivo `roteiro-de-apresentacao.md` orienta quem
apresenta com sugestões de fala e respostas para dúvidas comuns. A versão de uma
página continua disponível em `showroom-digital-resumido.pdf`.

Capturas e PDFs são estáticos e podem mostrar a Home anterior ao hero atual.
Esta revisão do texto não regenerou esses arquivos; personalize e confira o
material antes de usar com outra loja, conforme [README.md](README.md).
