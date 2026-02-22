import React from 'react';
import { Train, Wifi, Radio, Users, Clock } from 'lucide-react';
import { useTTRStore } from '../../store/ttrStore';
import { timeAgo } from '../../utils/formatters';

export const TrainHeader: React.FC = () => {
    const { analysis, influxTrainData, clearSelection } = useTTRStore();

    if (!analysis) return null;

    return (
        <div className="bg-traq-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
            {/* Main row: stack on mobile, row on tablet+ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

                {/* Train info (always left-aligned) */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-traq-cyan/15 rounded-lg sm:rounded-xl">
                        <Train className="w-5 h-5 sm:w-7 sm:h-7 text-traq-cyan" />
                    </div>
                    <div>
                        <h2 className="text-white text-base sm:text-xl font-bold leading-tight">
                            {analysis.trainName}
                        </h2>
                        <p className="text-white/50 text-xs sm:text-sm">
                            Train #{analysis.trainNumber}
                        </p>
                    </div>
                </div>

                {/* Controls row: wrap on mobile */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* IoT data badge – full width on mobile */}
                    {influxTrainData && (
                        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-lg w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-traq-cyan" />
                                <span className="text-traq-cyan font-bold text-base sm:text-lg">
                                    {influxTrainData.latestPeopleCount}
                                </span>
                                <span className="text-white/40 text-[10px] sm:text-xs">people</span>
                            </div>
                            <div className="hidden sm:block w-px h-5 bg-white/10" />
                            <div className="flex items-center gap-1 ml-auto sm:ml-0 text-right sm:text-left">
                                <Clock className="w-3 h-3 text-white/30" />
                                <span className="text-white/30 text-[10px] sm:text-xs whitespace-nowrap">
                                    {timeAgo(influxTrainData.lastUpdated)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* LIVE badge + Change Train - side by side */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 bg-green-500/20 rounded-full border border-green-500/50">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-[10px] sm:text-xs font-bold">LIVE</span>
                        </div>
                        <button
                            onClick={clearSelection}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-white/50 hover:text-white text-[10px] sm:text-xs border border-white/10 rounded-lg hover:border-white/30 transition"
                        >
                            Change Train
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom: IoT sensor details (if available) - smaller on mobile, scroll if needed */}
            {influxTrainData && influxTrainData.readings.length > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5 flex items-center gap-4 sm:gap-6 overflow-x-auto text-[10px] sm:text-xs pb-1 custom-scrollbar">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Radio className="w-3 h-3 sm:w-4 sm:h-4 text-white/30" />
                        <span className="text-white/30">RF: {influxTrainData.readings[0].rf.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-white/30" />
                        <span className="text-white/30">WiFi: {influxTrainData.readings[0].wifi.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap ml-auto sm:ml-0">
                        <span className="text-white/30">
                            {influxTrainData.readings.length} readings (6h)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
