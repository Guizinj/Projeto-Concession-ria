param([switch]$Verificar)
$ErrorActionPreference = 'Stop'
$snapshotDirectory = [System.IO.Path]::GetFullPath($PSScriptRoot)
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$manifest = Get-Content -LiteralPath (Join-Path $snapshotDirectory 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$allowedFiles = @('explorar.html', 'css/pages/explorar.css', 'js/pages/explorar.js')
if ($manifest.Count -ne $allowedFiles.Count) { throw 'Manifesto incompleto.' }
foreach ($relativeFile in $allowedFiles) {
  $entry = @($manifest | Where-Object { $_.path -eq $relativeFile })
  if ($entry.Count -ne 1) { throw 'Manifesto invalido.' }
  $sourceFile = [System.IO.Path]::GetFullPath((Join-Path $snapshotDirectory $relativeFile))
  $targetFile = [System.IO.Path]::GetFullPath((Join-Path $projectDirectory $relativeFile))
  if (!$sourceFile.StartsWith($snapshotDirectory + [System.IO.Path]::DirectorySeparatorChar) -or !$targetFile.StartsWith($projectDirectory + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Caminho fora do projeto.' }
  if ((Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash -ne $entry[0].sha256) { throw 'Backup alterado: hash diferente.' }
}
if ($Verificar) { Write-Output 'Backup verificado. Nenhum arquivo alterado.'; return }
foreach ($relativeFile in $allowedFiles) {
  Copy-Item -LiteralPath (Join-Path $snapshotDirectory $relativeFile) -Destination (Join-Path $projectDirectory $relativeFile) -Force
}
Write-Output 'Explorar horizontal restaurado. Supabase e demais paginas preservados.'
