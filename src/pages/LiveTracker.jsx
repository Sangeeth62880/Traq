import { MapPin, Navigation, Train, Clock, Zap } from 'lucide-react'

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

export default function LiveTracker() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#F0F6FC]">Live Tracker</h1>
                    <p className="text-sm text-[#8B949E] mt-1">
                        Track any train's real-time position across India
                    </p>
                </div>
                {/* Live badge */}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                    </span>
                    LIVE
                </span>
            </div>

            {/* ── Train Search ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                        <Train size={15} className="text-[#484F58]" />
                        <input
                            type="text"
                            placeholder="Enter train number or name (e.g. 12951)"
                            className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#EF4444]/90 text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                        <Navigation size={15} />
                        Track
                    </button>
                </div>
            </div>

            {/* ── Map Placeholder ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#EF4444]" />
                        <h2 className="text-base font-semibold text-[#F0F6FC]">Live Map</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#484F58]">Updates every 30s</span>
                        <Clock size={13} className="text-[#484F58]" />
                    </div>
                </div>
                <div className="p-5">
                    <PlaceholderCard message="Interactive live map with real-time train positions coming in next phase" />
                </div>
            </div>

            {/* ── Status Panel ── */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Train Status</h2>
                    <PlaceholderCard message="Delay, platform & ETA data coming in next phase" />
                </div>
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Station Stops</h2>
                    <PlaceholderCard message="Upcoming station stops with arrival times coming in next phase" />
                </div>
            </div>
        </div>
    )
}
