# Etapa 1: Construcción
FROM node:20-slim AS builder

WORKDIR /app

# Copiar dependencias
COPY package.json ./

# Instalar dependencias (usamos install por compatibilidad)
RUN npm install

# Copiar código fuente
COPY . .

# Variable de entorno para la API (pasada en build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la app
RUN npm run build


# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]