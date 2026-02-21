import React from 'react';
import { Train, Wifi, Radio, Users, Clock } from 'lucide-react';
import { useTTRStore } from '../../store/ttrStore';
import { timeAgo } from '../../utils/formatters';

export const TrainHeader: React.FC = () => {
    const { analysis, influxTrainData, clearSelection } = useTTRStore();

    if (!analysis) return null;

    return (
        <div className="bg-traq-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
                {/* Left: Train info */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-traq-cyan/15 rounded-xl">
                        <Train className="w-7 h-7 text-traq-cyan" />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold">
                            {analysis.trainName}
                        </h2>
                        <p className="text-white/50 text-sm">
                            Train #{analysis.trainNumber}
                        </p>
                    </div>
                </div>

                {/* Right: Live indicator + controls */}
                <div className="flex items-center gap-3">
                    {/* IoT Data Badge */}
                    {influxTrainData && (
                        <div className="flex items-center gap-4 mr-4 px-4 py-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-traq-cyan" />
                                <span className="text-traq-cyan font-bold text-lg">
                                    {influxTrainData.latestPeopleCount}
                                </span>
                                <span className="text-white/40 text-xs">people (IoT)</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-white/30" />
                                <span className="text-white/30 text-xs">
                                    {timeAgo(influxTrainData.lastUpdated)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Live badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/50">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-bold">LIVE</span>
                    </div>

                    {/* Change train button */}
                    <button
                        onClick={clearSelection}
                        className="px-3 py-1.5 text-white/50 hover:text-white text-xs border border-white/10 rounded-lg hover:border-white/30 transition"
                    >
                        Change Train
                    </button>
                </div>
            </div>

            {/* Bottom: IoT sensor details (if available) */}
            {influxTrainData && influxTrainData.readings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-white/30" />
                        <span className="text-white/30 text-xs">
                            RF: {influxTrainData.readings[0].rf.toFixed(0)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-white/30" />
                        <span className="text-white/30 text-xs">
                            WiFi devices: {influxTrainData.readings[0].wifi.toFixed(0)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white/30 text-xs">
                            {influxTrainData.readings.length} readings in last 6h
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
