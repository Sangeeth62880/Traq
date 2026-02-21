import Redis from 'ioredis';

const REDIS_URL = process.env['REDIS_URL'] || 'redis://localhost:6379';

// Initialize Redis client. It will automatically reconnect on disconnect.
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy(times) {
        // Exponential backoff with a max of 3 seconds
        const delay = Math.min(times * 500, 3000);
        return delay;
    },
});

redis.on('error', (err) => {
    // Log error but do not crash the application. The application will continue
    // tracking state and will fallback to secondary/tertiary data sources gracefully.
    console.error('[Redis Core] Connection Error:', err);
});

redis.on('connect', () => {
    console.info('[Redis Core] Connected successfully');
});

/**
 * Get a parsed JSON value from Redis cache.
 * Fails gracefully and returns null if Redis is down or parsing fails.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        if (redis.status !== 'ready') return null;

        const data = await redis.get(key);
        if (!data) return null;

        return JSON.parse(data) as T;
    } catch (err) {
        console.error(`[Redis] Failed to GET cache key ${key}:`, err);
        return null; // Graceful degradation
    }
}

/**
 * Set a JSON serializable value in Redis with a TTL.
 * Fails gracefully if Redis is down.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
        if (redis.status !== 'ready') return;

        const serialized = JSON.stringify(value);
        await redis.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
        console.error(`[Redis] Failed to SET cache key ${key}:`, err);
    }
}

/**
 * Delete a key from Redis.
 */
export async function cacheDel(key: string): Promise<void> {
    try {
        if (redis.status !== 'ready') return;

        await redis.del(key);
    } catch (err) {
        console.error(`[Redis] Failed to DEL cache key ${key}:`, err);
    }
}
