# Etapa 1: Construir la app React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci  # Mejor que npm install para builds reproducibles

COPY . .

# Pasar variable de entorno en build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación
RUN npm run build


# Etapa 2: Servir con Nginx (MUCHO MÁS LIGERO Y RÁPIDO)
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/build /usr/share/nginx/html

# Configuración personalizada para React Router v7
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]