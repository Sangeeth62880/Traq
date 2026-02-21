import { InfluxRow } from '../types';

/**
 * Parse InfluxDB annotated CSV response into an array of row objects.
 */
export function parseCsv(csv: string): InfluxRow[] {
    const lines = csv.split('\n');
    const results: InfluxRow[] = [];
    let headers: string[] | null = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and annotations
        if (!trimmed || trimmed.startsWith('#')) {
            if (!trimmed) headers = null; // Reset headers for new table
            continue;
        }

        const values = splitCsvLine(trimmed);

        if (!headers) {
            headers = values;
            continue;
        }

        if (values.length >= headers.length) {
            const row: InfluxRow = {};
            for (let i = 0; i < headers.length; i++) {
                const key = headers[i];
                const val = i < values.length ? values[i] : '';
                if (key && key !== 'result' && key !== 'table' && key !== '') {
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal) && !key.includes('time') && !key.includes('Time')) {
                        row[key] = numVal;
                    } else {
                        row[key] = val;
                    }
                }
            }
            if (Object.keys(row).length > 0) {
                results.push(row);
            }
        }
    }

    return results;
}

function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
