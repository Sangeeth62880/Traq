import type { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { trainDataService } from '../services/trainDataService';

export const trainsRoutes: FastifyPluginAsync = async (app) => {

    // GET /search?q={query}
    app.get('/search', {
        schema: {
            querystring: Type.Object({
                q: Type.String({ minLength: 2, maxLength: 50 })
            }),
            response: {
                200: Type.Object({
                    trains: Type.Array(Type.Any()), // Ideally mapped to a TypeBox representation of TrainResult
                    cached: Type.Boolean(),
                    apiDown: Type.Optional(Type.Boolean())
                })
            }
        },
        preHandler: app.publicRateLimiter // Use optional chaining to be safe if not mounted
    }, async (request, reply) => {
        const { q } = request.query as { q: string };
        const results = await trainDataService.searchTrains(q);

        reply.header('x-response-time', reply.elapsedTime.toString());
        return {
            trains: results,
            cached: results.every(r => r.cached) || false,
            apiDown: results.some(r => r.apiDown)
        };
    });

    // GET /:trainNumber/status
    app.get('/:trainNumber/status', {
        schema: {
            params: Type.Object({
                trainNumber: Type.String({ pattern: '^\\d{4,5}$' })
            }),
            response: {
                200: Type.Object({
                    status: Type.Any(), // TrainStatus
                    stale: Type.Optional(Type.Boolean())
                })
            }
        },
        preHandler: app.publicRateLimiter
    }, async (request, reply) => {
        const { trainNumber } = request.params as { trainNumber: string };
        const result = await trainDataService.getTrainStatus(trainNumber);

        reply.header('x-response-time', reply.elapsedTime.toString());
        return { status: result, stale: result.stale };
    });

    // GET /:trainNumber/schedule
    app.get('/:trainNumber/schedule', {
        schema: {
            params: Type.Object({
                trainNumber: Type.String()
            }),
            response: {
                200: Type.Object({
                    schedule: Type.Array(Type.Any())
                })
            }
        },
        preHandler: app.publicRateLimiter
    }, async (request, reply) => {
        const { trainNumber } = request.params as { trainNumber: string };
        const result = await trainDataService.getTrainSchedule(trainNumber);

        reply.header('x-response-time', reply.elapsedTime.toString());
        return { schedule: result };
    });

    // GET /route?from={code}&to={code}&date={YYYY-MM-DD}
    app.get('/route', {
        schema: {
            querystring: Type.Object({
                from: Type.String({ minLength: 2, maxLength: 7 }),
                to: Type.String({ minLength: 2, maxLength: 7 }),
                date: Type.String({ format: 'date' })
            }),
            response: {
                200: Type.Object({
                    routes: Type.Array(Type.Any()), // RouteOption[]
                    query: Type.Object({
                        from: Type.String(),
                        to: Type.String(),
                        date: Type.String()
                    })
                })
            }
        },
        preHandler: async (request, reply) => {
            // Optional auth + required rate limiting
            if (app.authenticateUserOptional) {
                await app.authenticateUserOptional(request, reply);
            }
            if (app.publicRateLimiter) {
                await app.publicRateLimiter(request, reply);
            }
        }
    }, async (request, reply) => {
        const { from, to, date } = request.query as { from: string, to: string, date: string };
        const result = await trainDataService.getTrainsOnRoute(from, to, date);

        reply.header('x-response-time', reply.elapsedTime.toString());
        return {
            routes: result,
            query: { from, to, date }
        };
    });

    // GET /stations/search?q={query}
    app.get('/stations/search', {
        schema: {
            querystring: Type.Object({
                q: Type.String({ minLength: 2 })
            }),
            response: {
                200: Type.Object({
                    stations: Type.Array(Type.Any())
                })
            }
        },
        // No rate limiting per instructions, but good practice to add
    }, async (request, reply) => {
        const { q } = request.query as { q: string };
        const result = await trainDataService.searchStations(q);

        reply.header('x-response-time', reply.elapsedTime.toString());
        return { stations: result };
    });
};
