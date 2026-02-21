import { create } from 'zustand';
import {
    TTRUser,
    TTRCredentials,
    authenticateTTR,
    saveSession,
    getSession,
    clearSession,
} from '../config/auth';

interface AuthState {
    user: TTRUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (credentials: TTRCredentials) => boolean;
    logout: () => void;
    checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: (credentials: TTRCredentials) => {
        set({ error: null });

        if (!credentials.division) {
            set({ error: 'Please select your railway division' });
            return false;
        }
        if (!credentials.employeeId.trim()) {
            set({ error: 'Please enter your Employee ID' });
            return false;
        }
        if (!credentials.password) {
            set({ error: 'Please enter your password' });
            return false;
        }

        const user = authenticateTTR(credentials);

        if (user) {
            saveSession(user);
            set({ user, isAuthenticated: true, error: null });
            console.log(`[Auth] ✅ Login successful: ${user.name} (${user.employeeId}) - ${user.divisionName}`);
            return true;
        } else {
            set({ error: 'Invalid credentials. Please check your Division, Employee ID, and Password.' });
            console.log(`[Auth] ❌ Login failed for ${credentials.employeeId}`);
            return false;
        }
    },

    logout: () => {
        clearSession();
        set({ user: null, isAuthenticated: false, error: null });
        console.log('[Auth] Logged out');
    },

    checkSession: () => {
        const user = getSession();
        if (user) {
            set({ user, isAuthenticated: true, isLoading: false });
            console.log(`[Auth] Session restored: ${user.name}`);
        } else {
            set({ isLoading: false });
        }
    },
}));
