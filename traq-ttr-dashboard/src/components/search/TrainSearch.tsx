import React, { useState, useEffect } from 'react';
import { Search, X, Train, Radio, Loader2 } from 'lucide-react';
import { useTTRStore } from '../../store/ttrStore';

export const TrainSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const {
        searchTrains,
        searchResults,
        isSearching,
        selectTrain,
        availableInfluxTrains,
        loadInfluxTrains,
    } = useTTRStore();

    // Load available InfluxDB trains on mount
    useEffect(() => {
        loadInfluxTrains();
    }, [loadInfluxTrains]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                searchTrains(query);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query, searchTrains]);

    return (
        <div className="w-full max-w-2xl mx-auto px-1 sm:px-0">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search train..."
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl
                     text-white text-sm sm:text-lg placeholder-white/30 focus:outline-none
                     focus:border-traq-cyan/50 focus:ring-1 focus:ring-traq-cyan/30 transition shadow-inner"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            useTTRStore.getState().clearSelection();
                        }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 hover:text-white transition" />
                    </button>
                )}
                {isSearching && (
                    <Loader2 className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-traq-cyan animate-spin" />
                )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-2 sm:mt-3 max-h-72 sm:max-h-96 overflow-y-auto rounded-xl border border-white/10 custom-scrollbar">
                    {searchResults.map((train, index) => (
                        <button
                            key={`${train.trainNumber}-${index}`}
                            onClick={() => {
                                selectTrain(train);
                                setQuery(`${train.trainNumber} - ${train.trainName}`);
                            }}
                            className="w-full flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/5
                         border-b border-white/5 last:border-b-0 transition text-left"
                        >
                            <div className="p-1.5 sm:p-2 bg-traq-accent rounded-lg flex-shrink-0">
                                <Train className="w-4 h-4 sm:w-5 sm:h-5 text-traq-cyan" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-white font-bold text-xs sm:text-sm">
                                        {train.trainNumber}
                                    </span>
                                    <span className="text-white/70 text-xs sm:text-sm truncate">
                                        {train.trainName}
                                    </span>
                                </div>
                                {train.sourceStationCode && (
                                    <span className="text-white/40 text-[10px] sm:text-xs">
                                        {train.sourceStationCode} → {train.destinationStationCode}
                                    </span>
                                )}
                            </div>
                            {/* IoT data badge */}
                            {train.hasLiveCrowdData && (
                                <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-traq-cyan/15
                               rounded-full border border-traq-cyan/30 flex-shrink-0">
                                    <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-traq-cyan" />
                                    <span className="hidden sm:inline text-traq-cyan text-[10px] font-bold">IoT DATA</span>
                                    <span className="sm:hidden text-traq-cyan text-[8px] font-bold">IoT</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {query.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="mt-3 sm:mt-4 text-center text-white/30 text-xs sm:text-sm">
                    No trains found for "{query}"
                </div>
            )}

            {/* Available InfluxDB trains (when no search is active) */}
            {!query && availableInfluxTrains.length > 0 && (
                <div className="mt-5 sm:mt-6">
                    <h3 className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2 sm:mb-3">
                        Trains with Live IoT Data
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {availableInfluxTrains.map((train) => (
                            <button
                                key={train.trainNumber}
                                onClick={() => {
                                    setQuery(`${train.trainNumber} - ${train.displayName}`);
                                    selectTrain({
                                        trainNumber: train.trainNumber,
                                        trainName: train.displayName,
                                        sourceStationCode: '',
                                        destinationStationCode: '',
                                        hasLiveCrowdData: true,
                                    });
                                }}
                                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-traq-card
                           border border-traq-cyan/20 rounded-lg hover:border-traq-cyan/50
                           transition group"
                            >
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                                <span className="text-white/70 text-[11px] sm:text-sm group-hover:text-white transition whitespace-nowrap">
                                    {train.trainNumber} – {train.displayName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
