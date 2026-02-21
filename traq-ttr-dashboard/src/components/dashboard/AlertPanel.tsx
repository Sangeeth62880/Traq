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
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Side Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-full max-w-md bg-traq-card shadow-[-5px_0_25px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-[#2D4059] bg-[#0A1520]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Priority Inspection
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-[#2D4059] text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {alertCoaches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <span className="text-4xl mb-2">✅</span>
                            <p>No coaches require immediate inspection.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {alertCoaches.map((coach) => {
                                const alertColor = getAlertColor(coach.alertLevel);
                                return (
                                    <div
                                        key={coach.coachId}
                                        className="bg-[#1B2838] border p-4 rounded-lg flex items-center justify-between"
                                        style={{ borderColor: alertColor }}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-bold text-white">{coach.coachId}</span>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full font-bold border"
                                                    style={{
                                                        color: alertColor,
                                                        borderColor: alertColor,
                                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                                    }}
                                                >
                                                    {getAlertIcon(coach.alertLevel)} {getAlertLabel(coach.alertLevel)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Unticketed: <strong style={{ color: alertColor }}>{coach.unticketedCount}</strong> / {coach.totalCrowdCount}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold" style={{ color: alertColor }}>
                                                {formatPercent(coach.unticketedPercent)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Density: {coach.crowdDensityPercent.toFixed(0)}%</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Settings Area */}
                <div className="p-4 border-t border-[#2D4059] bg-[#0A1520]">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Settings size={16} /> Dashboard Settings
                    </h3>
                    <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Alert Threshold</span>
                            <span className="text-white font-bold">{threshold}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="90"
                            step="5"
                            value={threshold}
                            onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
                            className="w-full accent-traq-cyan"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Coaches with unticketed percentage above {threshold}% will trigger alerts.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
