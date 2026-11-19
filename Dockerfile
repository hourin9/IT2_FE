# syntax=docker/dockerfile:1
# ==========================================
# STAGE 1: Build React App with Node 22
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions & reuse persistent npm cache
COPY package*.json ./
RUN --mount=type=cache,id=it2-fe-npm,target=/root/.npm npm ci

# Copy source code and build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve static files with Nginx
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Remove the Docker Compose /api proxy block when `backend` is not resolvable (e.g. Railway/PaaS with VITE_API_BASE_URL)
CMD ["sh", "-c", "if ! getent hosts backend >/dev/null 2>&1; then sed -i '/# Reverse proxy/,/^    }/d' /etc/nginx/conf.d/default.conf; fi; exec nginx -g 'daemon off;'"]
