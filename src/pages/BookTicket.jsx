import { useState, useEffect } from 'react'
import { Ticket, CalendarDays, Users, ArrowRight, MapPin, Zap, Train, Loader2, CheckCircle2, Tag, Layers } from 'lucide-react'
import { getTrainsBetween } from '../services/railRadarService'

// Decode runningDaysBitmap: bit 0 = Mon, bit 1 = Tue … bit 6 = Sun
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
function decodeRunningDays(bitmap) {
    if (!bitmap && bitmap !== 0) return []
    return DAY_LABELS.filter((_, i) => bitmap & (1 << i))
}

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
    { code: 'GN', label: 'General', price: '₹50 - ₹150' },
    { code: 'SL', label: 'Sleeper', price: '₹350 - ₹550' },
    { code: '3A', label: '3-Tier AC', price: '₹950 - ₹1200' },
    { code: '2A', label: '2-Tier AC', price: '₹1400 - ₹1800' },
]

export default function BookTicket() {
    const [fromStation, setFromStation] = useState('')
    const [toStation, setToStation] = useState('')
    const [date, setDate] = useState('')
    const [passengers, setPassengers] = useState(1)
    const [selectedClass, setSelectedClass] = useState('GN')

    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem('traq_bookings')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('traq_bookings', JSON.stringify(bookings))
    }, [bookings])

    const handleSearch = async () => {
        if (!fromStation || !toStation) {
            setError('Please enter both source and destination stations')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await getTrainsBetween(fromStation.toUpperCase(), toStation.toUpperCase())
            if (response && response.success && response.data && response.data.trains) {
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

    const handleBookGeneralTicket = (train) => {
        const newBooking = {
            id: Math.random().toString(36).substr(2, 9),
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            from: train.sourceStationCode || fromStation.toUpperCase(),
            to: train.destinationStationCode || toStation.toUpperCase(),
            date: date || new Date().toISOString().split('T')[0],
            passengers: passengers,
            class: 'General (GN)',
            timestamp: new Date().toLocaleString(),
            status: 'Confirmed'
        }
        setBookings([newBooking, ...bookings])
        alert(`General ticket booked for ${train.trainName} (${train.trainNumber})`)
    }

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
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/40 transition-colors">
                                <MapPin size={15} className="text-[#484F58]" />
                                <input
                                    type="text"
                                    placeholder="Origin (e.g. NDLS)"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                                    value={fromStation}
                                    onChange={(e) => setFromStation(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">To</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/40 transition-colors">
                                <MapPin size={15} className="text-[#484F58]" />
                                <input
                                    type="text"
                                    placeholder="Destination (e.g. BCT)"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                                    value={toStation}
                                    onChange={(e) => setToStation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date + Passengers */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Journey Date</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/40 transition-colors">
                                <CalendarDays size={15} className="text-[#484F58]" />
                                <input
                                    type="date"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] outline-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-[#484F58] tracking-widest">Passengers</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] focus-within:border-[#2F80ED]/40 transition-colors">
                                <Users size={15} className="text-[#484F58]" />
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    placeholder="1"
                                    className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none"
                                    value={passengers}
                                    onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(47,128,237,0.4)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                        {loading ? 'Searching...' : 'Search Available Trains'}
                        <ArrowRight size={14} />
                    </button>

                    {error && (
                        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
                    )}
                </div>
            </div>

            {/* ── Train Results ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Available Trains</h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-3 text-[#484F58]">
                        <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
                        <p className="text-sm font-medium">Fetching real-time train data...</p>
                    </div>
                ) : trains.length > 0 ? (
                    <div className="space-y-3">
                        {trains.map((train) => {
                            const runningDays = decodeRunningDays(train.runningDaysBitmap)
                            return (
                                <div key={train.trainNumber} className="rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 transition-all overflow-hidden group">

                                    {/* ── Top bar: number + name + badges ── */}
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

                                    {/* ── Actions ── */}
                                    <div className="flex items-center gap-2 px-4 pb-3">
                                        <button
                                            onClick={() => handleBookGeneralTicket(train)}
                                            className="flex-1 py-2 rounded-lg bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-bold transition-all hover:shadow-[0_0_12px_rgba(46,160,67,0.3)]"
                                        >
                                            Book General Ticket
                                        </button>
                                        <button className="px-4 py-2 rounded-lg border border-[#21262D] hover:border-[#8B949E] text-[#8B949E] hover:text-[#F0F6FC] text-xs font-bold transition-all">
                                            View Seats
                                        </button>
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
