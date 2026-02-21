import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CreditCard, Ticket, Star, Shield, Zap,
    QrCode, Hash, ChevronRight, ClipboardList,
    CheckCircle2, Loader2, AlertTriangle, LogOut, ScanLine,
    Train, ArrowRight, Bluetooth, BluetoothConnected, BluetoothOff, RefreshCw,
} from 'lucide-react'
import {
    connectToCard, disconnectCard, isConnected as bleIsConnected,
    getDeviceName, writeToCard, tryAutoConnect, sendTicketsToCard,
} from '../services/bleService'
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth'
import {
    doc, setDoc, getDoc, serverTimestamp,
    collection, query, where, orderBy, getDocs,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// STEP CONSTANTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STEP_CONNECT = 'connect'
const STEP_SIGNIN = 'signin'
const STEP_DONE = 'done'

// â”€â”€ Train type metadata (mirrors GeneralTicket.jsx) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TRAIN_TYPES = [
    { code: 'ORD', label: 'Ordinary', fare: 30, color: '#8B949E' },
    { code: 'MEMU', label: 'MEMU', fare: 45, color: '#22C55E' },
    { code: 'PASS', label: 'Passenger', fare: 35, color: '#6B7280' },
    { code: 'EXP', label: 'Express', fare: 75, color: '#2F80ED' },
    { code: 'SF', label: 'Superfast', fare: 110, color: '#F97316' },
]

// â”€â”€ Premium Ticket Card Visual (Matches GeneralTicket.jsx) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TicketCard({ booking }) {
    const type = TRAIN_TYPES.find(t => t.code === booking.trainType) || TRAIN_TYPES[0]

    return (
        <div className="relative w-full max-w-md mx-auto select-none" style={{ fontFamily: "'Courier New', monospace" }}>
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.8)]"
                style={{ background: 'linear-gradient(135deg, #161B22 0%, #0D1117 100%)', border: `1px solid ${type.color}40` }}>

                {/* Header band */}
                <div className="px-5 py-3 flex items-center justify-between"
                    style={{ background: `linear-gradient(90deg, ${type.color}22 0%, ${type.color}08 100%)`, borderBottom: `1px solid ${type.color}30` }}>
                    <div className="flex items-center gap-2">
                        <Train size={16} style={{ color: type.color }} />
                        <span className="text-xs font-black tracking-widest uppercase" style={{ color: type.color }}>
                            Indian Railways
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: `${type.color}20`, color: type.color, border: `1px solid ${type.color}40` }}>
                            {type.label.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-bold text-[#484F58]">GENERAL</span>
                    </div>
                </div>

                {/* Main body */}
                <div className="px-5 pt-4 pb-0">
                    {/* Route */}
                    <div className="flex items-stretch gap-3 mb-4">
                        <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">From</p>
                            <p className="text-2xl font-black text-[#F0F6FC] leading-none">{booking.from}</p>
                            <p className="text-[10px] text-[#8B949E] mt-0.5">{booking.departure || 'â€”'}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 px-1">
                            <div className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${type.color}, transparent)` }} />
                            <ArrowRight size={14} style={{ color: type.color }} />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">To</p>
                            <p className="text-2xl font-black text-[#F0F6FC] leading-none">{booking.to}</p>
                            <p className="text-[10px] text-[#8B949E] mt-0.5">{booking.arrival || 'â€”'}</p>
                        </div>
                    </div>

                    {/* Details grid */}
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

                {/* Perforation line */}
                <div className="relative my-0 flex items-center">
                    <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#0D1117] border-r" style={{ borderColor: `${type.color}30` }} />
                    <div className="flex-1 mx-3 border-t border-dashed" style={{ borderColor: `${type.color}30` }} />
                    <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#0D1117] border-l" style={{ borderColor: `${type.color}30` }} />
                </div>

                {/* Stub */}
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="shrink-0 p-2 rounded-lg" style={{ background: `${type.color}10`, color: type.color }}>
                        <QRPlaceholder size={60} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">Ticket ID</p>
                            <p className="text-[11px] font-black text-[#F0F6FC] tracking-wider">{booking.id?.toUpperCase()}</p>
                        </div>
                        {booking.cardNo && (
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58]">Card</p>
                                <p className="text-[10px] font-bold text-[#2F80ED] font-mono">â€¢â€¢â€¢â€¢ {booking.cardNo.slice(-4)}</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-[#238636]" />
                            <span className="text-[10px] font-bold text-[#238636]">Confirmed</span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">Fare</p>
                        <p className="text-2xl font-black leading-none" style={{ color: type.color }}>â‚¹{booking.fare}</p>
                        <p className="text-[9px] text-[#484F58] mt-0.5">incl. all taxes</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€ Mini QR placeholder (16Ã—16 dots) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN RAILWAY CARD PAGE  (single page â€” no multi-step wizard)
// Auth: Google sign-in   BLE: hardcoded to RCARD0000011
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function RailwayCard() {
    const navigate = useNavigate()
    const [userData, setUserData] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authErr, setAuthErr] = useState('')

    // â”€â”€ BLE state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [bleConnected, setBleConnected] = useState(() => bleIsConnected())
    const [bleName, setBleName] = useState(() => getDeviceName())
    const [bleStatus, setBleStatus] = useState('idle')  // idle|auto|connecting|error
    const [bleErr, setBleErr] = useState('')

    function refreshBleStatus() {
        setBleConnected(bleIsConnected())
        setBleName(getDeviceName())
    }

    // â”€â”€ Tickets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [tickets, setTickets] = useState([])
    const [ticketsLoading, setTicketsLoading] = useState(false)
    const [ticketsErr, setTicketsErr] = useState('')
    const [ticketsOpen, setTicketsOpen] = useState(false)

    // â”€â”€ Per-ticket write â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [writingId, setWritingId] = useState(null)
    const [writeResult, setWriteResult] = useState({})

    // â”€â”€ Bulk send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [bleSendStatus, setBleSendStatus] = useState('idle')
    const [bleSendProgress, setBleSendProgress] = useState({ sent: 0, total: 0 })
    const [bleSendErr, setBleSendErr] = useState('')

    // â”€â”€ Connect to RCARD0000011 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    async function handleBleConnect() {
        setBleStatus('connecting')
        setBleErr('')
        try {
            const name = await connectToCard({ onDisconnected: () => { refreshBleStatus(); setBleSendStatus('idle') } })
            setBleName(name)
            setBleConnected(true)
            setBleStatus('idle')
            // Push tickets immediately after connecting
            if (tickets.length > 0) setTimeout(() => sendAllTickets(tickets), 400)
        } catch (e) {
            setBleStatus('error')
            setBleErr(e.message || 'Could not connect to RCARD0000011')
        }
    }

    // â”€â”€ Auto-connect on mount (silent, no picker) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!userData || bleIsConnected()) return
        setBleStatus('auto')
        tryAutoConnect(() => { refreshBleStatus(); setBleSendStatus('idle') })
            .then(name => {
                if (name) {
                    setBleName(name); setBleConnected(true)
                    console.info('[BLE] Auto-connected to', name)
                }
            })
            .catch(() => { })
            .finally(() => setBleStatus('idle'))
    }, [userData?.uid])

    // â”€â”€ Send all tickets to RCARD0000011 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    async function sendAllTickets(ticketList) {
        const list = ticketList ?? tickets
        if (!list.length || !bleIsConnected()) {
            setBleSendStatus('error')
            setBleSendErr(list.length === 0 ? 'No tickets to send.' : 'Card not connected. Connect first.')
            return
        }
        setBleSendStatus('sending')
        setBleSendProgress({ sent: 0, total: list.length })
        setBleSendErr('')
        try {
            await sendTicketsToCard(list, (sent, total) => setBleSendProgress({ sent, total }))
            setBleSendStatus('done')
        } catch (e) {
            setBleSendStatus('error')
            setBleSendErr(e.message || 'Failed to send tickets to card.')
        }
    }

    // â”€â”€ Google sign in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    async function handleGoogleSignIn() {
        setAuthErr('')
        setAuthLoading(true)
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            try {
                const ref = doc(db, 'railcard_users', user.uid)
                const snap = await getDoc(ref)
                const payload = {
                    uid: user.uid, email: user.email,
                    name: user.displayName, photo: user.photoURL,
                    cardId: 'RCARD0000011', lastLogin: serverTimestamp(),
                }
                await setDoc(ref, snap.exists() ? payload : { ...payload, createdAt: serverTimestamp() }, { merge: true })
            } catch (fsErr) {
                if (fsErr.code !== 'permission-denied') throw fsErr
                console.warn('[RailwayCard] Firestore permission-denied â€” proceeding anyway.')
            }
            setUserData({ uid: user.uid, email: user.email, name: user.displayName, photo: user.photoURL })
        } catch (e) {
            if (!e.code?.includes('popup-closed') && !e.code?.includes('cancelled')) {
                setAuthErr(e.message || 'Google sign-in failed.')
            }
        } finally {
            setAuthLoading(false)
        }
    }

    async function handleSignOut() {
        await signOut(auth)
        setUserData(null)
        disconnectCard()
        refreshBleStatus()
        setTickets([])
        setBleSendStatus('idle')
    }

    // â”€â”€ Restore session on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async user => {
            if (user) {
                try {
                    const snap = await getDoc(doc(db, 'railcard_users', user.uid))
                    const d = snap.exists() ? snap.data() : {}
                    setUserData({ uid: user.uid, email: d.email || user.email, name: d.name || user.displayName, photo: d.photo || user.photoURL })
                } catch {
                    setUserData({ uid: user.uid, email: user.email, name: user.displayName, photo: user.photoURL })
                }
            }
            setAuthChecked(true)
        })
        return unsub
    }, [])

    // â”€â”€ Fetch tickets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!userData?.uid) return
        setTicketsLoading(true)
        setTicketsErr('')
        const q = query(collection(db, 'bookings'), where('uid', '==', userData.uid))
        getDocs(q)
            .then(snap => {
                const results = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }))
                results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                setTickets(results)
                if (results.length > 0 && bleIsConnected()) setTimeout(() => sendAllTickets(results), 600)
            })
            .catch(e => setTicketsErr(e.message.includes('index') ? 'Firestore index buildingâ€¦' : 'Failed to load tickets.'))
            .finally(() => setTicketsLoading(false))
    }, [userData?.uid])

    // â”€â”€ Loading spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!authChecked) return (
        <div className="flex items-center justify-center min-h-64">
            <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
        </div>
    )

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // NOT SIGNED IN
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (!userData) return (
        <div className="space-y-6 max-w-md mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2">
                    <CreditCard size={22} className="text-[#2F80ED]" /> Railway Card
                </h1>
                <p className="text-sm text-[#8B949E] mt-1">Sign in to push your ticket data to RCARD0000011 via Bluetooth.</p>
            </div>

            {/* ESP card visual */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0D1117] border border-[#2F80ED]/20">
                    <div className="w-12 h-12 rounded-xl bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center shrink-0">
                        <Bluetooth size={22} className="text-[#2F80ED]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">Railway Card Device</p>
                        <p className="text-sm font-mono font-bold text-[#F0F6FC]">RCARD0000011</p>
                        <p className="text-[11px] text-[#484F58]">ESP32 BLE â€” ticket store</p>
                    </div>
                    <div className="ml-auto">
                        <span className="text-[10px] font-bold text-[#484F58] bg-[#21262D] px-2 py-0.5 rounded-full">Permanent ID</span>
                    </div>
                </div>

                <p className="text-xs text-[#484F58] text-center">Sign in with Google â€” tickets in your account will be automatically pushed to this card once connected.</p>

                {authErr && (
                    <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                        <AlertTriangle size={12} className="shrink-0" />{authErr}
                    </p>
                )}

                <button
                    id="google-signin-btn"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold transition-all hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200">
                    {authLoading ? <Loader2 size={18} className="animate-spin text-gray-500" /> : (
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                    )}
                    {authLoading ? 'Signing inâ€¦' : 'Continue with Google'}
                </button>

                <div className="flex items-start gap-2 text-[11px] text-[#484F58]">
                    <Shield size={12} className="text-[#238636] shrink-0 mt-0.5" />
                    <span>We only read your name, email, and photo from Google. No passwords stored.</span>
                </div>
            </div>
        </div>
    )

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SIGNED IN â€” main dashboard
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // â”€â”€ Authenticated card UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <div className="space-y-6">
            {/* â”€â”€ Page Header â”€â”€ */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#F0F6FC]">Railway Card</h1>
                    <p className="text-sm text-[#8B949E] mt-1">
                        Signed in as <span className="text-[#2F80ED]">{userData?.email}</span>
                    </p>
                </div>
                <button onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-[11px] text-[#484F58] hover:text-[#DA3633] border border-[#21262D] hover:border-[#DA3633]/40 px-3 py-1.5 rounded-lg transition-all">
                    <LogOut size={12} /> Sign out
                </button>
            </div>

            {/* â”€â”€ Verified badge â”€â”€ */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#238636]/10 border border-[#238636]/25 w-fit">
                {userData?.photo ? (
                    <img src={userData.photo} alt={userData.name} className="w-6 h-6 rounded-full ring-1 ring-[#238636]/40" />
                ) : (
                    <CheckCircle2 size={13} className="text-[#238636]" />
                )}
                <span className="text-xs font-bold text-[#238636]">Google Verified</span>
                <span className="text-xs text-[#484F58]">Â· {userData?.name}</span>
            </div>

            {/* â”€â”€ Card Visual â”€â”€ */}
            <div className="relative w-full max-w-sm mx-auto sm:mx-0">
                <div className="relative overflow-hidden rounded-2xl p-6 select-none"
                    style={{
                        background: 'linear-gradient(135deg, #1a3a6f 0%, #2F80ED 50%, #0d2a57 100%)',
                        boxShadow: '0 20px 60px rgba(47, 128, 237, 0.35)',
                    }}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

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

                    {/* ESP device ID on card */}
                    <div className="relative z-10 mb-6">
                        <p className="text-[10px] text-blue-200/50 uppercase tracking-widest mb-1">ESP Device ID</p>
                        <p className="text-2xl font-black text-white font-mono tracking-tight">RCARD0000011</p>
                    </div>

                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <p className="text-xs text-blue-200/50">Account</p>
                            <p className="text-sm font-semibold text-white truncate max-w-[140px]">{userData?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-200/50">BLE Status</p>
                            <p className={`text-sm font-bold ${bleConnected ? 'text-green-300' : 'text-blue-200/50'}`}>
                                {bleConnected ? 'â— Connected' : 'â—‹ Not paired'}
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6">
                        <Bluetooth size={28} className="text-blue-100/20" />
                    </div>
                </div>
            </div>

            {/* â”€â”€ Quick Actions â”€â”€ */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    id="quick-view-tickets"
                    onClick={() => setTicketsOpen(o => !o)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#161B22] border transition-all duration-200 group
                        ${ticketsOpen
                            ? 'border-[#2F80ED]/60 bg-[#1a2332] shadow-[0_0_16px_rgba(47,128,237,0.12)]'
                            : 'border-[#2F80ED]/20 hover:bg-[#1a2332] hover:border-[#2F80ED]/50'}`}>
                    <div className="w-11 h-11 rounded-xl bg-[#2F80ED]/10 flex items-center justify-center group-hover:bg-[#2F80ED]/20 transition-colors">
                        <ClipboardList size={20} className="text-[#2F80ED]" />
                    </div>
                    <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#F0F6FC] text-center leading-tight transition-colors">View Booked Tickets</span>
                </button>

                <button
                    id="quick-book-ticket"
                    onClick={() => navigate('/book')}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#161B22] border border-[#238636]/20 hover:bg-[#162a1e] hover:border-[#238636]/50 transition-all duration-200 group">
                    <div className="w-11 h-11 rounded-xl bg-[#238636]/10 flex items-center justify-center group-hover:bg-[#238636]/20 transition-colors">
                        <Ticket size={20} className="text-[#238636]" />
                    </div>
                    <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#F0F6FC] text-center leading-tight transition-colors">Book Tickets</span>
                </button>

                <button
                    id="quick-fav-routes"
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#161B22] border border-[#FACC15]/20 hover:bg-[#1e1c10] hover:border-[#FACC15]/50 transition-all duration-200 group">
                    <div className="w-11 h-11 rounded-xl bg-[#FACC15]/10 flex items-center justify-center group-hover:bg-[#FACC15]/20 transition-colors">
                        <Star size={20} className="text-[#FACC15]" />
                    </div>
                    <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#F0F6FC] text-center leading-tight transition-colors">Favourite Routes</span>
                </button>
            </div>

            {/* â”€â”€ Booked Tickets Panel â”€â”€ */}
            {ticketsOpen && (
                <div id="booked-tickets-panel" className="bg-[#161B22] border border-[#21262D] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262D]">
                        <div className="flex items-center gap-2">
                            <ClipboardList size={16} className="text-[#2F80ED]" />
                            <h2 className="text-sm font-bold text-[#F0F6FC]">Booked Tickets</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {ticketsLoading
                                ? <Loader2 size={14} className="animate-spin text-[#484F58]" />
                                : <span className="text-[10px] font-bold text-[#8B949E] bg-[#21262D] px-2 py-0.5 rounded-full">
                                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                                </span>
                            }
                            <button
                                onClick={() => navigate('/book')}
                                className="text-[11px] font-bold text-[#2F80ED] hover:underline flex items-center gap-1">
                                + Book new
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {ticketsLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
                            </div>
                        )}

                        {ticketsErr && (
                            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                                <AlertTriangle size={20} className="text-[#EF4444]" />
                                <p className="text-xs text-[#EF4444] font-medium">{ticketsErr}</p>
                            </div>
                        )}

                        {!ticketsLoading && !ticketsErr && tickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                                <div className="w-12 h-12 rounded-xl bg-[#0D1117] border border-dashed border-[#21262D] flex items-center justify-center">
                                    <Ticket size={20} className="text-[#484F58]" />
                                </div>
                                <p className="text-sm text-[#484F58] font-medium">No tickets booked yet</p>
                                <button
                                    onClick={() => navigate('/book')}
                                    className="text-xs font-bold text-[#2F80ED] hover:underline flex items-center gap-1">
                                    Book your first ticket â†’
                                </button>
                            </div>
                        )}

                        {!ticketsLoading && !ticketsErr && tickets.map(b => {
                            const tId = b.id || b.firestoreId
                            const wStatus = writeResult[tId]
                            return (
                                <div key={b.firestoreId ?? b.id} className="space-y-2">
                                    <TicketCard booking={b} />
                                    <div className="flex items-center justify-end gap-2">
                                        {wStatus === 'ok' && (
                                            <span className="flex items-center gap-1 text-[11px] text-[#238636] font-bold">
                                                <CheckCircle2 size={12} /> Written to card
                                            </span>
                                        )}
                                        {wStatus === 'err' && (
                                            <span className="flex items-center gap-1 text-[11px] text-[#EF4444]">
                                                <AlertTriangle size={12} /> Write failed â€” connect card first
                                            </span>
                                        )}
                                        <button
                                            disabled={writingId === tId}
                                            onClick={async () => {
                                                setWritingId(tId)
                                                setWriteResult(prev => ({ ...prev, [tId]: undefined }))
                                                try {
                                                    await writeToCard(`TRAQ:TKT:${tId}`)
                                                    setWriteResult(prev => ({ ...prev, [tId]: 'ok' }))
                                                } catch {
                                                    setWriteResult(prev => ({ ...prev, [tId]: 'err' }))
                                                } finally {
                                                    setWritingId(null)
                                                }
                                            }}
                                            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${bleConnected
                                                ? 'border-[#2F80ED]/40 text-[#2F80ED] hover:bg-[#2F80ED]/10'
                                                : 'border-[#21262D] text-[#484F58] cursor-not-allowed opacity-50'
                                                }`}>
                                            {writingId === tId
                                                ? <><Loader2 size={11} className="animate-spin" /> Writingâ€¦</>
                                                : <><BluetoothConnected size={11} /> Write to Card</>}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* â”€â”€ RCARD0000011 Bluetooth Panel â”€â”€ */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                        <Bluetooth size={15} className="text-[#2F80ED]" /> RCARD0000011
                    </h2>
                    {bleStatus === 'auto' && (
                        <span className="flex items-center gap-1.5 text-[10px] text-[#484F58]">
                            <Loader2 size={11} className="animate-spin" /> Auto-connectingâ€¦
                        </span>
                    )}
                    {bleConnected && bleStatus !== 'auto' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#238636] bg-[#238636]/10 border border-[#238636]/25 px-2 py-0.5 rounded-full">
                            <BluetoothConnected size={11} /> CONNECTED
                        </span>
                    )}
                </div>

                {bleConnected ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#238636]/8 border border-[#238636]/30">
                            <BluetoothConnected size={18} className="text-[#238636] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#238636]">Paired</p>
                                <p className="text-[11px] text-[#8B949E] font-mono">{bleName || 'RCARD0000011'}</p>
                            </div>
                            <button
                                onClick={() => { disconnectCard(); refreshBleStatus(); setBleSendStatus('idle') }}
                                className="text-[10px] text-[#484F58] hover:text-[#DA3633] border border-[#21262D] hover:border-[#DA3633]/40 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1">
                                <BluetoothOff size={11} /> Disconnect
                            </button>
                        </div>

                        {bleSendStatus === 'sending' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="flex items-center gap-1.5 text-[#2F80ED]">
                                        <Loader2 size={11} className="animate-spin" />
                                        Sending tickets to RCARD0000011â€¦
                                    </span>
                                    <span className="text-[#8B949E] font-mono">{bleSendProgress.sent}/{bleSendProgress.total}</span>
                                </div>
                                <div className="w-full bg-[#21262D] rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-[#2F80ED] rounded-full transition-all duration-300"
                                        style={{ width: bleSendProgress.total ? `${(bleSendProgress.sent / bleSendProgress.total) * 100}%` : '0%' }} />
                                </div>
                            </div>
                        )}

                        {bleSendStatus === 'done' && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#238636]/8 border border-[#238636]/25">
                                <CheckCircle2 size={14} className="text-[#238636] shrink-0" />
                                <p className="text-[11px] text-[#238636] font-medium">
                                    {bleSendProgress.total} ticket{bleSendProgress.total !== 1 ? 's' : ''} written to RCARD0000011
                                </p>
                            </div>
                        )}

                        {bleSendStatus === 'error' && bleSendErr && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#DA3633]/8 border border-[#DA3633]/25">
                                <AlertTriangle size={13} className="text-[#DA3633] shrink-0" />
                                <p className="text-[11px] text-[#DA3633]">{bleSendErr}</p>
                            </div>
                        )}

                        {tickets.length > 0 && bleSendStatus !== 'sending' && (
                            <button
                                onClick={() => sendAllTickets()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/8 hover:bg-[#2F80ED]/15 hover:border-[#2F80ED]/60 text-[#2F80ED] text-xs font-bold transition-all">
                                <RefreshCw size={12} />
                                {bleSendStatus === 'done' ? 'Re-send All Tickets' : `Send ${tickets.length} Ticket${tickets.length !== 1 ? 's' : ''} to Card`}
                            </button>
                        )}

                        {tickets.length === 0 && bleSendStatus === 'idle' && (
                            <p className="text-[11px] text-[#484F58]">No booked tickets yet. Ticket data will be pushed automatically after your first booking.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
                            <BluetoothOff size={18} className="text-[#484F58] shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-[#484F58]">RCARD0000011 not connected</p>
                                <p className="text-[11px] text-[#484F58]">Click below to connect. Browser will show a picker â€” select RCARD0000011. After the first connection, it reconnects silently.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleBleConnect}
                            disabled={bleStatus === 'connecting'}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/8 hover:bg-[#2F80ED]/15 hover:border-[#2F80ED]/60 text-[#2F80ED] text-sm font-bold transition-all disabled:opacity-50">
                            {bleStatus === 'connecting'
                                ? <><Loader2 size={14} className="animate-spin" /> Connectingâ€¦</>
                                : <><Bluetooth size={14} /> Connect to RCARD0000011</>}
                        </button>
                        {bleStatus === 'error' && bleErr && (
                            <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                                <AlertTriangle size={11} className="shrink-0" />{bleErr}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* â”€â”€ Card Details placeholder â”€â”€ */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Card Settings &amp; Details</h2>
                <PlaceholderCard message="Card management, auto-recharge, and limits coming in next phase" />
            </div>
        </div>
    )
}
