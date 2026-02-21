import { useEffect, useRef } from 'react';
import { useTTRStore } from '../store/ttrStore';

export function useAutoRefresh() {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { refreshAnalysis, refreshInterval, isAutoRefreshEnabled, selectedTrain } = useTTRStore();

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (isAutoRefreshEnabled && selectedTrain) {
            console.log(`[AutoRefresh] Started (${refreshInterval}s interval)`);
            intervalRef.current = setInterval(() => {
                refreshAnalysis();
            }, refreshInterval * 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isAutoRefreshEnabled, refreshInterval, selectedTrain, refreshAnalysis]);
}
