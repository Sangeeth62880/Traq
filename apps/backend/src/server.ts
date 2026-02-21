import { buildApp } from './app.js';

const start = async () => {
    const app = await buildApp();
    try {
        const port = parseInt(process.env['PORT'] ?? '3000', 10);
        const host = process.env['HOST'] ?? '0.0.0.0';
        await app.listen({ port, host });
        app.log.info(`🚂 TRAQ Backend running on http://${host}:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

void start();
