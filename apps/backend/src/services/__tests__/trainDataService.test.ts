import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Redis from 'ioredis';
import Database from 'better-sqlite3';
import { trainDataService } from '../trainDataService';
import * as redisModule from '../../config/redis';

// Mock Dependencies
vi.mock('ioredis', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            on: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
            del: vi.fn(),
            status: 'ready'
        }))
    };
});

vi.mock('better-sqlite3', () => {
    const mStatement = {
        get: vi.fn(),
        all: vi.fn(),
        run: vi.fn(),
    };
    const mDb = {
        prepare: vi.fn(() => mStatement),
        pragma: vi.fn(),
        exec: vi.fn(),
    };
    return { default: vi.fn(() => mDb) };
});

const mockGlobalFetch = vi.fn();
global.fetch = mockGlobalFetch as any;

describe('TrainDataService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Reset any singleton/module state safely if needed
        // For cacheGet, cacheSet we spy on them because trainDataService imports them directly
        vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);
        vi.spyOn(redisModule, 'cacheSet').mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    // We can't easily reset private properties like failedCalls in JS classes without 
    // re-instantiating, but trainDataService is a singleton export. We'll use ts-ignore 
    // strictly for testing isolation.
    const resetServiceState = () => {
        // @ts-ignore
        trainDataService.failedCalls = 0;
        // @ts-ignore
        trainDataService.breakerOpenUntil = 0;
    };

    describe('searchTrains()', () => {
        it('1. Cache miss -> calls API -> returns transformed results -> sets cache', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);

            mockGlobalFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    status: true,
                    data: [{
                        train_number: '12345',
                        train_name: 'TEST EXP',
                        from_station: 'ABC',
                        to_station: 'XYZ',
                        departure_time: '10:00',
                        arrival_time: '20:00',
                        duration: '10:00',
                        types: ['Express'],
                        days: [1, 2]
                    }]
                })
            });

            const results = await trainDataService.searchTrains('12345');
            expect(results).toHaveLength(1);
            expect(results[0]?.train_name).toBe('TEST EXP');
            expect(results[0]?.cached).toBeUndefined();

            expect(mockGlobalFetch).toHaveBeenCalledTimes(1);
            expect(redisModule.cacheSet).toHaveBeenCalledWith(
                'search:trains:12345',
                expect.any(Array),
                300
            );
        });

        it('2. Cache hit -> returns cached results WITHOUT calling API', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue([{
                train_number: '12345',
                train_name: 'CACHED EXP',
                from_station: 'A',
                to_station: 'B',
                departure_time: '10:00',
                arrival_time: '11:00',
                duration_minutes: 60,
                coach_classes: ['SL'],
                days_of_operation: ['1']
            }]);

            const results = await trainDataService.searchTrains('12345');

            expect(results).toHaveLength(1);
            expect(results[0]?.train_name).toBe('CACHED EXP');
            expect(results[0]?.cached).toBe(true);
            expect(mockGlobalFetch).not.toHaveBeenCalled();
        });

        it('3. API throws -> returns fallback seed data array with apiDown: true (no throw)', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);

            mockGlobalFetch.mockRejectedValueOnce(new Error('Network error'));

            // "RAJDHANI" should match seed data
            const results = await trainDataService.searchTrains('RAJDHANI');

            expect(results.length).toBeGreaterThan(0);
            expect(results[0]?.apiDown).toBe(true);
            expect(results[0]?.train_name.toUpperCase()).toContain('RAJDHANI');
            expect(mockGlobalFetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('getTrainStatus()', () => {
        it('4. returns stale cache when API is down (stale: true)', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockImplementation(async (key: string) => {
                if (key.startsWith('status:')) return { train_name: 'STALE TRAIN' };
                return null;
            });
            mockGlobalFetch.mockRejectedValueOnce(new Error('500 Internal'));

            const result = await trainDataService.getTrainStatus('99999');

            expect(result.stale).toBe(true);
            expect(result.train_name).toBe('STALE TRAIN');
        });
    });

    describe('getTrainsOnRoute()', () => {
        it('5 & 6. Sorts by score (occupancy mapped) and sets occupancyAvailable', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);

            // Note: Date needs to be within +/- 90 days to pass validation
            const today = new Date().toISOString().split('T')[0];

            mockGlobalFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    status: true,
                    data: [
                        { train_number: '111', travel_time: '12:00' },
                        { train_number: '222', travel_time: '1:00' }
                    ]
                })
            });

            const results = await trainDataService.getTrainsOnRoute('CSTM', 'PUNE', today!);

            expect(results).toHaveLength(2);
            // Since we mocked DB occupancy as 40 for both, shorter duration should win
            expect(results[0]?.train_number).toBe('222');
            expect(results[0]?.occupancy_unknown).toBe(false);
        });

        it('10. date validation: date > 90 days in future -> throws validation error', async () => {
            const future = new Date();
            future.setDate(future.getDate() + 95);

            await expect(trainDataService.getTrainsOnRoute('CSTM', 'PUNE', future.toISOString()))
                .rejects.toThrow('Date must be within 90 days');
        });
    });

    describe('Circuit Breaker (Requirement 8)', () => {
        it('circuit breaker: after 3 consecutive failures -> 4th call skips API entirely', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);

            mockGlobalFetch.mockRejectedValue(new Error('Network drop'));

            // 1st
            await trainDataService.searchTrains('FAIL1');
            // 2nd
            await trainDataService.searchTrains('FAIL2');
            // 3rd
            await trainDataService.searchTrains('FAIL3');

            expect(mockGlobalFetch).toHaveBeenCalledTimes(3);

            // 4th call - circuit breaker should be Open
            const cbResult = await trainDataService.searchTrains('RAJDHANI');

            expect(mockGlobalFetch).toHaveBeenCalledTimes(3); // NO 4TH CALL
            expect(cbResult[0]?.apiDown).toBe(true); // Falling back successfully without crashing
        });
    });

    describe('searchStations() (Requirement 9)', () => {
        it('fuzzy match via DB -> returns correctly mapped StationInfo', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);
            const mRows = [{ station_code: 'CSTM', station_name: 'MUMBAI', city: 'Mumbai' }];
            const mStmt = { all: vi.fn().mockReturnValue(mRows) };
            vi.spyOn((trainDataService as any).db, 'prepare').mockReturnValue(mStmt as any);
            const results = await trainDataService.searchStations('Mumbai');
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(s => s.code === 'CSTM')).toBe(true);
        });
    });

    describe('transformTrainResult (Requirement 7)', () => {
        it('maps all fields correctly from raw API shape', async () => {
            resetServiceState();
            vi.spyOn(redisModule, 'cacheGet').mockResolvedValue(null);

            mockGlobalFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    status: true,
                    data: [{
                        train_number: '12345',
                        train_name: 'TEST EXP',
                        from_station: 'ABC',
                        to_station: 'XYZ',
                        departure_time: '10:00',
                        arrival_time: '12:30',
                        duration: '2:30',
                        types: ['Express'],
                        days: [1, 5]
                    }]
                })
            });

            const results = await trainDataService.searchTrains('1');
            const mapped = results[0];

            expect(mapped?.duration_minutes).toBe(150); // 2:30 = 150 min
            expect(mapped?.departure_time).toBe('10:00');
            expect(mapped?.days_of_operation).toEqual(['1', '5']); // string array
        });
    });
});
