export type AlertLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface CoachTicketAnalysis {
    trainNumber: string;
    coachId: string;
    totalCrowdCount: number;       // from IoT (InfluxDB)
    crowdDensityPercent: number;   // from IoT
    ticketedCount: number;         // from Firestore
    unticketedCount: number;       // computed
    unticketedPercent: number;     // computed
    alertLevel: AlertLevel;        // computed
    lastUpdated: Date;
    coachType?: string;            // NEW: "Sleeper", "AC 3-Tier", "General", etc.
    capacity?: number;             // NEW: standard capacity of this coach type
    hasRealData: boolean;          // NEW: true if this coach has actual ticket/IoT data
}

export interface TrainTicketSummary {
    trainNumber: string;
    trainName: string;
    coaches: CoachTicketAnalysis[];
    totalPeople: number;
    totalTicketed: number;
    totalUnticketed: number;
    overallUnticketedPercent: number;
    alertCoachCount: number;
    lastUpdated: Date;
}

export interface TrainSearchResult {
    trainNumber: string;
    trainName: string;
    sourceStationCode: string;
    destinationStationCode: string;
    hasLiveCrowdData?: boolean;
}

export interface CoachOccupancy {
    trainId: string;
    coachId: string;
    occupancyPercent: number;
    estimatedPeople: number;
    timestamp: Date;
}

export interface InfluxRow {
    [key: string]: string | number | undefined;
}

export interface DashboardState {
    // Train selection
    selectedTrain: TrainSearchResult | null;
    searchResults: TrainSearchResult[];
    isSearching: boolean;

    // Analysis data
    analysis: TrainTicketSummary | null;
    isLoading: boolean;
    error: string | null;

    // Settings
    alertThreshold: number;
    refreshInterval: number;  // seconds
    isAutoRefreshEnabled: boolean;

    // Connection status
    influxConnected: boolean;
    firestoreConnected: boolean;
    railradarConnected: boolean;

    // Actions
    selectTrain: (train: TrainSearchResult) => void;
    searchTrains: (query: string) => Promise<void>;
    loadAnalysis: () => Promise<void>;
    refreshAnalysis: () => Promise<void>;
    setAlertThreshold: (threshold: number) => void;
    setRefreshInterval: (seconds: number) => void;
    toggleAutoRefresh: () => void;
    clearSelection: () => void;
    testConnections: () => Promise<void>;
}
