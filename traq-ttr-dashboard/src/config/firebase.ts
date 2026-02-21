// MINIMAL ALTERNATIVE (if full Firebase config is not available):
// This works for RTDB access when security rules are set to public

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const RTDB_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

const firebaseConfig = {
    databaseURL: RTDB_URL,
    projectId: 'traq-522d3',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const database: Database = getDatabase(app);
export default app;
