import { describe, it, expectTypeOf } from 'vitest';
import type {
    CoachPayload,
    CardHeader,
    TrainResult,
    TrainStatus,
    StationInfo,
    RouteOption,
    CoachOccupancy,
    OccupancyRecord,
    Ticket,
    QRPayload,
    UserProfile,
    SavedRoute,
    DeviceHealth,
    OccupancyPrediction,
    PredictionPoint,
    TraqAlert,
    BLEScanReport,
    AoASample,
    RFPowerReading,
    SensorFusionResult,
    NRFCommand,
    NRFResponse,
    ADS1115Config,
    CoachZone,
    RFBand,
    ADSGain,
    ADSDataRate,
    ADSMux,
    ApiResponse,
    SocketEvents,
} from '../index.js';

// =============================================================================
// Type-level tests using `satisfies` to validate interface shapes
// =============================================================================

describe('Shared Types — Compile-Time Validation', () => {
    // -- Hardware Types --------------------------------------------------------

    it('AoASample requires valid CoachZone', () => {
        const valid: AoASample = {
            device_hash: 'abc123',
            azimuth_deg: 45,
            elevation_deg: 10,
            rssi_dbm: -60,
            zone: 'door_a',
        };
        expectTypeOf(valid).toMatchTypeOf<AoASample>();

        // @ts-expect-error — "invalid_zone" is not a valid CoachZone
        const _invalid: AoASample = {
            device_hash: 'abc123',
            azimuth_deg: 45,
            elevation_deg: 10,
            rssi_dbm: -60,
            zone: 'invalid_zone',
        };
    });

    it('BLEScanReport contains typed fields', () => {
        const report = {
            unique_device_estimate: 42,
            traq_cards: [],
            scan_duration_ms: 2500,
            aoa_samples: [],
        } satisfies BLEScanReport;
        expectTypeOf(report).toMatchTypeOf<BLEScanReport>();
    });

    it('RFPowerReading requires valid RFBand', () => {
        const valid = {
            channel: 0,
            raw_adc: 32768,
            voltage_mv: 1500,
            power_dbm: -30,
            frequency_band: 'wifi_2_4ghz' as RFBand,
            calibrated: true,
        } satisfies RFPowerReading;
        expectTypeOf(valid).toMatchTypeOf<RFPowerReading>();

        // @ts-expect-error — "bluetooth" is not a valid RFBand
        const _invalid: RFPowerReading = {
            channel: 0,
            raw_adc: 32768,
            voltage_mv: 1500,
            power_dbm: -30,
            frequency_band: 'bluetooth',
            calibrated: true,
        };
    });

    it('ADS1115Config uses typed gain/rate/mux', () => {
        const config = {
            i2c_address: 0x48,
            gain: '4x' as ADSGain,
            data_rate: 128 as ADSDataRate,
            mux: 'AIN0_GND' as ADSMux,
        } satisfies ADS1115Config;
        expectTypeOf(config).toMatchTypeOf<ADS1115Config>();

        // @ts-expect-error — "32x" is not a valid ADSGain
        const _badGain: ADS1115Config = {
            i2c_address: 0x48,
            gain: '32x',
            data_rate: 128,
            mux: 'AIN0_GND',
        };

        // @ts-expect-error — 100 is not a valid ADSDataRate
        const _badRate: ADS1115Config = {
            i2c_address: 0x48,
            gain: '4x',
            data_rate: 100,
            mux: 'AIN0_GND',
        };
    });

    it('SensorFusionResult has all sensor fields', () => {
        const fusion = {
            occupancy_pct: 67,
            ticketed_count: 42,
            total_ble_count: 58,
            rf_occupancy_estimate: 62,
            zone_distribution: {
                door_a: 15,
                middle: 30,
                door_b: 13,
                unknown: 0,
            },
            fusion_confidence: 0.85,
            sensors_active: {
                ble_scanner: true,
                rf_power: true,
                aoa: true,
            },
        } satisfies SensorFusionResult;
        expectTypeOf(fusion).toMatchTypeOf<SensorFusionResult>();
        expectTypeOf(fusion.fusion_confidence).toBeNumber();
        expectTypeOf(fusion.sensors_active.ble_scanner).toBeBoolean();
    });

    it('NRFResponse status must be OK | ERROR | BUSY', () => {
        const valid: NRFResponse = { status: 'OK' };
        expectTypeOf(valid).toMatchTypeOf<NRFResponse>();

        // @ts-expect-error — "TIMEOUT" is not a valid NRFResponse status
        const _invalid: NRFResponse = { status: 'TIMEOUT' };
    });

    it('NRFCommand cmd must be a valid command', () => {
        const valid: NRFCommand = { cmd: 'SCAN' };
        expectTypeOf(valid).toMatchTypeOf<NRFCommand>();

        // @ts-expect-error — "REBOOT" is not a valid NRFCommand
        const _invalid: NRFCommand = { cmd: 'REBOOT' };
    });

    // -- Domain Types ----------------------------------------------------------

    it('CoachPayload contains all required fields', () => {
        const payload = {
            node_id: 'TRQ-12345-C03',
            train_number: '12345',
            coach_number: 3,
            occupancy_pct: 67,
            ticketed_count: 42,
            total_detected: 58,
            fusion: {
                occupancy_pct: 67,
                ticketed_count: 42,
                total_ble_count: 58,
                rf_occupancy_estimate: 62,
                zone_distribution: { door_a: 15, middle: 30, door_b: 13, unknown: 0 },
                fusion_confidence: 0.85,
                sensors_active: { ble_scanner: true, rf_power: true, aoa: true },
            },
            battery_pct: 84,
            firmware_version: '1.2.0',
            timestamp: 1718000000,
        } satisfies CoachPayload;
        expectTypeOf(payload).toMatchTypeOf<CoachPayload>();
    });

    it('CardHeader has correct magic tuple', () => {
        const header = {
            magic: [0x54, 0x52] as [number, number],
            ticket_id: 'ABCD12345678',
            train_number: '12345',
            coach_assigned: 3,
            validity_epoch: 1718000000,
            checksum: 0xff,
        } satisfies CardHeader;
        expectTypeOf(header.magic).toMatchTypeOf<[number, number]>();
    });

    it('Ticket requires valid status and coach_class', () => {
        const ticket = {
            ticket_id: 'ABCD12345678',
            user_uid: 'firebase-uid-123',
            train_number: '12345',
            journey_date: '2025-06-10',
            from_station: 'NDLS',
            to_station: 'BCT',
            coach: 'S3',
            coach_class: 'SL' as const,
            seat: '42',
            passenger_name: 'Rahul Sharma',
            qr_data: 'base64-encoded-data',
            status: 'active' as const,
            created_at: '2025-06-01T10:00:00Z',
        } satisfies Ticket;
        expectTypeOf(ticket).toMatchTypeOf<Ticket>();
    });

    it('ApiResponse is generic', () => {
        const response: ApiResponse<{ count: number }> = {
            success: true,
            data: { count: 42 },
        };
        expectTypeOf(response.data).toMatchTypeOf<{ count: number } | undefined>();
    });

    it('SocketEvents has correct event shapes', () => {
        expectTypeOf<SocketEvents['coach_update']>().toMatchTypeOf<CoachPayload>();
        expectTypeOf<SocketEvents['coach_alert']>().toMatchTypeOf<TraqAlert>();
    });
});
