# ---------- build ----------
FROM node:20 AS builder
WORKDIR /app

ARG REACT_APP_API_URL
ARG REACT_APP_WP
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_WP=$REACT_APP_WP \
    NODE_OPTIONS=--max-old-space-size=1024 \
    CI=false \
    GENERATE_SOURCEMAP=false

# Copy only manifest files to leverage Docker layer caching.
COPY package.json package-lock.json ./

# Deterministic install based on the lockfile.
RUN npm ci --legacy-peer-deps

# Now copy the rest of the sources and build the application.
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:20
WORKDIR /app

# serve is installed while the image is still root-owned; the application
# itself runs as the non-root node user below.
RUN npm install -g serve

ENV PORT=3000 \
    NODE_ENV=production

COPY --from=builder --chown=node:node /app/build ./build

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/', (res) => process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["serve", "-s", "build", "-l", "3000"]
