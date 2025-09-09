const { PrismaClient } = require('./app/generated/prisma');

const prisma = new PrismaClient();

async function createTestSubscription() {
  try {
    console.log('🔍 Buscando usuarios existentes...');
    
    // Buscar todos los usuarios
    const users = await prisma.user.findMany();
    console.log(`📋 Usuarios encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios. Primero inicia sesión en la aplicación.');
      return;
    }

    const user = users[0];
    console.log(`👤 Usuario seleccionado: ${user.email}`);

    // Verificar si ya tiene suscripción
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (existingSub) {
      // Actualizar suscripción existente
      const updated = await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_' + Date.now(),
          stripeSubscriptionId: 'test_sub_' + Date.now()
        }
      });
      console.log('✅ Suscripción actualizada exitosamente');
      console.log('📊 Estado:', updated.status);
    } else {
      // Crear nueva suscripción
      const newSub = await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_' + Date.now(),
          stripeSubscriptionId: 'test_sub_' + Date.now(),
          stripePriceId: 'price_premium_monthly'
        }
      });
      console.log('✅ Suscripción creada exitosamente');
      console.log('📊 Estado:', newSub.status);
    }

    console.log('🎉 ¡Ahora puedes acceder al contenido premium!');
    console.log('🔄 Recarga la página /premium en tu navegador');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscription();
