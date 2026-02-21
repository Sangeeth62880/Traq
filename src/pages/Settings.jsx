import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Smartphone,
    Globe,
    Moon,
    ChevronRight,
    Zap,
    Train,
} from 'lucide-react'

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

function SettingRow({ icon: Icon, label, description, badge, iconColor = 'text-[#8B949E]' }) {
    return (
        <div className="flex items-center gap-4 py-3.5 cursor-pointer group hover:bg-white/[0.02] -mx-5 px-5 transition-colors duration-150 rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-[#0D1117] flex items-center justify-center flex-shrink-0 group-hover:bg-[#161B22] transition-colors duration-150">
                <Icon size={16} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F6FC]">{label}</p>
                {description && <p className="text-xs text-[#484F58] mt-0.5 truncate">{description}</p>}
            </div>
            {badge && (
                <span className="px-2 py-0.5 rounded-full bg-[#2F80ED]/15 text-[#2F80ED] text-xs font-medium flex-shrink-0">
                    {badge}
                </span>
            )}
            <ChevronRight size={14} className="text-[#484F58] group-hover:text-[#8B949E] transition-colors flex-shrink-0" />
        </div>
    )
}

function SettingSection({ title, children }) {
    return (
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl px-5 py-1">
            <div className="py-3 border-b border-[#21262D] mb-1">
                <p className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">{title}</p>
            </div>
            {children}
        </div>
    )
}

export default function Settings() {
    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Settings</h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    Configure your Traq app preferences and account
                </p>
            </div>

            {/* ── Profile Card ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#1a56c4] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        RK
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-[#F0F6FC]">Rahul Kumar</p>
                        <p className="text-sm text-[#8B949E]">rahul.kumar@example.com</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[10px] font-medium text-[#2F80ED]">
                                <Train size={9} />
                                Traq Premium
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                                Card Active
                            </span>
                        </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-[#21262D] text-xs font-medium text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#2F80ED]/40 transition-colors duration-200">
                        Edit
                    </button>
                </div>
            </div>

            {/* ── Account Settings ── */}
            <SettingSection title="Account">
                <SettingRow icon={User} label="Profile Information" description="Name, email, phone number" />
                <SettingRow icon={Shield} label="Security & Privacy" description="Password, 2FA, data privacy" badge="Secure" iconColor="text-[#22C55E]" />
                <SettingRow icon={Train} label="Railway Card" description="Card management & settings" iconColor="text-[#2F80ED]" />
            </SettingSection>

            {/* ── Preferences ── */}
            <SettingSection title="Preferences">
                <SettingRow icon={Bell} label="Notifications" description="Push alerts & crowd warnings" badge="3 active" iconColor="text-[#F97316]" />
                <SettingRow icon={Moon} label="Appearance" description="Dark mode, theme color" badge="Dark" />
                <SettingRow icon={Globe} label="Language & Region" description="English (India) · IST" />
                <SettingRow icon={Smartphone} label="App Preferences" description="Default views, map style" />
            </SettingSection>

            {/* ── Advanced ── */}
            <SettingSection title="Advanced">
                <PlaceholderCard message="Advanced settings (data usage, offline mode, etc.) coming in next phase" />
            </SettingSection>

            {/* ── App Info ── */}
            <div className="text-center py-4">
                <p className="text-xs text-[#484F58]">Traq v1.0.0 · Build 2024.03</p>
                <p className="text-xs text-[#21262D] mt-1">© 2024 Traq Technologies Pvt. Ltd.</p>
            </div>
        </div>
    )
}
