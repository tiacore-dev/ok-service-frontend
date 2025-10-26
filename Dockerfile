# Use an official node image as the base
FROM node:20 as build

# Set working directory
WORKDIR /app

ARG REACT_APP_API_URL
ARG REACT_APP_WP

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WP=$REACT_APP_WP

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application and build it
COPY . .
# Force the build layer to rebuild whenever API/WP values change
RUN REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_WP=$REACT_APP_WP \
    npm run build

# Устанавливаем "serve" для отдачи build-содержимого
RUN npm install -g serve

# Открываем 80-й порт внутри контейнера
EXPOSE 80

# Запускаем "serve" на 80 порту
CMD ["serve", "-s", "build", "-l", "80"]
