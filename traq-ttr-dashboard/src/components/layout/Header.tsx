import React from 'react';
import { Shield, LogOut, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
    const { user, logout } = useAuthStore();

    if (!user) return null;

    return (
        <div className="w-full bg-[#0D1B2A] border-b border-white/5 px-3 sm:px-6 py-2 sm:py-2.5">
            <div className="flex items-center justify-between">
                {/* Left: Branding – compact on mobile */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wider">
                        TRAQ
                    </span>
                    {/* Hide subtitle on mobile */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-px h-4 bg-white/10" />
                        <span className="text-white/30 text-xs">TTR Inspection Console</span>
                    </div>
                </div>

                {/* Right: User info + logout */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* User info – compact on mobile */}
                    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 rounded-lg">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                        </div>
                        <div>
                            {/* Show full name on tablet+, short on mobile */}
                            <div className="text-white text-[10px] sm:text-xs font-semibold leading-tight">
                                <span className="sm:hidden">{user.name.split(' ')[0]}</span>
                                <span className="hidden sm:inline">{user.name}</span>
                            </div>
                            <div className="text-white/30 text-[9px] sm:text-[10px] flex items-center gap-1 mt-0.5">
                                <span className="sm:hidden">{user.division}</span>
                                <span className="hidden sm:flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {user.divisionName} ({user.division}) • {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Logout – icon only on mobile */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-xs"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
