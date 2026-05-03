#!/bin/sh

# Ensure nginx run directory exists
mkdir -p /run/nginx

echo "Starting Application via PM2..."
cd /app/backend
pm2-runtime ecosystem.config.js
