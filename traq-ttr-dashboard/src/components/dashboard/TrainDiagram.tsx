import React from 'react';
import { CoachTicketAnalysis } from '../../types';
import { getAlertColor } from '../../utils/alertHelpers';

interface TrainDiagramProps {
    coaches: CoachTicketAnalysis[];
}

export const TrainDiagram: React.FC<TrainDiagramProps> = ({ coaches }) => {
    // Sort coaches in a realistic train order
    const sortedCoaches = [...coaches].sort((a, b) => {
        const order: Record<string, number> = {
            'H1': 1, 'A1': 2, 'B1': 3, 'B2': 4,
            'S1': 5, 'S2': 6, 'S3': 7, 'S4': 8, 'S5': 9, 'S6': 10,
            'G1': 11, 'G2': 12, 'GENERAL': 13, 'PC': 14, 'TRAIN': 15,
        };
        return (order[a.coachId] || 50) - (order[b.coachId] || 50);
    });

    return (
        <div className="bg-traq-card rounded-xl p-5 border border-white/10 mb-4">
            <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">
                Train Overview
            </h3>

            <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-0 min-w-max">
                    {/* Engine (left) */}
                    <div className="w-16 h-14 bg-traq-accent rounded-l-xl flex items-center justify-center border border-white/10">
                        <span className="text-white/40 text-xs font-bold">LOCO</span>
                    </div>
                    <div className="w-3 h-3 bg-white/10 rounded-full -ml-1 z-10" />

                    {/* Coach blocks */}
                    {sortedCoaches.map((coach, i) => {
                        const alertColor = coach.hasRealData
                            ? getAlertColor(coach.alertLevel)
                            : 'rgba(255,255,255,0.15)';
                        const hasAlert = coach.hasRealData &&
                            (coach.alertLevel === 'high' || coach.alertLevel === 'critical');

                        return (
                            <React.Fragment key={coach.coachId}>
                                {/* Coupler */}
                                {i > 0 && (
                                    <div className="w-2 h-1 bg-white/20 flex-shrink-0" />
                                )}

                                {/* Coach block */}
                                <div
                                    className={`
                    relative flex-shrink-0 w-20 h-14 rounded-sm flex flex-col
                    items-center justify-center border transition-all cursor-default
                    ${hasAlert ? 'animate-pulse' : ''}
                  `}
                                    style={{
                                        backgroundColor: `${alertColor}15`,
                                        borderColor: `${alertColor}50`,
                                    }}
                                    title={`${coach.coachId}: ${coach.totalCrowdCount} people, ${coach.ticketedCount} ticketed, ${coach.unticketedCount} unticketed`}
                                >
                                    <span
                                        className="font-bold text-sm"
                                        style={{ color: alertColor }}
                                    >
                                        {coach.coachId}
                                    </span>
                                    {coach.hasRealData && (
                                        <span className="text-[9px]" style={{ color: `${alertColor}90` }}>
                                            {coach.unticketedCount > 0
                                                ? `${coach.unticketedCount} untkt`
                                                : '✓ clear'
                                            }
                                        </span>
                                    )}

                                    {/* Red dot for alerted coaches */}
                                    {hasAlert && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-traq-card" />
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Coupler + Engine (right) */}
                    <div className="w-3 h-3 bg-white/10 rounded-full -mr-1 z-10" />
                    <div className="w-16 h-14 bg-traq-accent rounded-r-xl flex items-center justify-center border border-white/10">
                        <span className="text-white/40 text-xs font-bold">EOT</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                <LegendItem color="#4CAF50" label="Clear" />
                <LegendItem color="#FFC107" label="Moderate" />
                <LegendItem color="#FF9800" label="High" />
                <LegendItem color="#F44336" label="Critical" />
                <LegendItem color="rgba(255,255,255,0.15)" label="No data" />
            </div>
        </div>
    );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        <span className="text-white/30 text-[10px]">{label}</span>
    </div>
);
