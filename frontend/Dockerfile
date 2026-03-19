# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add ARGs for build-time env vars
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
