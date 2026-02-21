import { FastifyRequest, FastifyReply } from 'fastify';
import { adminAuth, adminFirestore } from '../config/firebase.js';
import type { UserProfile } from '@traq/shared-types';

/**
 * Standard HTTP 401 Unauthorized Error shape
 */
function sendUnauthorized(reply: FastifyReply, code: string, message: string) {
    return reply.code(401).send({
        success: false,
        code,
        message,
    });
}

/**
 * Factory for creating the user authentication middleware
 */
export const authenticateUserFactory = (optional: boolean = false) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (optional) return;
            return sendUnauthorized(reply, 'AUTH_MISSING_TOKEN', 'Authorization header required');
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            if (optional) return;
            return sendUnauthorized(reply, 'AUTH_MISSING_TOKEN', 'Authorization header required');
        }

        try {
            // 1. Verify token with admin SDK (checks if revoked implicitly since checkRevoked: true)
            const decodedToken = await adminAuth.verifyIdToken(token, true);

            // 2. Reject stale tokens (issued more than 1 hour ago) to force refresh client-side
            const now = Math.floor(Date.now() / 1000);
            if (now - decodedToken.iat > 3600) {
                return sendUnauthorized(reply, 'AUTH_STALE_TOKEN', 'Please refresh your session');
            }

            const uid = decodedToken.uid;

            // 3. Attach basic user context to request
            request.user = { uid };
            if (decodedToken.email) request.user.email = decodedToken.email;
            if (decodedToken.name) request.user.name = decodedToken.name;
            if (decodedToken.picture) request.user.picture = decodedToken.picture;

            // 4. Fetch full UserProfile from Firestore with a 3s timeout to avoid hanging the request
            let userProfile: UserProfile | undefined;

            try {
                const fetchPromise = adminFirestore.collection('users').doc(uid).get();
                // 3 second timeout for Firestore read
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 3000),
                );

                const doc = await Promise.race([fetchPromise, timeoutPromise]);

                if (doc && doc.exists) {
                    userProfile = doc.data() as UserProfile;
                } else {
                    // Auto-create default profile if missing
                    userProfile = {
                        uid,
                        display_name: decodedToken.name || 'User',
                        preferred_language: 'en',
                        saved_routes: [],
                        consent_given: false,
                        created_at: new Date().toISOString(),
                    };
                    if (decodedToken.email) userProfile.email = decodedToken.email;
                    if (decodedToken.phone_number) userProfile.phone = decodedToken.phone_number;
                    if (decodedToken.picture) userProfile.photo_url = decodedToken.picture;

                    // Best effort save. Don't block response on it.
                    adminFirestore.collection('users').doc(uid).set(userProfile, { merge: true }).catch(err => {
                        request.log.warn({ err, uid }, 'Failed to auto-create user profile in firestore');
                    });
                }

                if (userProfile) {
                    request.userProfile = userProfile;
                }
            } catch (err: unknown) {
                // If Firestore times out or fails, proceed with the token-based auth.
                // We log a warning but do not break the request (soft failure for the profile).
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                request.log.warn({ err: errorMsg, uid }, 'Firestore read failed during auth. Proceeding with basic token auth.');
            }

        } catch (err: unknown) {
            const errorObj = err as { code?: string };
            // Handle explicit Firebase admin token errors
            if (errorObj.code === 'auth/id-token-revoked') {
                return sendUnauthorized(reply, 'AUTH_REVOKED_TOKEN', 'Session revoked. Please sign in again');
            }
            if (errorObj.code === 'auth/id-token-expired') {
                return sendUnauthorized(reply, 'AUTH_STALE_TOKEN', 'Please refresh your session');
            }

            request.log.info({ err: errorObj.code || 'UNKNOWN' }, 'Invalid Firebase ID token');
            return sendUnauthorized(reply, 'AUTH_INVALID_TOKEN', 'Token verification failed');
        }
    };
};

export const authenticateUser = authenticateUserFactory(false);
export const authenticateUserOptional = authenticateUserFactory(true);
