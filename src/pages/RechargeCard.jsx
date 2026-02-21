import { Banknote, Zap, CheckCircle, CreditCard } from 'lucide-react'

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

const AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

export default function RechargeCard() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Recharge Card</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    Top up your Railway Card balance instantly
                </p>
            </div>

            {/* ── Balance Display ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#2F80ED]" />
                        <span className="text-sm font-medium text-[#8B949E]">Current Balance</span>
                    </div>
                    <span className="text-xs text-[#484F58]">Card ending ••••0000</span>
                </div>
                <p className="text-4xl font-bold text-[#F0F6FC]">₹0.00</p>
            </div>

            {/* ── Preset Amounts ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Select Amount</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                    {AMOUNTS.map(amt => (
                        <button key={amt}
                            className="py-3 rounded-xl bg-[#0D1117] border border-[#21262D] text-sm font-bold text-[#8B949E]
                         hover:border-[#2F80ED]/60 hover:text-[#2F80ED] hover:bg-[#2F80ED]/5
                         transition-all duration-200">
                            ₹{amt}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 transition-colors">
                        <span className="text-[#484F58] text-sm font-bold">₹</span>
                        <input
                            type="number"
                            placeholder="Enter custom amount"
                            className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                        />
                    </div>
                    <button
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90
                       text-white text-sm font-semibold transition-all duration-200
                       hover:shadow-[0_0_20px_rgba(47,128,237,0.4)]">
                        <Banknote size={16} />
                        Recharge
                    </button>
                </div>
            </div>

            {/* ── Offer Banner ── */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#2F80ED]/10 to-[#F97316]/10 border border-[#2F80ED]/20">
                <div className="w-10 h-10 rounded-full bg-[#2F80ED]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-[#2F80ED]" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-[#F0F6FC]">Recharge ₹500 & get 5% cashback</p>
                    <p className="text-xs text-[#8B949E] mt-0.5">Limited time offer · Valid till 31 Mar 2024</p>
                </div>
            </div>

            {/* ── Payment Methods ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Payment Methods</h2>
                <PlaceholderCard message="UPI, Net Banking, and Card payment options coming in next phase" />
            </div>

            {/* ── Recharge History ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Recharge History</h2>
                <PlaceholderCard message="Past recharge history coming in next phase" />
            </div>
        </div>
    )
}
