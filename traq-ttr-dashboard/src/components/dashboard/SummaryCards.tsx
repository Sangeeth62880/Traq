import React from 'react';
import { Users, Ticket, UserX } from 'lucide-react';
import { TrainTicketSummary } from '../../types';
import { formatPercent } from '../../utils/formatters';
import { COLORS } from '../../config/constants';

interface SummaryCardsProps {
    analysis: TrainTicketSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ analysis }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Passengers Card */}
            <div
                className="bg-traq-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 shadow-lg transition-all hover:border-[rgba(0,188,212,0.3)] relative overflow-hidden group"
                style={{ borderColor: 'transparent' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(0,188,212,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 hidden sm:block" />
                <div className="sm:mb-3">
                    <Users className="w-5 h-5 sm:w-8 sm:h-8" color={COLORS.cyan} />
                </div>
                <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-1">
                    <span className="text-xl sm:text-4xl font-bold text-white">
                        {analysis.totalPeople}
                    </span>
                    <span className="text-white/40 text-[10px] sm:text-sm uppercase tracking-widest font-medium text-center">
                        Total Passengers
                    </span>
                </div>
            </div>

            {/* Ticketed Card */}
            <div
                className="bg-traq-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 shadow-lg transition-all hover:border-[rgba(76,175,80,0.3)] relative overflow-hidden group"
                style={{ borderColor: 'transparent' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(76,175,80,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 hidden sm:block" />
                <div className="sm:mb-3">
                    <Ticket className="w-5 h-5 sm:w-8 sm:h-8" color={COLORS.green} />
                </div>
                <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-1">
                    <span className="text-xl sm:text-4xl font-bold text-white">
                        {analysis.totalTicketed}
                    </span>
                    <span className="text-white/40 text-[10px] sm:text-sm uppercase tracking-widest font-medium text-center">
                        Ticketed
                    </span>
                </div>
            </div>

            {/* Unticketed Card */}
            <div
                className="bg-traq-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 shadow-lg transition-all hover:border-[rgba(244,67,54,0.3)] relative overflow-hidden group"
                style={{ borderColor: 'transparent' }}
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(244,67,54,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 hidden sm:block" />
                <div className="sm:mb-3">
                    <UserX className="w-5 h-5 sm:w-8 sm:h-8" color={COLORS.red} />
                </div>
                <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-1">
                    <span className="text-xl sm:text-4xl font-bold" style={{ color: COLORS.red }}>
                        {analysis.totalUnticketed}
                    </span>
                    <span className="text-xs sm:text-sm font-bold opacity-70" style={{ color: COLORS.red }}>
                        {formatPercent(analysis.overallUnticketedPercent)}
                    </span>
                    <span className="text-white/40 text-[10px] sm:text-sm uppercase tracking-widest font-medium text-center">
                        Unticketed
                    </span>
                </div>
            </div>
        </div>
    );
};
