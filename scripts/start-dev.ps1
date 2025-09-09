# Script para iniciar Next.js y Stripe automáticamente
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green
Write-Host ""

# Función para verificar si Stripe CLI está disponible
function Test-StripeCLI {
    try {
        $null = stripe --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Verificar si Stripe CLI está instalado
$hasStripeCLI = Test-StripeCLI

if (-not $hasStripeCLI) {
    Write-Host "⚠️  Stripe CLI no está instalado. Solo iniciando Next.js..." -ForegroundColor Yellow
    Write-Host "💡 Para instalar Stripe CLI: https://stripe.com/docs/stripe-cli" -ForegroundColor Cyan
    Write-Host ""
}

# Iniciar Next.js
Write-Host "🌐 Iniciando Next.js server..." -ForegroundColor Blue
$nextJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:next
}

# Esperar un poco y luego iniciar Stripe si está disponible
if ($hasStripeCLI) {
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "💳 Iniciando Stripe webhook listener..." -ForegroundColor Magenta
    
    $stripeJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        stripe listen --forward-to localhost:3000/api/webhooks/stripe
    }
    
    Write-Host ""
    Write-Host "✅ Ambos servidores iniciados:" -ForegroundColor Green
    Write-Host "   🌐 Next.js: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   💳 Stripe: Escuchando webhooks" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✅ Next.js iniciado:" -ForegroundColor Green
    Write-Host "   🌐 URL: http://localhost:3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🛑 Presiona Ctrl+C para detener todos los servidores" -ForegroundColor Red
Write-Host ""

# Mostrar logs de Next.js en tiempo real
try {
    while ($true) {
        $nextOutput = Receive-Job -Job $nextJob -ErrorAction SilentlyContinue
        if ($nextOutput) {
            Write-Output $nextOutput
        }
        
        if ($hasStripeCLI -and $stripeJob) {
            $stripeOutput = Receive-Job -Job $stripeJob -ErrorAction SilentlyContinue
            if ($stripeOutput) {
                Write-Host $stripeOutput -ForegroundColor Magenta
            }
        }
        
        Start-Sleep -Milliseconds 100
        
        # Verificar si los jobs siguen corriendo
        if ($nextJob.State -eq "Completed" -or $nextJob.State -eq "Failed") {
            break
        }
    }
}
finally {
    # Limpiar jobs al salir
    Write-Host ""
    Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
    
    if ($nextJob) {
        Stop-Job -Job $nextJob -ErrorAction SilentlyContinue
        Remove-Job -Job $nextJob -ErrorAction SilentlyContinue
    }
    
    if ($hasStripeCLI -and $stripeJob) {
        Stop-Job -Job $stripeJob -ErrorAction SilentlyContinue
        Remove-Job -Job $stripeJob -ErrorAction SilentlyContinue
    }
    
    Write-Host "✅ Servidores detenidos" -ForegroundColor Green
}
