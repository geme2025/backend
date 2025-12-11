import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Conectar y verificar conexión
const conectarDB = async () => {
  try {
    await prisma.$connect();
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ PostgreSQL Conectado exitosamente');
    } else {
      console.log('✅ PostgreSQL Conectado exitosamente');
    }
  } catch (error) {
    console.error(`❌ Error al conectar PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

export { prisma, conectarDB };
