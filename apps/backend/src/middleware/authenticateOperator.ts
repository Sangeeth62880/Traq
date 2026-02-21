import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateUser } from './authenticateUser.js';
import { adminFirestore } from '../config/firebase.js';

export interface OperatorProfile {
    uid: string;
    name: string;
    role: 'station_master' | 'tte' | 'admin';
    assigned_trains: string[];
    assigned_stations: string[];
}

export const authenticateOperator = async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. Run basic user authentication to verify token and attach request.user
    const authResult = await authenticateUser(request, reply);
    if (authResult !== undefined) {
        // authenticateUser already sent a reply (e.g., 401)
        return authResult;
    }

    const uid = request.user?.uid;
    if (!uid) {
        return reply.code(401).send({
            success: false,
            code: 'AUTH_MISSING_TOKEN',
            message: 'Authorization missing',
        });
    }

    try {
        // 2. Fetch operator profile from Firestore
        const fetchPromise = adminFirestore.collection('operators').doc(uid).get();
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 3000),
        );

        const doc = await Promise.race([fetchPromise, timeoutPromise]);

        if (!doc || !doc.exists) {
            return reply.code(403).send({
                success: false,
                code: 'AUTH_NOT_OPERATOR',
                message: 'Operator access required',
            });
        }

        const operator = doc.data() as OperatorProfile;
        request.operator = operator;

    } catch (err: unknown) {
        request.log.error({ err, uid }, 'Failed to authenticate operator');
        // For operators, firestore failure must deny access (secure-by-default)
        return reply.code(500).send({
            success: false,
            code: 'AUTH_OPERATOR_SYSTEM_ERROR',
            message: 'Failed to verify operator credentials',
        });
    }
};
