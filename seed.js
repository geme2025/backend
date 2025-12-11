import bcrypt from 'bcryptjs';
import { prisma } from './src/config/prisma.js';

async function seed() {
  try {
    // Verificar si ya existe un admin
    const adminExiste = await prisma.user.findUnique({
      where: { email: 'admin@lennin.com' }
    });

    if (adminExiste) {
      console.log('⚠️ El usuario admin ya existe');
      await prisma.$disconnect();
      return;
    }

    // Crear usuario admin
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    const user = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@lennin.com',
        password: password,
        role: 'admin'
      }
    });

    console.log('✅ Usuario administrador creado:');
    console.log('   Email: admin@lennin.com');
    console.log('   Password: admin123');
    console.log('   Role:', user.role);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seed();
