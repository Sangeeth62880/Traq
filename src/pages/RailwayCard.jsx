import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CreditCard, Ticket, Star, Shield, Zap,
    QrCode, Hash, ChevronRight, ClipboardList,
    CheckCircle2, Loader2, AlertTriangle, LogOut, ScanLine,
    Train, ArrowRight, MapPin,
} from 'lucide-react'
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

// ─────────────────────────────────────────────────────────────────────────────
// STEP CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const STEP_CONNECT = 'connect'
const STEP_SIGNIN = 'signin'
const STEP_DONE = 'done'

// ── Train type metadata (mirrors GeneralTicket.jsx) ──────────────────────────
const TRAIN_TYPES = [
    { code: 'ORD', label: 'Ordinary', fare: 30, color: '#8B949E' },
    { code: 'MEMU', label: 'MEMU', fare: 45, color: '#22C55E' },
    { code: 'PASS', label: 'Passenger', fare: 35, color: '#6B7280' },
    { code: 'EXP', label: 'Express', fare: 75, color: '#2F80ED' },
    { code: 'SF', label: 'Superfast', fare: 110, color: '#F97316' },
]

// ── Premium Ticket Card Visual (Matches GeneralTicket.jsx) ───────────────────
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
                            <p className="text-[10px] text-[#8B949E] mt-0.5">{booking.departure || '—'}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 px-1">
                            <div className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${type.color}, transparent)` }} />
                            <ArrowRight size={14} style={{ color: type.color }} />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#484F58] mb-0.5">To</p>
                            <p className="text-2xl font-black text-[#F0F6FC] leading-none">{booking.to}</p>
                            <p className="text-[10px] text-[#8B949E] mt-0.5">{booking.arrival || '—'}</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
// ── Mini QR placeholder (16×16 dots) ─────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 – Connect card (QR or card number)
// ─────────────────────────────────────────────────────────────────────────────
function ConnectStep({ onNext }) {
    const [mode, setMode] = useState(null)
    const [cardNo, setCardNo] = useState('')
    const [scanned, setScanned] = useState(false)
    const [err, setErr] = useState('')

    function handleContinue() {
        if (mode === 'qr' && !scanned) { setErr('Please scan your card QR first'); return }
        if (mode === 'number' && cardNo.trim().length < 8) { setErr('Enter a valid card number (min 8 digits)'); return }
        onNext({ cardNo: mode === 'qr' ? 'QR-' + Math.random().toString(36).slice(2, 10).toUpperCase() : cardNo.trim() })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2">
                    <CreditCard size={22} className="text-[#2F80ED]" />
                    Connect Railway Card
                </h1>
                <p className="text-sm text-[#8B949E] mt-1">Link your physical railway card to access digital features</p>
            </div>

            {/* Mode selector */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#484F58]">Choose connection method</p>

                <div className="grid sm:grid-cols-2 gap-3">
                    {/* QR option */}
                    <button onClick={() => { setMode('qr'); setErr('') }}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center ${mode === 'qr'
                            ? 'border-[#2F80ED] bg-[#2F80ED]/8 shadow-[0_0_16px_rgba(47,128,237,0.15)]'
                            : 'border-[#21262D] bg-[#0D1117] hover:border-[#2F80ED]/40'
                            }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode === 'qr' ? 'bg-[#2F80ED]/15' : 'bg-[#161B22]'}`}>
                            <QrCode size={24} className={mode === 'qr' ? 'text-[#2F80ED]' : 'text-[#484F58]'} />
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${mode === 'qr' ? 'text-[#2F80ED]' : 'text-[#8B949E]'}`}>Scan QR Code</p>
                            <p className="text-[10px] text-[#484F58] mt-0.5">Use the QR on your railway card</p>
                        </div>
                    </button>

                    {/* Card number option */}
                    <button onClick={() => { setMode('number'); setErr('') }}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center ${mode === 'number'
                            ? 'border-[#2F80ED] bg-[#2F80ED]/8 shadow-[0_0_16px_rgba(47,128,237,0.15)]'
                            : 'border-[#21262D] bg-[#0D1117] hover:border-[#2F80ED]/40'
                            }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode === 'number' ? 'bg-[#2F80ED]/15' : 'bg-[#161B22]'}`}>
                            <Hash size={24} className={mode === 'number' ? 'text-[#2F80ED]' : 'text-[#484F58]'} />
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${mode === 'number' ? 'text-[#2F80ED]' : 'text-[#8B949E]'}`}>Card Number</p>
                            <p className="text-[10px] text-[#484F58] mt-0.5">Enter the number printed on your card</p>
                        </div>
                    </button>
                </div>

                {/* QR scan area */}
                {mode === 'qr' && (
                    <div className="space-y-3">
                        <div
                            onClick={() => setScanned(true)}
                            className={`relative flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all ${scanned ? 'border-[#238636] bg-[#238636]/8' : 'border-[#21262D] hover:border-[#2F80ED]/40 bg-[#0D1117]'
                                }`}>
                            {scanned ? (
                                <>
                                    <CheckCircle2 size={32} className="text-[#238636]" />
                                    <p className="text-sm font-bold text-[#238636]">QR Scanned Successfully</p>
                                </>
                            ) : (
                                <>
                                    <ScanLine size={32} className="text-[#484F58]" />
                                    <p className="text-sm text-[#484F58]">Click to simulate QR scan</p>
                                    <p className="text-[10px] text-[#21262D]">(In production, camera opens here)</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Card number input */}
                {mode === 'number' && (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#484F58]">Railway Card Number</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0D1117] border border-[#21262D] hover:border-[#2F80ED]/30 focus-within:border-[#2F80ED]/60 transition-all">
                            <CreditCard size={14} className="text-[#484F58]" />
                            <input
                                type="text"
                                placeholder="e.g. 1234 5678 9012 3456"
                                maxLength={20}
                                className="flex-1 bg-transparent text-sm text-[#F0F6FC] placeholder-[#484F58] outline-none font-mono tracking-wider"
                                value={cardNo}
                                onChange={e => { setCardNo(e.target.value); setErr('') }}
                            />
                        </div>
                    </div>
                )}

                {err && (
                    <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
                        <AlertTriangle size={12} />{err}
                    </p>
                )}

                <button
                    onClick={handleContinue}
                    disabled={!mode}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white text-sm font-bold transition-all hover:shadow-[0_0_24px_rgba(47,128,237,0.35)] disabled:opacity-30 disabled:cursor-not-allowed">
                    Continue to Sign In <ChevronRight size={16} />
                </button>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#484F58]">
                <Shield size={14} className="text-[#2F80ED] shrink-0 mt-0.5" />
                <p>Your card data is encrypted and linked to your verified Google account. We never store card PINs or CVVs.</p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 – Google Sign-In
// ─────────────────────────────────────────────────────────────────────────────
function GoogleSignInStep({ cardData, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    async function handleGoogleSignIn() {
        setErr('')
        setLoading(true)
        try {
            // ── Step 1: Google OAuth (this is what creates the user in Firebase Auth) ──
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // ── Step 2: Save to Firestore (may fail if rules aren't set yet) ──
            try {
                const userRef = doc(db, 'railcard_users', user.uid)
                const snap = await getDoc(userRef)

                if (!snap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL,
                        cardNo: cardData.cardNo,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                    })
                } else {
                    await setDoc(userRef, {
                        lastLogin: serverTimestamp(),
                        cardNo: cardData.cardNo,
                        name: user.displayName,
                        photo: user.photoURL,
                    }, { merge: true })
                }
            } catch (fsErr) {
                // Firestore permissions error — auth still succeeded, let the user in
                // but warn them so they know to fix Firestore rules
                if (fsErr.code === 'permission-denied') {
                    console.warn(
                        '[RailwayCard] Firestore permission denied.\n' +
                        'Fix: Firebase Console → Firestore → Rules → ' +
                        'allow read, write: if request.auth != null && request.auth.uid == userId;'
                    )
                    // Non-fatal: proceed to card UI anyway
                } else {
                    throw fsErr   // unexpected Firestore error — surface it
                }
            }

            // ── Step 3: Success — move to card UI ──
            onSuccess({
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photo: user.photoURL,
                cardNo: cardData.cardNo,
            })
        } catch (e) {
            if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
                setErr('Sign-in popup was closed. Please try again.')
            } else if (e.code === 'auth/popup-blocked') {
                setErr('Popup was blocked by your browser. Please allow popups for this site and try again.')
            } else {
                setErr(e.message || 'Google sign-in failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#F0F6FC] flex items-center gap-2">
                    {/* Google G icon */}
                    <svg width="22" height="22" viewBox="0 0 48 48" className="shrink-0">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    Sign in with Google
                </h1>
                <p className="text-sm text-[#8B949E] mt-1">
                    We'll use your Google account to verify your identity and link it to your railway card.
                </p>
            </div>

            {/* Card being linked */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
                <CreditCard size={16} className="text-[#2F80ED] shrink-0" />
                <div>
                    <p className="text-[10px] text-[#484F58] font-bold uppercase tracking-wider">Linking Card</p>
                    <p className="text-sm font-mono font-bold text-[#F0F6FC]">{cardData.cardNo}</p>
                </div>
            </div>

            {/* Sign-in box */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8 flex flex-col items-center gap-6">
                {/* Google logo big */}
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                </div>

                <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-[#F0F6FC]">Secure Google Authentication</p>
                    <p className="text-xs text-[#484F58]">A popup will open for you to choose your Google account.</p>
                </div>

                {err && (
                    <p className="flex items-center gap-1.5 text-xs text-[#EF4444] text-center">
                        <AlertTriangle size={12} className="shrink-0" />{err}
                    </p>
                )}

                <button
                    id="google-signin-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-sm font-bold transition-all hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200">
                    {loading ? (
                        <Loader2 size={18} className="animate-spin text-gray-500" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                    )}
                    {loading ? 'Signing in…' : 'Continue with Google'}
                </button>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#484F58]">
                <Shield size={14} className="text-[#238636] shrink-0 mt-0.5" />
                <p>
                    We only access your <span className="text-[#F0F6FC]">name, email, and profile photo</span> from Google.
                    No passwords are stored. You can revoke access anytime from your Google account settings.
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RAILWAY CARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RailwayCard() {
    const navigate = useNavigate()
    const [step, setStep] = useState(STEP_CONNECT)
    const [cardData, setCardData] = useState(null)
    const [userData, setUserData] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)

    // ── Booked tickets ─────────────────────────────────────────────────────────
    const [tickets, setTickets] = useState([])
    const [ticketsLoading, setTicketsLoading] = useState(false)
    const [ticketsOpen, setTicketsOpen] = useState(false)

    // Restore session on mount
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const snap = await getDoc(doc(db, 'railcard_users', user.uid))
                    if (snap.exists()) {
                        const d = snap.data()
                        setUserData({ uid: user.uid, email: d.email, name: d.name, photo: d.photo, cardNo: d.cardNo })
                        setCardData({ cardNo: d.cardNo })
                        setStep(STEP_DONE)
                    }
                } catch { /* ignore — will show connect screen */ }
            }
            setAuthChecked(true)
        })
        return unsub
    }, [])

    const [ticketsErr, setTicketsErr] = useState('')

    // ── Fetch booked tickets from Firestore whenever userData is set ───────────
    useEffect(() => {
        if (!userData?.uid) return
        setTicketsLoading(true)
        setTicketsErr('')

        // We fetch by UID. We'll sort locally to avoid mandatory index requirement during setup.
        const q = query(
            collection(db, 'bookings'),
            where('uid', '==', userData.uid)
        )

        getDocs(q)
            .then(snap => {
                const results = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }))
                // Sort by createdAt desc (newest first)
                results.sort((a, b) => {
                    const tA = a.createdAt?.seconds || 0
                    const tB = b.createdAt?.seconds || 0
                    return tB - tA
                })
                setTickets(results)
            })
            .catch(err => {
                console.error('[RailwayCard] Bookings fetch failed:', err)
                setTicketsErr(err.message.includes('index')
                    ? 'Firestore Index Building... Check console for link.'
                    : 'Failed to load tickets.')
            })
            .finally(() => setTicketsLoading(false))
    }, [userData?.uid])

    async function handleSignOut() {
        await signOut(auth)
        setStep(STEP_CONNECT)
        setCardData(null)
        setUserData(null)
    }

    if (!authChecked) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 size={28} className="animate-spin text-[#2F80ED]" />
            </div>
        )
    }

    // ── Auth gate ─────────────────────────────────────────────────────────────
    if (step === STEP_CONNECT) {
        return <ConnectStep onNext={data => { setCardData(data); setStep(STEP_SIGNIN) }} />
    }

    if (step === STEP_SIGNIN) {
        return (
            <GoogleSignInStep
                cardData={cardData}
                onSuccess={data => { setUserData(data); setStep(STEP_DONE) }}
            />
        )
    }

    // ── Authenticated card UI ─────────────────────────────────────────────────
    const maskedCard = userData?.cardNo
        ? '•••• ' + userData.cardNo.slice(-4)
        : '•••• 0000'

    return (
        <div className="space-y-6">
            {/* ── Page Header ── */}
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

            {/* ── Verified badge with Google avatar ── */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#238636]/10 border border-[#238636]/25 w-fit">
                {userData?.photo ? (
                    <img src={userData.photo} alt={userData.name} className="w-6 h-6 rounded-full ring-1 ring-[#238636]/40" />
                ) : (
                    <CheckCircle2 size={13} className="text-[#238636]" />
                )}
                <span className="text-xs font-bold text-[#238636]">Google Verified</span>
                <span className="text-xs text-[#484F58]">· {userData?.name}</span>
            </div>

            {/* ── Card Visual ── */}
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

                    <div className="relative z-10 mb-6">
                        <p className="text-xs text-blue-200/60 mb-1"></p>
                        <p className="text-4xl font-bold text-white tracking-tight">Train Card</p>
                    </div>

                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <p className="text-xs text-blue-200/50">Account</p>
                            <p className="text-sm font-semibold text-white truncate max-w-[140px]">{userData?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-200/50">Card No.</p>
                            <p className="text-sm font-mono text-white">{maskedCard}</p>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6">
                        <CreditCard size={28} className="text-blue-100/30" />
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-3 gap-3">
                {/* View Booked Tickets — toggles the panel below */}
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

                {/* Book Tickets → /book (GeneralTicket) */}
                <button
                    id="quick-book-ticket"
                    onClick={() => navigate('/book')}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#161B22] border border-[#238636]/20 hover:bg-[#162a1e] hover:border-[#238636]/50 transition-all duration-200 group">
                    <div className="w-11 h-11 rounded-xl bg-[#238636]/10 flex items-center justify-center group-hover:bg-[#238636]/20 transition-colors">
                        <Ticket size={20} className="text-[#238636]" />
                    </div>
                    <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#F0F6FC] text-center leading-tight transition-colors">Book Tickets</span>
                </button>

                {/* Favourite Routes */}
                <button
                    id="quick-fav-routes"
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#161B22] border border-[#FACC15]/20 hover:bg-[#1e1c10] hover:border-[#FACC15]/50 transition-all duration-200 group">
                    <div className="w-11 h-11 rounded-xl bg-[#FACC15]/10 flex items-center justify-center group-hover:bg-[#FACC15]/20 transition-colors">
                        <Star size={20} className="text-[#FACC15]" />
                    </div>
                    <span className="text-xs font-semibold text-[#8B949E] group-hover:text-[#F0F6FC] text-center leading-tight transition-colors">Favourite Routes</span>
                </button>
            </div>

            {/* ── Booked Tickets Panel ── */}
            {ticketsOpen && (
                <div id="booked-tickets-panel" className="bg-[#161B22] border border-[#21262D] rounded-2xl overflow-hidden">
                    {/* Panel header */}
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

                    {/* Ticket list */}
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
                                    Book your first ticket →
                                </button>
                            </div>
                        )}

                        {!ticketsLoading && !ticketsErr && tickets.map(b => (
                            <TicketCard key={b.firestoreId ?? b.id} booking={b} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Card Details ── */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">Card Settings &amp; Details</h2>
                <PlaceholderCard message="Card management, auto-recharge, and limits coming in next phase" />
            </div>
        </div>
    )
}
