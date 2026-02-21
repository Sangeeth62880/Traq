import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { sqliteDb } from '../config/sqlite';
import bcrypt from 'bcrypt';

export const authenticateNode = async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const apiKey = request.headers['x-node-api-key'];
    const nodeId = request.headers['x-node-id'];

    if (typeof apiKey !== 'string' || typeof nodeId !== 'string') {
        return reply.code(401).send({
            success: false,
            code: 'NODE_AUTH_MISSING',
            message: 'Missing or invalid X-Node-ID or X-Node-API-Key headers',
        });
    }

    try {
        // Fetch hash from DB
        const result = sqliteDb.prepare<[string]>(`
            SELECT api_key_hash
            FROM node_api_keys
            WHERE node_id = ?
        `).get(nodeId) as { api_key_hash: string } | undefined;

        if (!result) {
            request.log.warn(`[authenticateNode] Node ${nodeId} not found in DB`);
            return reply.code(401).send({
                success: false,
                code: 'NODE_NOT_REGISTERED',
                message: 'Node not found or not registered',
            });
        }

        // bcrypt.compare is inherently constant-time
        const isValid = await bcrypt.compare(apiKey, result.api_key_hash);

        if (!isValid) {
            return reply.code(403).send({
                success: false,
                code: 'NODE_AUTH_INVALID',
                message: 'Invalid API key',
            });
        }

        // Auth succeeded: update last_used in the background (fire and forget)
        sqliteDb.prepare(`
            UPDATE node_api_keys
            SET last_used_at = CURRENT_TIMESTAMP
            WHERE node_id = ?
        `).run(nodeId);

        // Attach to request
        request.nodeId = nodeId;
        done();

    } catch (err) {
        request.log.error({ err, nodeId }, 'Database error during node authentication');
        return reply.code(500).send({
            success: false,
            code: 'NODE_AUTH_SYSTEM_ERROR',
            message: 'Failed to verify node credentials',
        });
    }
};
