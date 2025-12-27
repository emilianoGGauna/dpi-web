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

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Cloud Run ignores this but keeps Docker happy)
EXPOSE 8080

# Replace env vars inside nginx.conf and start nginx
CMD ["/bin/sh", "-c", \
    "envsubst < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && \
     nginx -g 'daemon off;'"]
