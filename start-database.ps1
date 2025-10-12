# Script para iniciar la base de datos PostgreSQL con Docker Compose
# Uso: .\start-database.ps1

Write-Host "🚀 Iniciando base de datos PostgreSQL..." -ForegroundColor Green

# Verificar si Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Verificar si Docker está corriendo
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si docker-compose.yml existe
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: No se encontró docker-compose.yml" -ForegroundColor Red
    exit 1
}

# Iniciar contenedor
Write-Host "⏳ Iniciando contenedor de PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Base de datos PostgreSQL iniciada correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Información de conexión:" -ForegroundColor Cyan
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Puerto: 5432" -ForegroundColor White
    Write-Host "  Usuario: postgres" -ForegroundColor White
    Write-Host "  Password: password" -ForegroundColor White
    Write-Host "  Database: flex-calendar" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Connection String:" -ForegroundColor Cyan
    Write-Host "  postgresql://postgres:password@localhost:5432/flex-calendar" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  docker-compose ps         - Ver estado del contenedor" -ForegroundColor Gray
    Write-Host "  docker-compose logs -f    - Ver logs en tiempo real" -ForegroundColor Gray
    Write-Host "  docker-compose stop       - Detener el contenedor" -ForegroundColor Gray
    Write-Host "  docker-compose down       - Detener y eliminar el contenedor" -ForegroundColor Gray
    Write-Host "  docker-compose down -v    - Detener y eliminar (incluyendo datos)" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Error al iniciar el contenedor" -ForegroundColor Red
    exit 1
}
