import { AlertLevel } from '../types';

export function getAlertColor(level: AlertLevel): string {
    const colors: Record<AlertLevel, string> = {
        low: '#4CAF50',
        moderate: '#FFC107',
        high: '#FF9800',
        critical: '#F44336',
    };
    return colors[level];
}

export function getAlertBg(level: AlertLevel): string {
    const colors: Record<AlertLevel, string> = {
        low: 'bg-green-900/30 border-green-700/50',
        moderate: 'bg-amber-900/30 border-amber-700/50',
        high: 'bg-orange-900/30 border-orange-700/50',
        critical: 'bg-red-900/30 border-red-700/50',
    };
    return colors[level];
}

export function getAlertLabel(level: AlertLevel): string {
    return level.charAt(0).toUpperCase() + level.slice(1);
}

export function getAlertIcon(level: AlertLevel): string {
    const icons: Record<AlertLevel, string> = {
        low: '✅',
        moderate: 'ℹ️',
        high: '⚠️',
        critical: '🚨',
    };
    return icons[level];
}
