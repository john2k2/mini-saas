const { PrismaClient } = require('./app/generated/prisma');

async function checkAndFixSubscription() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuarios y suscripciones...');
    
    // Buscar todos los usuarios
    const users = await prisma.user.findMany({
      include: {
        subscription: true
      }
    });
    
    console.log('\n📋 Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Suscripción: ${user.subscription?.status || 'ninguna'}`);
      if (user.name) console.log(`   Nombre: ${user.name}`);
    });
    
    // Buscar el usuario con "John ortiz" o similar
    const johnUser = users.find(user => 
      user.name?.toLowerCase().includes('john') || 
      user.name?.toLowerCase().includes('ortiz') ||
      user.email?.toLowerCase().includes('john')
    );
    
    if (johnUser) {
      console.log(`\n👤 Usuario John encontrado: ${johnUser.email}`);
      
      // Verificar si ya tiene suscripción activa
      if (johnUser.subscription?.status === 'active') {
        console.log('✅ Ya tiene suscripción activa');
        return;
      }
      
      // Crear o actualizar suscripción
      const subscription = await prisma.subscription.upsert({
        where: { userId: johnUser.id },
        update: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_john_' + Date.now(),
          stripeSubscriptionId: 'test_sub_john_' + Date.now()
        },
        create: {
          userId: johnUser.id,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          stripeCustomerId: 'test_customer_john_' + Date.now(),
          stripeSubscriptionId: 'test_sub_john_' + Date.now()
        }
      });
      
      console.log('✅ Suscripción creada/actualizada para John');
      console.log(`📊 Estado: ${subscription.status}`);
      console.log('🎉 ¡Ahora John puede acceder al contenido premium!');
      
    } else {
      console.log('\n❌ No se encontró usuario con "John" en el nombre');
      console.log('Los usuarios disponibles son:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.name || 'sin nombre'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixSubscription();
