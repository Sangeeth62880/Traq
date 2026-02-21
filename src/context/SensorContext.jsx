// Traq — InfluxDB Integration | Make-a-Ton 2026
/**
 * SensorContext.jsx
 * Global context for live IoT sensor / crowd data.
 * Loads all available trains from InfluxDB on mount.
 * Auto-refreshes selected train data every 10 seconds.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
    fetchTrainCrowdData,
    fetchStationCrowdData,
    fetchLatestCrowdData,
    fetchAvailableTrains,
} from '../services/influxService'
import { mockTrains } from '../data/mockTrains'

// ── Context ───────────────────────────────────────────────────────────────────
const SensorContext = createContext(null)

// ── Boardin status helper (mirrors service) ───────────────────────────────────
function computeOverallStatus(compartments) {
    if (!compartments?.length) return 'No Data'
    const occ = compartments.reduce((s, c) => s + c.currentCount, 0)
    const cap = compartments.reduce((s, c) => s + c.capacity, 0)
    const r = cap > 0 ? occ / cap : 0
    if (r < 0.40) return 'Board Now'
    if (r < 0.65) return 'Comfortable'
    if (r < 0.80) return 'Filling Up'
    if (r < 0.90) return 'Almost Full'
    if (r < 1.00) return 'Avoid'
    return 'Overcrowded'
}

// ── Enrich DB trains with optional name/route from mockTrains lookup ──────────
function enrichTrain(dbTrain) {
    const meta = mockTrains.find(m => m.trainNo === dbTrain.trainNumber)
    return {
        ...dbTrain,
        name: meta?.name || `Train ${dbTrain.trainNumber}`,
        from: meta?.from || '',
        to: meta?.to || '',
        departure: meta?.departure || '',
    }
}

// ─────────────────────────────────────────────────────────────────────────────
export function SensorProvider({ children }) {
    // Live compartment data for the currently selected train/station
    const [crowdData, setCrowdData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [lastFetched, setLastFetched] = useState(null)
    const [isLive, setIsLive] = useState(false)
    const [selectedTrain, setSelectedTrain] = useState(null)

    // All trains available in InfluxDB (for search dropdowns)
    const [availableTrains, setAvailableTrains] = useState([])
    const [trainsLoading, setTrainsLoading] = useState(true)
    const [trainsLoadError, setTrainsLoadError] = useState(false)

    const currentTrainNumRef = useRef(null)
    const intervalRef = useRef(null)

    // ── Load all available trains once on mount ──────────────────────────────
    useEffect(() => {
        setTrainsLoading(true)
        fetchAvailableTrains().then(result => {
            if (!result.error && result.data.length > 0) {
                setAvailableTrains(result.data.map(enrichTrain))
                setTrainsLoadError(false)
            } else {
                // Fall back to mockTrains shaped like DB format
                setAvailableTrains(mockTrains.map(m => ({
                    trainNumber: m.trainNo,
                    name: m.name,
                    from: m.from,
                    to: m.to,
                    departure: m.departure,
                    coaches: [],
                    totalCount: 0,
                    totalCapacity: 0,
                })))
                setTrainsLoadError(true)
            }
        }).finally(() => setTrainsLoading(false))
    }, [])

    // ── Internal: run a fetch and apply result ───────────────────────────────
    async function _applyResult(resultPromise) {
        setIsLoading(true)
        setIsError(false)
        setErrorMessage('')
        try {
            const result = await resultPromise
            if (result.error && result.data.length === 0) {
                setIsError(true)
                setErrorMessage(result.message || 'Sensor fetch failed')
                setCrowdData([])
            } else {
                setCrowdData(result.data || [])
                setIsLive(result.isLive ?? false)
                if (result.error) { setIsError(true); setErrorMessage(result.message || '') }
            }
        } catch (err) {
            setIsError(true)
            setErrorMessage('Unexpected error: ' + err.message)
            setCrowdData([])
        } finally {
            setIsLoading(false)
            setLastFetched(new Date())
        }
    }

    // ── fetchForTrain ────────────────────────────────────────────────────────
    const fetchForTrain = useCallback(async (trainNumber) => {
        currentTrainNumRef.current = trainNumber
        await _applyResult(fetchTrainCrowdData(trainNumber))
    }, [])

    // ── fetchForStation ──────────────────────────────────────────────────────
    const fetchForStation = useCallback(async (stationCode) => {
        currentTrainNumRef.current = null
        await _applyResult(fetchStationCrowdData(stationCode))
    }, [])

    // ── refreshData ──────────────────────────────────────────────────────────
    const refreshData = useCallback(async () => {
        if (currentTrainNumRef.current) {
            await _applyResult(fetchTrainCrowdData(currentTrainNumRef.current))
        } else {
            await _applyResult(fetchLatestCrowdData())
        }
    }, [])

    // ── Auto-refresh every 10s ───────────────────────────────────────────────
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            if (currentTrainNumRef.current) {
                fetchTrainCrowdData(currentTrainNumRef.current).then(result => {
                    if (!result.error || result.data.length > 0) {
                        setCrowdData(result.data)
                        setIsLive(result.isLive ?? false)
                        setLastFetched(new Date())
                    }
                })
            }
        }, 10_000)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [])

    // ── Aggregate helpers ────────────────────────────────────────────────────
    const getTotalCount = useCallback(() => crowdData.reduce((s, c) => s + c.currentCount, 0), [crowdData])
    const getTotalCapacity = useCallback(() => crowdData.reduce((s, c) => s + c.capacity, 0), [crowdData])
    const getLeastCrowded = useCallback(() => crowdData.length ? crowdData.reduce((a, b) => a.occupancyRatio < b.occupancyRatio ? a : b) : null, [crowdData])
    const getMostCrowded = useCallback(() => crowdData.length ? crowdData.reduce((a, b) => a.occupancyRatio > b.occupancyRatio ? a : b) : null, [crowdData])
    const getOverallStatus = useCallback(() => computeOverallStatus(crowdData), [crowdData])

    return (
        <SensorContext.Provider value={{
            // Current train crowd data
            crowdData, isLoading, isError, errorMessage, lastFetched, isLive,
            // Selected train object
            selectedTrain, setSelectedTrain,
            // Actions
            refreshData, fetchForTrain, fetchForStation,
            // All trains from DB (for search)
            availableTrains, trainsLoading, trainsLoadError,
            // Helpers
            getTotalCount, getTotalCapacity, getLeastCrowded, getMostCrowded, getOverallStatus,
        }}>
            {children}
        </SensorContext.Provider>
    )
}

export function useSensor() {
    const ctx = useContext(SensorContext)
    if (!ctx) throw new Error('useSensor must be used inside <SensorProvider>')
    return ctx
}
