export interface RailRadarLiveStatus {
    train_number: string;
    train_name: string;
    current_station_code: string;
    current_station_name: string;
    next_station_code: string;
    next_station_name: string;
    delay_in_minutes: number;
    distance_covered_percent: number;
    updated_at: string;
    // other raw fields omitted for brevity
}

export interface RailRadarScheduleStop {
    station_code: string;
    station_name: string;
    arrival_time: string;
    departure_time: string;
    day: number;
    distance: string;
    halt: string;
}

export interface RailRadarSearchHit {
    train_number: string;
    train_name: string;
    from_station: string;
    to_station: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    types?: string[];
    days?: number[];
}

export interface RailRadarBetweenStationsHit {
    train_number: string;
    train_name: string;
    from_time: string;
    to_time: string;
    travel_time: string;
    days_of_run: number[];
}

export interface RailRadarSearchResponse {
    status: boolean;
    data: RailRadarSearchHit[];
}

export interface RailRadarStatusResponse {
    status: boolean;
    data: RailRadarLiveStatus;
}

export interface RailRadarScheduleResponse {
    status: boolean;
    data: RailRadarScheduleStop[];
}

export interface RailRadarBetweenStationsResponse {
    status: boolean;
    data: RailRadarBetweenStationsHit[];
}
