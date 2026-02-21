import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { authenticateUser, authenticateUserOptional } from '../middleware/authenticateUser.js';
import { authenticateOperator } from '../middleware/authenticateOperator.js';
import { authenticateNode } from '../middleware/authenticateNode.js';
import { userRateLimiter, publicRateLimiter, ingestRateLimiter } from '../middleware/rateLimiter.js';
import crypto from 'crypto';

export default fp(async (fastify: FastifyInstance) => {
    // Register Auth Decorators
    fastify.decorate('authenticateUser', authenticateUser);
    fastify.decorate('authenticateUserOptional', authenticateUserOptional);
    fastify.decorate('authenticateOperator', authenticateOperator);
    fastify.decorate('authenticateNode', authenticateNode);

    fastify.decorate('userRateLimiter', userRateLimiter);
    fastify.decorate('publicRateLimiter', publicRateLimiter);
    fastify.decorate('ingestRateLimiter', ingestRateLimiter);

    // Global request logging
    fastify.addHook('onRequest', async (request, reply) => {
        // Generate unique ID for this request if missing
        if (!request.id) request.id = crypto.randomUUID();

        // Fastify handles basic req/res logging if configured, but as per requirements, 
        // we explicitly log a standard structured event the business logic cares about
        request.log.info({
            reqId: request.id,
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            ts: new Date().toISOString()
        }, 'Incoming Request');
    });

    // Re-log after auth completes if a user/node is active
    fastify.addHook('preHandler', async (request, reply) => {
        if (request.user || request.nodeId) {
            request.log.info({
                reqId: request.id,
                user_uid: request.user?.uid,
                node_id: request.nodeId,
                role: request.operator?.role,
            }, 'Authenticated Identity Attached');
        }
    });
}, {
    name: 'traq-auth-plugin',
});

// For TypeScript augmentation
declare module 'fastify' {
    interface FastifyInstance {
        authenticateUser: ReturnType<typeof import('../middleware/authenticateUser.js').authenticateUserFactory>;
        authenticateUserOptional: ReturnType<typeof import('../middleware/authenticateUser.js').authenticateUserFactory>;
        authenticateOperator: typeof import('../middleware/authenticateOperator.js').authenticateOperator;
        authenticateNode: typeof import('../middleware/authenticateNode.js').authenticateNode;
        userRateLimiter: ReturnType<typeof import('../middleware/rateLimiter.js').createRateLimiter>;
        publicRateLimiter: ReturnType<typeof import('../middleware/rateLimiter.js').createRateLimiter>;
        ingestRateLimiter: ReturnType<typeof import('../middleware/rateLimiter.js').createRateLimiter>;
    }
}
