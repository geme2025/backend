# Usar imagen oficial de Node.js LTS basada en Debian (incluye OpenSSL)
FROM node:18-slim

# Instalar OpenSSL necesario para Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de producción
RUN npm ci --prefer-offline --no-audit || npm install --only=production

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Exponer el puerto (Render asigna dinámicamente PORT)
EXPOSE 5000

# Usuario no root para seguridad
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash nodejs
USER nodejs

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
