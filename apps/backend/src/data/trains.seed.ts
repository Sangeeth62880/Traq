import type { TrainResult } from '@traq/shared-types';

export const TRAINS: TrainResult[] = [
    {
        train_number: "12951",
        train_name: "MUMBAI NEW DELHI RAJDHANI",
        from_station: "BCT",
        to_station: "NDLS",
        departure_time: "17:00",
        arrival_time: "08:32",
        duration_minutes: 932,
        coach_classes: ['1AC', '2AC', '3AC'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12009",
        train_name: "MUMBAI CENTRAL - AHMEDABAD SHATABDI",
        from_station: "BCT",
        to_station: "ADI",
        departure_time: "06:20",
        arrival_time: "12:45",
        duration_minutes: 385,
        coach_classes: ['EC', 'CC'],
        days_of_operation: ["1", "2", "3", "4", "5", "6"]
    },
    {
        train_number: "12123",
        train_name: "DECCAN QUEEN",
        from_station: "CSTM",
        to_station: "PUNE",
        departure_time: "17:10",
        arrival_time: "20:25",
        duration_minutes: 195,
        coach_classes: ['CC', '2S'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12615",
        train_name: "GRAND TRUNK EXP",
        from_station: "MAS",
        to_station: "NDLS",
        departure_time: "18:50",
        arrival_time: "06:30",
        duration_minutes: 2140, // Multi-day
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12245",
        train_name: "HOWRAH - YPR DURONTO",
        from_station: "HWH",
        to_station: "YPR",
        departure_time: "10:50",
        arrival_time: "15:45",
        duration_minutes: 1735,
        coach_classes: ['1AC', '2AC', '3AC', 'SL'],
        days_of_operation: ["2", "3", "5", "6", "7"]
    },
    {
        train_number: "99813",
        train_name: "CHURCHGATE - BORIVALI LOCAL",
        from_station: "CCG",
        to_station: "BVI",
        departure_time: "08:15",
        arrival_time: "09:02",
        duration_minutes: 47,
        coach_classes: ['GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "99815",
        train_name: "CHURCHGATE - VIRAR FAST LOCAL",
        from_station: "CCG",
        to_station: "VR",
        departure_time: "18:05",
        arrival_time: "19:28",
        duration_minutes: 83,
        coach_classes: ['GN'],
        days_of_operation: ["1", "2", "3", "4", "5"]
    },
    {
        train_number: "12839",
        train_name: "HOWRAH CHENNAI MAIL",
        from_station: "HWH",
        to_station: "MAS",
        departure_time: "23:55",
        arrival_time: "03:15",
        duration_minutes: 1640,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12702",
        train_name: "HUSSAIN SAGAR EXPRESS",
        from_station: "HYB",
        to_station: "CSTM",
        departure_time: "14:45",
        arrival_time: "04:55",
        duration_minutes: 850,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "22691",
        train_name: "BANGALORE RAJDHANI",
        from_station: "SBC",
        to_station: "NZM",
        departure_time: "20:00",
        arrival_time: "05:50",
        duration_minutes: 2030,
        coach_classes: ['1AC', '2AC', '3AC'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "11009",
        train_name: "SINHAGAD EXPRESS",
        from_station: "CSTM",
        to_station: "PUNE",
        departure_time: "14:30",
        arrival_time: "18:40",
        duration_minutes: 250,
        coach_classes: ['CC', '2S'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12311",
        train_name: "NETAJI EXPRESS",
        from_station: "HWH",
        to_station: "KLK",
        departure_time: "21:55",
        arrival_time: "03:00",
        duration_minutes: 1745,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12621",
        train_name: "TAMIL NADU EXPRESS",
        from_station: "MAS",
        to_station: "NDLS",
        departure_time: "22:00",
        arrival_time: "06:30",
        duration_minutes: 1950,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12810",
        train_name: "HOWRAH MAIL",
        from_station: "CSTM",
        to_station: "HWH",
        departure_time: "21:10",
        arrival_time: "06:15",
        duration_minutes: 1985,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12431",
        train_name: "TRIVANDRUM RAJDHANI",
        from_station: "TVC",
        to_station: "NZM",
        departure_time: "19:15",
        arrival_time: "12:40",
        duration_minutes: 2485,
        coach_classes: ['1AC', '2AC', '3AC'],
        days_of_operation: ["2", "4", "5"]
    },
    {
        train_number: "12224",
        train_name: "ERNAKULAM LTT DURONTO",
        from_station: "ERS",
        to_station: "LTT",
        departure_time: "21:30",
        arrival_time: "18:15",
        duration_minutes: 1245,
        coach_classes: ['1AC', '2AC', '3AC', 'SL'],
        days_of_operation: ["3", "7"]
    },
    {
        train_number: "12002",
        train_name: "NEW DELHI BHOPAL SHATABDI",
        from_station: "NDLS",
        to_station: "RKMP",
        departure_time: "06:00",
        arrival_time: "14:40",
        duration_minutes: 520,
        coach_classes: ['EC', 'CC'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12903",
        train_name: "GOLDEN TEMPLE MAIL",
        from_station: "BCT",
        to_station: "ASR",
        departure_time: "18:45",
        arrival_time: "05:30",
        duration_minutes: 2085,
        coach_classes: ['1AC', '2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    },
    {
        train_number: "12259",
        train_name: "SEALDAH BIKANER DURONTO",
        from_station: "SDAH",
        to_station: "BKN",
        departure_time: "17:00",
        arrival_time: "11:45",
        duration_minutes: 1125,
        coach_classes: ['1AC', '2AC', '3AC', 'SL'],
        days_of_operation: ["1", "3", "4", "7"]
    },
    {
        train_number: "15017",
        train_name: "LOKMANYA TILAK GORAKHPUR EXPRESS",
        from_station: "LTT",
        to_station: "GKP",
        departure_time: "06:35",
        arrival_time: "18:50",
        duration_minutes: 2175,
        coach_classes: ['2AC', '3AC', 'SL', 'GN'],
        days_of_operation: ["1", "2", "3", "4", "5", "6", "7"]
    }
];
