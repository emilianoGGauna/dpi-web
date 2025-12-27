# ============================
# 1️⃣ BUILD STAGE – Node + Vite
# ============================
FROM node:18 AS builder

# Working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build production bundle
RUN npm run build


# ============================
# 2️⃣ PRODUCTION STAGE – NGINX
# ============================
FROM nginx:stable-alpine

# Cloud Run requires listening on $PORT (default 8080)
ENV PORT=8080

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Cloud Run port
EXPOSE 8080

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
