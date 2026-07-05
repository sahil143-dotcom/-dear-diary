# Start Dear Diary API sidecar
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\services\api

if (-not (Test-Path ".venv\Scripts\uvicorn.exe")) {
    Write-Host "Run first: python -m venv .venv && .\.venv\Scripts\pip install -r requirements.txt"
    exit 1
}

# Load .env if present (local api dir first, then repo root)
foreach ($envFile in @(".env", "..\.env")) {
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim().Trim('"'), 'Process')
            }
        }
    }
}
if (-not $env:LLM_API_KEY) { $env:COGNEE_SKIP_CONNECTION_TEST = "true" }
$env:ENABLE_BACKEND_ACCESS_CONTROL = "false"

$port = if ($env:API_PORT) { [int]$env:API_PORT } else { 8787 }
.\.venv\Scripts\uvicorn main:app --port $port --host 127.0.0.1 --reload
