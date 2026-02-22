import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface AlertBannerProps {
    alertCount: number;
    onViewClick: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alertCount, onViewClick }) => {
    if (alertCount === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-900/80 to-traq-card border-l-4 border-red-500 rounded-xl p-3 sm:p-4 shadow-md mb-2">
            {/* Stack on mobile, row on tablet+ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-red-500/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs sm:text-base leading-tight">
                            <span className="text-red-400">{alertCount}</span> Coach{alertCount > 1 ? 'es' : ''} Need Inspection
                        </p>
                        <p className="text-white/50 text-[10px] sm:text-xs">
                            Unticketed above {alertCount > 0 ? 'configured' : ''} threshold
                        </p>
                    </div>
                </div>
                <button
                    onClick={onViewClick}
                    className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-colors"
                >
                    VIEW ALERTS
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
