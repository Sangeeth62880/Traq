import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth.plugin.js';
import { trainsRoutes } from './routes/trains.routes.js';

dotenv.config({ path: '../../../.env' });

export const buildApp = async () => {
    const fastify = Fastify({
        logger: {
            level: process.env['LOG_LEVEL'] ?? 'info',
            ...(process.env['NODE_ENV'] === 'development' ? { transport: { target: 'pino-pretty' } } : {}),
        },
        disableRequestLogging: true, // We do our own structured onRequest/preHandler logging in auth.plugin
    });

    // --- Core Plugins ---
    await fastify.register(cors, {
        origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:5173'],
        credentials: true,
    });

    await fastify.register(helmet);

    // --- Auth Plugin ---
    await fastify.register(authPlugin);

    // --- Global Error Handler ---
    fastify.setErrorHandler((error, request, reply) => {
        request.log.error({ err: error, reqId: request.id }, 'Unhandled Error');

        // Handle validation errors from fastify's internal schema validator if used
        if (error.validation) {
            return reply.code(400).send({
                success: false,
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: error.validation,
            });
        }

        // Default 500
        const statusCode = error.statusCode ?? 500;
        const isProd = process.env['NODE_ENV'] === 'production';

        return reply.code(statusCode).send({
            success: false,
            code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR',
            message: isProd && statusCode === 500 ? 'An unexpected error occurred' : error.message,
        });
    });

    // --- Health Check ---
    fastify.get('/health', async () => ({
        status: 'ok',
        service: 'traq-backend',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }));

    // --- API Routes Prefix ---
    fastify.register(async (api) => {
        api.get('/', async () => ({
            message: 'TRAQ API v1',
            endpoints: {
                health: '/health',
            },
        }));

        // Future route registration goes here (e.g. users, trains, ingestion)
        api.register(trainsRoutes, { prefix: '/trains' });

    }, { prefix: '/api/v1' });

    // --- Graceful Shutdown ---
    const listeners = ['SIGINT', 'SIGTERM'];
    for (const signal of listeners) {
        process.on(signal, async () => {
            fastify.log.info(`Received ${signal}. Gracefully shutting down...`);
            await fastify.close();
            process.exit(0);
        });
    }

    return fastify;
};
