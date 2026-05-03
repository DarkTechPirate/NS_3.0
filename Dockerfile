# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Build for production (outputs to /app/frontend/build)
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM node:20-alpine
WORKDIR /app

# Set default internal port
ENV PORT=3002

# Install Nginx and PM2
RUN apk add --no-cache nginx \
    && npm install -g pm2

# Setup Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy Frontend Build
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/build ./build

# Copy Nginx Config
COPY nginx/nginx.conf /etc/nginx/http.d/default.conf

# Setup Entrypoint
WORKDIR /app
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose Nginx port
EXPOSE 3000

CMD ["./entrypoint.sh"]
