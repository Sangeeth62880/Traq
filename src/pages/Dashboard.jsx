import { Link } from 'react-router-dom'
import {
    Train,
    Users,
    CreditCard,
    TrendingUp,
    Clock,
    Map,
    Bell,
    ArrowRight,
    Zap,
} from 'lucide-react'


// ── Reusable placeholder card ─────────────────────────────────
function PlaceholderCard({ message = 'Feature coming in next phase' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-[#21262D] text-center min-h-[160px]">
            <div className="w-10 h-10 rounded-full bg-[#161B22] flex items-center justify-center">
                <Zap size={18} className="text-[#484F58]" />
            </div>
            <p className="text-sm text-[#484F58] font-medium">{message}</p>
        </div>
    )
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconColor, bgColor }) {
    return (
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 hover:border-[#2F80ED]/30 transition-colors duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon size={18} className={iconColor} />
                </div>
                <TrendingUp size={14} className="text-[#22C55E]" />
            </div>
            <p className="text-2xl font-bold text-[#F0F6FC] mb-1">{value}</p>
            <p className="text-sm text-[#8B949E]">{label}</p>
            {sub && <p className="text-xs text-[#484F58] mt-1">{sub}</p>}
        </div>
    )
}

// ── Quick Action Button ────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, path }) {
    return (
        <Link
            to={path}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#161B22] border border-[#21262D]
                 hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5 transition-all duration-200 group"
        >
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium text-[#8B949E] group-hover:text-[#F0F6FC] transition-colors duration-200 text-center">
                {label}
            </span>
        </Link>
    )
}


// ── Recent Activity Item ───────────────────────────────────────
function ActivityItem({ icon: Icon, title, sub, time, iconColor }) {
    return (
        <div className="flex items-center gap-4 py-3">
            <div className="w-9 h-9 rounded-full bg-[#0D1117] border border-[#21262D] flex items-center justify-center flex-shrink-0">
                <Icon size={15} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F6FC] truncate">{title}</p>
                <p className="text-xs text-[#484F58] truncate">{sub}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#484F58] flex-shrink-0">
                <Clock size={11} />
                {time}
            </div>
        </div>
    )
}

// ── Dashboard Page ────────────────────────────────────────────
export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Dashboard</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    Real-time overview of your railway activity
                </p>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Train}
                    label="Trains Tracked"
                    value="0"
                    sub="Updated just now"
                    iconColor="text-[#2F80ED]"
                    bgColor="bg-[#2F80ED]/10"
                />
                <StatCard
                    icon={Users}
                    label="Crowd Alerts"
                    value="3"
                    sub="Active alerts"
                    iconColor="text-[#F97316]"
                    bgColor="bg-[#F97316]/10"
                />
                <StatCard
                    icon={CreditCard}
                    label="Card Balance"
                    value="₹0.00"
                    sub="Top up now"
                    iconColor="text-[#22C55E]"
                    bgColor="bg-[#22C55E]/10"
                />
                <StatCard
                    icon={Map}
                    label="Live Stations"
                    value="0"
                    sub="Monitored stations"
                    iconColor="text-[#FACC15]"
                    bgColor="bg-[#FACC15]/10"
                />
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-[#F0F6FC]">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <QuickAction icon={Train} label="Search Train" color="bg-[#2F80ED]" path="/search" />
                    <QuickAction icon={Map} label="Live Tracker" color="bg-[#EF4444]" path="/tracker" />
                    <QuickAction icon={Users} label="Crowd Monitor" color="bg-[#F97316]" path="/crowd" />
                    <QuickAction icon={CreditCard} label="Railway Card" color="bg-[#22C55E]" path="/card" />
                    <QuickAction icon={Zap} label="Recharge" color="bg-[#FACC15]" path="/recharge" />
                    <QuickAction icon={Bell} label="Book Ticket" color="bg-[#8B5CF6]" path="/book" />
                </div>
            </div>

            {/* ── Two-column row: Recent Activity + Announcements ── */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-semibold text-[#F0F6FC]">Recent Activity</h2>
                        <button className="flex items-center gap-1 text-xs text-[#2F80ED] hover:underline">
                            View all <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="divide-y divide-[#21262D]">
                        <ActivityItem
                            icon={CreditCard}
                            title="Card Activated"
                            sub="Railway Card ending ••••0000"
                            time="Just now"
                            iconColor="text-[#22C55E]"
                        />
                        <ActivityItem
                            icon={Train}
                            title="No recent trips"
                            sub="Your journey history will appear here"
                            time="—"
                            iconColor="text-[#484F58]"
                        />
                        <ActivityItem
                            icon={Bell}
                            title="3 crowd alerts nearby"
                            sub="Mumbai CST · Dadar · Thane"
                            time="5 min ago"
                            iconColor="text-[#F97316]"
                        />
                    </div>
                </div>

                {/* System Status / Announcements */}
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Announcements</h2>
                    <PlaceholderCard message="Live announcements & alerts coming in next phase" />
                </div>
            </div>

            {/* ── Crowd Heatmap Placeholder ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-[#F0F6FC]">Crowd Heatmap</h2>
                        <p className="text-xs text-[#8B949E] mt-0.5">
                            Real-time density across monitored stations
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                        </span>
                        LIVE
                    </span>
                </div>
                <PlaceholderCard message="Interactive crowd heatmap coming in next phase" />
            </div>
        </div>
    )
}
