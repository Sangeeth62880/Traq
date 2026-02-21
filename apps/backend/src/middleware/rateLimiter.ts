import { FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

// In a real app we'd attach Redis to fastify, but for standalone exported
// middleware we lazy-load or use a singleton.
let redis: Redis | null = null;
const getRedis = () => {
    if (!redis) {
        redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
    }
    return redis;
};

interface RateLimiterOptions {
    keyPrefix: string;
    maxRequests: number;
    windowSeconds: number;
    keyExtractor: (req: FastifyRequest) => string;
}

/**
 * Creates a sliding-window rate limiter using Redis MULTI/EXEC
 */
export const createRateLimiter = ({
    keyPrefix,
    maxRequests,
    windowSeconds,
    keyExtractor,
}: RateLimiterOptions) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const keyPart = keyExtractor(request);
        if (!keyPart) {
            // If we can't extract a key, we allow it (or we could deny).
            // e.g. unauthenticated users hitting a uid-based limiter will bypass,
            // but they should be caught by auth middleware first.
            return;
        }

        const redisKey = `ratelimit:${keyPrefix}:${keyPart}`;
        const nowMs = Date.now();
        const windowStartMs = nowMs - windowSeconds * 1000;
        const client = getRedis();

        // Generate a unique value for this specific request
        const requestUuid = randomUUID();

        try {
            // Execute a transactional pipeline
            const results = await client
                .multi()
                // 1. Remove events older than the window
                .zremrangebyscore(redisKey, 0, windowStartMs)
                // 2. Add current request
                .zadd(redisKey, nowMs, requestUuid)
                // 3. Count remaining valid events in window
                .zcard(redisKey)
                // 4. Update TTL to window size so it cleans up if inactive
                .expire(redisKey, windowSeconds)
                .exec();

            if (!results) {
                request.log.warn('Redis transaction failed during rate limiting');
                return; // Fail open
            }

            // zcard result is the 3rd operation (index 2)
            // ioredis multi result format: [[error, result], [error, result], ...]
            const countResult = results[2];
            if (!countResult || countResult[0]) {
                request.log.warn({ err: countResult?.[0] }, 'Redis count failed');
                return; // Fail open
            }

            const requestCount = countResult[1] as number;

            // Set headers
            void reply.header('X-RateLimit-Limit', maxRequests);
            void reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));

            if (requestCount > maxRequests) {
                const resetTimeSecs = Math.ceil((nowMs + windowSeconds * 1000) / 1000);
                void reply.header('X-RateLimit-Reset', resetTimeSecs);
                void reply.header('Retry-After', windowSeconds);

                return reply.code(429).send({
                    success: false,
                    code: 'RATE_LIMITED',
                    message: 'Too many requests',
                    retry_after: windowSeconds,
                });
            }

        } catch (err) {
            request.log.error({ err }, 'Sliding window rate limiter failed');
            // Always fail open for rate limiters to prevent bringing the system down on Redis issues
        }
    };
};

// Pre-built instances
export const userRateLimiter = createRateLimiter({
    keyPrefix: 'user',
    maxRequests: 100,
    windowSeconds: 60,
    keyExtractor: (req) => req.user?.uid ?? req.ip,
});

export const publicRateLimiter = createRateLimiter({
    keyPrefix: 'public',
    maxRequests: 30,
    windowSeconds: 60,
    keyExtractor: (req) => req.ip,
});

export const ingestRateLimiter = createRateLimiter({
    keyPrefix: 'node',
    maxRequests: 10,
    windowSeconds: 30, // 30s as per prompt
    keyExtractor: (req) => req.headers['x-node-id'] as string ?? req.ip,
});
