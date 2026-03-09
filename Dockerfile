# Usamos una imagen de Node.js como base
FROM node:20-slim

# Instalamos Python y FFmpeg (Vital para que yt-dlp funcione en Linux)
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Directorio donde vivirá la app en el servidor
WORKDIR /app

# Copiamos los archivos de configuración de librerías
COPY package*.json ./

# Instalamos las librerías de Node
RUN npm install

# Copiamos todo tu código (incluyendo la carpeta dist con Angular)
COPY . .

# Exponemos el puerto (el que definimos en el .env)
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "app.js"]