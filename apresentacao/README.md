# Apresentação comercial

Material para apresentar o showroom digital a donos de concessionárias e showrooms, com uma narrativa que conecta a rotina da loja aos recursos implementados.

Orientações revisadas em 11/10/2026. Para adaptar o site e preparar a entrega,
comece no [guia de personalização](../PERSONALIZACAO.md). O arquivo principal da
loja é `../js/config.js`; este material comercial tem edição independente.

## Arquivos

- `showroom-digital.pdf`: apresentação principal, com cinco páginas A4.
- `index.html`: versão responsiva do mesmo material, com navegação entre partes, download e impressão.
- `roteiro-de-apresentacao.md`: sugestões de fala, perguntas para o dono da loja, demonstração por página e respostas para dúvidas comuns. Material de apoio para quem apresenta.
- `resumo.md`: resumo editável do projeto e do escopo atual.
- `resumida.html`, `resumida.css` e `showroom-digital-resumido.pdf`: versão anterior, de uma página, preservada para um envio breve.
- `assets/`: capturas reais da Home, Explorar e ficha, feitas em 11/10/2026. Imagens estáticas; preços e estoque podem mudar. A Home capturada pode anteceder o hero atual sobre a foto.

## Sequência da apresentação

1. A oportunidade: o cliente consulta informações antes de visitar a loja.
2. A experiência: busca, catálogo, Explorar e fotos ajudam a escolher.
3. O atendimento: a ficha e a mensagem identificam o interesse no carro.
4. A visita: contato, mapa, rota e intenção de test drive.
5. Sua loja: personalização, atualização do conteúdo, dúvidas e próximo passo.

O PDF é para o possível cliente. O roteiro separado é para orientar a conversa de quem apresenta. Não é necessário ler o texto inteiro das páginas em voz alta.

## Abrir e atualizar

Acesse `http://127.0.0.1:5500/apresentacao/` pelo Live Server, ou abra `index.html` diretamente. O material usa apenas arquivos locais, sem consultas ao banco, fontes externas ou serviços de terceiros.

Depois de editar, use **Imprimir / salvar PDF**, papel **A4**, escala **100%**, sem cabeçalhos e rodapés do navegador e com gráficos de fundo. O CSS divide o conteúdo em cinco páginas e oculta os controles. Confira as quebras antes de substituir `showroom-digital.pdf`.

Para a versão resumida, abra `resumida.html`, confira a impressão em uma página
e salve como `showroom-digital-resumido.pdf` com as mesmas opções.

Editar `resumo.md` ou o roteiro não atualiza o HTML nem os PDFs. Editar
`js/config.js` também não troca a marca, logo ou capturas nesta pasta. Para outra
loja, revise os dois HTMLs, os textos de apoio, as imagens e gere os PDFs novamente.
Confira dados pessoais/comerciais e o conteúdo antes de entregar ao cliente.

Nesta revisão apenas a documentação foi atualizada: PDFs, HTMLs e capturas
anteriores foram preservados. O material não constitui validação de uma implantação
nova. A checklist está no guia; evidências técnicas em [VALIDACAO.md](../VALIDACAO.md).

## Escopo

Os argumentos descrevem os recursos implementados e os benefícios esperados para a rotina, sem afirmar métricas de vendas ou conversão. O formulário prepara uma mensagem no WhatsApp; o cliente confirma o envio e a loja confirma a visita. O gerenciamento atual é feito pelo Supabase, sem painel administrativo próprio.

A versão demonstrativa usa a identidade Vértice Motors. Publicação, personalização, rotina de atualização, prazo e investimento precisam ser combinados. Etapa 7 continua em revisão. Nenhum deploy, alteração no Supabase ou envio a terceiros foi feito nesta revisão.
