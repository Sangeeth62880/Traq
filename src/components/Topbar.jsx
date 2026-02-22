import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Menu, X, Train, CreditCard } from 'lucide-react'

// Topbar component — fixed header with logo, search, and user actions
export default function Topbar({ onMenuToggle, isSidebarOpen }) {
    const [searchFocused, setSearchFocused] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4 bg-[#0D1117] border-b border-[#21262D]">

            {/* ── Left: Hamburger + Logo ── */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Hamburger — visible on mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-white/5 text-[#8B949E] hover:text-[#F0F6FC]"
                    aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Logo — uses Link to avoid full-page reload */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#2F80ED]/20 group-hover:bg-[#2F80ED]/30 transition-colors duration-200">
                        <Train size={18} className="text-[#2F80ED]" />
                    </div>
                    <div className="flex items-baseline gap-0">
                        <span className="text-xl font-bold tracking-tight text-[#F0F6FC]">Tra</span>
                        <span className="relative text-xl font-bold tracking-tight text-[#2F80ED]">
                            q
                            {/* Location pin dot beneath the Q */}
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F97316] opacity-90" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* ── Center: Search Bar ── */}
            <div className="flex-1 max-w-xl mx-auto hidden sm:block">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${searchFocused
                    ? 'bg-[#161B22] border border-[#2F80ED]/60 shadow-[0_0_0_3px_rgba(47,128,237,0.1)]'
                    : 'bg-[#161B22] border border-[#21262D] hover:border-[#484F58]'
                    }`}>
                    <Search size={16} className="text-[#484F58] flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search trains, stations..."
                        className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </div>
            </div>

            {/* ── Right: Notifications + User + Card ── */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                {/* Notification Bell with orange badge per spec */}
                <button
                    className="relative p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 text-[#8B949E] hover:text-[#F0F6FC]"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {/* Orange notification dot badge */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-[#0D1117]" />
                </button>

                {/* Railway Card Chip — hidden on small screens */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#21262D] bg-[#161B22] hover:border-[#2F80ED]/40 transition-colors duration-200 cursor-pointer">
                    <CreditCard size={14} className="text-[#2F80ED]" />
                    <span className="text-xs font-medium text-[#8B949E]">Railway Card</span>
                    <span className="text-xs font-bold text-[#22C55E]">₹0.00</span>
                </div>

                {/* User Avatar */}
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#1a56c4] text-white text-sm font-bold hover:shadow-[0_0_0_3px_rgba(47,128,237,0.3)] transition-all duration-200"
                    aria-label="User profile"
                >
                    RK
                </button>
            </div>
        </header>
    )
}
