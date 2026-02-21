import React from 'react';
import {
    Users, UserCheck, UserX, Gauge, AlertTriangle,
    CheckCircle, Info, XCircle, BedDouble, Snowflake,
    Crown, ArrowRight, Radio,
} from 'lucide-react';
import { CoachTicketAnalysis } from '../../types';
import { getAlertColor } from '../../utils/alertHelpers';

interface CoachCardProps {
    coach: CoachTicketAnalysis;
    onInspect?: (coachId: string) => void;
}

export const CoachCard: React.FC<CoachCardProps> = ({ coach, onInspect }) => {
    const hasData = coach.hasRealData;
    const isAlert = hasData &&
        (coach.alertLevel === 'high' || coach.alertLevel === 'critical');
    const alertColor = getAlertColor(coach.alertLevel);

    return (
        <div
            className={`
        relative rounded-xl overflow-hidden transition-all duration-200
        ${hasData
                    ? `bg-traq-card border-l-4 hover:bg-traq-accent/30`
                    : `bg-traq-card/50 border border-dashed border-white/10 opacity-60 hover:opacity-80`
                }
        ${isAlert ? 'ring-1 ring-red-500/20' : ''}
      `}
            style={{
                borderLeftColor: hasData ? alertColor : 'transparent',
            }}
        >
            {/* Subtle alert glow for critical coaches */}
            {isAlert && (
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${alertColor}, transparent 70%)` }}
                />
            )}

            <div className="relative p-5">
                {/* ---- HEADER ROW ---- */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Coach ID badge */}
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                            style={{
                                backgroundColor: hasData
                                    ? `${alertColor}20`
                                    : 'rgba(255,255,255,0.05)',
                                color: hasData ? alertColor : 'rgba(255,255,255,0.4)',
                            }}
                        >
                            {coach.coachId}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                {getCoachTypeIcon(coach.coachType)}
                                <span className="text-white/60 text-sm">
                                    {getCoachTypeLabel(coach.coachType)}
                                </span>
                            </div>
                            {!hasData && (
                                <span className="text-white/25 text-xs">No ticket data</span>
                            )}
                            {hasData && coach.capacity && coach.capacity > 0 && (
                                <span className="text-white/25 text-xs">
                                    Capacity: {coach.capacity} seats
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Alert badge */}
                    {hasData && (
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                                backgroundColor: `${alertColor}20`,
                                color: alertColor,
                            }}
                        >
                            {getAlertIcon(coach.alertLevel)}
                            <span>{coach.alertLevel.toUpperCase()}</span>
                        </div>
                    )}
                </div>

                {/* ---- OCCUPANCY DOTS ---- */}
                {hasData && coach.totalCrowdCount > 0 && (
                    <div className="mb-4">
                        <OccupancyDots
                            ticketed={coach.ticketedCount}
                            unticketed={coach.unticketedCount}
                            capacity={coach.capacity || coach.totalCrowdCount}
                        />
                    </div>
                )}

                {/* ---- STATS 2x2 GRID ---- */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCell
                        icon={<Users className="w-4 h-4" />}
                        value={coach.totalCrowdCount}
                        label="Total People"
                        color="#00BCD4"
                    />
                    <StatCell
                        icon={<UserCheck className="w-4 h-4" />}
                        value={coach.ticketedCount}
                        label="Ticketed"
                        color="#4CAF50"
                    />
                    <StatCell
                        icon={<UserX className="w-4 h-4" />}
                        value={coach.unticketedCount}
                        label="Unticketed"
                        color={alertColor}
                    />
                    <StatCell
                        icon={<Gauge className="w-4 h-4" />}
                        value={`${coach.crowdDensityPercent.toFixed(0)}%`}
                        label="Density"
                        color="#FFC107"
                    />
                </div>

                {/* ---- DUAL PROGRESS BAR ---- */}
                {hasData && coach.totalCrowdCount > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex">
                                {/* Ticketed portion (green) */}
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${100 - coach.unticketedPercent}%`,
                                        backgroundColor: '#4CAF50',
                                    }}
                                />
                                {/* Unticketed portion (alert color) */}
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${coach.unticketedPercent}%`,
                                        backgroundColor: alertColor,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-green-400">
                                {coach.ticketedCount} ticketed
                            </span>
                            <span style={{ color: alertColor }}>
                                {coach.unticketedCount} unticketed ({coach.unticketedPercent.toFixed(0)}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* ---- INSPECT BUTTON ---- */}
                {isAlert && (
                    <button
                        onClick={() => onInspect?.(coach.coachId)}
                        className="w-full mt-2 py-2.5 rounded-lg font-bold text-sm flex items-center
                       justify-center gap-2 transition-all duration-200 hover:brightness-110"
                        style={{
                            backgroundColor: `${alertColor}20`,
                            color: alertColor,
                            border: `1px solid ${alertColor}40`,
                        }}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        INSPECT THIS COACH
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ==================== SUB-COMPONENTS ====================

const StatCell: React.FC<{
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
}> = ({ icon, value, label, color }) => (
    <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
        <div style={{ color }} className="opacity-70">
            {icon}
        </div>
        <div>
            <div className="text-white font-bold text-lg leading-tight">{value}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider">{label}</div>
        </div>
    </div>
);

const OccupancyDots: React.FC<{
    ticketed: number;
    unticketed: number;
    capacity: number;
}> = ({ ticketed, unticketed, capacity }) => {
    // Scale down to max 24 dots
    const maxDots = 24;
    const total = Math.max(ticketed + unticketed, capacity);
    const scale = total > maxDots ? maxDots / total : 1;

    const greenDots = Math.round(ticketed * scale);
    const redDots = Math.round(unticketed * scale);
    const grayDots = Math.max(0, Math.round(capacity * scale) - greenDots - redDots);

    const dots: Array<'green' | 'red' | 'gray'> = [
        ...Array(greenDots).fill('green'),
        ...Array(redDots).fill('red'),
        ...Array(grayDots).fill('gray'),
    ];

    return (
        <div className="flex flex-wrap gap-1.5">
            {dots.map((color, i) => (
                <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-colors duration-300"
                    style={{
                        backgroundColor:
                            color === 'green' ? '#4CAF50' :
                                color === 'red' ? '#F44336' :
                                    'rgba(255,255,255,0.08)',
                    }}
                    title={
                        color === 'green' ? 'Ticketed' :
                            color === 'red' ? 'Unticketed' :
                                'Empty seat'
                    }
                />
            ))}
        </div>
    );
};

// ==================== HELPERS ====================

function getCoachTypeIcon(type?: string): React.ReactNode {
    const cls = "w-4 h-4 text-white/40";
    switch (type?.toLowerCase()) {
        case 'sleeper':
            return <BedDouble className={cls} />;
        case 'ac 3-tier':
        case 'ac 2-tier':
            return <Snowflake className={cls} />;
        case 'ac first':
            return <Crown className={cls} />;
        case 'general':
            return <Users className={cls} />;
        default:
            return <Radio className={cls} />;
    }
}

function getCoachTypeLabel(type?: string): string {
    if (!type || type === 'Unknown') return 'Coach';
    return type;
}

function getAlertIcon(level: string): React.ReactNode {
    const size = "w-3.5 h-3.5";
    switch (level) {
        case 'critical': return <XCircle className={size} />;
        case 'high': return <AlertTriangle className={size} />;
        case 'moderate': return <Info className={size} />;
        default: return <CheckCircle className={size} />;
    }
}
