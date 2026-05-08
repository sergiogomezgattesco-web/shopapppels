# dev-up.ps1
# Levanta el ambiente local de shop-app: Postgres + backend + frontend.
# Detecta si Postgres ya esta corriendo, limpia pid stale si crasheo,
# y abre backend y frontend en ventanas PowerShell separadas.
#
# Uso:    .\dev-up.ps1
# Si la execution policy bloquea: powershell -ExecutionPolicy Bypass -File .\dev-up.ps1
# Log de debug en: %TEMP%\dev-up-debug.log
#
# Paths machine-specific (user `s.gomez.gattesco`). Si cambia la maquina, actualizar.

# === Config ===
$pgBin       = "C:\Program Files\PostgreSQL\18\bin"
$pgData      = "C:\Users\s.gomez.gattesco\pgdata"
$repoRoot    = $PSScriptRoot
$backendDir  = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"
$debugLog    = "$env:TEMP\dev-up-debug.log"

function Log {
    param([string]$msg, [string]$color = "White")
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
    Add-Content -Path $debugLog -Value $line
    Write-Host $line -ForegroundColor $color
}

# Reset debug log
"" | Out-File $debugLog -Encoding utf8
Log "=== dev-up start ==="

# === Paso 1: Postgres ===
Log "[1/3] Verificando Postgres..." "Cyan"

$pgListening = Test-NetConnection -ComputerName localhost -Port 5432 `
                  -InformationLevel Quiet -WarningAction SilentlyContinue
Log "Postgres listening check: $pgListening"

if ($pgListening) {
    Log "    Postgres ya estaba corriendo en :5432" "Green"
} else {
    Log "    Postgres apagado, levantandolo..." "Yellow"

    $pidFile = Join-Path $pgData "postmaster.pid"
    if (Test-Path $pidFile) {
        Remove-Item $pidFile -Force
        Log "    Eliminado postmaster.pid stale" "DarkGray"
    }

    Log "    Invocando pg_ctl..."
    # Forma simple que sabemos funciona — sin pipe ni redirects.
    # pg_ctl ya escribe a $pgData\postgres.log via -l.
    & "$pgBin\pg_ctl.exe" -D $pgData -l "$pgData\postgres.log" start
    Log "    pg_ctl retorno con exit code $LASTEXITCODE"

    $up = $false
    for ($i = 1; $i -le 10; $i++) {
        if (Test-NetConnection -ComputerName localhost -Port 5432 `
              -InformationLevel Quiet -WarningAction SilentlyContinue) {
            $up = $true; break
        }
        Start-Sleep -Seconds 1
    }
    if ($up) {
        Log "    Postgres listo" "Green"
    } else {
        Log "    ERROR: Postgres no levanto" "Red"
        Get-Content $pgCtlLog -ErrorAction SilentlyContinue | ForEach-Object { Log "    pg_ctl: $_" "Red" }
        exit 1
    }
}

# === Paso 2: Backend ===
Log "[2/3] Backend..." "Cyan"

Push-Location $backendDir
if (-not (Test-Path "node_modules")) {
    Log "    npm install (primera vez)..." "Yellow"
    npm install | Out-Null
    Log "    npm install OK"
}
Log "    prisma generate..."
# IMPORTANTE: NO usar `2>&1 | Out-Null` con comandos nativos (npx).
# PowerShell 5.1 envuelve cada linea de stderr como NativeCommandError.
# Redirigimos stderr a archivo separado.
$prismaLog = "$env:TEMP\dev-up-prisma.log"
& npx prisma generate *> $prismaLog
Log "    prisma generate OK (log: $prismaLog)"
Log "    prisma migrate deploy..."
& npx prisma migrate deploy *>> $prismaLog
Log "    prisma migrate deploy OK"
Pop-Location

# IMPORTANTE: usamos cmd.exe (no powershell) porque la politica Avecto en
# esta maquina no deja a powershell hija ejecutar el -Command. Con cmd /k
# si se ejecuta normal y la ventana queda abierta despues.
Log "    Lanzando backend en ventana nueva..."
Start-Process cmd -ArgumentList "/k", "cd /d `"$backendDir`" && npm run dev" -WindowStyle Normal
Log "    Backend lanzado -> http://localhost:3001" "Green"

# === Paso 3: Frontend ===
Log "[3/3] Frontend..." "Cyan"

Push-Location $frontendDir
if (-not (Test-Path ".env.development")) {
    "VITE_API_URL=http://localhost:3001/api" | Out-File -Encoding utf8 ".env.development"
    Log "    Creado .env.development" "DarkGray"
}
if (-not (Test-Path "node_modules")) {
    Log "    npm install (primera vez)..." "Yellow"
    npm install | Out-Null
    Log "    npm install OK"
}
Pop-Location

Log "    Lanzando frontend en ventana nueva..."
Start-Process cmd -ArgumentList "/k", "cd /d `"$frontendDir`" && npm run dev" -WindowStyle Normal
Log "    Frontend lanzado -> http://localhost:5173" "Green"

Log ""
Log "Listo. Abri http://localhost:5173" "Cyan"
Log "Para apagar: cerrar las ventanas + .\dev-down.ps1" "DarkGray"