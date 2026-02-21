export interface TTRCredentials {
    division: string;      // Division code (e.g., "TVC")
    employeeId: string;    // Employee ID (e.g., "TTR001")
    password: string;      // Password
}

export interface TTRUser {
    employeeId: string;
    name: string;
    division: string;
    divisionName: string;
    zone: string;
    role: string;
}

// Hardcoded credentials for hackathon demo
const VALID_USERS: Array<TTRCredentials & { name: string; role: string }> = [
    { division: 'TVC', employeeId: 'TTR001', password: 'ttr@123', name: 'Rajeev Kumar', role: 'Senior TTR' },
    { division: 'ERS', employeeId: 'TTR002', password: 'ttr@123', name: 'Suresh Menon', role: 'TTR' },
    { division: 'PGT', employeeId: 'TTR003', password: 'ttr@123', name: 'Priya Nair', role: 'TTR' },
    { division: 'MAS', employeeId: 'TTR004', password: 'ttr@123', name: 'Arun Krishnan', role: 'Senior TTR' },
    { division: 'SBC', employeeId: 'TTR005', password: 'ttr@123', name: 'Deepa Sharma', role: 'TTR' },
    { division: 'BCT', employeeId: 'TTR006', password: 'ttr@123', name: 'Amit Patel', role: 'Chief TTR' },
    { division: 'NDLS', employeeId: 'TTR007', password: 'ttr@123', name: 'Sangeeth P S', role: 'TTR' },
    { division: 'HWH', employeeId: 'TTR008', password: 'ttr@123', name: 'Rajesh Gupta', role: 'Senior TTR' },
    { division: 'ADMIN', employeeId: 'ADMIN', password: 'admin@123', name: 'Administrator', role: 'Admin' },
];

const MASTER_PASSWORD = 'traq2026';

export interface RailwayDivision {
    code: string;
    name: string;
    zone: string;
}

export const RAILWAY_DIVISIONS: RailwayDivision[] = [
    // Southern Railway
    { code: 'TVC', name: 'Thiruvananthapuram', zone: 'Southern Railway' },
    { code: 'ERS', name: 'Ernakulam', zone: 'Southern Railway' },
    { code: 'PGT', name: 'Palakkad', zone: 'Southern Railway' },
    { code: 'MAS', name: 'Chennai', zone: 'Southern Railway' },
    { code: 'MDU', name: 'Madurai', zone: 'Southern Railway' },
    { code: 'SA', name: 'Salem', zone: 'Southern Railway' },
    // South Western Railway
    { code: 'SBC', name: 'Bangalore', zone: 'South Western Railway' },
    { code: 'UBL', name: 'Hubballi', zone: 'South Western Railway' },
    { code: 'MYS', name: 'Mysuru', zone: 'South Western Railway' },
    // Western Railway
    { code: 'BCT', name: 'Mumbai Central', zone: 'Western Railway' },
    { code: 'BRC', name: 'Vadodara', zone: 'Western Railway' },
    { code: 'ADI', name: 'Ahmedabad', zone: 'Western Railway' },
    // Central Railway
    { code: 'CSMT', name: 'Mumbai CSMT', zone: 'Central Railway' },
    { code: 'PA', name: 'Pune', zone: 'Central Railway' },
    { code: 'NGP', name: 'Nagpur', zone: 'Central Railway' },
    // Northern Railway
    { code: 'NDLS', name: 'Delhi', zone: 'Northern Railway' },
    { code: 'UMB', name: 'Ambala', zone: 'Northern Railway' },
    { code: 'LKO', name: 'Lucknow', zone: 'Northern Railway' },
    // Eastern Railway
    { code: 'HWH', name: 'Howrah', zone: 'Eastern Railway' },
    { code: 'SDAH', name: 'Sealdah', zone: 'Eastern Railway' },
    { code: 'ASN', name: 'Asansol', zone: 'Eastern Railway' },
    // South Central Railway
    { code: 'SC', name: 'Secunderabad', zone: 'South Central Railway' },
    { code: 'HYB', name: 'Hyderabad', zone: 'South Central Railway' },
    { code: 'BZA', name: 'Vijayawada', zone: 'South Central Railway' },
    // North Eastern Railway
    { code: 'GKP', name: 'Gorakhpur', zone: 'North Eastern Railway' },
    // Northeast Frontier Railway
    { code: 'GHY', name: 'Guwahati', zone: 'Northeast Frontier Railway' },
    // East Central Railway
    { code: 'DNR', name: 'Danapur', zone: 'East Central Railway' },
    // North Central Railway
    { code: 'AGC', name: 'Agra', zone: 'North Central Railway' },
    { code: 'ALD', name: 'Prayagraj', zone: 'North Central Railway' },
    // West Central Railway
    { code: 'BPL', name: 'Bhopal', zone: 'West Central Railway' },
    { code: 'JBP', name: 'Jabalpur', zone: 'West Central Railway' },
    // North Western Railway
    { code: 'JP', name: 'Jaipur', zone: 'North Western Railway' },
    { code: 'JU', name: 'Jodhpur', zone: 'North Western Railway' },
    // East Coast Railway
    { code: 'WAT', name: 'Waltair', zone: 'East Coast Railway' },
    { code: 'KUR', name: 'Khurda Road', zone: 'East Coast Railway' },
    // South East Central Railway
    { code: 'R', name: 'Raipur', zone: 'South East Central Railway' },
    { code: 'BSP', name: 'Bilaspur', zone: 'South East Central Railway' },
    { code: 'NGP', name: 'Nagpur SEC', zone: 'South East Central Railway' },
];

// Group divisions by zone for the dropdown
export function getDivisionsByZone(): Record<string, RailwayDivision[]> {
    const grouped: Record<string, RailwayDivision[]> = {};
    for (const div of RAILWAY_DIVISIONS) {
        if (!grouped[div.zone]) grouped[div.zone] = [];
        grouped[div.zone].push(div);
    }
    return grouped;
}

/**
 * Authenticate a TTR user.
 * Returns the user object if valid, null if invalid.
 */
export function authenticateTTR(credentials: TTRCredentials): TTRUser | null {
    const { division, employeeId, password } = credentials;

    // Check master password first (works with any ID and division)
    if (password === MASTER_PASSWORD) {
        const div = RAILWAY_DIVISIONS.find((d) => d.code === division);
        return {
            employeeId: employeeId.toUpperCase(),
            name: `TTR ${employeeId}`,
            division: division,
            divisionName: div?.name || division,
            zone: div?.zone || 'Indian Railways',
            role: 'TTR',
        };
    }

    // Check against hardcoded credentials
    const user = VALID_USERS.find(
        (u) =>
            u.employeeId.toUpperCase() === employeeId.toUpperCase() &&
            u.password === password &&
            (u.division === division || u.division === 'ADMIN')
    );

    if (!user) return null;

    const div = RAILWAY_DIVISIONS.find((d) => d.code === division);

    return {
        employeeId: user.employeeId,
        name: user.name,
        division: division,
        divisionName: div?.name || division,
        zone: div?.zone || 'Indian Railways',
        role: user.role,
    };
}

// Session management (localStorage)
const SESSION_KEY = 'traq_ttr_session';

export function saveSession(user: TTRUser): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        ...user,
        loginTime: new Date().toISOString(),
    }));
}

export function getSession(): TTRUser | null {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;
        return JSON.parse(data) as TTRUser;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}
