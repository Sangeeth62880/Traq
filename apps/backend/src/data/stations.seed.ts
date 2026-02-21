import type { StationInfo } from '@traq/shared-types';

export const STATIONS: StationInfo[] = [
    // Mumbai Zone
    { code: "CSTM", name: "Chhatrapati Shivaji Maharaj Terminus", delay_minutes: 0, stop_number: 1 },
    { code: "DR", name: "Dadar Central", delay_minutes: 0, stop_number: 1 },
    { code: "TNA", name: "Thane", delay_minutes: 0, stop_number: 1 },
    { code: "PNVL", name: "Panvel", delay_minutes: 0, stop_number: 1 },
    { code: "VDVD", name: "Vadodara", delay_minutes: 0, stop_number: 1 },
    { code: "BCT", name: "Mumbai Central", delay_minutes: 0, stop_number: 1 },
    { code: "LTT", name: "Lokmanya Tilak Terminus", delay_minutes: 0, stop_number: 1 },
    { code: "BVI", name: "Borivali", delay_minutes: 0, stop_number: 1 },
    { code: "CCG", name: "Churchgate", delay_minutes: 0, stop_number: 1 },
    { code: "VR", name: "Virar", delay_minutes: 0, stop_number: 1 },

    // Delhi Zone
    { code: "NDLS", name: "New Delhi", delay_minutes: 0, stop_number: 1 },
    { code: "DLI", name: "Old Delhi", delay_minutes: 0, stop_number: 1 },
    { code: "NZM", name: "Hazrat Nizamuddin", delay_minutes: 0, stop_number: 1 },
    { code: "GZB", name: "Ghaziabad", delay_minutes: 0, stop_number: 1 },
    { code: "ANVT", name: "Anand Vihar Terminal", delay_minutes: 0, stop_number: 1 },

    // Chennai & South
    { code: "MAS", name: "Chennai Central", delay_minutes: 0, stop_number: 1 },
    { code: "MS", name: "Chennai Egmore", delay_minutes: 0, stop_number: 1 },
    { code: "SBC", name: "KSR Bengaluru", delay_minutes: 0, stop_number: 1 },
    { code: "BNC", name: "Bengaluru Cantonment", delay_minutes: 0, stop_number: 1 },
    { code: "YPR", name: "Yesvantpur Junction", delay_minutes: 0, stop_number: 1 },
    { code: "TVC", name: "Thiruvananthapuram Central", delay_minutes: 0, stop_number: 1 },
    { code: "ERS", name: "Ernakulam Junction", delay_minutes: 0, stop_number: 1 },

    // Kolkata & East
    { code: "HWH", name: "Howrah Junction", delay_minutes: 0, stop_number: 1 },
    { code: "KOAA", name: "Kolkata", delay_minutes: 0, stop_number: 1 },
    { code: "SDAH", name: "Sealdah", delay_minutes: 0, stop_number: 1 },
    { code: "PNBE", name: "Patna Junction", delay_minutes: 0, stop_number: 1 },
    { code: "BBS", name: "Bhubaneswar", delay_minutes: 0, stop_number: 1 },

    // Central & West (Pune, Hyd, Guj)
    { code: "PUNE", name: "Pune Junction", delay_minutes: 0, stop_number: 1 },
    { code: "DD", name: "Daund Junction", delay_minutes: 0, stop_number: 1 },
    { code: "SC", name: "Secunderabad", delay_minutes: 0, stop_number: 1 },
    { code: "HYB", name: "Hyderabad Deccan", delay_minutes: 0, stop_number: 1 },
    { code: "ADI", name: "Ahmedabad Junction", delay_minutes: 0, stop_number: 1 },
    { code: "ST", name: "Surat", delay_minutes: 0, stop_number: 1 },
    { code: "BKN", name: "Bikaner Junction", delay_minutes: 0, stop_number: 1 },
    { code: "JP", name: "Jaipur Junction", delay_minutes: 0, stop_number: 1 },

    // North & UP
    { code: "LKO", name: "Lucknow NR", delay_minutes: 0, stop_number: 1 },
    { code: "CNB", name: "Kanpur Central", delay_minutes: 0, stop_number: 1 },
    { code: "BSB", name: "Varanasi Junction", delay_minutes: 0, stop_number: 1 },
    { code: "GKP", name: "Gorakhpur Junction", delay_minutes: 0, stop_number: 1 },
    { code: "ASR", name: "Amritsar Junction", delay_minutes: 0, stop_number: 1 },
    { code: "CDG", name: "Chandigarh Junction", delay_minutes: 0, stop_number: 1 },

    // MP & Central
    { code: "BPL", name: "Bhopal Junction", delay_minutes: 0, stop_number: 1 },
    { code: "RKMP", name: "Rani Kamlapati", delay_minutes: 0, stop_number: 1 },
    { code: "JBP", name: "Jabalpur Junction", delay_minutes: 0, stop_number: 1 },
    { code: "NGP", name: "Nagpur Junction", delay_minutes: 0, stop_number: 1 }
];

export const POPULAR_ROUTES = [
    { from: STATIONS.find(s => s.code === 'CSTM')!, to: STATIONS.find(s => s.code === 'PUNE')!, label: 'Mumbai ↔ Pune' },
    { from: STATIONS.find(s => s.code === 'BCT')!, to: STATIONS.find(s => s.code === 'NDLS')!, label: 'Mumbai ↔ Delhi' },
    { from: STATIONS.find(s => s.code === 'NDLS')!, to: STATIONS.find(s => s.code === 'LKO')!, label: 'Delhi ↔ Lucknow' },
    { from: STATIONS.find(s => s.code === 'HWH')!, to: STATIONS.find(s => s.code === 'NDLS')!, label: 'Kolkata ↔ Delhi' },
    { from: STATIONS.find(s => s.code === 'SBC')!, to: STATIONS.find(s => s.code === 'MAS')!, label: 'Bengaluru ↔ Chennai' },
    { from: STATIONS.find(s => s.code === 'PUNE')!, to: STATIONS.find(s => s.code === 'HYB')!, label: 'Pune ↔ Hyderabad' },
    { from: STATIONS.find(s => s.code === 'BCT')!, to: STATIONS.find(s => s.code === 'ADI')!, label: 'Mumbai ↔ Ahmedabad' },
    { from: STATIONS.find(s => s.code === 'CCG')!, to: STATIONS.find(s => s.code === 'BVI')!, label: 'Churchgate ↔ Borivali' },
];
