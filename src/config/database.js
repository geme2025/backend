import mongoose from 'mongoose';

const conectarDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
      console.log(`📊 Base de Datos: ${conn.connection.name}`);
    } else {
      console.log('✅ MongoDB Conectado exitosamente');
    }
  } catch (error) {
    console.error(`❌ Error al conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default conectarDB;
