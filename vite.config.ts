import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        drop: ['console', 'debugger'], // Remove console.log in production
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor chunks for better caching
                    vendor: ['react', 'react-dom'],
                    ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-navigation-menu', '@radix-ui/react-dropdown-menu'],
                    utils: ['clsx', 'tailwind-merge'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false, // Disable sourcemaps for production
        cssCodeSplit: true, // Enable CSS code splitting
        cssMinify: true, // Minify CSS
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        hmr: {
            overlay: false, // Disable error overlay for better performance
        },
        cors: {
            origin: [
                // Development URLs
                'http://localhost:8000',
                'http://localhost:8001',
                'https://localhost:8000',
                'https://localhost:8001',
                'http://astroworks.test',
                'https://astroworks.test',
                // Production URLs (ready for future deployment)
                ...(process.env.NODE_ENV === 'production' ? [
                    'https://astrokabinet.id',
                    'https://www.astrokabinet.id',
                    'https://admin.astrokabinet.id',
                    'https://dashboard.astrokabinet.id'
                ] : [])
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'X-CSRF-TOKEN',
                'X-Inertia',
                'X-Inertia-Version',
                'Accept'
            ]
        },
        host: true,
        port: 5173,
        strictPort: false,
    },
});
