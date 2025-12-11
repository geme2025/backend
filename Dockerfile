# Usar imagen oficial de Node.js LTS
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --prefer-offline --no-audit || npm install --only=production

# Copiar el resto del código
COPY . .

# Exponer el puerto (Render asigna dinámicamente PORT)
EXPOSE 5000

# Usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
