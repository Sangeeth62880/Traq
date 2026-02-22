import React from 'react';
import { CoachCard } from './CoachCard';
import { CoachTicketAnalysis } from '../../types';

interface CoachGridProps {
    coaches: CoachTicketAnalysis[];
    onInspectCoach?: (coachId: string) => void;
}

export const CoachGrid: React.FC<CoachGridProps> = ({ coaches, onInspectCoach }) => {
    // Separate coaches: real data first, then padded
    const realCoaches = coaches.filter(c => c.hasRealData);
    const paddedCoaches = coaches.filter(c => !c.hasRealData);

    return (
        <div>
            {/* Section: Coaches with real data */}
            {realCoaches.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 mt-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-traq-cyan animate-pulse" />
                        <h3 className="text-white/70 text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Monitored Coaches ({realCoaches.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {realCoaches.map((coach) => (
                            <CoachCard
                                key={coach.coachId}
                                coach={coach}
                                onInspect={onInspectCoach}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Section: Other coaches (padded / no data) */}
            {paddedCoaches.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <h3 className="text-white/30 text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Other Coaches ({paddedCoaches.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                        {paddedCoaches.map((coach) => (
                            <CoachCard
                                key={coach.coachId}
                                coach={coach}
                                onInspect={onInspectCoach}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
