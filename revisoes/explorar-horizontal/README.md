# Voltar ao Explorar horizontal

Backup exato da Etapa 5, anterior ao feed vertical. Não sobrescrever.
O manifesto registra SHA-256 dos três arquivos. O script verifica os hashes
e os caminhos antes de substituir somente HTML, CSS e entrada JS do Explorar.

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

`ExecutionPolicy Bypass` vale apenas para esse processo; não modifica a política
de execução do Windows. O script é local e verifica o backup antes de copiar.

Esta pasta é de desenvolvimento e deve ficar fora de uma futura publicação.
