const { spawn } = require('child_process');

console.log('🔍 Verificando Stripe CLI...');

// Ruta local de Stripe CLI
const stripePath = 'C:\\Users\\ortiz\\Desktop\\Programacion\\pagnas para portfolio\\mini-saas\\stripe-cli\\stripe.exe';

// Función para verificar si Stripe CLI está disponible
function checkStripeCLI() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`"${stripePath}" --version`, { timeout: 5000 }, (error) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function main() {
  const hasStripeCLI = await checkStripeCLI();
  
  if (!hasStripeCLI) {
    console.log('⚠️  Stripe CLI no está instalado o no está disponible.');
    console.log('💡 Para instalar: https://stripe.com/docs/stripe-cli');
    console.log('💡 Para autenticarse: stripe login');
    console.log('🔧 Si ya está instalado, asegúrate de que esté en el PATH del sistema');
    return;
  }

  console.log('✅ Stripe CLI detectado, iniciando webhook listener...');
  
  // Esperar 3 segundos para que Next.js se inicie primero
  setTimeout(() => {
    const stripeProcess = spawn(stripePath, [
      'listen', 
      '--forward-to', 
      'localhost:3000/api/webhooks/stripe'
    ], {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd()
    });

    stripeProcess.on('error', (err) => {
      console.log('❌ Error al iniciar Stripe:', err.message);
      console.log('💡 Verifica que Stripe CLI esté instalado y autenticado');
    });

    stripeProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`⚠️  Stripe listener terminó con código ${code}`);
      }
    });

    // Manejar cierre limpio
    process.on('SIGINT', () => {
      stripeProcess.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      stripeProcess.kill('SIGTERM');
      process.exit(0);
    });
  }, 3000);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
