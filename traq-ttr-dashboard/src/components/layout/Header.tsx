import React from 'react';
import { Shield, LogOut, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
    const { user, logout } = useAuthStore();

    if (!user) return null;

    return (
        <div className="w-full bg-[#0D1B2A] border-b border-white/5 px-6 py-2.5">
            <div className="flex items-center justify-between">
                {/* Left: Branding */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <span className="text-white font-bold text-sm tracking-wider">
                            TRAQ
                        </span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <span className="text-white/30 text-xs">
                        TTR Inspection Console
                    </span>
                </div>

                {/* Right: User info + logout */}
                <div className="flex items-center gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-lg">
                        <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-white text-xs font-semibold leading-tight">
                                {user.name}
                            </div>
                            <div className="text-white/30 text-[10px] flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {user.divisionName} ({user.division}) • {user.role}
                            </div>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-xs"
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
