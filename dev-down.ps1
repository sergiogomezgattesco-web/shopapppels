# dev-down.ps1
# Apaga Postgres limpio. Backend y frontend hay que cerrarlos manualmente
# (cerrar las ventanas o Ctrl+C en cada una).
#
# Uso:    .\dev-down.ps1

$pgBin  = "C:\Program Files\PostgreSQL\18\bin"
$pgData = "C:\Users\s.gomez.gattesco\pgdata"

Write-Host "Apagando Postgres..." -ForegroundColor Cyan

$pgListening = Test-NetConnection -ComputerName localhost -Port 5432 `
                  -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $pgListening) {
    Write-Host "    Postgres ya no estaba corriendo" -ForegroundColor DarkGray
} else {
    & "$pgBin\pg_ctl.exe" -D $pgData stop -m fast | Out-Null
    Write-Host "    Postgres apagado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backend y frontend: cerra las ventanas de PowerShell donde corren" -ForegroundColor Yellow
Write-Host "(o Ctrl+C en cada una)" -ForegroundColor Yellow