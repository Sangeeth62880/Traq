import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { useTTRStore } from '../store/ttrStore';
import { TrainSearch } from '../components/search/TrainSearch';
import { TrainHeader } from '../components/dashboard/TrainHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { AlertBanner } from '../components/dashboard/AlertBanner';
import { CoachGrid } from '../components/dashboard/CoachGrid';

import { TrainDiagram } from '../components/dashboard/TrainDiagram';
import { Header } from '../components/layout/Header';
import { AlertPanel } from '../components/dashboard/AlertPanel';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export default function DashboardPage() {
    const {
        selectedTrain,
        analysis,
        isLoading,
        error,
        alertThreshold,
        refreshInterval,
        isAutoRefreshEnabled,
        influxConnected,
        firestoreConnected, // Kept property name from store for compat
        railradarConnected,
        loadAnalysis,
        setAlertThreshold,
        toggleAutoRefresh,
        testConnections,
    } = useTTRStore();

    const [isAlertPanelOpen, setIsAlertPanelOpen] = useState(false);

    // Enable auto refresh
    useAutoRefresh();

    // Test connections on mount
    useEffect(() => {
        testConnections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefresh = () => {
        loadAnalysis();
    };

    const handleToggleAutoRefresh = () => {
        toggleAutoRefresh();
    };

    const handleViewAlerts = () => {
        setIsAlertPanelOpen(true);
    };

    // State 1: No train selected (Search View)
    if (!selectedTrain) {
        return (
            <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl text-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 bg-traq-card rounded-full mb-6 border-2 border-traq-cyan shadow-[0_0_15px_rgba(0,188,212,0.3)]">
                            <Shield size={64} className="text-traq-cyan" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                            TTR Inspection Console
                        </h1>
                        <p className="text-gray-400 text-lg">Search your assigned train to begin</p>
                    </div>

                    <TrainSearch />

                    {/* Connection Status */}
                    <div className="fixed bottom-6 flex gap-4 text-xs font-mono uppercase tracking-widest text-gray-500 bg-traq-card px-4 py-2 rounded-full border border-[#2D4059]">
                        <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${influxConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            IoT (Influx)
                        </span>
                        <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${firestoreConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            Tickets (Firebase)
                        </span>
                        <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${railradarConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            RailRadar
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // State 2: Train Selected (Dashboard View)
    return (
        <div className="min-h-screen bg-[#0D1B2A] flex flex-col font-sans text-gray-200">
            <Header />
            <div className="px-4 py-6 pb-24 max-w-7xl mx-auto flex flex-col space-y-6 w-full">
                {/* Header */}
                <TrainHeader />

                {isLoading && !analysis ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="w-12 h-12 border-4 border-traq-cyan border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-400 text-xl animate-pulse">Analyzing real-time IoT and Ticket data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center shadow-lg">
                        <h2 className="text-red-400 text-xl font-bold mb-2">Analysis Failed</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors font-bold"
                        >
                            Retry Analysis
                        </button>
                    </div>
                ) : analysis ? (
                    <>
                        {/* Top Cards */}
                        <SummaryCards analysis={analysis} />

                        {/* Alert Banner */}
                        <AlertBanner
                            alertCount={analysis.alertCoachCount}
                            onViewClick={handleViewAlerts}
                        />

                        {/* Main Visuals: Train Diagram */}
                        <TrainDiagram coaches={analysis.coaches} />

                        {/* Detailed Coach Analytics (Full Width) */}
                        <div className="flex flex-col bg-traq-card/50 rounded-xl p-4 md:p-6 border border-[#2D4059] shadow-inner">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                <h3 className="text-white font-semibold text-xl">Detailed Coach Analytics</h3>
                                <span className="text-xs text-gray-400 bg-[#0D1B2A] px-3 py-1.5 rounded-full border border-white/5 font-medium tracking-wide">
                                    Sorted by Urgency
                                </span>
                            </div>
                            <div className="w-full">
                                <CoachGrid coaches={analysis.coaches} />
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Floating Bottom Bar for Refresh Status */}
            {analysis && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0A1520] border-t border-[#2D4059] p-3 flex justify-center items-center gap-4 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                    <div className="text-sm text-gray-400">
                        {isAutoRefreshEnabled ? (
                            <span>Auto-refreshing every <strong className="text-white">{refreshInterval}s</strong></span>
                        ) : (
                            <span>Auto-refresh is <strong className="text-red-400">paused</strong></span>
                        )}
                        <span className="mx-3 opacity-50">|</span>
                        <span>Last updated: {analysis.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={handleToggleAutoRefresh}
                        className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors border ${isAutoRefreshEnabled
                            ? 'bg-[rgba(255,255,255,0.05)] text-gray-300 border-gray-600 hover:bg-[rgba(255,255,255,0.1)]'
                            : 'bg-traq-cyan text-traq-dark border-traq-cyan hover:bg-cyan-400'
                            }`}
                    >
                        {isAutoRefreshEnabled ? 'Pause Refresh' : 'Resume Refresh'}
                    </button>
                </div>
            )}

            {/* Alert Panel */}
            {analysis && (
                <AlertPanel
                    isOpen={isAlertPanelOpen}
                    onClose={() => setIsAlertPanelOpen(false)}
                    coaches={analysis.coaches}
                    threshold={alertThreshold}
                    onThresholdChange={setAlertThreshold}
                />
            )}
        </div>
    );
}
