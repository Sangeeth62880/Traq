// Traq — InfluxDB Integration | Make-a-Ton 2026
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Users, BarChart3, AlertTriangle, MapPin, Train,
    ChevronDown, ChevronUp, Wifi, WifiOff, Zap, Activity,
    Search, X, Radio, RefreshCw, CheckCircle2,
} from 'lucide-react'
import { trainsByStation, mockTrains } from '../data/mockTrains'
import { sensorData, getCrowdMeta } from '../data/sensorData'
import { useSensor } from '../context/SensorContext'

// ── Station list ──────────────────────────────────────────────────────────────
const STATIONS = [
    { name: 'Mumbai CST', code: 'CSTM' },
    { name: 'New Delhi', code: 'NDLS' },
    { name: 'Howrah Junction', code: 'HWH' },
    { name: 'Chennai Central', code: 'MAS' },
    { name: 'Bangalore City', code: 'SBC' },
    { name: 'Hyderabad Deccan', code: 'HYB' },
    { name: 'Pune Junction', code: 'PUNE' },
    { name: 'Ahmedabad', code: 'ADI' },
    { name: 'Bhopal Junction', code: 'BPL' },
    { name: 'Jaipur', code: 'JP' },
    { name: 'Lucknow', code: 'LKO' },
    { name: 'Patna Junction', code: 'PNBE' },
    { name: 'Nagpur', code: 'NGP' },
    { name: 'Agra Cantt', code: 'AGC' },
    { name: 'Varanasi', code: 'BSB' },
]

// ── Colour helpers ────────────────────────────────────────────────────────────
function crowdBarColor(pct) {
    if (pct >= 85) return 'bg-[#EF4444]'
    if (pct >= 70) return 'bg-[#F97316]'
    if (pct >= 40) return 'bg-[#FACC15]'
    return 'bg-[#22C55E]'
}
function crowdTextColor(pct) {
    if (pct >= 85) return 'text-[#EF4444]'
    if (pct >= 70) return 'text-[#F97316]'
    if (pct >= 40) return 'text-[#FACC15]'
    return 'text-[#22C55E]'
}
function crowdLabel(pct) {
    if (pct >= 85) return 'Critical'
    if (pct >= 70) return 'High'
    if (pct >= 40) return 'Moderate'
    return 'Low'
}

// ── Shared skeleton ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded bg-[#21262D] ${className}`} />
}

// ── Data source chip ──────────────────────────────────────────────────────────
function DataSourceChip({ isLive }) {
    return isLive
        ? <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">📡 Live Sensor Data</span>
        : <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded-full">🔧 Demo Data</span>
}

// ── Station crowd bars ────────────────────────────────────────────────────────
function CrowdBar({ station, level, color, percentage }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-32 flex-shrink-0">
                <p className="text-sm font-medium text-[#F0F6FC] truncate">{station}</p>
                <p className="text-xs text-[#484F58]">{level}</p>
            </div>
            <div className="flex-1 h-2 bg-[#21262D] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-xs font-bold text-[#8B949E] w-8 text-right">{percentage}%</span>
        </div>
    )
}

// ── Coach diagram ─────────────────────────────────────────────────────────────
function CoachDiagram({ coaches, loading }) {
    if (loading) {
        return (
            <div className="flex flex-wrap gap-1.5 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="rounded-md" style={{ width: 52, height: 44 }} />
                ))}
            </div>
        )
    }
    return (
        <div className="flex flex-wrap gap-1.5 mt-3">
            {coaches.map(c => {
                const count = c.currentCount !== undefined ? c.currentCount : (c.occupancy ?? 0)
                const cap = c.capacity ?? 1
                const pct = Math.round(count / cap * 100)
                const offline = c.offline || c.status === 'offline'
                const { tailwindBg, tailwindText, hex } = getCrowdMeta(pct, offline)
                return (
                    <div key={c.compartmentId || c.coach}
                        title={`${c.compartmentId || c.coach} — ${offline ? 'Offline' : `${count}/${cap} · ${pct}%`}`}
                        className="relative flex flex-col items-center justify-center rounded-md border border-[#21262D] cursor-default select-none"
                        style={{ width: 52, height: 44, background: `${hex}18` }}
                    >
                        <div className={`absolute bottom-0 left-0 right-0 rounded-b-md opacity-30 ${tailwindBg}`} style={{ height: `${pct}%` }} />
                        <span className={`relative text-[10px] font-bold ${tailwindText}`}>{c.compartmentId || c.coach}</span>
                        <span className="relative text-[9px] text-[#8B949E]">{offline ? 'Off' : `${pct}%`}</span>
                    </div>
                )
            })}
            <div className="flex items-center justify-center ml-1">
                <Train size={18} className="text-[#484F58]" />
            </div>
        </div>
    )
}

// ── Expandable in-train sensor card ──────────────────────────────────────────
function TrainSensorCard({ trainDef, liveCompartments, globalLoading }) {
    const [expanded, setExpanded] = useState(false)

    const coaches = (liveCompartments && liveCompartments.length > 0)
        ? liveCompartments
        : (sensorData[trainDef.trainNo || trainDef.trainNumber]?.coaches || []).map(c => ({
            compartmentId: c.coach,
            coachType: c.type,
            currentCount: c.occupancy,
            capacity: c.capacity,
            occupancyRatio: c.capacity > 0 ? c.occupancy / c.capacity : 0,
            offline: c.status === 'offline',
        }))

    const totalOcc = coaches.reduce((s, c) => s + (c.currentCount ?? c.occupancy ?? 0), 0)
    const totalCap = coaches.reduce((s, c) => s + c.capacity, 0)
    const overallPct = totalCap > 0 ? Math.round(totalOcc / totalCap * 100) : 0
    const isLoading = globalLoading && expanded

    return (
        <div className="border border-[#21262D] rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-[#0D1117] hover:bg-[#161B22] transition-colors duration-150 text-left"
            >
                <div className="w-10 h-10 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/20 flex items-center justify-center flex-shrink-0">
                    <Train size={18} className="text-[#2F80ED]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#F0F6FC]">{trainDef.name}</span>
                        <span className="text-xs text-[#484F58] font-mono">#{trainDef.trainNo || trainDef.trainNumber}</span>
                        {isLoading ? <Skeleton className="w-14 h-4 rounded-full" /> : (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${overallPct >= 85 ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                                overallPct >= 70 ? 'bg-[#F97316]/10 text-[#F97316]' :
                                    overallPct >= 40 ? 'bg-[#FACC15]/10 text-[#FACC15]' :
                                        'bg-[#22C55E]/10 text-[#22C55E]'}`}>
                                {crowdLabel(overallPct)}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#8B949E] mt-1 truncate">{trainDef.from} → {trainDef.to}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 mr-3">
                    {isLoading ? <Skeleton className="w-12 h-5" /> : (
                        <>
                            <span className={`text-base font-bold ${crowdTextColor(overallPct)}`}>{overallPct}%</span>
                            <div className="w-20 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${crowdBarColor(overallPct)}`} style={{ width: `${overallPct}%` }} />
                            </div>
                            <span className="text-[10px] text-[#484F58]">{totalOcc}/{totalCap}</span>
                        </>
                    )}
                </div>
                <div className="flex-shrink-0 text-[#484F58]">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {expanded && (
                <div className="bg-[#161B22] border-t border-[#21262D] px-5 py-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#484F58] mb-1 font-semibold">Coach Diagram</p>
                    <CoachDiagram coaches={coaches} loading={isLoading} />
                    <p className="text-[10px] uppercase tracking-widest text-[#484F58] mt-4 mb-2 font-semibold">Coach-wise Sensor Readings</p>
                    <div className="space-y-2">
                        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-16 space-y-1"><Skeleton className="h-3" /><Skeleton className="w-10 h-2" /></div>
                                <Skeleton className="flex-1 h-2" />
                                <Skeleton className="w-8 h-3" />
                            </div>
                        )) : coaches.map(c => {
                            const count = c.currentCount ?? c.occupancy ?? 0
                            const pct = Math.round(count / (c.capacity || 1) * 100)
                            const offline = c.offline || c.status === 'offline'
                            const { label: lvl, tailwindText: tc, tailwindBg: bc } = getCrowdMeta(pct, offline)
                            return (
                                <div key={c.compartmentId || c.coach} className="flex items-center gap-3">
                                    <div className="w-16 flex-shrink-0">
                                        <p className="text-xs font-bold text-[#F0F6FC]">{c.compartmentId || c.coach}</p>
                                        <p className="text-[10px] text-[#484F58]">{c.coachType || c.type}</p>
                                    </div>
                                    <div className="flex-1 h-2 bg-[#21262D] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${bc}`} style={{ width: `${offline ? 100 : pct}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold w-8 text-right ${tc}`}>{offline ? '—' : `${pct}%`}</span>
                                    <span className={`text-[10px] font-semibold w-14 text-right hidden sm:inline ${tc}`}>{lvl}</span>
                                    <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                                        <Activity size={10} className="text-[#484F58]" />
                                        <span className="text-[10px] text-[#484F58] font-mono">{c.sensorId || `SN-${(c.compartmentId || c.coach || '').replace('-', '')}`}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Station crowd result ──────────────────────────────────────────────────────
function StationCrowdResult({ station, loading }) {
    const trainNos = trainsByStation[station.code] || []
    const trains = trainNos.map(no => mockTrains.find(t => t.trainNo === no)).filter(Boolean)
    if (trains.length === 0) {
        return (
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 text-center text-sm text-[#484F58] py-8">
                No live train data available for {station.name}
            </div>
        )
    }
    return (
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <MapPin size={15} className="text-[#2F80ED]" />
                <h3 className="text-sm font-semibold text-[#F0F6FC]">Trains at {station.name}</h3>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E]">{trains.length} live</span>
            </div>
            <div className="space-y-3">
                {trains.map(train => {
                    const data = sensorData[train.trainNo]
                    if (!data) return null
                    const occ = data.coaches.reduce((s, c) => s + c.occupancy, 0)
                    const pct = Math.round(occ / data.totalCapacity * 100)
                    return (
                        <div key={train.trainNo} className="flex items-center gap-3 py-2 border-b border-[#21262D] last:border-none">
                            <div className="w-8 h-8 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center flex-shrink-0">
                                <Train size={14} className="text-[#2F80ED]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#F97316]">#{train.trainNo}</span>
                                    <span className="text-sm font-medium text-[#F0F6FC] truncate">{train.name}</span>
                                </div>
                                {loading ? <Skeleton className="w-full h-1.5 mt-1" /> : (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${crowdBarColor(pct)}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={`text-xs font-bold flex-shrink-0 ${crowdTextColor(pct)}`}>{pct}%</span>
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${pct >= 85 ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                                pct >= 70 ? 'bg-[#F97316]/10 text-[#F97316]' :
                                    pct >= 40 ? 'bg-[#FACC15]/10 text-[#FACC15]' :
                                        'bg-[#22C55E]/10 text-[#22C55E]'}`}>
                                {crowdLabel(pct)}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Crowd search section ——— uses availableTrains from InfluxDB ───────────────
function CrowdSearchSection({ onTrainSelect, onStationSelect, onClear, selectedTrain, selectedStation }) {
    const [tab, setTab] = useState('train')
    const [query, setQuery] = useState('')
    const [debouncedQ, setDebouncedQ] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const wrapperRef = useRef(null)
    const { availableTrains, trainsLoading } = useSensor()

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(query), 300)
        return () => clearTimeout(t)
    }, [query])

    useEffect(() => {
        function handler(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Filter trains from InfluxDB by number or name
    const trainResults = debouncedQ.length >= 1
        ? availableTrains.filter(t =>
            t.trainNumber.includes(debouncedQ) ||
            t.name.toLowerCase().includes(debouncedQ.toLowerCase())
        ).slice(0, 5)
        : []

    const stationResults = debouncedQ.length >= 1
        ? STATIONS.filter(s =>
            s.name.toLowerCase().includes(debouncedQ.toLowerCase()) ||
            s.code.toLowerCase().includes(debouncedQ.toLowerCase())
        ).slice(0, 5)
        : []

    function switchTab(t) { setTab(t); setQuery(''); setDebouncedQ(''); setDropdownOpen(false) }

    function pickTrain(train) {
        // Normalise: downstream code uses .trainNo
        onTrainSelect({ ...train, trainNo: train.trainNumber })
        setQuery('')
        setDropdownOpen(false)
    }
    function pickStation(station) { onStationSelect(station); setQuery(''); setDropdownOpen(false) }

    const hasSelection = selectedTrain || selectedStation

    return (
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-[#F0F6FC]">Check Crowd Levels</h2>
                <p className="text-sm text-[#8B949E] mt-0.5">Search any train or station to see live sensor headcount</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-[#21262D]">
                {[{ key: 'train', label: '🚆 Search by Train' }, { key: 'station', label: '📍 Search by Station' }].map(({ key, label }) => (
                    <button key={key} onClick={() => switchTab(key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px ${tab === key ? 'border-[#2F80ED] text-[#2F80ED]' : 'border-transparent text-[#8B949E] hover:text-[#F0F6FC]'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Selected chip */}
            {hasSelection && (
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/25">
                        <span className="text-xs font-semibold text-[#2F80ED]">
                            {selectedTrain
                                ? `🚆 ${selectedTrain.name} (${selectedTrain.trainNo || selectedTrain.trainNumber})`
                                : `📍 ${selectedStation.name} (${selectedStation.code})`}
                        </span>
                        <button onClick={onClear} className="text-[#2F80ED] hover:text-[#F0F6FC] transition-colors"><X size={13} /></button>
                    </div>
                    <span className="text-xs text-[#484F58]">showing filtered results below</span>
                </div>
            )}

            {/* Input + dropdown */}
            <div className="relative" ref={wrapperRef}>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/60 focus-within:shadow-[0_0_0_3px_rgba(47,128,237,0.1)] transition-all duration-200">
                    <Search size={16} className="text-[#484F58] flex-shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setDropdownOpen(true) }}
                        onFocus={() => { if (query.length >= 1) setDropdownOpen(true) }}
                        placeholder={tab === 'train' ? 'Enter train name or number…' : 'Enter station name or code…'}
                        className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                    />
                    {trainsLoading && tab === 'train' && <span className="text-[10px] text-[#484F58] animate-pulse">Loading…</span>}
                    {query && <button onClick={() => { setQuery(''); setDropdownOpen(false) }} className="text-[#484F58] hover:text-[#8B949E]"><X size={14} /></button>}
                </div>

                {dropdownOpen && debouncedQ.length >= 1 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {tab === 'train' ? (
                            trainsLoading ? (
                                <div className="px-4 py-5 text-center text-xs text-[#484F58] animate-pulse">Loading trains from InfluxDB…</div>
                            ) : trainResults.length > 0 ? trainResults.map(train => (
                                <button key={train.trainNumber} onMouseDown={() => pickTrain(train)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2F80ED]/5 transition-colors text-left border-b border-[#21262D] last:border-none">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center">
                                        <Train size={14} className="text-[#F97316]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">#{train.trainNumber}</span>
                                            <span className="text-sm font-semibold text-[#F0F6FC] truncate">{train.name}</span>
                                        </div>
                                        {(train.from || train.to) && (
                                            <p className="text-xs text-[#8B949E] mt-0.5">{train.from} → {train.to}</p>
                                        )}
                                        {train.coaches?.length > 0 && (
                                            <p className="text-[10px] text-[#484F58] mt-0.5">
                                                {train.coaches.length} coaches · {train.totalCount} people detected
                                            </p>
                                        )}
                                    </div>
                                    <span className="flex-shrink-0 text-[10px] text-[#22C55E] flex items-center gap-1"><Wifi size={9} />Live</span>
                                </button>
                            )) : (
                                <div className="px-4 py-5 text-center text-sm text-[#484F58]">No trains found matching "{debouncedQ}"</div>
                            )
                        ) : (
                            stationResults.length > 0 ? stationResults.map(station => (
                                <button key={station.code} onMouseDown={() => pickStation(station)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2F80ED]/5 transition-colors text-left border-b border-[#21262D] last:border-none">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center">
                                        <MapPin size={14} className="text-[#2F80ED]" />
                                    </div>
                                    <span className="flex-1 text-sm font-semibold text-[#F0F6FC]">{station.name}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2F80ED]/15 text-[#2F80ED] flex-shrink-0">{station.code}</span>
                                </button>
                            )) : (
                                <div className="px-4 py-5 text-center text-sm text-[#484F58]">No stations found matching "{debouncedQ}"</div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Static in-train train definitions ────────────────────────────────────────
const STATIC_TRAINS = [
    { trainNo: '11001', name: 'Deccan Express', from: 'Mumbai CST', to: 'Pune' },
    { trainNo: '12127', name: 'Intercity Express', from: 'Pune', to: 'Mumbai CST' },
    { trainNo: '22109', name: 'Mumbai CSMT - Madgaon', from: 'Mumbai CST', to: 'Madgaon' },
]

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function CrowdMonitor() {
    const location = useLocation()
    const { crowdData, isLoading, isError, isLive, lastFetched, fetchForTrain, fetchForStation, refreshData } = useSensor()

    const [selectedTrain, setSelectedTrain] = useState(null)
    const [selectedStation, setSelectedStation] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [refreshedMsg, setRefreshedMsg] = useState(false)

    // Auto-fetch if navigated from SearchTrain with a train in router state
    useEffect(() => {
        const passedTrainNo = location.state?.selectedTrainNo
        if (passedTrainNo) {
            const train = mockTrains.find(t => t.trainNo === passedTrainNo)
            if (train) { setSelectedTrain(train); fetchForTrain(passedTrainNo) }
        }
    }, []) // eslint-disable-line

    function handleTrainSelect(train) {
        setSelectedTrain(train)
        setSelectedStation(null)
        fetchForTrain(train.trainNo || train.trainNumber)
    }
    function handleStationSelect(station) {
        setSelectedStation(station)
        setSelectedTrain(null)
        fetchForStation(station.code)
    }
    function handleClear() { setSelectedTrain(null); setSelectedStation(null) }

    async function handleRefresh() {
        setRefreshing(true)
        await refreshData()
        setRefreshing(false)
        setRefreshedMsg(true)
        setTimeout(() => setRefreshedMsg(false), 3000)
    }

    // If the selected train is in STATIC_TRAINS, use TrainSensorCard.
    // If it's a DB-only train (e.g. 12626), show live crowdData directly.
    const selectedTrainNo = selectedTrain?.trainNo || selectedTrain?.trainNumber
    const isStaticTrain = selectedTrain && STATIC_TRAINS.some(t => t.trainNo === selectedTrainNo)
    const displayedTrains = selectedTrain
        ? (isStaticTrain ? STATIC_TRAINS.filter(t => t.trainNo === selectedTrainNo) : [])
        : STATIC_TRAINS

    function getLive(trainNo) {
        if (selectedTrain && (selectedTrain.trainNo === trainNo || selectedTrain.trainNumber === trainNo) && crowdData.length > 0) return crowdData
        return null
    }

    const criticalCount = STATIC_TRAINS.filter(t => {
        const d = sensorData[t.trainNo]
        if (!d) return false
        const pct = Math.round(d.coaches.reduce((s, c) => s + c.occupancy, 0) / d.totalCapacity * 100)
        return pct >= 85
    }).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#F0F6FC]">Crowd Monitor</h1>
                    <p className="text-sm text-[#8B949E] mt-1">Real-time crowd density — stations &amp; trains via IoT sensors</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <DataSourceChip isLive={isLive} />
                    {refreshedMsg && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} />Updated just now
                        </span>
                    )}
                    <button onClick={handleRefresh} disabled={refreshing || isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161B22] border border-[#21262D] hover:border-[#2F80ED]/40 text-[#8B949E] hover:text-[#F0F6FC] text-xs font-medium transition-all disabled:opacity-50">
                        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />Refresh
                    </button>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-xs font-bold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]" />
                        </span>
                        MONITORING
                    </span>
                </div>
            </div>

            {/* Error banner */}
            {isError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F97316]/5 border border-[#F97316]/20">
                    <WifiOff size={15} className="text-[#F97316] flex-shrink-0" />
                    <p className="text-xs text-[#8B949E]">
                        <span className="text-[#F97316] font-semibold">⚠️ Live sensor unavailable</span> — showing estimated data. Retrying every 10s.
                    </p>
                </div>
            )}

            {/* Search */}
            <CrowdSearchSection
                onTrainSelect={handleTrainSelect}
                onStationSelect={handleStationSelect}
                onClear={handleClear}
                selectedTrain={selectedTrain}
                selectedStation={selectedStation}
            />

            {/* Station result */}
            {selectedStation && <StationCrowdResult station={selectedStation} loading={isLoading} />}

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                {[
                    { color: 'bg-[#22C55E]', label: 'Low (0–40%)' },
                    { color: 'bg-[#FACC15]', label: 'Moderate (40–70%)' },
                    { color: 'bg-[#F97316]', label: 'High (70–85%)' },
                    { color: 'bg-[#EF4444]', label: 'Critical (85–100%)' },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-xs text-[#8B949E]">{label}</span>
                    </div>
                ))}
            </div>

            {/* Station Crowd Levels */}
            {!selectedStation && (
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#2F80ED]" />
                            <h2 className="text-base font-semibold text-[#F0F6FC]">Station Crowd Levels</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#484F58]">
                            <BarChart3 size={13} />Sensor data
                        </div>
                    </div>
                    <div className="space-y-4">
                        <CrowdBar station="Mumbai CST" level="Critical" color="bg-[#EF4444]" percentage={92} />
                        <CrowdBar station="Dadar" level="High" color="bg-[#F97316]" percentage={78} />
                        <CrowdBar station="Thane" level="High" color="bg-[#F97316]" percentage={74} />
                        <CrowdBar station="Kurla" level="Moderate" color="bg-[#FACC15]" percentage={55} />
                        <CrowdBar station="Pune Jn." level="Low" color="bg-[#22C55E]" percentage={30} />
                        <CrowdBar station="Lokmanya TTM" level="Moderate" color="bg-[#FACC15]" percentage={48} />
                    </div>
                </div>
            )}

            {/* In-Train Crowd — DB train live panel (shown when a DB train is selected) */}
            {selectedTrain && !isStaticTrain && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Train size={16} className="text-[#F97316]" />
                            <h2 className="text-base font-semibold text-[#F0F6FC]">
                                {selectedTrain.name || `Train ${selectedTrainNo}`}
                            </h2>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316]">#{selectedTrainNo}</span>
                        </div>
                        <button onClick={handleClear} className="text-xs text-[#484F58] hover:text-[#EF4444] flex items-center gap-1 transition-colors">
                            <X size={12} /> Clear selection
                        </button>
                    </div>

                    {/* Loading skeletons */}
                    {isLoading && (
                        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 space-y-4">
                            <div className="flex gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-lg bg-[#21262D]" style={{ width: 64, height: 52 }} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="animate-pulse rounded bg-[#21262D] w-16 h-4" />
                                        <div className="animate-pulse rounded-full bg-[#21262D] flex-1 h-2" />
                                        <div className="animate-pulse rounded bg-[#21262D] w-10 h-4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live coach data from InfluxDB */}
                    {!isLoading && crowdData.length > 0 && (() => {
                        const totalOcc = crowdData.reduce((s, c) => s + c.currentCount, 0)
                        const totalCap = crowdData.reduce((s, c) => s + c.capacity, 0)
                        const pct = totalCap > 0 ? Math.round(totalOcc / totalCap * 100) : 0
                        const colorBg = pct >= 85 ? 'bg-[#EF4444]' : pct >= 70 ? 'bg-[#F97316]' : pct >= 40 ? 'bg-[#FACC15]' : 'bg-[#22C55E]'
                        const colorTx = pct >= 85 ? 'text-[#EF4444]' : pct >= 70 ? 'text-[#F97316]' : pct >= 40 ? 'text-[#FACC15]' : 'text-[#22C55E]'
                        return (
                            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                                {/* Summary bar */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                                        </span>
                                        <span className="text-xs font-bold text-[#22C55E]">LIVE</span>
                                        <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">📡 Live Sensor Data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-black ${colorTx}`}>{pct}%</span>
                                        <span className="text-xs text-[#8B949E]">{totalOcc}/{totalCap} people</span>
                                    </div>
                                </div>

                                {/* Overall bar */}
                                <div className="w-full h-2.5 bg-[#21262D] rounded-full overflow-hidden mb-4">
                                    <div className={`h-full rounded-full transition-all duration-700 ${colorBg}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>

                                {/* Coach diagram grid */}
                                <p className="text-[10px] uppercase tracking-widest text-[#484F58] font-semibold mb-2">Coach Overview</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {crowdData.map(c => {
                                        const r = c.occupancyRatio ?? (c.currentCount / c.capacity)
                                        const p = Math.round(r * 100)
                                        const bg = p > 90 ? '#EF4444' : p > 80 ? '#F97316' : p > 65 ? '#FACC15' : p > 40 ? '#2F80ED' : '#22C55E'
                                        const tx = (p > 65 && p <= 80) || p <= 40 ? '#111' : '#fff'
                                        return (
                                            <div key={c.compartmentId}
                                                className="flex flex-col items-center justify-center rounded-xl p-2 min-w-[64px] cursor-default select-none"
                                                style={{ backgroundColor: bg }}
                                                title={`${c.compartmentId}: ${c.currentCount} people (${p}%)`}
                                            >
                                                <span className="text-[11px] font-black leading-tight" style={{ color: tx }}>{c.compartmentId}</span>
                                                <span className="text-xs font-bold leading-tight" style={{ color: tx }}>{c.currentCount}</span>
                                                <span className="text-[9px] leading-tight" style={{ color: tx }}>{p}%</span>
                                            </div>
                                        )
                                    })}
                                    <div className="flex items-center justify-center w-10">
                                        <Train size={18} className="text-[#484F58]" />
                                    </div>
                                </div>

                                {/* Per-coach breakdown table */}
                                <p className="text-[10px] uppercase tracking-widest text-[#484F58] font-semibold mb-2">Coach-wise Breakdown</p>
                                <div className="space-y-2">
                                    {crowdData.map(c => {
                                        const r = c.occupancyRatio ?? (c.currentCount / c.capacity)
                                        const p = Math.round(r * 100)
                                        const tCls = p >= 85 ? 'text-[#EF4444]' : p >= 70 ? 'text-[#F97316]' : p >= 40 ? 'text-[#FACC15]' : 'text-[#22C55E]'
                                        const bCls = p >= 85 ? 'bg-[#EF4444]' : p >= 70 ? 'bg-[#F97316]' : p >= 40 ? 'bg-[#FACC15]' : 'bg-[#22C55E]'
                                        const status = c.boardingStatus || (p < 40 ? 'Board Now' : p < 65 ? 'Comfortable' : p < 80 ? 'Filling Up' : p < 90 ? 'Almost Full' : 'Avoid')
                                        return (
                                            <div key={c.compartmentId} className="flex items-center gap-3">
                                                <div className="w-12 flex-shrink-0">
                                                    <p className="text-xs font-bold text-[#F0F6FC]">{c.compartmentId}</p>
                                                    <p className="text-[10px] text-[#484F58]">{c.coachType}</p>
                                                </div>
                                                <div className="flex-1 h-2 bg-[#21262D] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${bCls}`} style={{ width: `${Math.min(p, 100)}%` }} />
                                                </div>
                                                <span className={`text-xs font-bold w-9 text-right flex-shrink-0 ${tCls}`}>{p}%</span>
                                                <span className={`text-[10px] font-semibold w-20 text-right hidden sm:inline flex-shrink-0 ${tCls}`}>{status}</span>
                                                <span className="text-[10px] text-[#484F58] w-16 text-right hidden lg:inline flex-shrink-0">{c.currentCount} people</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Best / worst */}
                                {crowdData.length > 1 && (() => {
                                    const best = crowdData.reduce((a, b) => a.currentCount < b.currentCount ? a : b)
                                    const worst = crowdData.reduce((a, b) => a.currentCount > b.currentCount ? a : b)
                                    return (
                                        <div className="flex gap-3 mt-4 flex-wrap">
                                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#22C55E]/5 border border-[#22C55E]/15">
                                                <CheckCircle2 size={14} className="text-[#22C55E] flex-shrink-0" />
                                                <div><p className="text-[10px] text-[#484F58]">Best coach</p><p className="text-sm font-bold text-[#22C55E]">{best.compartmentId} — {best.currentCount} people</p></div>
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15">
                                                <AlertTriangle size={14} className="text-[#EF4444] flex-shrink-0" />
                                                <div><p className="text-[10px] text-[#484F58]">Most crowded</p><p className="text-sm font-bold text-[#EF4444]">{worst.compartmentId} — {worst.currentCount} people</p></div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        )
                    })()}

                    {/* No live data yet */}
                    {!isLoading && crowdData.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-10 bg-[#161B22] rounded-xl border border-dashed border-[#21262D]">
                            <WifiOff size={22} className="text-[#484F58]" />
                            <p className="text-sm text-[#484F58]">No live sensor data for train #{selectedTrainNo}</p>
                            <button onClick={() => fetchForTrain(selectedTrainNo)} className="text-xs text-[#2F80ED] hover:underline">Retry fetch</button>
                        </div>
                    )}
                </div>
            )}

            {/* In-Train Crowd — Static trains (shown when no DB train is selected) */}
            {(!selectedTrain || isStaticTrain) && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Train size={16} className="text-[#F97316]" />
                            <h2 className="text-base font-semibold text-[#F0F6FC]">In-Train Crowd</h2>
                            <span className="text-xs text-[#484F58]">— IoT sensors per coach</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {criticalCount > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold">
                                    <AlertTriangle size={10} />{criticalCount} critical
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                                <Wifi size={10} />{STATIC_TRAINS.length} trains live
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#2F80ED]/5 border border-[#2F80ED]/15">
                        <Activity size={14} className="text-[#2F80ED] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[#8B949E] leading-relaxed">
                            <span className="text-[#2F80ED] font-semibold">IoT sensors</span> placed in each coach transmit occupancy counts every 30 seconds via InfluxDB. Tap a train to see per-coach breakdown.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {displayedTrains.map(train => (
                            <TrainSensorCard
                                key={train.trainNo}
                                trainDef={train}
                                liveCompartments={getLive(train.trainNo)}
                                globalLoading={isLoading && selectedTrain?.trainNo === train.trainNo}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Alerts */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-[#EF4444]" />
                    <h2 className="text-base font-semibold text-[#F0F6FC]">Active Crowd Alerts</h2>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-xs font-bold">{criticalCount + 3}</span>
                </div>
                <div className="space-y-2">
                    {[
                        { icon: '🏛️', title: 'Mumbai CST — Platform overcrowding', sub: 'Station crowd at 92% · Rerouting advised', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/5', border: 'border-[#EF4444]/15' },
                        { icon: '🚂', title: 'Deccan Express #11001 — GEN-1 coach full', sub: 'Coach at 98% · Sensor: SN-G1', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/5', border: 'border-[#EF4444]/15' },
                        { icon: '🚂', title: 'Deccan Express #11001 — B1 coach full', sub: 'Coach at 100% · Sensor: SN-B1', color: 'text-[#F97316]', bg: 'bg-[#F97316]/5', border: 'border-[#F97316]/15' },
                        { icon: '🏛️', title: 'Dadar — High crowd density', sub: 'Station crowd at 78%', color: 'text-[#F97316]', bg: 'bg-[#F97316]/5', border: 'border-[#F97316]/15' },
                    ].map(({ icon, title, sub, color, bg, border }) => (
                        <div key={title} className={`flex items-start gap-3 px-4 py-3 rounded-xl ${bg} border ${border}`}>
                            <span className="text-base flex-shrink-0">{icon}</span>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${color} truncate`}>{title}</p>
                                <p className="text-xs text-[#8B949E] mt-0.5">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom grid */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-[#2F80ED]" />
                        <h2 className="text-base font-semibold text-[#F0F6FC]">Zone Map</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[#21262D] min-h-[120px]">
                        <Zap size={18} className="text-[#484F58]" />
                        <p className="text-sm text-[#484F58] font-medium text-center">Interactive zone map coming in next phase</p>
                    </div>
                </div>
                <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-[#F97316]" />
                        <h2 className="text-base font-semibold text-[#F0F6FC]">Trend Analysis</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[#21262D] min-h-[120px]">
                        <Zap size={18} className="text-[#484F58]" />
                        <p className="text-sm text-[#484F58] font-medium text-center">Hourly crowd trend charts coming in next phase</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
