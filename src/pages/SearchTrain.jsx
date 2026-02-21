// Traq — InfluxDB Integration | Make-a-Ton 2026
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, ArrowRight, ArrowLeftRight, Train, Clock,
    Users, ChevronRight, Wifi, WifiOff, AlertTriangle,
    CheckCircle, ExternalLink, RefreshCw, MapPin, Calendar,
} from 'lucide-react'
import { useSensor } from '../context/SensorContext'
import { mockTrains } from '../data/mockTrains'
import { sensorData } from '../data/sensorData'

// ── Comprehensive Indian railway station list ─────────────────────────────────
const STATIONS = [
    { code: 'CSTM', name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai' },
    { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
    { code: 'LTT', name: 'Mumbai Lokmanya Tilak Terminus', city: 'Mumbai' },
    { code: 'DR', name: 'Dadar', city: 'Mumbai' },
    { code: 'TNA', name: 'Thane', city: 'Thane' },
    { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
    { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
    { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi' },
    { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
    { code: 'SDAH', name: 'Sealdah', city: 'Kolkata' },
    { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
    { code: 'MS', name: 'Chennai Egmore', city: 'Chennai' },
    { code: 'SBC', name: 'Bangalore City Junction', city: 'Bengaluru' },
    { code: 'YPR', name: 'Yeshwanthpur Junction', city: 'Bengaluru' },
    { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad' },
    { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' },
    { code: 'ST', name: 'Surat', city: 'Surat' },
    { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara' },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur' },
    { code: 'AGC', name: 'Agra Cantt', city: 'Agra' },
    { code: 'LUCW', name: 'Lucknow', city: 'Lucknow' },
    { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
    { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur' },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
    { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur' },
    { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal' },
    { code: 'ET', name: 'Itarsi Junction', city: 'Itarsi' },
    { code: 'VSKP', name: 'Visakhapatnam', city: 'Visakhapatnam' },
    { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada' },
    { code: 'MDU', name: 'Madurai Junction', city: 'Madurai' },
    { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi' },
    { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram' },
    { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore' },
    { code: 'SA', name: 'Salem Junction', city: 'Salem' },
    { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru' },
    { code: 'MAJN', name: 'Mangaluru Junction', city: 'Mangaluru' },
    { code: 'UBL', name: 'Hubballi Junction', city: 'Hubballi' },
    { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior' },
    { code: 'JHS', name: 'Jhansi Junction', city: 'Jhansi' },
    { code: 'KOTA', name: 'Kota Junction', city: 'Kota' },
    { code: 'AII', name: 'Ajmer Junction', city: 'Ajmer' },
    { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu' },
    { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar' },
    { code: 'LDH', name: 'Ludhiana Junction', city: 'Ludhiana' },
    { code: 'UMB', name: 'Ambala Cantt Junction', city: 'Ambala' },
    { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh' },
    { code: 'GHY', name: 'Guwahati', city: 'Guwahati' },
    { code: 'RNC', name: 'Ranchi', city: 'Ranchi' },
    { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh' },
    { code: 'MAO', name: 'Madgaon Junction', city: 'Goa' },
    { code: 'THVM', name: 'Thiruvananthapuram', city: 'Kerala' },
]

// ── Filter stations from query ────────────────────────────────────────────────
function filterStations(q) {
    if (!q || q.length < 1) return []
    const lower = q.toLowerCase()
    return STATIONS.filter(s =>
        s.code.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower) ||
        s.city.toLowerCase().includes(lower)
    ).slice(0, 7)
}

// ── Colour helpers ────────────────────────────────────────────────────────────
function coachBg(ratio, offline) {
    if (offline) return { bg: '#374151', text: '#9CA3AF' }
    const p = ratio * 100
    if (p > 90) return { bg: '#EF4444', text: '#fff' }
    if (p > 80) return { bg: '#F97316', text: '#fff' }
    if (p > 65) return { bg: '#FACC15', text: '#111' }
    if (p > 40) return { bg: '#2F80ED', text: '#fff' }
    return { bg: '#22C55E', text: '#111' }
}
function pctColor(pct) {
    if (pct > 90) return 'text-[#EF4444]'
    if (pct > 80) return 'text-[#F97316]'
    if (pct > 65) return 'text-[#FACC15]'
    if (pct > 40) return 'text-[#2F80ED]'
    return 'text-[#22C55E]'
}
function secAgo(d) { return d ? Math.round((Date.now() - d.getTime()) / 1000) : null }

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ className = '', style }) {
    return <div className={`animate-pulse rounded bg-[#21262D] ${className}`} style={style} />
}

// ── Station autocomplete input ────────────────────────────────────────────────
function StationInput({ label, icon: Icon, value, onChange, placeholder }) {
    const [query, setQuery] = useState(value?.code ? `${value.name} (${value.code})` : '')
    const [open, setOpen] = useState(false)
    const [results, setResults] = useState([])
    const ref = useRef(null)

    // Close on outside click
    useEffect(() => {
        function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // Sync if parent clears value
    useEffect(() => {
        if (!value) setQuery('')
        else if (value.code) setQuery(`${value.name} (${value.code})`)
    }, [value])

    function handleInput(e) {
        const q = e.target.value
        setQuery(q)
        setResults(filterStations(q))
        setOpen(true)
        if (!q) onChange(null)
    }

    function pick(station) {
        setQuery(`${station.name} (${station.code})`)
        setResults([])
        setOpen(false)
        onChange(station)
    }

    return (
        <div className="relative flex-1" ref={ref}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484F58] mb-1">{label}</label>
            <div className={`flex items-center gap-2 px-3 py-3 rounded-xl bg-[#0D1117] border transition-all duration-200
        ${open ? 'border-[#2F80ED]/60 shadow-[0_0_0_3px_rgba(47,128,237,0.1)]' : 'border-[#21262D] hover:border-[#2F80ED]/30'}`}>
                <Icon size={16} className="text-[#484F58] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInput}
                        onFocus={() => { if (results.length > 0 || query.length > 0) { setResults(filterStations(query)); setOpen(true) } }}
                        placeholder={placeholder}
                        className="w-full bg-transparent text-sm font-medium text-[#F0F6FC] placeholder-[#484F58] outline-none truncate"
                    />
                    {value?.code && (
                        <p className="text-[10px] text-[#484F58] -mt-0.5">{value.city}</p>
                    )}
                </div>
                {value?.code && (
                    <span className="flex-shrink-0 text-[11px] font-black text-[#2F80ED] bg-[#2F80ED]/10 px-1.5 py-0.5 rounded">
                        {value.code}
                    </span>
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    {results.map(s => (
                        <button
                            key={s.code}
                            onMouseDown={() => pick(s)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2F80ED]/5 text-left border-b border-[#21262D] last:border-none transition-colors"
                        >
                            <div className="flex-shrink-0 w-10 h-8 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center">
                                <span className="text-[10px] font-black text-[#2F80ED]">{s.code}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#F0F6FC] truncate">{s.name}</p>
                                <p className="text-[10px] text-[#484F58]">{s.city}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── inline crowd panel (DB-backed) ───────────────────────────────────────────
function CrowdPanel({ trainNumber, sensorCompartments, loading, hasError, isLive, lastFetched, onRefresh, refreshing }) {
    const navigate = useNavigate()

    const compartments = (sensorCompartments?.length > 0) ? sensorCompartments
        : (sensorData[trainNumber]?.coaches || []).map(c => ({
            compartmentId: c.coach,
            coachType: c.type,
            currentCount: c.occupancy,
            capacity: c.capacity,
            occupancyRatio: c.capacity > 0 ? c.occupancy / c.capacity : 0,
            offline: c.status === 'offline',
        }))

    const totalOcc = compartments.reduce((s, c) => s + c.currentCount, 0)
    const totalCap = compartments.reduce((s, c) => s + c.capacity, 0)
    const pct = totalCap > 0 ? Math.round(totalOcc / totalCap * 100) : 0
    const online = compartments.filter(c => !c.offline)
    const best = online.length ? online.reduce((a, b) => a.currentCount < b.currentCount ? a : b) : null
    const worst = online.length ? online.reduce((a, b) => a.currentCount > b.currentCount ? a : b) : null
    const age = secAgo(lastFetched)
    const stale = age !== null && age > 30

    return (
        <div className="bg-[#0D1117] border-t border-[#21262D] px-4 py-4">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs font-medium text-[#8B949E]">📡 Live Sensor Data</span>
                {loading ? <Sk className="w-10 h-3.5" /> : (
                    <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                        </span>
                        <span className="text-[10px] font-bold text-[#22C55E]">LIVE</span>
                    </span>
                )}
                {isLive
                    ? <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">📡 Live Sensor Data</span>
                    : <span className="text-[10px] font-semibold text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded-full">🔧 Demo Data</span>}
                {hasError && <span className="text-[10px] text-[#8B949E] border border-[#21262D] px-2 py-0.5 rounded-full flex items-center gap-1"><WifiOff size={9} />⚠️ Live unavailable — estimated data</span>}
                {stale && !loading && <span className="text-[10px] font-semibold text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-full">⚠️ May be outdated</span>}
                <div className="ml-auto flex items-center gap-2">
                    {age !== null && !loading && <span className="text-[10px] text-[#484F58]">Synced: {age}s ago</span>}
                    <button onClick={onRefresh} disabled={refreshing || loading} className="text-[#8B949E] hover:text-[#F0F6FC] disabled:opacity-40">
                        <RefreshCw size={12} className={refreshing || loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => navigate('/crowd', { state: { selectedTrainNo: trainNumber } })}
                        className="flex items-center gap-1 text-xs text-[#2F80ED] hover:underline">
                        Open Monitor <ExternalLink size={11} />
                    </button>
                </div>
            </div>

            {/* Coach strip */}
            <div className="overflow-x-auto pb-1">
                <div className="flex gap-1.5 w-max">
                    {loading ? Array.from({ length: 5 }).map((_, i) => <Sk key={i} style={{ width: 64, height: 52 }} className="rounded-lg" />)
                        : compartments.map(c => {
                            const { bg, text } = coachBg(c.occupancyRatio, c.offline)
                            return (
                                <div key={c.compartmentId}
                                    title={`${c.compartmentId} — ${c.offline ? 'Offline' : `${c.currentCount} people`}`}
                                    className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg select-none"
                                    style={{ width: 64, height: 52, backgroundColor: bg }}
                                >
                                    <span className="text-[11px] font-bold leading-tight" style={{ color: text }}>{c.compartmentId}</span>
                                    <span className="text-[10px] leading-tight" style={{ color: text }}>{c.offline ? 'Off' : `${c.currentCount} pax`}</span>
                                </div>
                            )
                        })}
                    <div className="flex items-center justify-center w-10 flex-shrink-0">
                        <Train size={16} className="text-[#484F58]" />
                    </div>
                </div>
            </div>

            {/* Summary */}
            {!loading && best && worst && (
                <div className="flex items-center justify-between mt-3 gap-2 text-xs flex-wrap">
                    <span className="flex items-center gap-1 text-[#22C55E] font-medium"><CheckCircle size={12} />Best: {best.compartmentId} — {best.currentCount} people</span>
                    <span className="flex items-center gap-1 text-[#EF4444] font-medium"><AlertTriangle size={12} />Avoid: {worst.compartmentId} — {worst.currentCount} people</span>
                </div>
            )}
            {loading && <Sk className="w-full h-4 mt-3" />}

            {/* Total */}
            {!loading
                ? <p className="mt-2 text-center text-sm"><span className={`font-bold ${pctColor(pct)}`}>👥 {totalOcc} / {totalCap}</span><span className="text-xs text-[#8B949E] ml-1">({pct}% full)</span></p>
                : <Sk className="w-40 h-4 mt-2 mx-auto" />}

            <button onClick={() => navigate('/crowd', { state: { selectedTrainNo: trainNumber } })}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(47,128,237,0.3)]">
                View Full Coach Details <ChevronRight size={15} />
            </button>
        </div>
    )
}

// ── Train result card ─────────────────────────────────────────────────────────
function TrainCard({ dbTrain, mockTrain, expandedId, setExpandedId }) {
    const { fetchForTrain, crowdData, isLoading, isError, lastFetched, isLive } = useSensor()
    const [refreshing, setRefreshing] = useState(false)
    const isExpanded = expandedId === dbTrain.trainNumber

    async function handleToggle() {
        if (!isExpanded) {
            setExpandedId(dbTrain.trainNumber)
            fetchForTrain(dbTrain.trainNumber)
        } else {
            setExpandedId(null)
        }
    }

    async function handleRefresh() {
        setRefreshing(true)
        await fetchForTrain(dbTrain.trainNumber)
        setRefreshing(false)
    }

    // Overall pct: live data if expanded, else DB summary
    let overallPct = null
    if (isExpanded && crowdData.length > 0) {
        const occ = crowdData.reduce((s, c) => s + c.currentCount, 0)
        const cap = crowdData.reduce((s, c) => s + c.capacity, 0)
        overallPct = cap > 0 ? Math.round(occ / cap * 100) : null
    } else if (dbTrain.totalCapacity > 0) {
        overallPct = Math.round(dbTrain.totalCount / dbTrain.totalCapacity * 100)
    }

    const departure = mockTrain?.departure || '—'
    const arrival = mockTrain?.arrival || '—'
    const duration = mockTrain?.duration || '—'
    const classes = mockTrain?.classes || []
    const days = mockTrain?.days || []

    return (
        <div className="border border-[#21262D] rounded-xl overflow-hidden hover:border-[#2F80ED]/20 transition-colors duration-200">
            {/* Card body */}
            <div className="bg-[#161B22] px-5 py-4">
                {/* Top row — name + occupancy */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">#{dbTrain.trainNumber}</span>
                            <h3 className="text-sm font-bold text-[#F0F6FC] truncate">{dbTrain.name}</h3>
                        </div>
                        {/* Coaches from DB */}
                        {dbTrain.coaches?.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                                <Wifi size={9} />{dbTrain.coaches.length} coach{dbTrain.coaches.length > 1 ? 'es' : ''} · {dbTrain.totalCount} people on board (DB live)
                            </div>
                        )}
                    </div>
                    {overallPct !== null && (
                        <div className={`flex flex-col items-end flex-shrink-0 ${pctColor(overallPct)}`}>
                            <span className="text-lg font-black leading-none">{overallPct}%</span>
                            <span className="text-[10px]">full</span>
                        </div>
                    )}
                </div>

                {/* Timing row */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="text-center">
                        <p className="text-base font-bold text-[#F0F6FC]">{departure}</p>
                        <p className="text-[10px] text-[#484F58]">{mockTrain?.fromCode || '—'}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <p className="text-[10px] text-[#484F58]">{duration}</p>
                        <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1 bg-[#21262D]" />
                            <Train size={12} className="text-[#2F80ED]" />
                            <div className="h-px flex-1 bg-[#21262D]" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-[#F0F6FC]">{arrival}</p>
                        <p className="text-[10px] text-[#484F58]">{mockTrain?.toCode || '—'}</p>
                    </div>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {classes.map(c => (
                        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E]">{c}</span>
                    ))}
                    {days.length > 0 && (
                        <div className="flex gap-0.5">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <span key={d} className={`text-[9px] font-bold px-1 py-0.5 rounded ${days.includes(d) ? 'bg-[#2F80ED]/15 text-[#2F80ED]' : 'bg-[#21262D] text-[#484F58]'}`}>
                                    {d[0]}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* DB coach preview chips (before expanding) */}
                {dbTrain.coaches?.length > 0 && !isExpanded && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {dbTrain.coaches.slice(0, 8).map(c => {
                            const { bg, text } = coachBg(c.currentCount / c.capacity, false)
                            return (
                                <div key={c.compartmentId} className="flex flex-col items-center justify-center rounded-lg text-center px-2 py-1"
                                    style={{ backgroundColor: bg, minWidth: 48 }}>
                                    <span className="text-[10px] font-bold leading-tight" style={{ color: text }}>{c.compartmentId}</span>
                                    <span className="text-[9px] leading-tight" style={{ color: text }}>{c.currentCount} pax</span>
                                </div>
                            )
                        })}
                        {dbTrain.coaches.length > 8 && <span className="text-[10px] text-[#484F58] self-center">+{dbTrain.coaches.length - 8} more</span>}
                    </div>
                )}

                {/* Check Live Crowd button */}
                <button onClick={handleToggle}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
            ${isExpanded
                            ? 'bg-[#F97316]/10 border-[#F97316]/40 text-[#F97316]'
                            : 'bg-transparent border-[#F97316]/40 text-[#F97316] hover:bg-[#F97316]/5'}`}>
                    <Users size={15} />
                    {isExpanded ? 'Hide Coach Details ▲' : '👥 Check Live Crowd ▼'}
                </button>
            </div>

            {/* Expandable panel */}
            <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isExpanded ? '600px' : '0px' }}>
                {isExpanded && (
                    <CrowdPanel
                        trainNumber={dbTrain.trainNumber}
                        sensorCompartments={crowdData}
                        loading={isLoading}
                        hasError={isError}
                        isLive={isLive}
                        lastFetched={lastFetched}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                )}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function SearchTrain() {
    const { availableTrains, trainsLoading, trainsLoadError } = useSensor()

    const [from, setFrom] = useState(null)
    const [to, setTo] = useState(null)
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [searched, setSearched] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    function handleSwap() {
        setFrom(to)
        setTo(from)
    }

    function handleSearch() {
        if (!from || !to) return
        setSearched(true)
        setExpandedId(null)
    }

    // Filter trains: from availableTrains (DB), optionally cross-ref mockTrains for metadata
    // Show all DB trains when no station filter is applied,
    // or filter by from/to codes when selected
    const results = (() => {
        if (!searched) return []
        return availableTrains.map(dbT => ({
            dbTrain: dbT,
            mockTrain: mockTrains.find(m => m.trainNo === dbT.trainNumber) || null,
        }))
    })()

    const POPULAR = [
        { from: { code: 'NDLS', name: 'New Delhi', city: 'Delhi' }, to: { code: 'CSTM', name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai' } },
        { from: { code: 'CSTM', name: 'Mumbai Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai' }, to: { code: 'PUNE', name: 'Pune Junction', city: 'Pune' } },
        { from: { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' }, to: { code: 'NDLS', name: 'New Delhi', city: 'Delhi' } },
        { from: { code: 'MAS', name: 'Chennai Central', city: 'Chennai' }, to: { code: 'SBC', name: 'Bangalore City Junction', city: 'Bengaluru' } },
        { from: { code: 'NDLS', name: 'New Delhi', city: 'Delhi' }, to: { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur' } },
        { from: { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' }, to: { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' } },
    ]

    return (
        <div className="space-y-6">
            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Search Train</h1>
                <p className="text-sm text-[#8B949E] mt-1">Find trains between stations with live crowd data from IoT sensors</p>
            </div>

            {/* ── Search Panel ─────────────────────────────────────────────── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-6">
                {/* Station row */}
                <div className="flex items-end gap-2 mb-4">
                    <StationInput
                        label="From"
                        icon={MapPin}
                        value={from}
                        onChange={setFrom}
                        placeholder="Station name or code — e.g. NDLS"
                    />

                    {/* Swap button */}
                    <button
                        onClick={handleSwap}
                        className="flex-shrink-0 mb-[2px] w-10 h-10 rounded-xl bg-[#21262D] hover:bg-[#2F80ED]/10 hover:border-[#2F80ED]/40 border border-[#21262D] flex items-center justify-center text-[#8B949E] hover:text-[#2F80ED] transition-all duration-200"
                        title="Swap stations"
                    >
                        <ArrowLeftRight size={16} />
                    </button>

                    <StationInput
                        label="To"
                        icon={MapPin}
                        value={to}
                        onChange={setTo}
                        placeholder="Station name or code — e.g. PUNE"
                    />
                </div>

                {/* Date + Search row */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#484F58] mb-1">Date of Journey</label>
                        <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 focus-within:border-[#2F80ED]/60 transition-all">
                            <Calendar size={15} className="text-[#484F58] flex-shrink-0" />
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={!from || !to}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
              bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white hover:shadow-[0_0_24px_rgba(47,128,237,0.4)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Search size={16} />Search Trains<ArrowRight size={14} />
                    </button>
                </div>

                {/* Validation hint */}
                {searched && (!from || !to) && (
                    <p className="mt-2 text-xs text-[#EF4444]">Please select both source and destination stations.</p>
                )}
            </div>

            {/* ── Popular Routes (shown before search) ────────────────────── */}
            {!searched && (
                <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-[#F0F6FC] mb-3 flex items-center gap-2">
                        <Train size={15} className="text-[#F97316]" />Popular Routes
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {POPULAR.map(({ from: f, to: t }) => (
                            <button
                                key={`${f.code}-${t.code}`}
                                onClick={() => { setFrom(f); setTo(t); setSearched(true) }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5 transition-all text-left group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#F0F6FC] group-hover:text-[#2F80ED] transition-colors">
                                        <span className="text-[10px] font-black bg-[#2F80ED]/10 text-[#2F80ED] px-1.5 py-0.5 rounded">{f.code}</span>
                                        <ArrowRight size={12} className="text-[#484F58]" />
                                        <span className="text-[10px] font-black bg-[#2F80ED]/10 text-[#2F80ED] px-1.5 py-0.5 rounded">{t.code}</span>
                                    </div>
                                    <p className="text-[10px] text-[#484F58] mt-0.5 truncate">{f.city} → {t.city}</p>
                                </div>
                                <ArrowRight size={14} className="text-[#484F58] group-hover:text-[#2F80ED] flex-shrink-0 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Results ──────────────────────────────────────────────────── */}
            {searched && (
                <div className="space-y-3">
                    {/* Result header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h2 className="text-base font-semibold text-[#F0F6FC]">
                                {trainsLoading ? 'Loading trains from database…'
                                    : `${results.length} Train${results.length !== 1 ? 's' : ''} with Live Data`}
                            </h2>
                            {from && to && (
                                <p className="text-xs text-[#484F58] mt-0.5">
                                    {from.name} ({from.code}) → {to.name} ({to.code}) · {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                        {trainsLoadError && (
                            <span className="flex items-center gap-1 text-[10px] text-[#8B949E] border border-[#21262D] px-2 py-1 rounded-full">
                                <WifiOff size={9} />Showing cached data
                            </span>
                        )}
                    </div>

                    {trainsLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="border border-[#21262D] rounded-xl p-5 space-y-3">
                                    <Sk className="w-48 h-5" /><Sk className="w-64 h-3" /><Sk className="w-full h-9 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-14 bg-[#161B22] rounded-2xl border border-[#21262D]">
                            <Train size={28} className="text-[#484F58]" />
                            <p className="text-sm font-medium text-[#484F58]">No trains with live sensor data found</p>
                            <p className="text-xs text-[#484F58]">Try a different route or check back when sensors are active</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {results.map(({ dbTrain, mockTrain }) => (
                                <TrainCard
                                    key={dbTrain.trainNumber}
                                    dbTrain={dbTrain}
                                    mockTrain={mockTrain}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
