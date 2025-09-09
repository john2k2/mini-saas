import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestSubscription() {
  try {
    // Obtener el primer usuario (debería ser tu usuario)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No se encontró ningún usuario. Primero inicia sesión en la aplicación.');
      return;
    }

    console.log(`Creando suscripción para el usuario: ${user.email}`);

    // Verificar si ya tiene una suscripción
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (existingSub) {
      // Actualizar la suscripción existente
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_id',
          stripeSubscriptionId: 'test_subscription_id',
          stripePriceId: 'test_price_id'
        }
      });
      console.log('✅ Suscripción actualizada exitosamente');
    } else {
      // Crear nueva suscripción
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_id',
          stripeSubscriptionId: 'test_subscription_id',
          stripePriceId: 'test_price_id'
        }
      });
      console.log('✅ Suscripción creada exitosamente');
    }

    console.log('🎉 Ahora tienes acceso al contenido premium!');
    
  } catch (error) {
    console.error('Error creando la suscripción:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscription();
