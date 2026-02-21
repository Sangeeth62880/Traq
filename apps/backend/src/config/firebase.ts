import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Check if we already loaded env (useful for tests)
if (!process.env['FIREBASE_PROJECT_ID']) {
    dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
}

// -----------------------------------------------------------------------------
// Firebase Admin Initialization
// -----------------------------------------------------------------------------
// Note: getApps().length check makes this idempotent, crucial for hot-reloading
// or test environments where this file might be evaluated multiple times.

export const initializeFirebaseAdmin = (): admin.app.App => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing required Firebase environment variables. ' +
            'Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
        );
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
};

export const adminApp: admin.app.App = initializeFirebaseAdmin();
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
export const adminAuth: Auth = adminApp.auth();
export const adminFirestore: Firestore = adminApp.firestore();
