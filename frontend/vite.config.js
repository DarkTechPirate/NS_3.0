import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5178,
        watch: {
            usePolling: true, // Required for Docker on Windows/macOS (WSL2 filesystem boundary)
        },
        proxy: {
            '/api': {
                target: process.env.BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'build',
    },
});
