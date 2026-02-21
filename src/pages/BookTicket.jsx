import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Ticket, CalendarDays, Users, ArrowRight, MapPin, Zap,
    Train, Loader2, CheckCircle2, Tag, Layers, UserRound,
    AlertTriangle, TrendingUp, ArrowLeftRight
} from 'lucide-react'
import { getTrainsBetween, searchStations } from '../services/railRadarService'
import { useSensor } from '../context/SensorContext'
import { fetchTrainCrowdData } from '../services/influxService'

// ── Decode runningDaysBitmap: bit 0 = Mon … bit 6 = Sun ─────────────────────
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function decodeRunningDays(bitmap) {
    if (!bitmap && bitmap !== 0) return []
    return DAY_LABELS.filter((_, i) => bitmap & (1 << i))
}

// ── Fuzzy train-name matcher ─────────────────────────────────────────────────
// Normalises both strings (lowercase, remove punctuation, collapse spaces),
// then checks for word overlap ≥ 1, or substring containment.
function normaliseName(n = '') {
    return n.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}
function trainNamesMatch(apiName = '', dbName = '') {
    const a = normaliseName(apiName)
    const b = normaliseName(dbName)
    if (!a || !b) return false
    if (a.includes(b) || b.includes(a)) return true
    const aWords = new Set(a.split(' '))
    const bWords = b.split(' ')
    return bWords.filter(w => w.length > 3 && aWords.has(w)).length >= 1
}

// ── Colour helpers ────────────────────────────────────────────────────────────
function coachBg(ratio, offline) {
    if (offline) return { bg: '#374151', text: '#9CA3AF' }
    const p = ratio * 100
    if (p >= 80) return { bg: '#EF4444', text: '#fff' }
    if (p >= 50) return { bg: '#F97316', text: '#fff' }
    return { bg: '#22C55E', text: '#fff' }
}
function pctColor(pct) {
    if (pct >= 80) return 'text-[#EF4444]'
    if (pct >= 50) return 'text-[#F97316]'
    return 'text-[#22C55E]'
}
function secAgo(d) { return d ? Math.round((Date.now() - d.getTime()) / 1000) : null }

function boardingStatus(ratio) {
    if (ratio < 0.40) return 'Board Now'
    if (ratio < 0.65) return 'Comfortable'
    if (ratio < 0.80) return 'Filling Up'
    if (ratio < 0.85) return 'Almost Full'
    if (ratio < 1.00) return 'Avoid'
    return 'Overcrowded'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ className = '', style }) {
    return <div className={`animate-pulse rounded bg-[#21262D] ${className}`} style={style} />
}

// ── Visual components for the train diagram ──────────────────────────────────
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
            {/* Sync spacer with VisualCoach footer */}
            <span className="text-[8px] font-bold mt-2 invisible leading-none">000 pax</span>
        </div>
    )
}

function VisualCoach({ id, count, ratio, isOffline, isLive }) {
    const labelColor = isOffline ? 'text-[#8B949E]' : pctColor(ratio * 100)

    return (
        <div className="flex flex-col items-center min-w-[64px]">
            <span className={`text-[10px] font-black mb-1 transition-colors duration-200 leading-none ${labelColor}`}>
                {id}
            </span>
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
            {/* Always render text area to maintain vertical baseline */}
            <span className={`text-[8px] font-bold mt-2 tabular-nums leading-none flex-shrink-0 text-[#8B949E] ${isLive ? 'opacity-60' : 'invisible'}`}>
                {isOffline ? 'Offline' : `${count} pax`}
            </span>
        </div>
    )
}

// ── Placeholder card ──────────────────────────────────────────────────────────
function PlaceholderCard({ message = 'Feature coming in next phase' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-[#21262D] text-center min-h-[140px]">
            <div className="w-10 h-10 rounded-full bg-[#161B22] flex items-center justify-center">
                <Zap size={18} className="text-[#484F58]" />
            </div>
            <p className="text-sm text-[#484F58] font-medium">{message}</p>
        </div>
    )
}

// ── Travel class options ──────────────────────────────────────────────────────
const CLASS_OPTIONS = [
    { code: 'GN', label: 'General', price: '₹50 - ₹150' },
    { code: 'SL', label: 'Sleeper', price: '₹350 - ₹550' },
    { code: '3A', label: '3-Tier AC', price: '₹950 - ₹1200' },
    { code: '2A', label: '2-Tier AC', price: '₹1400 - ₹1800' },
]

// ── Station autocomplete input ────────────────────────────────────────────────
// Calls GET /railradar/search/stations?query=... (proxied → api.railradar.org)
// API returns: [{ code: "NDLS", name: "New Delhi" }, ...]
// Shows "Station Name (CODE)" in the input after selection.
// Passes only the station CODE back to the parent via onChange.
function StationInput({ label, value, onChange, placeholder }) {
    const [query, setQuery] = useState('')
    const [selectedStation, setSelected] = useState(null)
    const [suggestions, setSugg] = useState([])
    const [open, setOpen] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [apiError, setApiError] = useState(false)
    const debounceRef = useRef(null)
    const wrapRef = useRef(null)
    const inputRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Sync: if parent resets value to '' (e.g. swap clears old), clear display too
    useEffect(() => {
        if (!value) { setQuery(''); setSelected(null); setSugg([]); setOpen(false) }
    }, [value])

    async function doSearch(q) {
        setFetching(true)
        setApiError(false)
        try {
            const url = `/railradar/search/stations?query=${encodeURIComponent(q.trim())}`
            const res = await fetch(url, {
                headers: {
                    'X-API-Key': 'rr_o7r33nnimx63vzkgyk73r08q6rbwreck',
                    'Accept': 'application/json',
                },
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            // Real API shape: { success: true, data: { stations: [...] }, meta: {} }
            const arr = Array.isArray(json) ? json
                : Array.isArray(json?.data?.stations) ? json.data.stations
                    : Array.isArray(json?.data) ? json.data
                        : []
            console.log(`[BookTicket StationInput] "${q}" → ${arr.length} results`, arr)
            setSugg(arr.slice(0, 12))
            setOpen(true)
        } catch (err) {
            console.error('[StationInput] API error:', err)
            setApiError(true)
            setSugg([])
            setOpen(true)   // keep open to show error state
        } finally {
            setFetching(false)
        }
    }

    function handleInput(e) {
        const v = e.target.value
        setQuery(v)
        setSelected(null)
        onChange(v)         // let parent track raw typed text

        clearTimeout(debounceRef.current)

        if (!v.trim()) {
            setSugg([]); setOpen(false); setApiError(false)
            return
        }

        // Show loading state immediately, then debounce the actual fetch
        setFetching(true)
        debounceRef.current = setTimeout(() => doSearch(v), 200)
    }

    function pick(station) {
        const code = station.code || ''
        const name = station.name || ''
        setQuery(name ? `${name} (${code})` : code)
        setSelected({ code, name })
        onChange(code)          // ← only code goes to parent for API queries
        setSugg([])
        setOpen(false)
        setApiError(false)
    }

    const showDropdown = open && (fetching || suggestions.length > 0 || apiError)

    return (
        <div className="space-y-1.5 relative" ref={wrapRef}>
            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">
                {label}
            </label>

            {/* Input row */}
            <div
                onClick={() => inputRef.current?.focus()}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border transition-all duration-150 cursor-text
                    ${open ? 'border-[#2F80ED]/60 shadow-[0_0_0_3px_rgba(47,128,237,0.08)]'
                        : 'border-[#21262D] hover:border-[#2F80ED]/30 focus-within:border-[#2F80ED]/60'}`}
            >
                <MapPin size={15} className="text-[#484F58] shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none min-w-0"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => { if (suggestions.length > 0 || apiError) setOpen(true) }}
                />
                {/* Spinner */}
                {fetching && (
                    <Loader2 size={13} className="animate-spin text-[#2F80ED] shrink-0" />
                )}
                {/* Selected code badge */}
                {!fetching && selectedStation?.code && (
                    <span className="text-[11px] font-black font-mono text-[#2F80ED] bg-[#2F80ED]/10 px-1.5 py-0.5 rounded shrink-0">
                        {selectedStation.code}
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 z-[100] mt-1.5 rounded-xl border border-[#21262D] bg-[#161B22] shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden max-h-72 overflow-y-auto">

                    {/* Loading skeleton rows */}
                    {fetching && suggestions.length === 0 && (
                        <div className="px-4 py-3 space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-12 h-7 rounded-lg bg-[#21262D]" />
                                    <div className="h-3 flex-1 rounded bg-[#21262D]" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {apiError && !fetching && (
                        <div className="flex items-center gap-2 px-4 py-3 text-xs text-[#F97316]">
                            <AlertTriangle size={13} />
                            <span>Could not reach station search API. Check your connection.</span>
                        </div>
                    )}

                    {/* Results */}
                    {!fetching && !apiError && suggestions.map((s) => {
                        const code = s.code || ''
                        const name = s.name || ''
                        return (
                            <button
                                key={code}
                                onMouseDown={(e) => { e.preventDefault(); pick(s) }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2F80ED]/10 active:bg-[#2F80ED]/20 transition-colors text-left group border-b border-[#21262D]/60 last:border-0"
                            >
                                {/* Code tile */}
                                <div className="flex-shrink-0 w-12 h-8 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center">
                                    <span className="text-[10px] font-black font-mono text-[#2F80ED] leading-none">
                                        {code}
                                    </span>
                                </div>
                                {/* Station name */}
                                <span className="flex-1 text-sm font-medium text-[#C9D1D9] group-hover:text-[#F0F6FC] transition-colors truncate">
                                    {name}
                                </span>
                                <ArrowRight size={12} className="text-[#484F58] group-hover:text-[#2F80ED] shrink-0 transition-colors" />
                            </button>
                        )
                    })}

                    {/* No results */}
                    {!fetching && !apiError && suggestions.length === 0 && query.trim() && (
                        <div className="px-4 py-3 text-xs text-[#484F58] text-center">
                            No stations found for "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Crowd panel shown inside a selected train card ───────────────────────────
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
            return {
                compartmentId: id,
                currentCount: id.startsWith('G') ? 45 : 20,
                capacity: 100,
                occupancyRatio: id.startsWith('G') ? 0.45 : 0.2,
                offline: false,
                isLive: false
            }
        })
    ]

    const totalOcc = coaches.reduce((s, c) => s + c.currentCount, 0)
    const online = fullTrain.filter(c => c.type !== 'engine' && !c.offline)
    const best = online.length ? online.reduce((a, b) => a.currentCount < b.currentCount ? a : b) : null
    const worst = online.length ? online.reduce((a, b) => a.currentCount > b.currentCount ? a : b) : null

    if (loading) return (
        <div className="space-y-3 py-4">
            <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#2F80ED]" />
                <span className="text-xs text-[#484F58]">Fetching crowd details…</span>
            </div>
            <Sk className="w-full h-16 rounded-xl" />
        </div>
    )

    if (error || coaches.length === 0) return (
        <div className="flex items-center gap-2 py-3 px-4 bg-[#21262D]/30 rounded-lg text-[#8B949E] border border-[#21262D] mt-2">
            <AlertTriangle size={13} className="text-[#F97316]" />
            <span className="text-[11px] font-medium">Live crowd data unavailable — using typical averages</span>
        </div>
    )

    return (
        <div className="mt-4 space-y-4 border-t border-[#21262D] pt-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#8B949E] uppercase tracking-[0.15em] flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#238636]" /> Live Density Diagram
                </span>
                <span className="text-[10px] font-bold text-[#238636] bg-[#238636]/10 px-2.5 py-0.5 rounded-full border border-[#238636]/20">
                    REAL-TIME
                </span>
            </div>

            {/* Coach strip */}
            <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
                <div className="flex items-end gap-1.5 w-max px-1">
                    {fullTrain.map((c, i) => (
                        c.type === 'engine' ? <TrainEngine key="engine" /> :
                            <VisualCoach
                                key={c.compartmentId || i}
                                id={c.compartmentId}
                                count={c.currentCount}
                                ratio={c.occupancyRatio}
                                isOffline={c.offline}
                                isLive={c.isLive}
                            />
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {best && worst && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-[#238636]/5 border border-[#238636]/20 rounded-lg p-2 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#238636]" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-[#238636] leading-none mb-1">Best Coach</p>
                            <p className="text-xs font-bold text-[#F0F6FC] truncate">{best.compartmentId}</p>
                        </div>
                    </div>
                    <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg p-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-[#EF4444]" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase font-bold text-[#EF4444] leading-none mb-1">Busy / Avoid</p>
                            <p className="text-xs font-bold text-[#F0F6FC] truncate">{worst.compartmentId}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Total */}
            <p className="text-center text-[11px] font-bold text-[#484F58] opacity-80 pt-1">
                Total Passengers Recorded: <span className="text-[#F0F6FC]">{totalOcc}</span>
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BookTicket() {
    const { availableTrains } = useSensor()
    const dateInputRef = useRef(null)

    const [fromStation, setFromStation] = useState('')
    const [toStation, setToStation] = useState('')
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [passengers, setPassengers] = useState(1)
    const [selectedClass, setSelectedClass] = useState('GN')

    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // which train card is expanded (showing crowd panel)
    const [expandedTrain, setExpandedTrain] = useState(null)

    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('traq_bookings')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('traq_bookings', JSON.stringify(bookings))
    }, [bookings])

    // ── Find the matching InfluxDB train number for a given API train name ────
    const findInfluxTrainNumber = useCallback((apiTrainName, apiTrainNumber) => {
        // 1. Exact train number match
        const byNum = availableTrains.find(t => t.trainNumber === apiTrainNumber)
        if (byNum) return byNum.trainNumber
        // 2. Fuzzy name match
        const byName = availableTrains.find(t => trainNamesMatch(apiTrainName, t.name))
        return byName ? byName.trainNumber : null
    }, [availableTrains])

    // ── Search handler ────────────────────────────────────────────────────────
    const handleSearch = async () => {
        const from = fromStation.toUpperCase().trim()
        const to = toStation.toUpperCase().trim()
        if (!from || !to) {
            setError('Please enter both source and destination stations')
            return
        }
        setLoading(true)
        setError(null)
        setExpandedTrain(null)
        try {
            const response = await getTrainsBetween(from, to)
            if (response?.success && response?.data?.trains) {
                setTrains(response.data.trains)
            } else {
                setTrains([])
                if (response && !response.success) setError('No trains found for this route.')
            }
        } catch (err) {
            console.error(err)
            setError('Failed to fetch trains. Please check station codes (e.g., NDLS, BCT)')
        } finally {
            setLoading(false)
        }
    }

    // ── Book general ticket ───────────────────────────────────────────────────
    const handleBookGeneralTicket = (train) => {
        const booking = {
            id: Math.random().toString(36).substr(2, 9),
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            from: train.sourceStationCode || fromStation.toUpperCase(),
            to: train.destinationStationCode || toStation.toUpperCase(),
            date: date || new Date().toISOString().split('T')[0],
            passengers,
            class: 'General (GN)',
            timestamp: new Date().toLocaleString(),
            status: 'Confirmed',
        }
        setBookings(prev => [booking, ...prev])
        alert(`General ticket booked for ${train.trainName} (${train.trainNumber})`)
    }

    // ── Toggle crowd expansion ─────────────────────────────────────────────────
    function toggleCrowd(train) {
        const influxNum = findInfluxTrainNumber(train.trainName, train.trainNumber)
        if (!influxNum) return
        setExpandedTrain(prev => (prev === train.trainNumber ? null : train.trainNumber))
    }

    // ── Swap from/to stations ─────────────────────────────────────────────────
    function handleSwap() {
        setFromStation(toStation)
        setToStation(fromStation)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC]">Book Ticket</h1>
                <p className="text-sm text-[#8B949E] mt-1">Reserve seats across all Indian railway classes</p>
            </div>

            {/* ── Booking Form ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-5">Journey Details</h2>
                <div className="space-y-4">
                    {/* Station autocomplete inputs with swap button */}
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <StationInput
                                label="From"
                                value={fromStation}
                                onChange={setFromStation}
                                placeholder="Origin — e.g. NDLS, Mumbai"
                            />
                        </div>
                        <button
                            onClick={handleSwap}
                            title="Swap stations"
                            className="flex-shrink-0 mb-[2px] w-10 h-10 rounded-xl bg-[#21262D] hover:bg-[#2F80ED]/10 border border-[#21262D] hover:border-[#2F80ED]/40 flex items-center justify-center text-[#8B949E] hover:text-[#2F80ED] transition-all duration-200"
                        >
                            <ArrowLeftRight size={15} />
                        </button>
                        <div className="flex-1">
                            <StationInput
                                label="To"
                                value={toStation}
                                onChange={setToStation}
                                placeholder="Destination — e.g. BCT, Pune"
                            />
                        </div>
                    </div>

                    {/* Date + Passengers */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Journey Date</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/60 transition-colors cursor-pointer" onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}>
                                <CalendarDays size={15} className="text-[#484F58]" />
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none cursor-pointer"
                                    value={date}
                                    min={new Date().toISOString().slice(0, 10)}
                                    onChange={e => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Passengers</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/60 transition-colors">
                                <Users size={15} className="text-[#484F58]" />
                                <input
                                    type="number" min="1" max="6" placeholder="1"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                                    value={passengers}
                                    onChange={e => setPassengers(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Travel Class</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CLASS_OPTIONS.map(({ code, label, price }) => (
                                <button
                                    key={code}
                                    onClick={() => setSelectedClass(code)}
                                    className={`flex flex-col items-center gap-0.5 py-3 px-2 rounded-lg border transition-all duration-200 group ${selectedClass === code
                                        ? 'bg-[#2F80ED]/10 border-[#2F80ED] shadow-[0_0_10px_rgba(47,128,237,0.2)]'
                                        : 'bg-[#0D1117] border-[#21262D] hover:border-[#2F80ED]/50 hover:bg-[#2F80ED]/5'
                                        }`}
                                >
                                    <span className={`text-sm font-bold transition-colors ${selectedClass === code ? 'text-[#2F80ED]' : 'text-[#F0F6FC] group-hover:text-[#2F80ED]'}`}>{code}</span>
                                    <span className="text-[10px] text-[#484F58]">{label}</span>
                                    <span className="text-[10px] text-[#8B949E] mt-0.5">{price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_24px_rgba(47,128,237,0.4)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                        {loading ? 'Searching…' : 'Search Available Trains'}
                        <ArrowRight size={14} />
                    </button>

                    {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
                </div>
            </div>

            {/* ── Train Results ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Available Trains</h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3 text-[#484F58]">
                        <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
                        <p className="text-sm font-medium">Fetching real-time train data…</p>
                    </div>
                ) : trains.length > 0 ? (
                    <div className="space-y-3">
                        {trains.map((train) => {
                            const runningDays = decodeRunningDays(train.runningDaysBitmap)
                            const influxTrainNum = findInfluxTrainNumber(train.trainName, train.trainNumber)
                            const hasCrowd = !!influxTrainNum
                            const isExpanded = expandedTrain === train.trainNumber

                            return (
                                <div key={train.trainNumber} className="rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 transition-all overflow-hidden group">

                                    {/* ── Top bar ── */}
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

                                    {/* ── Route strip ── */}
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
                                            {/* Running days heat-map */}
                                            <div className="flex gap-0.5">
                                                {DAY_LABELS.map(d => (
                                                    <span
                                                        key={d}
                                                        title={d}
                                                        className={`text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-sm ${runningDays.includes(d)
                                                            ? 'bg-[#238636] text-white'
                                                            : 'bg-[#21262D] text-[#484F58]'
                                                            }`}
                                                    >{d[0]}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-center min-w-[72px]">
                                            <p className="text-xs font-black text-[#2F80ED]">{train.destinationStationCode}</p>
                                            <p className="text-[10px] text-[#484F58] truncate max-w-[80px]" title={train.destinationStationName}>{train.destinationStationName}</p>
                                        </div>
                                    </div>

                                    {/* ── Inline crowd panel ── */}
                                    {isExpanded && influxTrainNum && (
                                        <div className="px-4 pb-3">
                                            <CrowdPanel trainNumber={influxTrainNum} />
                                        </div>
                                    )}

                                    {/* ── Actions ── */}
                                    <div className="flex items-center gap-2 px-4 pb-3">
                                        <button
                                            onClick={() => handleBookGeneralTicket(train)}
                                            className="flex-1 py-2 rounded-lg bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-bold transition-all hover:shadow-[0_0_12px_rgba(46,160,67,0.3)]"
                                        >
                                            Book General Ticket
                                        </button>
                                        {hasCrowd && (
                                            <button
                                                onClick={() => toggleCrowd(train)}
                                                className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${isExpanded
                                                    ? 'bg-[#2F80ED]/10 border-[#2F80ED] text-[#2F80ED]'
                                                    : 'border-[#21262D] hover:border-[#2F80ED] text-[#8B949E] hover:text-[#2F80ED]'
                                                    }`}
                                            >
                                                {isExpanded ? 'Hide Crowd' : 'Live Crowd'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <PlaceholderCard message={error || "Enter station codes to see available trains and book tickets"} />
                )}
            </div>

            {/* ── My Bookings ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">My Bookings</h2>
                {bookings.length > 0 ? (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="p-4 rounded-xl bg-[#0D1117]/50 border border-[#21262D] border-l-4 border-l-[#238636]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-[#238636]" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#238636]">{booking.status}</span>
                                    </div>
                                    <span className="text-[10px] text-[#484F58]">{booking.timestamp}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-[#F0F6FC]">{booking.trainName}</h4>
                                        <p className="text-xs text-[#8B949E] flex items-center gap-1">
                                            <Train size={12} /> {booking.trainNumber} • {booking.from} <ArrowRight size={10} /> {booking.to}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-[#F0F6FC]">{booking.class}</p>
                                        <p className="text-[10px] text-[#8B949E]">{booking.passengers} Passenger(s)</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <PlaceholderCard message="Your booked tickets will appear here" />
                )}
            </div>
        </div>
    )
}
