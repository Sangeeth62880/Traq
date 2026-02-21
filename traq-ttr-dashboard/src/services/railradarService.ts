import axios from 'axios';
import { CONFIG } from '../config/constants';
import { TrainSearchResult } from '../types';

/**
 * Search trains by name or number via RailRadar API.
 */
export async function searchTrains(queryText: string): Promise<TrainSearchResult[]> {
    if (queryText.trim().length < 1) return [];

    try {
        console.log(`[RailRadar] Searching: "${queryText}"`);

        const response = await axios.get(`${CONFIG.railradar.baseUrl}/search/trains`, {
            params: {
                query: queryText.trim(),
                apiKey: CONFIG.railradar.apiKey,
            },
            timeout: 10000,
        });

        const trainList = extractTrainList(response.data);

        const results: TrainSearchResult[] = trainList
            .map((item: any) => ({
                trainNumber: getString(item, ['trainNumber', 'train_number', 'number']),
                trainName: getString(item, ['trainName', 'train_name', 'name']),
                sourceStationCode: getString(item, ['sourceStationCode', 'source_station_code', 'source', 'from']),
                destinationStationCode: getString(item, ['destinationStationCode', 'destination_station_code', 'destination', 'to']),
            }))
            .filter((r: TrainSearchResult) => r.trainNumber !== '');

        console.log(`[RailRadar] Found ${results.length} trains`);
        return results;
    } catch (error: any) {
        console.error('[RailRadar] Search error:', error.message);
        return [];
    }
}

function extractTrainList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        for (const key of ['data', 'trains', 'results', 'items', 'body']) {
            if (Array.isArray(data[key])) return data[key];
        }
        if (data.trainNumber || data.train_number) return [data];
        const numericValues = Object.keys(data)
            .filter((k) => !isNaN(Number(k)))
            .map((k) => data[k]);
        if (numericValues.length > 0) return numericValues;
        for (const val of Object.values(data)) {
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') return val;
        }
    }
    return [];
}

function getString(obj: any, keys: string[]): string {
    for (const key of keys) {
        if (obj[key] != null) return String(obj[key]);
    }
    return '';
}

export async function testConnection(): Promise<boolean> {
    try {
        const results = await searchTrains('ERS');
        return results.length > 0;
    } catch {
        return false;
    }
}
