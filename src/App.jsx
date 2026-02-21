// Traq — InfluxDB Integration | Make-a-Ton 2026
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SensorProvider } from './context/SensorContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SearchTrain from './pages/SearchTrain'
import LiveTracker from './pages/LiveTracker'
import CrowdMonitor from './pages/CrowdMonitor'
import RailwayCard from './pages/RailwayCard'
import RechargeCard from './pages/RechargeCard'
import BookTicket from './pages/BookTicket'
import Settings from './pages/Settings'

export default function App() {
    return (
        <SensorProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="search" element={<SearchTrain />} />
                        <Route path="tracker" element={<LiveTracker />} />
                        <Route path="crowd" element={<CrowdMonitor />} />
                        <Route path="card" element={<RailwayCard />} />
                        <Route path="recharge" element={<RechargeCard />} />
                        <Route path="book" element={<BookTicket />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </SensorProvider>
    )
}

