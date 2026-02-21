import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // /railradar/search/stations?query=nd
            //   ↓ rewrites to
            // https://api.railradar.org/api/v1/search/stations?query=nd
            '/railradar': {
                target: 'https://api.railradar.org',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/railradar/, '/api/v1'),
                configure: (proxy) => {
                    proxy.on('error', (err, req) => {
                        console.error('[proxy error]', req.url, err.message)
                    })
                    proxy.on('proxyReq', (_, req) => {
                        console.log('[proxy →]', req.method, req.url)
                    })
                    proxy.on('proxyRes', (res, req) => {
                        console.log('[proxy ←]', res.statusCode, req.url)
                    })
                },
            },
        },
    },
})
