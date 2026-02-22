import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Ticket, MapPin, CalendarDays, Users, ArrowRight,
    Loader2, ArrowLeftRight, Train, CheckCircle2,
    Trash2, Printer, CreditCard, AlertTriangle, ShieldCheck,
    TrendingUp, Search, ChevronDown, ChevronUp, Tag, Layers,
    Bluetooth, BluetoothConnected,
} from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import {
    doc, getDoc, collection, addDoc, query,
    where, orderBy, getDocs, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { ref, set } from 'firebase/database'
import { auth, db, rtdb } from '../firebase'
import { getTrainsBetween } from '../services/railRadarService'
import { fetchTrainCrowdData } from '../services/influxService'
import { useSensor } from '../context/SensorContext'
import { isBleConnected, connectBleDevice, setBleDisconnectHandler, sendTicketViaBle } from '../services/bleService'

// ── Train types with per-passenger base fare ────────────────────────────────
const TRAIN_TYPES = [
    { code: 'ORD', label: 'Ordinary', fare: 30, color: '#8B949E', desc: 'Local / Unreserved' },
    { code: 'MEMU', label: 'MEMU', fare: 45, color: '#22C55E', desc: 'Suburban EMU' },
    { code: 'PASS', label: 'Passenger', fare: 35, color: '#6B7280', desc: 'Slow Passenger' },
    { code: 'EXP', label: 'Express', fare: 75, color: '#2F80ED', desc: 'Inter-city Express' },
    { code: 'SF', label: 'Superfast', fare: 110, color: '#F97316', desc: 'Superfast (>110 km/h)' },
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function decodeRunningDays(bitmap) {
    if (!bitmap && bitmap !== 0) return []
    return DAY_LABELS.filter((_, i) => bitmap & (1 << i))
}

// ── Colour helpers ──────────────────────────────────────────────────────────
function pctColor(pct) {
    if (pct >= 80) return 'text-[#EF4444]'
    if (pct >= 50) return 'text-[#F97316]'
    return 'text-[#22C55E]'
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Sk({ className = '', style }) {
    return <div className={`animate-pulse rounded bg-[#21262D] ${className}`} style={style} />
}

// ── Mini QR placeholder ─────────────────────────────────────────────────────
function QRPlaceholder({ size = 64 }) {
    const cells = Array.from({ length: 16 * 16 }, (_, i) => {
        const x = i % 16, y = Math.floor(i / 16)
        if ((x < 4 && y < 4) || (x > 11 && y < 4) || (x < 4 && y > 11)) return true
        return (x * 3 + y * 7 + x * y) % 5 < 2
    })
    const s = size / 16
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {cells.map((on, i) => on && (
                <rect key={i} x={(i % 16) * s} y={Math.floor(i / 16) * s} width={s - 0.5} height={s - 0.5} fill="currentColor" />
            ))}
        </svg>
    )
}

// ── Visual train diagram components ─────────────────────────────────────────
function TrainEngine() {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#8B949E] mb-1 leading-none">En</span>
            <div className="relative w-16 h-8 bg-[#3D444D] rounded-l-md border-y border-l border-[#21262D]">
                <div className="absolute top-1.5 left-1.5 w-3 h-2 bg-[#8B949E]/30 rounded-sm" />
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#F97316]/40" />
                <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 rounded-full bg-[#0D1117] border border-[#21262D]" />
                <div className="absolute -bottom-1 left-9 w-2.5 h-2.5 rounded-full bg-[#0D1117] border border-[#21262D]" />
            </div>
            <span className="text-[8px] font-bold mt-2 invisible leading-none">000 pax</span>
        </div>
    )
}

function VisualCoach({ id, count, ratio, isOffline, isLive }) {
    const labelColor = isOffline ? 'text-[#8B949E]' : pctColor(ratio * 100)
    return (
        <div className="flex flex-col items-center min-w-[64px]">
            <span className={`text-[10px] font-black mb-1 leading-none ${labelColor}`}>{id}</span>
            <div
                title={`${id} — ${isOffline ? 'Offline' : `${count} pax`}`}
                className="relative w-16 h-8 border border-[#30363D] bg-[#21262D]/50 rounded-sm"
            >
                <div className="flex justify-around mt-1.5 px-0.5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-2.5 h-2 bg-white/5 rounded-sm border border-white/5" />
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10" />
                {isLive && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#F97316]/80 shadow-[0_0_8px_#F97316] z-10" />
                )}
                <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 rounded-full bg-[#0D1117] border border-[#21262D]" />
                <div className="absolute -bottom-1 left-10 w-2.5 h-2.5 rounded-full bg-[#0D1117] border border-[#21262D]" />
            </div>
            <span className={`text-[8px] font-bold mt-2 tabular-nums leading-none text-[#8B949E] ${isLive ? 'opacity-60' : 'invisible'}`}>
                {isOffline ? 'Offline' : `${count} pax`}
            </span>
        </div>
    )
}

// ── Crowd panel with graphical train diagram ─────────────────────────────────
function CrowdPanel({ trainNumber }) {
    const [coaches, setCoaches] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true); setError(false)
        fetchTrainCrowdData(trainNumber)
            .then(res => {
                if (!res.error && res.data?.length) setCoaches(res.data)
                else setError(true)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [trainNumber])

    const layoutIds = ['G1', 'G2', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']
    const fullTrain = [
        { type: 'engine' },
        ...layoutIds.map(id => {
            const live = coaches.find(c => c.compartmentId === id || (id.startsWith('G') && c.compartmentId === 'GS'))
            if (live) return { ...live, isLive: true }
            return { compartmentId: id, currentCount: id.startsWith('G') ? 45 : 20, capacity: 100, occupancyRatio: id.startsWith('G') ? 0.45 : 0.2, offline: false, isLive: false }
        })
    ]

    const totalOcc = coaches.reduce((s, c) => s + c.currentCount, 0)
    const online = fullTrain.filter(c => c.type !== 'engine' && !c.offline)
    const best = online.length ? online.reduce((a, b) => a.currentCount < b.currentCount ? a : b) : null
    const worst = online.length ? online.reduce((a, b) => a.currentCount > b.currentCount ? a : b) : null

    if (loading) return (
        <div className="space-y-3 py-3">
            <div className="flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-[#2F80ED]" />
                <span className="text-xs text-[#484F58]">Fetching live crowd data…</span>
            </div>
            <Sk className="w-full h-14 rounded-xl" />
        </div>
    )

    if (error || coaches.length === 0) return (
        <div className="flex items-center gap-2 py-2.5 px-3 bg-[#21262D]/30 rounded-lg text-[#8B949E] border border-[#21262D] mt-2">
            <AlertTriangle size={12} className="text-[#F97316] shrink-0" />
            <span className="text-[11px]">No live crowd data — coach density unavailable for this train</span>
        </div>
    )

    return (
        <div className="mt-3 space-y-3 border-t border-[#21262D] pt-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#8B949E] uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-[#238636]" /> Live Density
                </span>
                <span className="text-[10px] font-bold text-[#238636] bg-[#238636]/10 px-2 py-0.5 rounded-full border border-[#238636]/20">REAL-TIME</span>
            </div>

            <div className="overflow-x-auto pb-3 pt-1 no-scrollbar">
                <div className="flex items-end gap-1.5 w-max px-1">
                    {fullTrain.map((c, i) => (
                        c.type === 'engine' ? <TrainEngine key="engine" /> :
                            <VisualCoach key={c.compartmentId || i} id={c.compartmentId} count={c.currentCount} ratio={c.occupancyRatio} isOffline={c.offline} isLive={c.isLive} />
                    ))}
                </div>
            </div>

            {best && worst && (
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#238636]/5 border border-[#238636]/20 rounded-lg p-2 flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-[#238636] shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-[#238636] leading-none mb-0.5">Best Coach</p>
                            <p className="text-xs font-bold text-[#F0F6FC]">{best.compartmentId}</p>
                        </div>
                    </div>
                    <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg p-2 flex items-center gap-2">
                        <AlertTriangle size={13} className="text-[#EF4444] shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-[#EF4444] leading-none mb-0.5">Avoid</p>
                            <p className="text-xs font-bold text-[#F0F6FC]">{worst.compartmentId}</p>
                        </div>
                    </div>
                </div>
            )}

            {totalOcc > 0 && (
                <p className="text-center text-[11px] text-[#484F58]">
                    Total pax recorded: <span className="text-[#F0F6FC] font-bold">{totalOcc}</span>
                </p>
            )}
        </div>
    )
}

// ── Ticket card visual ───────────────────────────────────────────────────────
function TicketCard({ booking }) {
    const type = TRAIN_TYPES.find(t => t.code === booking.trainType) || TRAIN_TYPES[0]
    return (
        <div className="relative w-full max-w-md mx-auto select-none" style={{ fontFamily: "'Courier New', monospace" }}>
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.8)]"
                style={{ background: 'linear-gradient(135deg, #161B22 0%, #0D1117 100%)', border: `1px solid ${type.color}40` }}>
                <div className="px-5 py-3 flex items-center justify-between"
                    style={{ background: `linear-gradient(90deg, ${type.color}22 0%, ${type.color}08 100%)`, borderBottom: `1px solid ${type.color}30` }}>
                    <div className="flex items-center gap-2">
                        <Train size={16} style={{ color: type.color }} />
                        <span className="text-xs font-black tracking-widest uppercase" style={{ color: type.color }}>Indian Railways</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: `${type.color}20`, color: type.color, border: `1px solid ${type.color}40` }}>
                            {type.label.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-bold text-[#484F58]">GENERAL</span>
                    </div>
                </div>

                <div className="px-5 pt-4 pb-0">
                    <div className="flex items-stretch gap-3 mb-4">
                        <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">From</p>
                            <p className="text-2xl font-black text-[#F0F6FC] leading-none">{booking.from}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 px-1">
                            <div className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${type.color}, transparent)` }} />
                            <ArrowRight size={14} style={{ color: type.color }} />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">To</p>
                            <p className="text-2xl font-black text-[#F0F6FC] leading-none">{booking.to}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
                        style={{ background: `${type.color}08`, border: `1px solid ${type.color}20` }}>
                        <Train size={13} style={{ color: type.color }} />
                        <span className="flex-1 text-xs font-bold" style={{ color: type.color }}>{booking.trainName || type.label}</span>
                        <span className="text-[9px] text-[#484F58]">{booking.trainNumber ? `#${booking.trainNumber}` : type.desc}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: 'Date', value: new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) },
                            { label: 'Passengers', value: `${booking.passengers} Pax` },
                            { label: 'Class', value: 'GN' },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">{label}</p>
                                <p className="text-xs font-black text-[#F0F6FC] mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative my-0 flex items-center">
                    <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#0D1117] border-r" style={{ borderColor: `${type.color}30` }} />
                    <div className="flex-1 mx-3 border-t border-dashed" style={{ borderColor: `${type.color}30` }} />
                    <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#0D1117] border-l" style={{ borderColor: `${type.color}30` }} />
                </div>

                <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="shrink-0 p-2 rounded-lg" style={{ background: `${type.color}10`, color: type.color }}>
                        <QRPlaceholder size={60} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">Ticket ID</p>
                            <p className="text-[11px] font-black text-[#F0F6FC] tracking-wider">{booking.id?.toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">Booked At</p>
                            <p className="text-[10px] font-semibold text-[#8B949E]">{booking.timestamp}</p>
                        </div>
                        {booking.cardNo && (
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">Card</p>
                                <p className="text-[10px] font-bold text-[#2F80ED] font-mono">•••• {booking.cardNo.slice(-4)}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-[#238636]" />
                            <span className="text-[10px] font-bold text-[#238636]">Confirmed</span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">Fare</p>
                        <p className="text-2xl font-black leading-none" style={{ color: type.color }}>₹{booking.fare}</p>
                        <p className="text-[9px] text-[#484F58] mt-0.5">incl. all taxes</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Station autocomplete ─────────────────────────────────────────────────────
function StationInput({ label, value, onChange, placeholder }) {
    const [query, setQuery] = useState('')
    const [sugg, setSugg] = useState([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(null)
    const debounce = useRef(null)
    const wrap = useRef(null)
    const inp = useRef(null)

    useEffect(() => {
        const h = e => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    useEffect(() => {
        if (!value) { setQuery(''); setSelected(null) }
    }, [value])

    async function doSearch(q) {
        setLoading(true)
        try {
            const res = await fetch(`/railradar/search/stations?query=${encodeURIComponent(q.trim())}`, {
                headers: { 'X-API-Key': 'rr_o7r33nnimx63vzkgyk73r08q6rbwreck', Accept: 'application/json' },
            })
            const json = await res.json()
            const arr = Array.isArray(json) ? json
                : Array.isArray(json?.data?.stations) ? json.data.stations
                    : Array.isArray(json?.data) ? json.data : []
            setSugg(arr.slice(0, 8)); setOpen(true)
        } catch { setSugg([]) }
        finally { setLoading(false) }
    }

    function handleInput(e) {
        const v = e.target.value
        setQuery(v); setSelected(null); onChange(null)
        clearTimeout(debounce.current)
        if (!v.trim()) { setSugg([]); setOpen(false); return }
        setLoading(true)
        debounce.current = setTimeout(() => doSearch(v), 220)
    }

    function pick(s) {
        setQuery(`${s.name} (${s.code})`); setSelected(s); onChange(s)
        setSugg([]); setOpen(false)
    }

    return (
        <div className="space-y-1.5 relative" ref={wrap}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">{label}</label>
            <div onClick={() => inp.current?.focus()}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0D1117] border cursor-text transition-all
                    ${open ? 'border-[#2F80ED]/60 shadow-[0_0_0_3px_rgba(47,128,237,0.08)]' : 'border-[#21262D] hover:border-[#2F80ED]/30'}`}>
                <MapPin size={14} className="text-[#484F58] shrink-0" />
                <input ref={inp} type="text" placeholder={placeholder} autoComplete="off" spellCheck={false}
                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none min-w-0"
                    value={query} onChange={handleInput}
                    onFocus={() => { if (sugg.length) setOpen(true) }} />
                {loading && <Loader2 size={13} className="animate-spin text-[#2F80ED] shrink-0" />}
                {!loading && selected?.code && (
                    <span className="text-[11px] font-black text-[#2F80ED] bg-[#2F80ED]/10 px-1.5 py-0.5 rounded shrink-0">{selected.code}</span>
                )}
            </div>
            {open && sugg.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-[#21262D] bg-[#161B22] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden max-h-60 overflow-y-auto">
                    {sugg.map(s => (
                        <button key={s.code} onMouseDown={e => { e.preventDefault(); pick(s) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2F80ED]/10 text-left border-b border-[#21262D]/60 last:border-0 transition-colors group">
                            <span className="text-[10px] font-black w-10 text-center py-0.5 rounded bg-[#2F80ED]/10 text-[#2F80ED] shrink-0">{s.code}</span>
                            <span className="flex-1 text-sm text-[#C9D1D9] group-hover:text-[#F0F6FC] truncate">{s.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#161B22] border-2 border-dashed border-[#21262D] flex items-center justify-center">
                <CreditCard size={36} className="text-[#2F80ED]" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#F0F6FC]">Railway Card Required</h2>
                <p className="text-sm text-[#8B949E] max-w-xs">You need to connect and verify your railway card before booking tickets.</p>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#161B22] border border-[#FACC15]/20 text-left max-w-xs">
                <AlertTriangle size={14} className="text-[#FACC15] shrink-0 mt-0.5" />
                <p className="text-xs text-[#8B949E]">
                    Sign in with Google and link your card on the <span className="text-[#F0F6FC] font-semibold">Railway Card</span> page first.
                </p>
            </div>
            <button id="go-to-card-btn" onClick={() => navigate('/card')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-bold transition-all hover:shadow-[0_0_24px_rgba(47,128,237,0.35)]">
                <CreditCard size={16} /> Connect Railway Card
            </button>
        </div>
    )
}

// ── Fuzzy name matcher ───────────────────────────────────────────────────────
function normaliseName(n = '') { return n.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim() }
function trainNamesMatch(apiName = '', dbName = '') {
    const a = normaliseName(apiName), b = normaliseName(dbName)
    if (!a || !b) return false
    if (a.includes(b) || b.includes(a)) return true
    const aWords = new Set(a.split(' '))
    return b.split(' ').filter(w => w.length > 3 && aWords.has(w)).length >= 1
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GeneralTicket() {
    const navigate = useNavigate()
    const dateRef = useRef(null)
    const { availableTrains } = useSensor()

    // ── Auth / card state ────────────────────────────────────────────────────
    const [authLoading, setAuthLoading] = useState(true)
    const [cardUser, setCardUser] = useState(null)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const snap = await getDoc(doc(db, 'railcard_users', user.uid))
                    if (snap.exists()) {
                        const d = snap.data()
                        setCardUser({ uid: user.uid, email: d.email, name: d.name, cardNo: d.cardNo })
                    } else setCardUser(null)
                } catch { setCardUser(null) }
            } else setCardUser(null)
            setAuthLoading(false)
        })
        return unsub
    }, [])

    // ── Form state ───────────────────────────────────────────────────────────
    const [from, setFrom] = useState(null)
    const [to, setTo] = useState(null)
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [passengers, setPass] = useState(1)
    const [trainType, setTrainType] = useState('EXP')

    // ── Train search state ───────────────────────────────────────────────────
    const [trains, setTrains] = useState([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const [expandedTrain, setExpandedTrain] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    // ── Booking state ────────────────────────────────────────────────────────
    const [booking, setBooking] = useState(false)
    const [bookings, setBookings] = useState([])
    const [justBooked, setJustBooked] = useState(null)
    const [fsLoading, setFsLoading] = useState(false)
    const [bleConnected, setBleConnected] = useState(false)
    const [bleLoading, setBleLoading] = useState(false)
    const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | done | error
    const [syncErr, setSyncErr] = useState('')

    useEffect(() => {
        setBleConnected(isBleConnected())
        setBleDisconnectHandler(() => setBleConnected(false))
        return () => setBleDisconnectHandler(null)
    }, [])

    async function handleBlePair() {
        setBleLoading(true)
        try {
            await connectBleDevice()
            setBleConnected(true)
        } catch (e) {
            console.error('[GeneralTicket] BLE Pairing failed:', e.message)
        } finally {
            setBleLoading(false)
        }
    }

    useEffect(() => {
        if (!cardUser) { setBookings([]); return }
        setFsLoading(true)
        const q = query(collection(db, 'bookings'), where('uid', '==', cardUser.uid), orderBy('createdAt', 'desc'))
        getDocs(q)
            .then(snap => setBookings(snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }))))
            .catch(err => console.warn('[GeneralTicket] Could not load bookings:', err.message))
            .finally(() => setFsLoading(false))
    }, [cardUser])

    const selectedType = TRAIN_TYPES.find(t => t.code === trainType) || TRAIN_TYPES[0]
    const fare = selectedType.fare * passengers
    const isFormValid = from && to && date

    function handleSwap() { const tmp = from; setFrom(to); setTo(tmp) }

    // Find the InfluxDB-matched train number
    const findInfluxTrainNumber = useCallback((apiTrainName, apiTrainNumber) => {
        const byNum = availableTrains.find(t => t.trainNumber === apiTrainNumber)
        if (byNum) return byNum.trainNumber
        const byName = availableTrains.find(t => trainNamesMatch(apiTrainName, t.name))
        return byName ? byName.trainNumber : null
    }, [availableTrains])

    // ── Search trains on route ───────────────────────────────────────────────
    async function handleSearch() {
        if (!isFormValid) return
        setSearching(true)
        setSearchError(null)
        setHasSearched(true)
        setExpandedTrain(null)
        setJustBooked(null)
        try {
            const response = await getTrainsBetween(from.code, to.code)
            if (response?.success && response?.data?.trains) {
                setTrains(response.data.trains)
            } else {
                setTrains([])
                setSearchError('No trains found for this route. Try different station codes.')
            }
        } catch (err) {
            console.error(err)
            setSearchError('Failed to fetch trains. Please check station codes.')
            setTrains([])
        } finally {
            setSearching(false)
        }
    }

    // ── Book ticket (single global action) ───────────────────────────────────
    async function handleBook() {
        if (!cardUser || !isFormValid) return
        setBooking(true)

        await new Promise(r => setTimeout(r, 800))

        const now = new Date()
        const timestamp = now.toLocaleString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
        const ticketId = `TRQ${(Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase().slice(-9)}`

        const newBooking = {
            id: ticketId,
            uid: cardUser.uid,
            email: cardUser.email,
            cardNo: cardUser.cardNo,
            trainType,
            from: from.code,
            to: to.code,
            fromName: from.name?.toLowerCase() || from.code.toLowerCase(),
            toName: to.name?.toLowerCase() || to.code.toLowerCase(),
            date,
            passengers,
            fare,
            timestamp,
            createdAt: serverTimestamp(),
        }

        try {
            const docRef = await addDoc(collection(db, 'bookings'), newBooking)
            const saved = { firestoreId: docRef.id, ...newBooking }
            setBookings(prev => [saved, ...prev])
            setJustBooked(saved)
        } catch (err) {
            console.warn('[GeneralTicket] Firestore save failed, falling back to local:', err.message)
            const local = { firestoreId: null, ...newBooking, createdAt: now.toISOString() }
            setBookings(prev => [local, ...prev])
            setJustBooked(local)
        } finally {
            setBooking(false)
        }
    }

    async function handleSyncToCard() {
        if (!justBooked?.id) return
        setSyncStatus('syncing')
        setSyncErr('')
        try {
            // ── Simultaneous write to BLE and RTDB (for verification) ──────────
            await Promise.all([
                sendTicketViaBle(justBooked.id),
                set(ref(rtdb, `tickets/${justBooked.id}`), {
                    ticketId: justBooked.id,
                    from: justBooked.fromName || justBooked.from?.toLowerCase(),
                    to: justBooked.toName || justBooked.to?.toLowerCase(),
                    verified: false
                })
            ])
            setSyncStatus('done')
            // Reset after success
            setTimeout(() => setSyncStatus('idle'), 3000)
        } catch (e) {
            setSyncStatus('error')
            setSyncErr(e.message || 'Sync failed')
        }
    }

    async function deleteBooking(firestoreId, localId) {
        setBookings(prev => prev.filter(b => (b.firestoreId ?? b.id) !== (firestoreId ?? localId)))
        if (justBooked?.id === localId) setJustBooked(null)
        if (firestoreId) {
            try { await deleteDoc(doc(db, 'bookings', firestoreId)) }
            catch (e) { console.warn('[GeneralTicket] Delete failed:', e.message) }
        }
    }

    if (authLoading) return (
        <div className="flex items-center justify-center min-h-64">
            <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
        </div>
    )

    if (!cardUser) return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2">
                    <Ticket size={22} className="text-[#2F80ED]" /> Book General Ticket
                </h1>
                <p className="text-sm text-[#8B949E] mt-1">Fill in your journey details to instantly generate a ticket</p>
            </div>
            <AuthGate />
        </div>
    )

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2">
                        <Ticket size={22} className="text-[#2F80ED]" /> Book General Ticket
                    </h1>
                    <p className="text-sm text-[#8B949E] mt-1">Search trains on your route, then confirm your booking</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#238636]/10 border border-[#238636]/25 shrink-0">
                    <ShieldCheck size={13} className="text-[#238636]" />
                    <span className="text-[11px] font-bold text-[#238636] hidden sm:inline">Card Verified</span>
                    <span className="text-[11px] text-[#484F58] font-mono hidden sm:inline">•••• {cardUser.cardNo?.slice(-4)}</span>
                </div>
            </div>

            {/* ── Step 1: Booking Form ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-5 space-y-5">
                <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2F80ED] flex items-center justify-center text-[10px] font-black text-white">1</span>
                    Journey Details
                </h2>

                <div className="flex items-end gap-2">
                    <div className="flex-1"><StationInput label="From Station" value={from} onChange={setFrom} placeholder="e.g. New Delhi, NDLS" /></div>
                    <button onClick={handleSwap}
                        className="shrink-0 mb-[2px] w-10 h-10 rounded-xl border border-[#21262D] bg-[#21262D] hover:bg-[#2F80ED]/10 hover:border-[#2F80ED]/40 flex items-center justify-center text-[#8B949E] hover:text-[#2F80ED] transition-all">
                        <ArrowLeftRight size={15} />
                    </button>
                    <div className="flex-1"><StationInput label="To Station" value={to} onChange={setTo} placeholder="e.g. Pune Junction, PUNE" /></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">Journey Date</label>
                        <div onClick={() => dateRef.current?.showPicker?.() || dateRef.current?.focus()}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 focus-within:border-[#2F80ED]/60 cursor-pointer transition-all">
                            <CalendarDays size={14} className="text-[#484F58]" />
                            <input ref={dateRef} type="date" value={date} min={new Date().toISOString().slice(0, 10)}
                                onChange={e => setDate(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none cursor-pointer" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">Passengers</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 focus-within:border-[#2F80ED]/60 transition-all">
                            <Users size={14} className="text-[#484F58]" />
                            <input type="number" min={1} max={6} value={passengers}
                                onChange={e => setPass(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                                className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none" />
                            <span className="text-[10px] text-[#484F58] shrink-0">max 6</span>
                        </div>
                    </div>
                </div>

                {/* Train Type */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">Train Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {TRAIN_TYPES.map(t => (
                            <button key={t.code} onClick={() => setTrainType(t.code)}
                                className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${trainType === t.code
                                    ? '' : 'border-[#21262D] bg-[#0D1117] hover:border-[#2F80ED]/30'}`}
                                style={trainType === t.code ? {
                                    background: `${t.color}12`, borderColor: t.color, boxShadow: `0 0 12px ${t.color}25`,
                                } : {}}>
                                <span className="text-xs font-black" style={{ color: trainType === t.code ? t.color : '#8B949E' }}>{t.label}</span>
                                <span className="text-[9px] text-[#484F58] truncate w-full">{t.desc}</span>
                                <span className="text-[10px] font-bold mt-0.5" style={{ color: trainType === t.code ? t.color : '#484F58' }}>₹{t.fare}/pax</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fare summary */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: `${selectedType.color}10`, border: `1px solid ${selectedType.color}25` }}>
                    <span className="text-sm text-[#8B949E]">
                        {passengers} passenger{passengers > 1 ? 's' : ''} × ₹{selectedType.fare} ({selectedType.label})
                    </span>
                    <span className="text-lg font-black" style={{ color: selectedType.color }}>₹{fare}</span>
                </div>

                {/* Bluetooth Pairing Required */}
                {!bleConnected && (
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bluetooth size={16} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Bluetooth Pair Required</span>
                            </div>
                            <span className="text-[10px] text-blue-500/70 font-medium">Railway Card not found</span>
                        </div>
                        <p className="text-[11px] text-blue-500/60 leading-relaxed">
                            You must pair your Railway Card via Bluetooth before booking a ticket. This ensures the ticket is synced to your card immediately.
                        </p>
                        <button onClick={handleBlePair} disabled={bleLoading}
                            className="w-full py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[11px] font-bold transition-all disabled:opacity-50">
                            {bleLoading ? <><Loader2 size={12} className="animate-spin inline mr-2" /> Searching Card...</> : 'Pair Railway Card via BLE'}
                        </button>
                    </div>
                )}

                {bleConnected && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/20 text-green-500">
                        <BluetoothConnected size={15} />
                        <span className="text-xs font-bold uppercase tracking-wider">Card Ready</span>
                        <span className="ml-auto text-[10px] opacity-70">RCARD0000011 Connected</span>
                    </div>
                )}

                {/* Buttons row */}
                <div className="flex gap-2">
                    <button onClick={handleSearch} disabled={!isFormValid || searching}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[#21262D] hover:bg-[#2F80ED]/10 border border-[#21262D] hover:border-[#2F80ED]/40 text-[#8B949E] hover:text-[#2F80ED]">
                        {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        {searching ? 'Searching…' : 'View Trains on Route'}
                    </button>
                    <button onClick={handleBook} disabled={!isFormValid || booking || !bleConnected}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_24px_rgba(47,128,237,0.4)]"
                        style={{
                            background: (isFormValid && bleConnected) ? `linear-gradient(135deg, ${selectedType.color}, ${selectedType.color}cc)` : '#21262D',
                            boxShadow: (isFormValid && bleConnected) ? `0 0 20px ${selectedType.color}30` : 'none',
                        }}>
                        {booking ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                        {booking ? 'Booking…' : `Confirm & Book · ₹${fare}`}
                    </button>
                </div>

                {!isFormValid && (
                    <p className="text-[11px] text-[#484F58] text-center">Select From, To station and a date to proceed</p>
                )}
                {isFormValid && !bleConnected && (
                    <p className="text-[11px] text-blue-500/70 text-center font-medium animate-pulse">Please pair your card to enable booking</p>
                )}
            </div>

            {/* ── Step 2: Train Results ── */}
            {(hasSearched || searching) && (
                <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-5">
                    <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 rounded-full bg-[#2F80ED] flex items-center justify-center text-[10px] font-black text-white">2</span>
                        Available Trains
                        {trains.length > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded-full">
                                {trains.length} found
                            </span>
                        )}
                    </h2>

                    {searching ? (
                        <div className="flex flex-col items-center justify-center p-10 gap-3 text-[#484F58]">
                            <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
                            <p className="text-sm font-medium">Fetching real-time train data…</p>
                        </div>
                    ) : trains.length > 0 ? (
                        <div className="space-y-3">
                            {trains.map((train) => {
                                const runningDays = decodeRunningDays(train.runningDaysBitmap)
                                const influxNum = findInfluxTrainNumber(train.trainName, train.trainNumber)
                                const hasCrowd = !!influxNum
                                const isExpanded = expandedTrain === train.trainNumber

                                return (
                                    <div key={train.trainNumber} className="rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/20 transition-all overflow-hidden group">
                                        {/* Top bar */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded bg-[#F97316]/10 text-[#F97316]">
                                                    #{train.trainNumber}
                                                </span>
                                                <div>
                                                    <h3 className="text-sm font-bold text-[#F0F6FC] leading-tight group-hover:text-[#2F80ED] transition-colors">
                                                        {train.trainName}
                                                    </h3>
                                                    {train.hindiName && (
                                                        <p className="text-[10px] text-[#484F58] leading-none mt-0.5">{train.hindiName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                {train.type && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#21262D] text-[#8B949E] flex items-center gap-1">
                                                        <Tag size={9} />{train.type}
                                                    </span>
                                                )}
                                                {train.zone && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2F80ED]/10 text-[#2F80ED] flex items-center gap-1">
                                                        <Layers size={9} />{train.zone}
                                                    </span>
                                                )}
                                                {hasCrowd && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#238636]/10 text-[#238636] flex items-center gap-1">
                                                        <TrendingUp size={9} /> Live
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Route strip */}
                                        <div className="flex items-center px-4 py-3 gap-3">
                                            <div className="text-center min-w-[72px]">
                                                <p className="text-xs font-black text-[#2F80ED]">{train.sourceStationCode}</p>
                                                <p className="text-[10px] text-[#484F58] truncate max-w-[80px]" title={train.sourceStationName}>{train.sourceStationName}</p>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center gap-1.5">
                                                <div className="w-full flex items-center gap-1">
                                                    <div className="h-px flex-1 bg-[#21262D]" />
                                                    <Train size={12} className="text-[#2F80ED]" />
                                                    <div className="h-px flex-1 bg-[#21262D]" />
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {DAY_LABELS.map(d => (
                                                        <span key={d} title={d}
                                                            className={`text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-sm ${runningDays.includes(d)
                                                                ? 'bg-[#238636] text-white' : 'bg-[#21262D] text-[#484F58]'}`}>
                                                            {d[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-center min-w-[72px]">
                                                <p className="text-xs font-black text-[#2F80ED]">{train.destinationStationCode}</p>
                                                <p className="text-[10px] text-[#484F58] truncate max-w-[80px]" title={train.destinationStationName}>{train.destinationStationName}</p>
                                            </div>
                                        </div>

                                        {/* Inline crowd panel */}
                                        {isExpanded && influxNum && (
                                            <div className="px-4 pb-3">
                                                <CrowdPanel trainNumber={influxNum} />
                                            </div>
                                        )}

                                        {/* Crowd toggle only — no per-train book */}
                                        {hasCrowd && (
                                            <div className="px-4 pb-3">
                                                <button
                                                    onClick={() => setExpandedTrain(prev => prev === train.trainNumber ? null : train.trainNumber)}
                                                    className={`w-full py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isExpanded
                                                        ? 'bg-[#2F80ED]/10 border-[#2F80ED] text-[#2F80ED]'
                                                        : 'border-[#21262D] hover:border-[#2F80ED]/50 text-[#8B949E] hover:text-[#2F80ED]'}`}
                                                >
                                                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    {isExpanded ? 'Hide Live Crowd' : 'View Live Crowd'}
                                                    <TrendingUp size={11} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-[#21262D] text-center">
                            <Train size={28} className="text-[#484F58]" />
                            <p className="text-sm text-[#484F58] font-medium">{searchError || 'No trains found for this route'}</p>
                        </div>
                    )}
                </div>
            )}



            {/* ── Step 3: Ticket Preview ── */}
            {justBooked && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#22C55E] flex items-center gap-2">
                            <CheckCircle2 size={15} /> Ticket Generated!
                        </h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.print()}
                                className="flex items-center gap-1 text-[11px] text-[#8B949E] hover:text-[#F0F6FC] border border-[#21262D] hover:border-[#2F80ED]/40 px-3 py-1.5 rounded-lg transition-all">
                                <Printer size={12} /> Print
                            </button>
                            <button onClick={() => deleteBooking(justBooked.firestoreId, justBooked.id)}
                                className="flex items-center gap-1 text-[11px] text-[#484F58] hover:text-[#DA3633] border border-[#21262D] hover:border-[#DA3633]/40 px-3 py-1.5 rounded-lg transition-all">
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    </div>
                    <TicketCard booking={justBooked} />

                    {/* Quick Sync Button */}
                    <div className="pt-2">
                        <button
                            onClick={handleSyncToCard}
                            disabled={syncStatus === 'syncing'}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all ${syncStatus === 'done'
                                ? 'bg-green-500/10 border-green-500/40 text-green-500'
                                : syncStatus === 'error'
                                    ? 'bg-red-500/10 border-red-500/40 text-red-500'
                                    : 'bg-blue-500/10 border-blue-500/40 text-blue-500 hover:bg-blue-500/20'
                                } disabled:opacity-50`}
                        >
                            {syncStatus === 'syncing' ? <Loader2 size={16} className="animate-spin" /> :
                                syncStatus === 'done' ? <CheckCircle2 size={16} /> :
                                    syncStatus === 'error' ? <AlertTriangle size={16} /> :
                                        <Bluetooth size={16} />}

                            {syncStatus === 'syncing' ? 'Syncing to Card...' :
                                syncStatus === 'done' ? 'Ticket Cycled to Card!' :
                                    syncStatus === 'error' ? `Error: ${syncErr}` :
                                        'Sync Ticket to Card via BLE'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
