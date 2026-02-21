export const CONFIG = {
    influx: {
        url: import.meta.env.VITE_INFLUX_URL || 'https://us-east-1-1.aws.cloud2.influxdata.com',
        token: import.meta.env.VITE_INFLUX_TOKEN || '',
        org: import.meta.env.VITE_INFLUX_ORG || '1537318cd43c7ef4',
        bucket: import.meta.env.VITE_INFLUX_BUCKET || 'density-reading',
    },
    railradar: {
        baseUrl: import.meta.env.VITE_RAILRADAR_URL || 'https://api.railradar.org/api/v1',
        apiKey: import.meta.env.VITE_RAILRADAR_API_KEY || '',
    },
    alertThreshold: parseInt(import.meta.env.VITE_ALERT_THRESHOLD || '30', 10),
    refreshInterval: parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '15', 10),
} as const;

export const ALERT_THRESHOLDS = {
    low: 0,
    moderate: 15,
    high: 30,
    critical: 50,
} as const;

export const COLORS = {
    // Dark theme
    bg: {
        primary: '#0D1B2A',
        secondary: '#1B2838',
        card: '#1B2838',
        hover: '#243447',
        accent: '#2D4059',
    },
    // Alert levels
    alert: {
        low: { main: '#4CAF50', bg: '#1B3A1B', border: '#2E7D32' },
        moderate: { main: '#FFC107', bg: '#3A3520', border: '#F9A825' },
        high: { main: '#FF9800', bg: '#3A2A15', border: '#EF6C00' },
        critical: { main: '#F44336', bg: '#3A1B1B', border: '#D32F2F' },
    },
    // Accents
    cyan: '#00BCD4',
    green: '#4CAF50',
    red: '#F44336',
    orange: '#FF9800',
    amber: '#FFC107',
    white: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    textMuted: 'rgba(255,255,255,0.3)',
} as const;
