$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$tracked = @('index.html', 'styles.css', 'script.js')
$lastSignature = ''

Write-Host 'Auto-commit activo. Presiona Ctrl+C para detenerlo.'
while ($true) {
  $status = @(git status --short -- $tracked)
  $signature = $status -join "`n"
  if ($signature -and $signature -ne $lastSignature) {
    git add -- $tracked
    git commit -m "Actualizacion automatica $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $lastSignature = ''
  } else {
    $lastSignature = $signature
  }
  Start-Sleep -Seconds 2
}
