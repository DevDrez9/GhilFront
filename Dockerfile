# Etapa base para construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias del proyecto
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (necesarias para la construcción)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Argumento para entorno de vite, ya que necesita saber la URL de la API en tiempo de compilación
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Ejecutar la construcción del proyecto (React Router build)
RUN npm run build


# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Configurar el entorno de producción
ENV NODE_ENV=production
ENV PORT=2001

# Copiar los archivos necesarios desde la etapa builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Exponer el puerto por el que correrá la aplicación
EXPOSE 2001

# Comando para iniciar el servidor de React Router
CMD ["npm", "start"]