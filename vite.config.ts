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
                    ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
                    utils: ['clsx', 'tailwind-merge'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false, // Disable sourcemaps for production
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
    },
});
