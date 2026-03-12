# Etapa base para construcción - CAMBIO IMPORTANTE
FROM node:20-slim AS builder 

WORKDIR /app

# Copiar dependencias del proyecto
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Argumento para entorno de vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Ejecutar la construcción
RUN npm run build


# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]