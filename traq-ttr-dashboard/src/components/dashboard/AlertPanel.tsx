import React from 'react';
import { X, Settings, AlertTriangle } from 'lucide-react';
import { CoachTicketAnalysis } from '../../types';
import { getAlertColor, getAlertIcon, getAlertLabel } from '../../utils/alertHelpers';
import { formatPercent } from '../../utils/formatters';

interface AlertPanelProps {
    isOpen: boolean;
    onClose: () => void;
    coaches: CoachTicketAnalysis[];
    threshold: number;
    onThresholdChange: (value: number) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
    isOpen,
    onClose,
    coaches,
    threshold,
    onThresholdChange,
}) => {
    const alertCoaches = coaches.filter(
        (c) => c.alertLevel === 'high' || c.alertLevel === 'critical'
    );

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Side Panel / Bottom Sheet */}
            <div
                className={`fixed z-50 bg-traq-card transform transition-transform duration-300 ease-in-out flex flex-col shadow-[-5px_0_25px_rgba(0,0,0,0.5)] border border-[#2D4059]
                /* Mobile: Bottom sheet */
                bottom-0 inset-x-0 h-[85vh] rounded-t-2xl
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                
                /* Desktop: Slide out side panel */
                sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:max-w-md sm:rounded-none sm:border-r-0 sm:border-y-0
                ${isOpen ? 'sm:translate-x-0 sm:translate-y-0' : 'sm:translate-x-full sm:translate-y-0'}
            `}
            >
                {/* Mobile drag handle indicator */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#2D4059] bg-[#0A1520] sm:bg-transparent rounded-t-2xl sm:rounded-none">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                        Priority Inspection
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-[#2D4059] bg-white/5 sm:bg-transparent text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                    {alertCoaches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 py-10 text-gray-400">
                            <span className="text-5xl mb-3 opacity-80">✅</span>
                            <p className="text-sm sm:text-base text-center">No coaches require immediate inspection based on current threshold.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            {alertCoaches.map((coach) => {
                                const alertColor = getAlertColor(coach.alertLevel);
                                return (
                                    <div
                                        key={coach.coachId}
                                        className="bg-[#1B2838] border border-l-4 p-3 sm:p-4 rounded-xl flex items-center justify-between transition-colors hover:bg-[#1E2E40]"
                                        style={{ borderLeftColor: alertColor, borderColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-base sm:text-lg font-bold text-white leading-none">{coach.coachId}</span>
                                                <span
                                                    className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold flex items-center gap-1"
                                                    style={{
                                                        color: alertColor,
                                                        backgroundColor: `${alertColor}15`,
                                                    }}
                                                >
                                                    {getAlertIcon(coach.alertLevel)} {getAlertLabel(coach.alertLevel)}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-300">
                                                Unticketed: <strong style={{ color: alertColor }}>{coach.unticketedCount}</strong> / {coach.totalCrowdCount}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: alertColor }}>
                                                {formatPercent(coach.unticketedPercent)}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-medium">Density: {coach.crowdDensityPercent.toFixed(0)}%</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Settings Area */}
                <div className="p-4 sm:p-5 border-t border-[#2D4059] bg-[#0A1520] mb-safe">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                        <Settings size={14} className="sm:w-4 sm:h-4 text-traq-cyan" /> Dashboard Settings
                    </h3>
                    <div className="mb-2">
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className="text-gray-400 font-medium">Alert Threshold</span>
                            <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-xs">{threshold}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="90"
                            step="5"
                            value={threshold}
                            onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-traq-cyan"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-2 leading-relaxed">
                            Coaches with unticketed percentage above <strong className="text-gray-400">{threshold}%</strong> will trigger priority alerts and visual indicators.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
