Write-Host "Resetting Dear Diary demo (Cognee forget + remember seed)..."
$port = if ($env:API_PORT) { $env:API_PORT } else { 8787 }
Invoke-RestMethod -Uri "http://127.0.0.1:$port/seed/load" -Method POST -ContentType "application/json" -Body '{"profile":"maya-30d"}'
Write-Host "Done. Loaded maya-30d on port $port."
