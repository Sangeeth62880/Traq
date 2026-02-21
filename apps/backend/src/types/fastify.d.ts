import type { UserProfile } from '@traq/shared-types';
import type { OperatorProfile } from '../middleware/authenticateOperator.js';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            uid: string;
            email?: string;
            name?: string;
            picture?: string;
        };
        userProfile?: UserProfile;
        operator?: OperatorProfile;
        nodeId?: string;
    }
}
