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

# Remove default html
RUN rm -rf /usr/share/nginx/html/*

# Copy built site
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy fixed nginx config
COPY nginx.conf.template /etc/nginx/conf.d/default.conf

# Expose Cloud Run port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
