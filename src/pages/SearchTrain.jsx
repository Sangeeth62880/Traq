// Traq — InfluxDB Integration | Make-a-Ton 2026
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, ArrowRight, ArrowLeftRight, Train, Clock,
    Users, ChevronRight, Wifi, WifiOff, AlertTriangle,
    CheckCircle, ExternalLink, RefreshCw, MapPin, Calendar, Loader2, Ticket,
} from 'lucide-react'
import { useSensor } from '../context/SensorContext'
import { mockTrains } from '../data/mockTrains'
import { sensorData } from '../data/sensorData'
import { searchStations as apiSearchStations, getTrainsBetween } from '../services/railRadarService'



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

// ── Station autocomplete input ────────────────────────────────────────────────
function StationInput({ label, icon: Icon, value, onChange, placeholder }) {
    const [query, setQuery] = useState(value?.code ? `${value.name} (${value.code})` : '')
    const [open, setOpen] = useState(false)
    const [results, setResults] = useState([])
    const [fetching, setFetching] = useState(false)
    const debounceRef = useRef(null)
    const ref = useRef(null)

    // Close on outside click
    useEffect(() => {
        function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    // Sync if parent clears value or swaps
    useEffect(() => {
        if (!value) {
            setQuery('')
            setResults([])
        } else if (value.code) {
            setQuery(`${value.name} (${value.code})`)
        }
    }, [value])

    async function handleInput(e) {
        const q = e.target.value
        setQuery(q)

        clearTimeout(debounceRef.current)

        if (!q.trim() || q.length < 2) {
            setResults([])
            setOpen(false)
            setFetching(false)
            if (!q) onChange(null)
            return
        }

        setFetching(true)
        setOpen(true)

        debounceRef.current = setTimeout(async () => {
            try {
                const arr = await apiSearchStations(q)
                setResults(arr)
            } finally {
                setFetching(false)
            }
        }, 300)
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
                        onFocus={() => { if (results.length > 0) setOpen(true) }}
                        placeholder={placeholder}
                        className="w-full bg-transparent text-sm font-medium text-[#F0F6FC] placeholder-[#484F58] outline-none truncate"
                    />
                    {fetching && (
                        <div className="flex items-center gap-1.5 ml-2">
                            <Loader2 size={12} className="animate-spin text-[#2F80ED]" />
                        </div>
                    )}
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

// ── inline crowd panel (DB-backed) ───────────────────────────────────────────
function CrowdPanel({ trainNumber, sensorCompartments, loading, hasError, isLive, lastFetched, onRefresh, refreshing }) {
    const navigate = useNavigate()

    const liveCoaches = (sensorCompartments?.length > 0) ? sensorCompartments : []

    // Standard layout like the reference image: Engine -> GS -> GS -> Sleeper...
    const layoutIds = ['G1', 'G2', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']
    const fullTrain = [
        { type: 'engine' },
        ...layoutIds.map(id => {
            // Find live data for this ID, or any live data that might be 'GS' etc.
            const live = liveCoaches.find(c => c.compartmentId === id || (id.startsWith('G') && c.compartmentId === 'GS'))
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

    const totalOcc = liveCoaches.reduce((s, c) => s + c.currentCount, 0)
    const totalCap = liveCoaches.reduce((s, c) => s + c.capacity, 0)
    const pct = totalCap > 0 ? Math.round(totalOcc / totalCap * 100) : 0
    const pc = ratio => ratio * 100
    const online = fullTrain.filter(c => c.type !== 'engine' && !c.offline)
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
            <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
                <div className="flex items-end gap-1.5 w-max px-2">
                    {loading ? Array.from({ length: 8 }).map((_, i) => <Sk key={i} style={{ width: 64, height: 40 }} className="rounded-lg mb-4" />)
                        : fullTrain.map((c, i) => (
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
                    <div className="flex items-center justify-center w-10 flex-shrink-0 mb-4 opacity-50">
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
                ? <p className="mt-2 text-center text-sm font-bold opacity-80 text-[#8B949E]">Record: {totalOcc} Passengers</p>
                : <Sk className="w-40 h-4 mt-2 mx-auto" />}


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
// RAIL RADAR TRAIN CARD — renders a train from the /trains/between API
// ════════════════════════════════════════════════════════════════════════════
function RailRadarTrainCard({ train, influxTrain, expandedId, setExpandedId, from, to }) {
    const { fetchForTrain, crowdData, isLoading, isError, lastFetched, isLive } = useSensor()
    const [refreshing, setRefreshing] = useState(false)

    const trainNo = String(train.trainNumber || train.number || '')
    const trainName = train.trainName || train.name || `Train ${trainNo}`
    const isExpanded = expandedId === trainNo
    const hasLive = !!influxTrain

    // Calculate occupancy if data exists
    let overallPct = null
    let totalOcc = 0
    if (influxTrain?.coaches?.length > 0) {
        totalOcc = influxTrain.coaches.reduce((s, c) => s + (c.currentCount || 0), 0)
        const cap = influxTrain.coaches.reduce((s, c) => s + (c.capacity || 100), 0)
        overallPct = cap > 0 ? Math.round((totalOcc / cap) * 100) : null
    }

    const departure = train.departureTime || train.source?.departureTime || train.fromStationData?.departureTime || '—'
    const arrival = train.arrivalTime || train.destination?.arrivalTime || train.toStationData?.arrivalTime || '—'
    const duration = train.duration || train.journeyTime || '—'

    const fromCode = train.sourceStationCode || train.fromStation || from?.code || '—'
    const toCode = train.destinationStationCode || train.toStation || to?.code || '—'

    const classes = Array.isArray(train.classesAvailable)
        ? train.classesAvailable
        : typeof train.classesAvailable === 'string'
            ? train.classesAvailable.split(',').map(c => c.trim()).filter(Boolean)
            : []

    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    const runsOn = train.runningDays || ''

    async function handleToggle() {
        if (!hasLive) return
        if (!isExpanded) { setExpandedId(trainNo); fetchForTrain(trainNo) }
        else setExpandedId(null)
    }

    async function handleRefresh() {
        setRefreshing(true)
        await fetchForTrain(trainNo)
        setRefreshing(false)
    }

    return (
        <div className="border border-[#21262D] rounded-xl overflow-hidden hover:border-[#2F80ED]/20 transition-colors duration-200">
            <div className="bg-[#161B22] px-5 py-4">
                {/* Number + name + live dot */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">#{trainNo}</span>
                            <h3 className="text-sm font-bold text-[#F0F6FC] truncate">{trainName}</h3>
                        </div>
                        {hasLive && (
                            <div className="flex items-center gap-1.5 text-[10px] text-[#22C55E] font-semibold">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                                </span>
                                Live sensor data · {influxTrain.coaches.length} coaches
                            </div>
                        )}
                    </div>
                    {overallPct !== null && (
                        <div className={`flex flex-col items-end flex-shrink-0 ${pctColor(overallPct)}`}>
                            <span className="text-lg font-black leading-none">{totalOcc}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">People</span>
                        </div>
                    )}
                </div>

                {/* Timing row */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="text-center min-w-[48px]">
                        <p className="text-base font-bold text-[#F0F6FC]">{departure}</p>
                        <p className="text-[10px] text-[#484F58]">{fromCode}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <p className="text-[10px] text-[#484F58]">{duration}</p>
                        <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1 bg-[#21262D]" />
                            <Train size={12} className="text-[#2F80ED]" />
                            <div className="h-px flex-1 bg-[#21262D]" />
                        </div>
                    </div>
                    <div className="text-center min-w-[48px]">
                        <p className="text-base font-bold text-[#F0F6FC]">{arrival}</p>
                        <p className="text-[10px] text-[#484F58]">{toCode}</p>
                    </div>
                </div>

                {/* Classes + running days */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {classes.map(c => (
                        <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E]">{c}</span>
                    ))}
                    {runsOn && runsOn.length === 7 && (
                        <div className="flex gap-0.5 ml-auto">
                            {dayNames.map((d, i) => (
                                <span key={i} className={`text-[9px] font-bold px-1 py-0.5 rounded ${runsOn[i] === '1' ? 'bg-[#2F80ED]/15 text-[#2F80ED]' : 'bg-[#21262D] text-[#484F58]'
                                    }`}>{d}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Coach Preview (Only if NOT expanded) ── */}
                {hasLive && !isExpanded && influxTrain.coaches?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {influxTrain.coaches.slice(0, 10).map(c => {
                            const ratio = c.currentCount / (c.capacity || 100)
                            const { bg, text } = coachBg(ratio, false)
                            return (
                                <div
                                    key={c.compartmentId}
                                    className="flex flex-col items-center justify-center rounded-lg text-center px-2 py-1 min-w-[50px]"
                                    style={{ backgroundColor: bg }}
                                >
                                    <span className="text-[10px] font-bold leading-tight" style={{ color: text }}>{c.compartmentId}</span>
                                    <span className="text-[9px] font-black leading-tight opacity-90" style={{ color: text }}>{c.currentCount} pax</span>
                                </div>
                            )
                        })}
                        {influxTrain.coaches.length > 10 && (
                            <div className="flex items-center justify-center px-2 text-[10px] text-[#484F58] font-bold">
                                +{influxTrain.coaches.length - 10} more
                            </div>
                        )}
                    </div>
                )}

                {/* Live Crowd button */}
                {hasLive ? (
                    <button onClick={handleToggle}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${isExpanded ? 'bg-[#F97316]/10 border-[#F97316]/40 text-[#F97316]'
                            : 'bg-transparent border-[#F97316]/40 text-[#F97316] hover:bg-[#F97316]/5'
                            }`}>
                        <Users size={15} />
                        {isExpanded ? 'Hide Coach Details ▲' : '👥 Check Live Crowd ▼'}
                    </button>
                ) : (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs text-[#484F58] border border-[#21262D]/50 bg-[#0D1117]/40">
                        <Wifi size={13} className="opacity-40" />
                        No live sensor data for this train
                    </div>
                )}
            </div>

            {/* Crowd panel */}
            <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isExpanded ? '600px' : '0px' }}>
                {isExpanded && (
                    <CrowdPanel
                        trainNumber={trainNo}
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
    const { availableTrains } = useSensor()

    const [from, setFrom] = useState(null)
    const [to, setTo] = useState(null)
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [searched, setSearched] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    // ── RailRadar API state ───────────────────────────────────────────────────
    const [apiTrains, setApiTrains] = useState([])
    const [apiLoading, setApiLoading] = useState(false)
    const [apiError, setApiError] = useState(null)

    function handleSwap() { setFrom(to); setTo(from) }

    async function handleSearch() {
        if (!from || !to) return
        setSearched(true)
        setExpandedId(null)
        setApiTrains([])
        setApiError(null)
        setApiLoading(true)
        try {
            const json = await getTrainsBetween(from.code, to.code)
            const trains = Array.isArray(json) ? json
                : Array.isArray(json?.data?.trains) ? json.data.trains
                    : Array.isArray(json?.data) ? json.data
                        : []
            console.log(`[SearchTrain] ${trains.length} trains for ${from.code}→${to.code}`, trains)
            setApiTrains(trains)
        } catch (err) {
            console.error('[SearchTrain] getTrainsBetween error:', err)
            setApiError(err.message || 'Failed to fetch trains')
        } finally {
            setApiLoading(false)
        }
    }

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
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <h2 className="text-base font-semibold text-[#F0F6FC]">
                                {apiLoading ? 'Searching trains…'
                                    : apiError ? 'Search failed'
                                        : `${apiTrains.length} Train${apiTrains.length !== 1 ? 's' : ''} Found`}
                            </h2>
                            {from && to && (
                                <p className="text-xs text-[#484F58] mt-0.5">
                                    {from.name} ({from.code}) → {to.name} ({to.code}) · {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                        {apiError && (
                            <span className="flex items-center gap-1 text-[10px] text-[#EF4444] border border-[#EF4444]/30 px-2 py-1 rounded-full">
                                <WifiOff size={9} />{apiError}
                            </span>
                        )}
                    </div>

                    {/* Loading skeletons */}
                    {apiLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="border border-[#21262D] rounded-xl p-5 space-y-3 bg-[#161B22]">
                                    <div className="flex gap-3"><Sk className="w-16 h-5 rounded" /><Sk className="w-40 h-5 rounded" /></div>
                                    <div className="flex items-center gap-4"><Sk className="w-12 h-8 rounded" /><Sk className="flex-1 h-2 rounded" /><Sk className="w-12 h-8 rounded" /></div>
                                    <Sk className="w-full h-9 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!apiLoading && apiError && (
                        <div className="flex flex-col items-center gap-3 py-14 bg-[#161B22] rounded-2xl border border-[#21262D]">
                            <AlertTriangle size={28} className="text-[#F97316]" />
                            <p className="text-sm font-medium text-[#F0F6FC]">Could not fetch trains</p>
                            <p className="text-xs text-[#484F58]">{apiError}</p>
                            <button onClick={handleSearch} className="mt-1 px-4 py-2 rounded-lg bg-[#2F80ED] text-white text-xs font-semibold hover:bg-[#2F80ED]/80 transition-colors">Retry</button>
                        </div>
                    )}

                    {/* No results */}
                    {!apiLoading && !apiError && apiTrains.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-14 bg-[#161B22] rounded-2xl border border-[#21262D]">
                            <Train size={28} className="text-[#484F58]" />
                            <p className="text-sm font-medium text-[#484F58]">No trains found for this route</p>
                            <p className="text-xs text-[#484F58]">Try swapping stations or a different date</p>
                        </div>
                    )}

                    {/* Train cards */}
                    {!apiLoading && !apiError && apiTrains.length > 0 && (
                        <div className="space-y-3">
                            {apiTrains.map((train) => {
                                const influxMatch = availableTrains.find(
                                    t => t.trainNumber === String(train.trainNumber)
                                        || t.trainNumber === String(train.number)
                                )
                                return (
                                    <RailRadarTrainCard
                                        key={train.trainNumber || train.number}
                                        train={train}
                                        influxTrain={influxMatch || null}
                                        expandedId={expandedId}
                                        setExpandedId={setExpandedId}
                                        from={from}
                                        to={to}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
