import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/railradar': {
                target: 'https://api.railradar.org/api/v1',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/railradar/, ''),
            },
        },
    },
})
