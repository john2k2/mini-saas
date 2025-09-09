const { spawn } = require('child_process');

console.log('🚀 Iniciando servidores...\n');

// Función para verificar si Stripe CLI está disponible
function checkStripeCLI() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('stripe --version', { timeout: 5000 }, (error) => {
      resolve(!error);
    });
  });
}

async function startServers() {
  // Verificar si Stripe CLI está instalado
  const hasStripeCLI = await checkStripeCLI();
  
  if (!hasStripeCLI) {
    console.log('⚠️  Stripe CLI no está instalado. Solo iniciando Next.js...\n');
    console.log('💡 Para instalar Stripe CLI: https://stripe.com/docs/stripe-cli\n');
  }

  // Iniciar Next.js
  console.log('🌐 Iniciando Next.js server...');
  const nextProcess = spawn('npm', ['run', 'dev:next'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    cwd: process.cwd()
  });

  // Mostrar output de Next.js
  nextProcess.stdout.on('data', (data) => {
    process.stdout.write(`[Next.js] ${data}`);
  });

  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(`[Next.js] ${data}`);
  });

  // Esperar un poco antes de iniciar Stripe
  if (hasStripeCLI) {
    setTimeout(async () => {
      console.log('\n💳 Iniciando Stripe webhook listener...');
      
      const stripeProcess = spawn('stripe', [
        'listen', 
        '--forward-to', 
        'localhost:3000/api/webhooks/stripe'
      ], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        cwd: process.cwd()
      });

      // Mostrar output de Stripe
      stripeProcess.stdout.on('data', (data) => {
        process.stdout.write(`[Stripe] ${data}`);
      });

      stripeProcess.stderr.on('data', (data) => {
        process.stderr.write(`[Stripe] ${data}`);
      });

      // Manejar la finalización del proceso de Stripe
      stripeProcess.on('close', (code) => {
        if (code !== 0 && code !== null) {
          console.log(`\n⚠️  Stripe listener terminó con código ${code}`);
          console.log('💡 Puedes reiniciarlo manualmente con: npm run dev:stripe');
        }
      });

      stripeProcess.on('error', (err) => {
        console.log('\n❌ Error iniciando Stripe listener:', err.message);
        console.log('💡 Asegúrate de estar autenticado con: stripe login');
      });

      // Guardar referencia para cleanup
      process.stripeProcess = stripeProcess;
    }, 3000);
  }

  console.log('\n✅ Servidores iniciados:');
  console.log('   🌐 Next.js: http://localhost:3000');
  if (hasStripeCLI) {
    console.log('   💳 Stripe: Escuchando webhooks');
  }
  console.log('\n🛑 Presiona Ctrl+C para detener todos los servidores\n');

  // Manejar la finalización del proceso principal
  const cleanup = () => {
    console.log('\n🛑 Cerrando servidores...');
    
    if (process.stripeProcess) {
      process.stripeProcess.kill('SIGTERM');
    }
    
    nextProcess.kill('SIGTERM');
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  nextProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n📦 Next.js server terminó con código ${code}`);
    }
    process.exit(code || 0);
  });

  nextProcess.on('error', (err) => {
    console.log('\n❌ Error iniciando Next.js:', err.message);
    process.exit(1);
  });
}

startServers().catch((err) => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
