import { cacheGet, cacheSet } from '../config/redis';
import { TRAINS } from '../data/trains.seed';
import { STATIONS } from '../data/stations.seed';
import type { Redis } from 'ioredis';
import type { Database } from 'better-sqlite3';
import type {
    TrainResult,
    TrainStatus as AppTrainStatus,
    RouteOption,
    StationInfo
} from '@traq/shared-types';
import {
    RailRadarSearchResponse,
    RailRadarStatusResponse,
    RailRadarScheduleResponse,
    RailRadarBetweenStationsResponse,
    RailRadarScheduleStop
} from '../types/railradar.types';

// Types mapping raw rail radar to shared-types
export interface ScheduleStop {
    stationCode: string;
    stationName: string;
    arrivalTime: string | null;
    departureTime: string | null;
    dayNumber: number;
    distanceKm: number;
    haltMinutes: number;
}

const RAILRADAR_BASE_URL = 'https://railradar.trainman.in';

// TTL Constants
const SCHEDULE_TTL = 86400;      // 24h
const STATUS_TTL = 60;           // 60s
const SEARCH_TTL = 300;          // 5min
const STATIONS_TTL = 604800;     // 7 days
const API_TIMEOUT_MS = 5000;

class TrainDataService {
    private failedCalls = 0;
    private breakerOpenUntil = 0;

    constructor(private redis: Redis, private db: Database) { }

    private async fetchRailRadar<T>(path: string): Promise<T> {
        const now = Date.now();
        if (this.failedCalls >= 3 && now < this.breakerOpenUntil) {
            throw new Error('CircuitBreakerOpen');
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

            const response = await fetch(`${RAILRADAR_BASE_URL}${path}`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Traq-Server/1.0'
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (this.failedCalls > 0) {
                this.failedCalls = 0;
                this.breakerOpenUntil = 0;
            }

            return await response.json() as T;
        } catch (error) {
            this.failedCalls++;
            if (this.failedCalls >= 3) {
                this.breakerOpenUntil = Date.now() + 30000;
            }
            throw error;
        }
    }

    async searchTrains(query: string): Promise<(TrainResult & { cached?: boolean, apiDown?: boolean })[]> {
        const normalizedQuery = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!normalizedQuery) return [];

        const cacheKey = `search:trains:${normalizedQuery}`;
        const cached = await cacheGet<TrainResult[]>(cacheKey);

        if (cached) {
            return cached.map(t => ({ ...t, cached: true }));
        }

        try {
            const data = await this.fetchRailRadar<RailRadarSearchResponse>(`/autocomplete?q=${normalizedQuery}&type=train`);
            if (!data.status || !data.data) {
                return [];
            }

            const results = data.data.map(raw => this.transformTrainResult(raw));
            await cacheSet(cacheKey, results, SEARCH_TTL);
            return results;

        } catch (error) {
            console.warn('[TrainDataService] API Failure during searchTrains, returning empty array', error);
            const fallbackResults = TRAINS.filter(t =>
                t.train_number.includes(normalizedQuery) ||
                t.train_name.toUpperCase().includes(normalizedQuery)
            ).slice(0, 10);
            return fallbackResults.map(t => ({ ...t, apiDown: true }));
        }
    }

    async getTrainStatus(trainNumber: string): Promise<AppTrainStatus & { stale?: boolean }> {
        const cacheKey = `status:${trainNumber}`;

        try {
            const data = await this.fetchRailRadar<RailRadarStatusResponse>(`/train/${trainNumber}/liveStatus`);
            if (!data.status || !data.data) throw new Error('Invalid RailRadar format');

            const statusData: AppTrainStatus = {
                train_number: data.data.train_number,
                train_name: data.data.train_name,
                current_station: data.data.current_station_code,
                delay_minutes: data.data.delay_in_minutes,
                status: 'running',
                route: [],
                last_updated: data.data.updated_at || new Date().toISOString(),
                avg_occupancy_pct: 0
            };

            await cacheSet(cacheKey, statusData, STATUS_TTL);
            return statusData;
        } catch (error) {
            console.warn('[TrainDataService] API Failure for live status, attempting stale cache fallback', error);

            const staleCache = await cacheGet<AppTrainStatus>(cacheKey);
            if (staleCache) {
                return { ...staleCache, stale: true };
            }

            const seedTrain = TRAINS.find(t => t.train_number === trainNumber);
            return {
                train_number: trainNumber,
                train_name: seedTrain?.train_name || 'Unknown Train',
                current_station: seedTrain?.from_station || 'UNK',
                delay_minutes: 0,
                status: 'unknown',
                route: [],
                last_updated: new Date().toISOString(),
                stale: true
            };
        }
    }

    async getTrainSchedule(trainNumber: string): Promise<ScheduleStop[]> {
        const cacheKey = `schedule:${trainNumber}`;
        const cached = await cacheGet<ScheduleStop[]>(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.fetchRailRadar<RailRadarScheduleResponse>(`/train/${trainNumber}/schedule`);
            if (!data.status || !data.data) throw new Error('Invalid RailRadar format');

            const scheduleLine = data.data.map(stop => ({
                stationCode: stop.station_code,
                stationName: stop.station_name,
                arrivalTime: stop.arrival_time,
                departureTime: stop.departure_time,
                dayNumber: stop.day,
                distanceKm: parseInt(stop.distance, 10) || 0,
                haltMinutes: stop.halt === 'SRC' || stop.halt === 'DST' ? 0 : (parseInt(stop.halt, 10) || 0)
            }));

            await cacheSet(cacheKey, scheduleLine, SCHEDULE_TTL);
            return scheduleLine;
        } catch (error) {
            console.warn(`[TrainDataService] API Failure for schedule (${trainNumber}), using fallback`);
            const seed = TRAINS.find(t => t.train_number === trainNumber);
            if (seed) {
                return [
                    { stationCode: seed.from_station, stationName: seed.from_station, arrivalTime: null, departureTime: seed.departure_time, dayNumber: 1, distanceKm: 0, haltMinutes: 0 },
                    { stationCode: seed.to_station, stationName: seed.to_station, arrivalTime: seed.arrival_time, departureTime: null, dayNumber: 1, distanceKm: seed.duration_minutes, haltMinutes: 0 }
                ];
            }
            return [];
        }
    }

    async getTrainsOnRoute(from: string, to: string, date: string): Promise<RouteOption[]> {
        const queryDate = new Date(date);
        const now = new Date();
        const diffDays = (queryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays < -90 || diffDays > 90) {
            throw new Error('Date must be within 90 days');
        }

        const validCodePattern = /^[A-Z0-9]{2,7}$/;
        if (!validCodePattern.test(from) || !validCodePattern.test(to)) {
            throw new Error('Invalid station codes');
        }

        const cacheKey = `route:${from}:${to}:${date}`;
        const cached = await cacheGet<RouteOption[]>(cacheKey);
        if (cached) return cached;

        let rawTrains: any[] = [];
        try {
            const data = await this.fetchRailRadar<RailRadarBetweenStationsResponse>(`/trains-between-stations?from=${from}&to=${to}&date=${date}`);
            if (data.status && data.data) {
                rawTrains = data.data;
            }
        } catch (error) {
            console.warn('[TrainDataService] API Failure for route search, falling back to seed');
            rawTrains = TRAINS.filter(t => t.from_station === from && t.to_station === to).map(t => ({
                train_number: t.train_number,
                train_name: t.train_name,
                from_time: t.departure_time,
                to_time: t.arrival_time,
                travel_time: `${Math.floor(t.duration_minutes / 60)}:${t.duration_minutes % 60}`,
                days_of_run: [1, 2, 3, 4, 5, 6, 7]
            }));
        }

        const routeOptionsCounted = await Promise.all(rawTrains.map(async (rt) => {
            let durationHours = 5;
            if (rt.travel_time) {
                const parts = String(rt.travel_time).split(/[:\.]/);
                if (parts.length === 2) {
                    durationHours = parseInt(parts[0] || '0', 10) + (parseInt(parts[1] || '0', 10) / 60);
                }
            }

            const delayMinutes = 0;
            let avgOccupancy = 40;
            let occupancyAvailable = true;

            const scoreRaw = (0.5 * (100 - avgOccupancy)) + (0.3 * (1 / Math.max(delayMinutes, 1))) + (0.2 * (1 / Math.max(durationHours, 1)));
            const score = Math.min(Math.max(scoreRaw, 0), 100);

            const result: RouteOption = {
                train_number: rt.train_number,
                train_name: rt.train_name,
                departure_time: rt.from_time || '00:00',
                arrival_time: rt.to_time || '00:00',
                duration_minutes: Math.floor(durationHours * 60),
                avg_occupancy_pct: avgOccupancy,
                delay_minutes: delayMinutes,
                score,
                recommended: false,
                occupancy_unknown: !occupancyAvailable
            };
            return result;
        }));

        routeOptionsCounted.sort((a, b) => b.score - a.score);
        if (routeOptionsCounted.length > 0) {
            const topScore = routeOptionsCounted[0];
            if (topScore && typeof topScore.avg_occupancy_pct === 'number' && topScore.avg_occupancy_pct < 80) {
                topScore.recommended = true;
            }
        }

        await cacheSet(cacheKey, routeOptionsCounted, SEARCH_TTL);
        return routeOptionsCounted;
    }

    async searchStations(query: string): Promise<StationInfo[]> {
        const normalized = query.trim().toUpperCase();
        if (normalized.length < 2) return [];

        const cacheKey = `search:stations:${normalized}`;
        const cached = await cacheGet<StationInfo[]>(cacheKey);
        if (cached) return cached;

        try {
            const likeQuery = `%${normalized}%`;
            const stmt = this.db.prepare(`
                SELECT * FROM train_stations 
                WHERE station_name LIKE ? OR station_code LIKE ? 
                LIMIT 10
            `);
            const rows = stmt.all(likeQuery, likeQuery) as any[];

            const results: StationInfo[] = rows.map(r => ({
                code: r.station_code,
                name: r.station_name,
                delay_minutes: 0,
                stop_number: 1,
                distance_km: 0
            }));

            await cacheSet(cacheKey, results, STATIONS_TTL);
            return results;
        } catch (e) {
            console.error('[TrainDataService] DB pg_trgm search failed, falling back to static seed', e);
            const fallback = STATIONS.filter(s =>
                s.code.toUpperCase().includes(normalized) ||
                s.name.toUpperCase().includes(query.toUpperCase())
            ).slice(0, 10);

            return fallback;
        }
    }

    private transformTrainResult(raw: any): TrainResult {
        let durationMins = 0;
        if (raw.duration) {
            const parts = String(raw.duration).split(':');
            if (parts.length === 2) {
                durationMins = parseInt(parts[0] || '0', 10) * 60 + parseInt(parts[1] || '0', 10);
            }
        }

        return {
            train_number: String(raw.train_number || '00000'),
            train_name: String(raw.train_name || 'Unknown'),
            from_station: String(raw.from_station || ''),
            to_station: String(raw.to_station || ''),
            departure_time: String(raw.departure_time || '00:00'),
            arrival_time: String(raw.arrival_time || '00:00'),
            duration_minutes: durationMins,
            coach_classes: ['SL', '3AC', '2AC', '1AC'],
            days_of_operation: Array.isArray(raw.days) ? raw.days.map(String) : []
        };
    }
}

import { sqliteDb } from '../config/sqlite';
import { redis } from '../config/redis';
export const trainDataService = new TrainDataService(redis, sqliteDb);
