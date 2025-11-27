# --- ETAPA 1: CONSTRUCCIÓN (Build) ---
# Usamos una imagen de Node.js para instalar dependencias y construir la app
FROM node:20-alpine AS builder

RUN apk upgrade --no-cache

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de manifiesto e instalamos dependencias
# Esto se cachea si los package.json no cambian
COPY package.json package-lock.json* ./
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Ejecutamos el build de producción
RUN npm run build
# Esto crea una carpeta /app/dist con los archivos optimizados

# --- ETAPA 2: SERVIDOR (Serve) ---
# Usamos una imagen de Nginx súper ligera para servir los archivos
FROM nginx:1.27-alpine

RUN apk upgrade --no-cache

# Copiamos los archivos construidos (de /app/dist) desde la etapa 'builder'
# al directorio donde Nginx sirve los archivos HTML
COPY --from=builder /app/dist /usr/share/nginx/html

# (Opcional) Copiamos una configuración personalizada de Nginx si es necesario
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (puerto estándar de Nginx)
EXPOSE 80

# El comando por defecto de Nginx se encarga de iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]