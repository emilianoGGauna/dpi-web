# ============================
# 1️⃣ BUILD STAGE – Node
# ============================
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy project files
COPY . .

# Build for production
RUN npm run build

# ============================
# 2️⃣ PRODUCTION STAGE – NGINX
# ============================
FROM nginx:stable-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
