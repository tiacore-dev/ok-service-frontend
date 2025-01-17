# Use an official node image as the base
FROM node:20 as build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application and build it
COPY . .
RUN npm run build

# Устанавливаем "serve" для отдачи build-содержимого
RUN npm install -g serve

# Открываем 80-й порт внутри контейнера
EXPOSE 80

# Запускаем "serve" на 80 порту
CMD ["serve", "-s", "build", "-l", "80"]
