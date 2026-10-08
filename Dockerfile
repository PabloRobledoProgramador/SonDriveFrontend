# Imagen de desarrollo del frontend (servidor de Vite con recarga en caliente).
# Se usa desde el docker-compose.yml de SonDriveBackend, que monta el código en /app.
FROM node:24-alpine

WORKDIR /app

# Dependencias primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
