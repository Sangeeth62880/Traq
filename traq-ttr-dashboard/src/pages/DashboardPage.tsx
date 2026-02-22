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
                    <div className="w-full max-w-2xl text-center mb-6 sm:mb-8">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 inline-flex items-center justify-center p-3 sm:p-4 bg-traq-card rounded-full mb-4 sm:mb-6 border-2 border-traq-cyan shadow-[0_0_15px_rgba(0,188,212,0.3)]">
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-traq-cyan" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                            TTR Inspection Console
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-lg">Search your assigned train to begin</p>
                    </div>

                    <TrainSearch />

                    {/* Connection Status - Inline refactored for mobile */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 sm:mt-10">
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-gray-500 bg-traq-card px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-[#2D4059] shadow-md">
                            <span className="flex items-center gap-1.5 sm:gap-2">
                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${influxConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                IoT (Influx)
                            </span>
                            <span className="flex items-center gap-1.5 sm:gap-2">
                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${firestoreConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                Tickets <span className="hidden sm:inline">(Firebase)</span>
                            </span>
                            <span className="flex items-center gap-1.5 sm:gap-2">
                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${railradarConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                RailRadar
                            </span>
                            <div className="w-px h-3 bg-white/10 mx-1 hidden sm:block" />
                            <button onClick={() => testConnections()} className="text-white/30 hover:text-white/60 text-[10px] sm:text-xs underline flex items-center">
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // State 2: Train Selected (Dashboard View)
    return (
        <div className="min-h-screen bg-[#0D1B2A] flex flex-col font-sans text-gray-200 overflow-x-hidden">
            <Header />
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-28 max-w-7xl mx-auto flex flex-col w-full">
                <div className="space-y-3 sm:space-y-4">
                    {/* Header */}
                    <TrainHeader />

                    {isLoading && !analysis ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] py-12">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-traq-cyan border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-400 text-base sm:text-xl animate-pulse text-center px-4">Analyzing real-time IoT and Ticket data...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/30 border border-red-500 rounded-lg p-5 sm:p-6 text-center shadow-lg my-6">
                            <h2 className="text-red-400 text-lg sm:text-xl font-bold mb-2">Analysis Failed</h2>
                            <p className="text-gray-300 text-sm sm:text-base mb-5 sm:mb-6">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="px-5 sm:px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors font-bold text-sm sm:text-base"
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

                            {/* Detailed Coach Analytics */}
                            <div className="flex items-center justify-between mt-2 sm:mt-4 mb-1 sm:mb-2">
                                <h2 className="text-white font-bold text-sm sm:text-lg">Coach-wise Analysis</h2>
                                <span className="text-white/40 text-[10px] sm:text-xs bg-[#1B2838] px-2 sm:px-3 py-1 rounded-full border border-white/5">
                                    {analysis.coaches.length} Coaches Sorted by Urgency
                                </span>
                            </div>
                            <CoachGrid coaches={analysis.coaches} onInspectCoach={(id) => {
                                console.log("Inspecting", id);
                                handleViewAlerts(); // Just open panel for now as demo
                            }} />
                        </>
                    ) : null}
                </div>
            </div>

            {/* Floating Bottom Bar for Refresh Status */}
            {analysis && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0A1520]/95 backdrop-blur-md border-t border-[#2D4059] p-2.5 sm:p-3 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                    <div className="text-[10px] sm:text-sm text-gray-400 flex items-center justify-center text-center">
                        {isAutoRefreshEnabled ? (
                            <span>Auto-refreshing every <strong className="text-white">{refreshInterval}s</strong></span>
                        ) : (
                            <span>Auto-refresh is <strong className="text-red-400">paused</strong></span>
                        )}
                        <span className="mx-2 sm:mx-3 opacity-50 hidden sm:inline">|</span>
                        <span className="mx-1.5 opacity-50 sm:hidden">•</span>
                        <span>Updated: {analysis.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <button
                        onClick={handleToggleAutoRefresh}
                        className={`mt-1 sm:mt-0 px-3 sm:px-4 py-1.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg uppercase transition-colors border w-full sm:w-auto ${isAutoRefreshEnabled
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
