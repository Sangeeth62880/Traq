import { Ticket, CalendarDays, Users, ArrowRight, MapPin, Zap } from 'lucide-react'

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

const CLASS_OPTIONS = [
    { code: 'SL', label: 'Sleeper', price: '₹' },
    { code: '3A', label: 'AC 3-Tier', price: '₹₹' },
    { code: '2A', label: 'AC 2-Tier', price: '₹₹₹' },
    { code: '1A', label: 'First AC', price: '₹₹₹₹' },
]

export default function BookTicket() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Book Ticket</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    Reserve seats across all Indian railway classes
                </p>
            </div>

            {/* ── Booking Form ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-5">Journey Details</h2>

                <div className="space-y-4">
                    {/* From / To */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">From</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                                <MapPin size={15} className="text-[#484F58]" />
                                <input type="text" placeholder="Origin station" className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">To</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                                <MapPin size={15} className="text-[#484F58]" />
                                <input type="text" placeholder="Destination station" className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Date + Passengers */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Journey Date</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                                <CalendarDays size={15} className="text-[#484F58]" />
                                <input type="date" className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Passengers</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                                <Users size={15} className="text-[#484F58]" />
                                <input type="number" min="1" max="6" placeholder="1" className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Travel Class</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CLASS_OPTIONS.map(({ code, label, price }) => (
                                <button key={code}
                                    className="flex flex-col items-center gap-0.5 py-3 px-2 rounded-lg bg-[#0D1117] border border-[#21262D]
                             hover:border-[#2F80ED]/50 hover:bg-[#2F80ED]/5 transition-all duration-200 group">
                                    <span className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#2F80ED] transition-colors">{code}</span>
                                    <span className="text-[10px] text-[#484F58]">{label}</span>
                                    <span className="text-[10px] text-[#8B949E] mt-0.5">{price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Button */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(47,128,237,0.4)] mt-2">
                        <Ticket size={16} />
                        Search Available Trains
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* ── Train Results ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Available Trains</h2>
                <PlaceholderCard message="Train availability, seat selection & PNR generation coming in next phase" />
            </div>

            {/* ── My Bookings ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">My Bookings</h2>
                <PlaceholderCard message="Past and upcoming bookings coming in next phase" />
            </div>
        </div>
    )
}
