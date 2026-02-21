import { CreditCard, ArrowUpRight, ArrowDownLeft, Shield, Zap, RefreshCw } from 'lucide-react'

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

export default function RailwayCard() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Railway Card</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    Manage your digital railway card and transaction history
                </p>
            </div>

            {/* ── Card Visual ── */}
            <div className="relative w-full max-w-sm mx-auto sm:mx-0">
                <div className="relative overflow-hidden rounded-2xl p-6 select-none"
                    style={{
                        background: 'linear-gradient(135deg, #1a3a6f 0%, #2F80ED 50%, #0d2a57 100%)',
                        boxShadow: '0 20px 60px rgba(47, 128, 237, 0.35)',
                    }}>
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

                    {/* Card top row */}
                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div>
                            <p className="text-xs text-blue-200/70 font-medium uppercase tracking-widest">Traq Railway Card</p>
                            <p className="text-xs text-blue-200/50 mt-0.5">Digital Transit Pass</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Shield size={14} className="text-blue-200/70" />
                            <span className="text-xs text-blue-200/70">Secured</span>
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="relative z-10 mb-6">
                        <p className="text-xs text-blue-200/60 mb-1">Available Balance</p>
                        <p className="text-4xl font-bold text-white tracking-tight">₹0.00</p>
                    </div>

                    {/* Card bottom */}
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <p className="text-xs text-blue-200/50">Card Holder</p>
                            <p className="text-sm font-semibold text-white">Rahul Kumar</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-200/50">Card No.</p>
                            <p className="text-sm font-mono text-white">•••• •••• •••• 0000</p>
                        </div>
                    </div>

                    {/* Chip */}
                    <div className="absolute top-6 right-6">
                        <CreditCard size={28} className="text-blue-100/30" />
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: RefreshCw, label: 'Recharge', color: 'text-[#2F80ED]', bg: 'bg-[#2F80ED]/10', border: 'border-[#2F80ED]/20' },
                    { icon: ArrowUpRight, label: 'Pay Fare', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20' },
                    { icon: ArrowDownLeft, label: 'Transactions', color: 'text-[#FACC15]', bg: 'bg-[#FACC15]/10', border: 'border-[#FACC15]/20' },
                    { icon: Shield, label: 'Security', color: 'text-[#F97316]', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/20' },
                ].map(({ icon: Icon, label, color, bg, border }) => (
                    <button key={label}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-[#161B22] border ${border}
                        hover:bg-[#1e2530] transition-colors duration-200`}>
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                            <Icon size={18} className={color} />
                        </div>
                        <span className="text-xs font-medium text-[#8B949E]">{label}</span>
                    </button>
                ))}
            </div>

            {/* ── Transaction History ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Transaction History</h2>
                <PlaceholderCard message="Full transaction history with filters coming in next phase" />
            </div>

            {/* ── Card Details ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Card Settings & Details</h2>
                <PlaceholderCard message="Card management, auto-recharge, and limits coming in next phase" />
            </div>
        </div>
    )
}
