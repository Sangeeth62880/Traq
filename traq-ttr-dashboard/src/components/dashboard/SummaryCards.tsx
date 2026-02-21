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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Passengers Card */}
            <div className="bg-traq-card rounded-xl p-6 shadow-lg border border-transparent transition-all hover:border-[rgba(0,188,212,0.3)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(0,188,212,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
                <Users size={32} color={COLORS.cyan} className="mb-4" />
                <h2 className="text-4xl font-bold text-white mb-2">{analysis.totalPeople}</h2>
                <p className="text-gray-400 uppercase tracking-widest text-sm font-medium">
                    Total Passengers
                </p>
            </div>

            {/* Ticketed Card */}
            <div className="bg-traq-card rounded-xl p-6 shadow-lg border border-transparent transition-all hover:border-[rgba(76,175,80,0.3)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(76,175,80,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
                <Ticket size={32} color={COLORS.green} className="mb-4" />
                <h2 className="text-4xl font-bold text-white mb-2">{analysis.totalTicketed}</h2>
                <p className="text-gray-400 uppercase tracking-widest text-sm font-medium">
                    Ticketed
                </p>
            </div>

            {/* Unticketed Card */}
            <div className="bg-traq-card rounded-xl p-6 shadow-lg border border-transparent transition-all hover:border-[rgba(244,67,54,0.3)] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(244,67,54,0.05)] rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
                <UserX size={32} color={COLORS.red} className="mb-4" />
                <h2 className="text-4xl font-bold text-white mb-1" style={{ color: COLORS.red }}>
                    {analysis.totalUnticketed}
                </h2>
                <p className="text-sm font-bold text-red-400 mb-1">
                    {formatPercent(analysis.overallUnticketedPercent)}
                </p>
                <p className="text-gray-400 uppercase tracking-widest text-sm font-medium">
                    Unticketed
                </p>
            </div>
        </div>
    );
};
