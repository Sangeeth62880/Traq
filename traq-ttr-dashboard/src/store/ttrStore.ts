import { create } from 'zustand';
import { DashboardState, TrainSearchResult } from '../types';
import * as railradarService from '../services/railradarService';
import * as influxService from '../services/influxService';
import * as firebaseService from '../services/firebaseService';
import { getTrainAnalysis } from '../services/ttrAnalysisService';
import { CONFIG } from '../config/constants';

interface ExtendedDashboardState extends DashboardState {
    // Additional state for InfluxDB train data
    influxTrainData: influxService.TrainSummary | null;
    availableInfluxTrains: Array<{
        trainNumber: string;
        trainName: string;
        displayName: string;
    }>;
    loadInfluxTrains: () => Promise<void>;
}

export const useTTRStore = create<ExtendedDashboardState>((set, get) => ({
    // State
    selectedTrain: null,
    searchResults: [],
    isSearching: false,
    analysis: null,
    isLoading: false,
    error: null,
    alertThreshold: CONFIG.alertThreshold,
    refreshInterval: CONFIG.refreshInterval,
    isAutoRefreshEnabled: true,
    influxConnected: false,
    firestoreConnected: false,
    railradarConnected: false,
    influxTrainData: null,
    availableInfluxTrains: [],

    // Load available trains from InfluxDB (for suggestions)
    loadInfluxTrains: async () => {
        try {
            const trains = await influxService.getAvailableTrains();
            set({ availableInfluxTrains: trains });
        } catch (error) {
            console.error('[Store] Failed to load InfluxDB trains:', error);
        }
    },

    selectTrain: (train: TrainSearchResult) => {
        set({ selectedTrain: train, searchResults: [], error: null });
        get().loadAnalysis();
    },

    searchTrains: async (query: string) => {
        if (query.trim().length < 2) {
            set({ searchResults: [], isSearching: false });
            return;
        }

        set({ isSearching: true });

        try {
            // Search from TWO sources in parallel:
            // 1. InfluxDB – trains that have ACTUAL IoT data
            // 2. RailRadar – all Indian Railways trains

            const [influxTrains, railradarTrains] = await Promise.all([
                influxService.getAvailableTrains(),
                railradarService.searchTrains(query),
            ]);

            const queryLower = query.toLowerCase().replace(/[_\s]+/g, '');

            // Filter InfluxDB trains that match the search
            const matchedInflux = influxTrains.filter((t) => {
                const numMatch = t.trainNumber.includes(query.trim());
                const nameMatch = t.displayName.toLowerCase().replace(/\s+/g, '').includes(queryLower);
                const rawNameMatch = t.trainName.toLowerCase().replace(/_/g, '').includes(queryLower);
                return numMatch || nameMatch || rawNameMatch;
            });

            // Mark InfluxDB trains with hasLiveCrowdData = true
            const influxResults: TrainSearchResult[] = matchedInflux.map((t) => ({
                trainNumber: t.trainNumber,
                trainName: t.displayName,
                sourceStationCode: '',
                destinationStationCode: '',
                hasLiveCrowdData: true,
            }));

            // Merge: InfluxDB results first (they have live data), then RailRadar
            const seenNumbers = new Set(influxResults.map((r) => r.trainNumber));
            const railradarFiltered = railradarTrains.filter(
                (r) => !seenNumbers.has(r.trainNumber)
            );

            const combined = [...influxResults, ...railradarFiltered];

            set({ searchResults: combined, isSearching: false });
        } catch {
            set({ searchResults: [], isSearching: false });
        }
    },

    loadAnalysis: async () => {
        const { selectedTrain } = get();
        if (!selectedTrain) return;

        set({ isLoading: true, error: null });

        try {
            // Also fetch the raw InfluxDB data for the dashboard display
            const influxData = await influxService.getTrainData(selectedTrain.trainNumber);
            set({ influxTrainData: influxData });

            // Run the full TTR analysis (InfluxDB + Firestore merge)
            const analysis = await getTrainAnalysis(
                selectedTrain.trainNumber,
                selectedTrain.trainName
            );

            if (analysis) {
                set({ analysis, isLoading: false });
            } else {
                set({
                    analysis: null,
                    isLoading: false,
                    error: `No data available for train ${selectedTrain.trainNumber}`,
                });
            }
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.message || 'Failed to load analysis',
            });
        }
    },

    refreshAnalysis: async () => {
        const { selectedTrain } = get();
        if (!selectedTrain) return;

        try {
            const influxData = await influxService.getTrainData(selectedTrain.trainNumber);
            const analysis = await getTrainAnalysis(
                selectedTrain.trainNumber,
                selectedTrain.trainName
            );

            if (analysis) {
                const prevAlertCount = get().analysis?.alertCoachCount || 0;
                set({ analysis, influxTrainData: influxData });

                if (analysis.alertCoachCount > prevAlertCount) {
                    console.log(`[TTR] ⚠️ NEW ALERTS: ${analysis.alertCoachCount}`);
                }
            }
        } catch (error: any) {
            console.error('[TTR] Refresh error:', error.message);
        }
    },

    setAlertThreshold: (threshold: number) => {
        set({ alertThreshold: Math.min(90, Math.max(5, threshold)) });
    },

    setRefreshInterval: (seconds: number) => {
        set({ refreshInterval: Math.min(120, Math.max(5, seconds)) });
    },

    toggleAutoRefresh: () => {
        set((state) => ({ isAutoRefreshEnabled: !state.isAutoRefreshEnabled }));
    },

    clearSelection: () => {
        set({
            selectedTrain: null,
            analysis: null,
            error: null,
            searchResults: [],
            influxTrainData: null,
        });
    },

    testConnections: async () => {
        const [influx, firestore, railradar] = await Promise.all([
            influxService.testConnection(),
            firebaseService.testConnection(),
            railradarService.testConnection(),
        ]);
        set({
            influxConnected: influx.connected,
            firestoreConnected: firestore.connected, // Retain existing prop for compat
            railradarConnected: railradar,
        });
        console.log(`[Connections] InfluxDB: ${influx.connected} (${influx.trainCount} trains) | Firebase RTDB: ${firestore.connected} (${firestore.ticketCount} tickets, ${firestore.trainCount} trains) | RailRadar: ${railradar}`);
        if (influx.sampleTrain) {
            console.log(`[Connections] Sample train: ${influx.sampleTrain}`);
        }
    },
}));
