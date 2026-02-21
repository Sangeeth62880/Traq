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
            <div className="w-full bg-[#0D1B2A] border-b border-white/5 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <Train className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <span className="text-white font-bold text-sm tracking-wider">
                                TRAQ
                            </span>
                            <span className="text-white/30 text-xs ml-2">
                                Smart Rail Crowding System
                            </span>
                        </div>
                    </div>
                    <div className="text-white/20 text-xs">
                        Indian Railways • Ministry of Railways
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Emblem / Shield */}
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20">
                            <Shield className="w-10 h-10 text-amber-400" />
                        </div>
                        <h1 className="text-white text-2xl font-bold mb-1">
                            TTR Inspection Console
                        </h1>
                        <p className="text-white/40 text-sm">
                            Travelling Ticket Recorder • Authorized Access Only
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-[#1B2838] to-[#1E3A5F] px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-cyan-400" />
                                <span className="text-white font-semibold text-sm">
                                    Officer Authentication
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Error message */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Division Selector */}
                            <div>
                                <label className="block text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                                    Railway Division
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
                                        className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl
                      border transition-all text-left
                      ${showDivisionDropdown
                                                ? 'border-cyan-500/50 ring-1 ring-cyan-500/20 bg-white/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-4 h-4 text-white/30" />
                                            {selectedDivision ? (
                                                <div>
                                                    <span className="text-white text-sm">
                                                        {selectedDivision.name}
                                                    </span>
                                                    <span className="text-white/30 text-xs ml-2">
                                                        ({selectedDivision.code})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-white/30 text-sm">
                                                    Select your division...
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-white/30 transition-transform ${showDivisionDropdown ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    {showDivisionDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-[#1B2838] border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-hidden">
                                            {/* Search within dropdown */}
                                            <div className="p-2 border-b border-white/5">
                                                <input
                                                    type="text"
                                                    value={divisionSearch}
                                                    onChange={(e) => setDivisionSearch(e.target.value)}
                                                    placeholder="Search division or zone..."
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/30"
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="overflow-y-auto max-h-56">
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
                                  w-full flex items-center justify-between px-4 py-2.5 text-left
                                  hover:bg-white/5 transition-colors
                                  ${division === div.code ? 'bg-cyan-500/10' : ''}
                                `}
                                                            >
                                                                <div>
                                                                    <span className="text-white text-sm">{div.name}</span>
                                                                    <span className="text-white/30 text-xs ml-2">({div.code})</span>
                                                                </div>
                                                                <span className="text-white/20 text-xs">{div.zone}</span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-6 text-center text-white/30 text-sm">
                                                            No divisions match "{divisionSearch}"
                                                        </div>
                                                    )
                                                ) : (
                                                    // Show grouped by zone
                                                    Object.entries(divisionsByZone).map(([zone, divisions]) => (
                                                        <div key={zone}>
                                                            <div className="px-4 py-1.5 bg-white/5 sticky top-0">
                                                                <span className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
                                                                    {zone}
                                                                </span>
                                                            </div>
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
                                    w-full flex items-center justify-between px-4 py-2 text-left
                                    hover:bg-white/5 transition-colors
                                    ${division === div.code ? 'bg-cyan-500/10' : ''}
                                  `}
                                                                >
                                                                    <span className="text-white/70 text-sm">{div.name}</span>
                                                                    <span className="text-white/20 text-xs">{div.code}</span>
                                                                </button>
                                                            ))}
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
                                <label className="block text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                                    placeholder="e.g., TTR001"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                                    autoComplete="username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm pr-12"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                  w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${isSubmitting
                                        ? 'bg-cyan-500/20 text-cyan-300/50 cursor-wait'
                                        : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
                                    }
                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Login to Inspection Console
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Card Footer */}
                        <div className="px-6 py-3 bg-white/5 border-t border-white/5">
                            <p className="text-white/40 text-[10px] text-center">
                                Unauthorized access is punishable under Indian Railways Act.
                                This system is monitored.
                            </p>
                        </div>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-6 bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                        <p className="text-amber-400/60 text-xs font-medium mb-1">Demo Credentials</p>
                        <p className="text-amber-400/40 text-xs">
                            Division: <span className="text-amber-300/60">Any</span>
                            {' • '}
                            ID: <span className="text-amber-300/60">TTR001</span>
                            {' • '}
                            Password: <span className="text-amber-300/60">ttr@123</span>
                        </p>
                        <p className="text-amber-400/40 text-xs mt-0.5">
                            Master password: <span className="text-amber-300/60">traq2026</span> (works with any ID)
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-white/10 text-xs">
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
