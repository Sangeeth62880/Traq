import React, { useState } from 'react';
import {
    Shield, Train, Eye, EyeOff, ChevronDown, AlertCircle,
    Fingerprint, Building2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { RAILWAY_DIVISIONS, getDivisionsByZone } from '../config/auth';

const LoginPage: React.FC = () => {
    const [division, setDivision] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
    const [divisionSearch, setDivisionSearch] = useState('');

    const { login, error } = useAuthStore();

    const divisionsByZone = getDivisionsByZone();
    const selectedDivision = RAILWAY_DIVISIONS.find((d) => d.code === division);

    // Filter divisions based on search
    const filteredDivisions = divisionSearch.trim()
        ? RAILWAY_DIVISIONS.filter(
            (d) =>
                d.name.toLowerCase().includes(divisionSearch.toLowerCase()) ||
                d.code.toLowerCase().includes(divisionSearch.toLowerCase()) ||
                d.zone.toLowerCase().includes(divisionSearch.toLowerCase())
        )
        : null; // null means show all grouped by zone

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Brief delay for UX feel
        setTimeout(() => {
            login({ division, employeeId, password });
            setIsSubmitting(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            {/* Top bar */}
            <div className="w-full bg-[#0D1B2A] border-b border-white/5 px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <Train className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                        </div>
                        <div>
                            <span className="text-white font-bold text-xs sm:text-sm tracking-wider">
                                TRAQ
                            </span>
                            <span className="text-white/30 text-xs ml-2 hidden sm:inline">
                                Smart Rail Crowding System
                            </span>
                        </div>
                    </div>
                    <div className="text-white/20 text-[10px] sm:text-xs hidden sm:block">
                        Indian Railways • Ministry of Railways
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 w-full">
                <div className="w-full max-w-sm sm:max-w-md">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        {/* Emblem / Shield */}
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 border border-amber-500/20">
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                        </div>
                        <h1 className="text-white text-xl sm:text-2xl font-bold mb-1">
                            TTR Inspection Console
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm">
                            Travelling Ticket Recorder • Authorized Access Only
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-[#1B2838] to-[#1E3A5F] px-4 sm:px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                                <span className="text-white font-semibold text-xs sm:text-sm">
                                    Officer Authentication
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                            {/* Error message */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs sm:text-sm">{error}</p>
                                </div>
                            )}

                            {/* Division Selector */}
                            <div>
                                <label className="block text-white/50 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2">
                                    Railway Division
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
                                        className={`
                      w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                      border transition-all text-left
                      ${showDivisionDropdown
                                                ? 'border-cyan-500/50 ring-1 ring-cyan-500/20 bg-white/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                            <Building2 className="w-4 h-4 text-white/30 flex-shrink-0" />
                                            {selectedDivision ? (
                                                <div className="min-w-0 flex items-center">
                                                    <span className="text-white text-xs sm:text-sm truncate mr-1.5">
                                                        {selectedDivision.name}
                                                    </span>
                                                    <span className="text-white/30 text-[10px] sm:text-xs whitespace-nowrap">
                                                        ({selectedDivision.code})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-white/30 text-xs sm:text-sm">
                                                    Select division...
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${showDivisionDropdown ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    {showDivisionDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-[#1B2838] border border-white/10 rounded-xl shadow-2xl max-h-60 sm:max-h-72 flex flex-col overflow-hidden">
                                            {/* Search within dropdown */}
                                            <div className="p-2 border-b border-white/5 flex-shrink-0">
                                                <input
                                                    type="text"
                                                    value={divisionSearch}
                                                    onChange={(e) => setDivisionSearch(e.target.value)}
                                                    placeholder="Search division..."
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/30"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="overflow-y-auto flex-1 p-1">
                                                {filteredDivisions ? (
                                                    // Show flat filtered list
                                                    filteredDivisions.length > 0 ? (
                                                        filteredDivisions.map((div) => (
                                                            <button
                                                                key={div.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setDivision(div.code);
                                                                    setShowDivisionDropdown(false);
                                                                    setDivisionSearch('');
                                                                }}
                                                                className={`
                                  w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-left rounded-lg
                                  hover:bg-white/5 transition-colors
                                  ${division === div.code ? 'bg-cyan-500/10' : ''}
                                `}
                                                            >
                                                                <div className="flex items-center min-w-0 pr-2">
                                                                    <span className="text-white text-xs sm:text-sm truncate">
                                                                        {div.name}
                                                                    </span>
                                                                    <span className="text-white/30 text-[10px] sm:text-xs ml-1.5 whitespace-nowrap">
                                                                        ({div.code})
                                                                    </span>
                                                                </div>
                                                                <span className="text-white/20 text-[10px] sm:text-xs whitespace-nowrap">
                                                                    {div.zone}
                                                                </span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-6 text-center text-white/30 text-xs sm:text-sm">
                                                            No divisions match "{divisionSearch}"
                                                        </div>
                                                    )
                                                ) : (
                                                    // Show grouped by zone
                                                    Object.entries(divisionsByZone).map(([zone, divisions]) => (
                                                        <div key={zone} className="mb-2 last:mb-0">
                                                            <div className="px-3 py-1.5 bg-white/5 sticky top-0 rounded-md z-10 backdrop-blur-sm">
                                                                <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold block truncate">
                                                                    {zone}
                                                                </span>
                                                            </div>
                                                            <div className="py-1">
                                                                {divisions.map((div) => (
                                                                    <button
                                                                        key={div.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDivision(div.code);
                                                                            setShowDivisionDropdown(false);
                                                                            setDivisionSearch('');
                                                                        }}
                                                                        className={`
                                      w-full flex items-center justify-between px-3 sm:px-4 py-2 text-left rounded-md
                                      hover:bg-white/5 transition-colors
                                      ${division === div.code ? 'bg-cyan-500/10' : ''}
                                    `}
                                                                    >
                                                                        <span className="text-white/70 text-xs sm:text-sm truncate pr-2">
                                                                            {div.name}
                                                                        </span>
                                                                        <span className="text-white/30 text-[10px] sm:text-xs whitespace-nowrap">
                                                                            {div.code}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label className="block text-white/50 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                    placeholder="e.g., TTR001"
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-xs sm:text-sm"
                                    autoComplete="username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-white/50 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-xs sm:text-sm"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                  w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${isSubmitting
                                        ? 'bg-cyan-500/20 text-cyan-300/50 cursor-wait'
                                        : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
                                    }
                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Login to Inspection Console
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Card Footer */}
                        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 border-t border-white/5">
                            <p className="text-white/40 text-[9px] sm:text-[10px] text-center">
                                Unauthorized access is punishable under Indian Railways Act.<br className="sm:hidden" />
                                This system is monitored.
                            </p>
                        </div>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-4 sm:mt-6 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                        <p className="text-amber-400/60 text-[11px] sm:text-xs font-medium mb-1">Demo Credentials</p>
                        <p className="text-amber-400/40 text-[11px] sm:text-xs leading-relaxed">
                            Division: <span className="text-amber-300/60">Any</span>
                            {' • '}
                            ID: <span className="text-amber-300/60">TTR001</span>
                            {' • '}
                            Pass: <span className="text-amber-300/60">ttr@123</span>
                        </p>
                        <p className="text-amber-400/40 text-[10px] sm:text-xs mt-0.5">
                            Master password: <span className="text-amber-300/60 break-all">traq2026</span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 sm:mt-8 text-center text-white/10 text-[10px] sm:text-xs">
                        Traq TTR Dashboard v1.0 • © 2026 Indian Railways
                    </div>
                </div>
            </div>

            {/* Close dropdown when clicking outside */}
            {showDivisionDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowDivisionDropdown(false);
                        setDivisionSearch('');
                    }}
                />
            )}
        </div>
    );
};

export default LoginPage;
