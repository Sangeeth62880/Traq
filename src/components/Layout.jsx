import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

// Page title map — derives heading from the current route
const pageTitles = {
    '/': 'Dashboard',
    '/search': 'Search Train',
    '/tracker': 'Live Tracker',
    '/crowd': 'Crowd Monitor',
    '/card': 'Railway Card',
    '/recharge': 'Recharge',
    '/book': 'Book Ticket',
    '/settings': 'Settings',
}

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [sidebarOpen])

    // Update document title on route change
    useEffect(() => {
        const title = pageTitles[location.pathname] || 'Traq'
        document.title = `${title} — Traq`
    }, [location.pathname])

    return (
        <div className="min-h-screen bg-[#05060F]">
            {/* Fixed Topbar */}
            <Topbar
                onMenuToggle={() => setSidebarOpen(prev => !prev)}
                isSidebarOpen={sidebarOpen}
            />

            {/* Sidebar — fixed left, 240px wide on desktop */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <main
                className={`
          min-h-screen pt-16
          transition-all duration-300
          lg:pl-60
        `}
            >
                <div className="p-6 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
