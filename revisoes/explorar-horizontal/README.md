# Voltar ao Explorar horizontal

Backup exato da Etapa 5, anterior ao feed vertical. Não sobrescrever.
O manifesto registra SHA-256 dos três arquivos. O script verifica os hashes
e os caminhos antes de substituir somente HTML, CSS e entrada JS do Explorar.

Orientação revisada em 11/10/2026. A versão ativa permanece vertical conforme
[CONTINUIDADE.md](../../CONTINUIDADE.md). Esta revisão documental não alterou
o backup, manifesto ou script e não executou restauração. Não usar esta pasta
como modelo de personalização para outra loja: siga
[PERSONALIZACAO.md](../../PERSONALIZACAO.md).

No PowerShell, a partir da raiz do projeto:

```powershell
# Conferir a integridade sem modificar o site:
powershell -NoProfile -ExecutionPolicy Bypass -File ./revisoes/explorar-horizontal/restaurar.ps1 -Verificar

# Executar somente se decidir voltar ao formato anterior:
powershell -NoProfile -ExecutionPolicy Bypass -File ./revisoes/explorar-horizontal/restaurar.ps1
```

Supabase, Home, estoque, detalhes e dados não são alterados. Os módulos de fila
e gesto horizontal existentes continuam disponíveis para a versão anterior.
Documentos mantêm o histórico da entrega; atualizar o ponto de continuidade
caso a restauração seja efetivamente realizada.

Depois de restaurar, será preciso revisar a integração com o layout, navegação,
menu e contatos atuais: o backup é da etapa anterior a essas melhorias. A
integridade dos três arquivos não certifica a compatibilidade com revisões futuras.

`ExecutionPolicy Bypass` vale apenas para esse processo; não modifica a política
de execução do Windows. O script é local e verifica o backup antes de copiar.

Esta pasta é de desenvolvimento e deve ficar fora de uma futura publicação.
