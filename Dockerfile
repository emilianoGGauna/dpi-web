# ============================
# 1️⃣ BUILD STAGE – Node
# ============================
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ============================
# 2️⃣ PRODUCTION STAGE – NGINX
# ============================
FROM nginx:stable-alpine

# Install envsubst
RUN apk add --no-cache gettext

# Remove default html
RUN rm -rf /usr/share/nginx/html/*

# Copy built site
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy template config
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Expose Cloud Run port
EXPOSE 8080

# Start nginx with envsubst
CMD ["/bin/sh", "-c", "\
    envsubst < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'"]
