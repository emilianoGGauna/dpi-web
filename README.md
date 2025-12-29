# DPI – Diseño Planeación Integral  
### Sitio Web Corporativo – React + Vite + TailwindCSS + Node API (GCP)

Este repositorio contiene el código del sitio web oficial de **DPI – Diseño Planeación Integral**.

El proyecto está dividido en 2 partes:

- **client/** → Frontend (React + Vite + Tailwind) servido con NGINX (Cloud Run)
- **server/** → Backend API (Node + Express) para servir imágenes desde **Google Cloud Storage** (Cloud Run)

---

## ✅ Tecnologías

### Frontend (`client/`)
- React
- Vite
- TailwindCSS
- Lucide Icons
- Modo Oscuro / Claro (localStorage)
- NGINX (producción)

### Backend (`server/`)
- Node.js + Express
- Google Cloud Storage SDK
- Sharp (resize/format)
- Zod (validación de query params)
- Variables de entorno (.env en local / env vars en Cloud Run)

---

## 📂 Estructura del Proyecto

```
web_page/
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf.template
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend API (Node)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   └── images.js
│   │   └── middleware/
│   │       └── requireApiKey.js
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env (NO se commitea)
│
├── cloudbuild.yaml              # CI/CD (build + deploy a Cloud Run)
├── README.md
└── .gitignore
```

---

## 🌐 Cómo funciona el sistema de imágenes (GCP)

Los assets se guardan en un bucket de **Google Cloud Storage** (ej. `dpi-info`).

El frontend **NO** consume imágenes directamente del bucket.  
En su lugar, consume imágenes desde el backend:

**Frontend → GET /api/images → Backend → GCS → Sharp → responde imagen optimizada**

Ejemplo (local):
```
http://127.0.0.1:8080/api/images?object=LOGO%20DPI.jpg&w=1200&q=80&format=jpeg
```

Esto te permite:
- Controlar tamaños (`w`)
- Controlar calidad (`q`)
- Convertir formato (`format` webp/jpeg/png)
- Usar cache headers para mejorar rendimiento

---

## ▶️ Correr el proyecto localmente

### 1) Backend (API)
En una terminal:

```bash
cd server
npm install
npm run dev
```

Probar health:
```bash
curl http://127.0.0.1:8080/health
```

Probar imagen:
```bash
curl -o test.jpg "http://127.0.0.1:8080/api/images?object=LOGO%20DPI.jpg&w=600&q=80&format=jpeg"
```

> Nota: si usas autenticación ADC en tu máquina, el backend puede leer del bucket automáticamente.

---

### 2) Frontend (React)
En otra terminal:

```bash
cd client
npm install
npm run dev
```

Abre el sitio en:
```
http://localhost:5173
```

---

## ⚙️ Variables de entorno

### Backend (`server/.env`) – local
Ejemplo:

```env
GCS_ORIGINAL_BUCKET=dpi-info
GCS_CACHE_BUCKET=dpi-info-cache
CACHE_TTL_SECONDS=86400

# opcional: si activas API key (NO recomendado si usas <img>)
IMAGE_API_KEY=tu_key
```

### Frontend (`client/.env`) – local
```env
VITE_IMAGES_API_BASE=http://127.0.0.1:8080
```

---

## ☁️ Deploy a Google Cloud (Cloud Run)

Este proyecto despliega **dos servicios** en Cloud Run:

- `dpi-web` → Frontend NGINX (desde `client/Dockerfile`)
- `dpi-api` → Backend Node API (desde `server/Dockerfile`)

El archivo `cloudbuild.yaml` construye, sube a Artifact Registry y despliega ambos.

---

## 🧪 Pruebas rápidas (backend)
Desde `server/` puedes descargar una imagen desde el API:

```bash
npm run test:image
```

---

## 📦 Build de Producción (frontend)
Dentro de `client/`:

```bash
npm run build
npm run preview
```

---

## 📥 Descargar el proyecto (GitHub)

### Opción 1: Descargar ZIP
En GitHub:
- Click en **Code**
- Click en **Download ZIP**

### Opción 2: Clonar repositorio
```bash
git clone <URL_DEL_REPO>
cd web_page
```

---

## 📌 Secciones del Sitio

- Inicio
- Quiénes Somos
- Servicios
- Metodología
- Proyectos (filtros + buscador)
- Clientes
- Por qué DPI
- Contacto (WhatsApp prellenado + mapa clickeable)
- Footer

---

## 📄 Licencia
Uso privado — DPI Diseño Planeación Integral.

---

## 👤 Autor
**Emiliano Gauna**  
GitHub: https://github.com/emilianoGGauna
