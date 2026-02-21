import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface AlertBannerProps {
    alertCount: number;
    onViewClick: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alertCount, onViewClick }) => {
    if (alertCount === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-900/80 to-traq-card border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded-full">
                    <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">
                        Immediate Inspection Required
                    </h3>
                    <p className="text-gray-300 text-sm">
                        <span className="text-red-400 font-bold">{alertCount} coaches</span> exceed the unticketed passenger threshold.
                    </p>
                </div>
            </div>
            <button
                onClick={onViewClick}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-semibold transition-colors"
            >
                VIEW
                <ChevronRight size={18} />
            </button>
        </div>
    );
};
