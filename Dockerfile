# Build the existing Vite PWA, then serve only its static production output.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . ./
RUN npm run build

# This image is configured to run Nginx as its unprivileged user (UID 101).
FROM nginxinc/nginx-unprivileged:1.30.4-alpine3.24

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist/ /usr/share/nginx/html/

EXPOSE 8080
USER 101
