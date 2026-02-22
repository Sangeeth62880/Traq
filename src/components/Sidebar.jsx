import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Search,
    MapPin,
    Users,
    CreditCard,
    Wallet,
    Ticket,
    Settings,
    Train,
} from 'lucide-react'

// Navigation item definitions — matches spec exactly
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', end: true },
    { icon: Search, label: 'Search Train', path: '/search' },
    { icon: MapPin, label: 'Live Tracker', path: '/tracker' },
    { icon: Users, label: 'Crowd Monitor', path: '/crowd' },
    { icon: CreditCard, label: 'Railway Card', path: '/card' },
    { icon: Wallet, label: 'Recharge', path: '/recharge' },
    { icon: Ticket, label: 'Book Ticket', path: '/book' },
    { icon: Settings, label: 'Settings', path: '/settings' },
]

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
}

export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* ── Mobile Overlay ──
          z-40 so it sits above main content but below the sidebar panel (z-50).
          It intentionally covers the topbar (z-50) on mobile so that the
          full screen is darkened when the drawer is open — note: topbar is
          also z-50, so they're at the same level; the overlay renders AFTER
          the topbar in the DOM so it paints on top of it on mobile. */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar Panel ──
          z-50 ensures it renders above the overlay and the topbar while open.
          On desktop (lg+) it's always visible via lg:translate-x-0.
          On mobile it slides in/out via translate-x. */}
            <aside
                className={`
          fixed top-16 left-0 bottom-0 z-50 w-60 flex flex-col
          border-r border-[#21262D] bg-[#0D1117]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
                aria-label="Sidebar navigation"
            >
                {/* ── User Greeting ── */}
                {/* <div className="px-5 pt-5 pb-4 border-b border-[#21262D]">
                    <p className="text-xs text-[#484F58] font-medium uppercase tracking-widest mb-1">
                        {getGreeting()}
                    </p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                        Rahul Kumar <span className="text-base">👋</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[10px] font-medium text-[#2F80ED]">
                            <Train size={9} />
                            Premium
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                            Active
                        </span>
                    </div>
                </div> */}

                {/* ── Navigation Links ── */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2">
                    <ul className="space-y-0.5">
                        {navItems.map(({ icon: Icon, label, path, end }) => (
                            <li key={path}>
                                <NavLink
                                    to={path}
                                    end={end}
                                    onClick={() => {
                                        // Close drawer on mobile when a link is clicked
                                        if (window.innerWidth < 1024) onClose()
                                    }}
                                    className={({ isActive }) =>
                                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     transition-all duration-150 cursor-pointer
                     ${isActive
                                            ? 'bg-[#2F80ED]/10 text-[#2F80ED]'
                                            : 'text-[#8B949E] hover:bg-white/5 hover:text-[#F0F6FC]'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Active left border — 4px wide per spec */}
                                            {isActive && (
                                                <span className="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#2F80ED]" />
                                            )}
                                            <Icon
                                                size={17}
                                                className={`flex-shrink-0 transition-colors duration-150 ${isActive
                                                    ? 'text-[#2F80ED]'
                                                    : 'text-[#484F58] group-hover:text-[#8B949E]'
                                                    }`}
                                            />
                                            <span className="truncate">{label}</span>

                                            {/* LIVE badge on Live Tracker */}
                                            {path === '/tracker' && (
                                                <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold tracking-wide">
                                                    LIVE
                                                </span>
                                            )}
                                            {/* NEW badge on Crowd Monitor */}
                                            {path === '/crowd' && (
                                                <span className="ml-auto flex items-center px-1.5 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold">
                                                    NEW
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* ── Divider ── */}
                    <div className="my-3 border-t border-[#21262D]" />

                    {/* ── Quick Stats ── */}
                    <div className="px-3 py-2 rounded-lg bg-[#161B22] border border-[#21262D] mx-1">
                        <p className="text-[10px] font-semibold uppercase text-[#484F58] tracking-widest mb-2">
                            Quick Stats
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#8B949E]">Card Balance</span>
                                <span className="text-xs font-bold text-[#22C55E]">₹0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#8B949E]">Trips Today</span>
                                <span className="text-xs font-bold text-[#F0F6FC]">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#8B949E]">Active Alerts</span>
                                <span className="text-xs font-bold text-[#F97316]">3</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ── Footer ── */}
                <div className="px-5 py-4 border-t border-[#21262D]">
                    <p className="text-[11px] text-[#484F58] font-medium">Traq v1.0.0</p>
                    <p className="text-[10px] text-[#21262D] mt-0.5">© 2024 Traq Technologies</p>
                </div>
            </aside>
        </>
    )
}
