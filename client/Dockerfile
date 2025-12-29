# ============================
# 1️⃣ BUILD STAGE – Node
# ============================
FROM node:18 AS builder

WORKDIR /app

# 👇 Recibe el build-arg desde cloudbuild.yaml
ARG VITE_IMAGES_API_BASE

# 👇 Lo expone como variable de entorno para "npm run build" (Vite lo lee aquí)
ENV VITE_IMAGES_API_BASE=$VITE_IMAGES_API_BASE

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ============================
# 2️⃣ PRODUCTION STAGE – NGINX
# ============================
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# OJO: esto ya no es "template" realmente, es config final
COPY nginx.conf.template /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
