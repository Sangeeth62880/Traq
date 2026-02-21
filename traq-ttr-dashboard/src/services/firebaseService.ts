import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';

// ============================================================
// FIREBASE REALTIME DATABASE SCHEMA (confirmed from screenshot):
//
// Path: /tickets/{TICKET_ID}
//
// Fields:
//   coach: string        → "G1", "S1", "S2", etc.
//   from: string         → boarding station, e.g., "kottayam"
//   to: string           → destination station, e.g., "ernakulam"
//   trainNumber: string  → train number, e.g., "12626"
//   verified: boolean    → whether the ticket is verified
//   verifiedTime: number → timestamp of verification
//
// Example:
//   tickets/TICKET12345 = {
//     coach: "G1",
//     from: "kottayam",
//     to: "ernakulam",
//     trainNumber: "12626",
//     verified: true,
//     verifiedTime: 38726
//   }
// ============================================================

export interface TicketRecord {
    ticketId: string;
    coach: string;
    from: string;
    to: string;
    trainNumber: string;
    verified: boolean;
    verifiedTime: number;
}

/**
 * Get all tickets for a specific train number.
 * Queries Firebase RTDB: /tickets where trainNumber == trainNumber
 *
 * @param trainNumber - The train number to filter by (e.g., "12626")
 * @returns Array of ticket records
 */
export async function getTicketsForTrain(trainNumber: string): Promise<TicketRecord[]> {
    try {
        console.log(`[Firebase RTDB] Fetching tickets for train: ${trainNumber}`);

        const ticketsRef = ref(database, 'tickets');

        // Query: orderByChild('trainNumber').equalTo(trainNumber)
        // This finds all tickets where trainNumber matches
        const trainQuery = query(
            ticketsRef,
            orderByChild('trainNumber'),
            equalTo(trainNumber)
        );

        let snapshot;
        try {
            // First try the indexed query (requires .indexOn: "trainNumber" in rules)
            snapshot = await get(trainQuery);
        } catch (queryError: any) {
            // If the query fails due to missing index, fallback to fetching all and filtering
            console.warn(`[Firebase RTDB] Indexed query failed (${queryError.message}). Falling back to client-side filtering.`);
            const allSnapshot = await get(ticketsRef);

            if (!allSnapshot.exists()) {
                console.log(`[Firebase RTDB] No tickets found in database`);
                return [];
            }

            const allTickets: TicketRecord[] = [];
            allSnapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data && data.trainNumber === trainNumber) {
                    allTickets.push({
                        ticketId: childSnapshot.key || '',
                        coach: data.coach || 'UNKNOWN',
                        from: data.from || '',
                        to: data.to || '',
                        trainNumber: data.trainNumber || '',
                        verified: data.verified === true,
                        verifiedTime: data.verifiedTime || 0,
                    });
                }
            });

            console.log(`[Firebase RTDB] Found ${allTickets.length} tickets for train ${trainNumber} (fallback method)`);
            return allTickets;
        }

        if (!snapshot.exists()) {
            console.log(`[Firebase RTDB] No tickets found for train ${trainNumber}`);
            return [];
        }

        const tickets: TicketRecord[] = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            tickets.push({
                ticketId: childSnapshot.key || '',
                coach: data.coach || 'UNKNOWN',
                from: data.from || '',
                to: data.to || '',
                trainNumber: data.trainNumber || '',
                verified: data.verified === true,
                verifiedTime: data.verifiedTime || 0,
            });
        });

        console.log(`[Firebase RTDB] Found ${tickets.length} tickets for train ${trainNumber}`);
        return tickets;
    } catch (error: any) {
        console.error('[Firebase RTDB] Error fetching tickets:', error.message);

        // Log detailed error for debugging
        if (error.code === 'PERMISSION_DENIED') {
            console.error('[Firebase RTDB] Permission denied. Check database rules.');
        } else if (error.code === 'NETWORK_ERROR') {
            console.error('[Firebase RTDB] Network error. Check internet connection.');
        }

        return [];
    }
}

/**
 * Get the count of tickets per coach for a specific train.
 * This is the KEY function for TTR analysis.
 *
 * @param trainNumber - The train number (e.g., "12626")
 * @returns Map of coach ID → ticket count, e.g., { "G1": 12, "S1": 8 }
 */
export async function getTicketedCountPerCoach(
    trainNumber: string
): Promise<Record<string, number>> {
    const tickets = await getTicketsForTrain(trainNumber);

    if (tickets.length === 0) {
        return {};
    }

    // Group by coach and count
    const coachCounts: Record<string, number> = {};

    for (const ticket of tickets) {
        const coach = ticket.coach.toUpperCase().trim(); // Normalize: "g1" → "G1"
        coachCounts[coach] = (coachCounts[coach] || 0) + 1;
    }

    console.log(`[Firebase RTDB] Ticketed per coach for train ${trainNumber}:`, coachCounts);
    console.log(`[Firebase RTDB] Total ticketed: ${Object.values(coachCounts).reduce((a, b) => a + b, 0)}`);

    return coachCounts;
}

/**
 * Get the total count of tickets for a specific train.
 *
 * @param trainNumber - The train number
 * @returns Total ticket count
 */
export async function getTotalTicketCount(trainNumber: string): Promise<number> {
    const tickets = await getTicketsForTrain(trainNumber);
    return tickets.length;
}

/**
 * Get detailed ticket info for a specific coach.
 * Used when the TTR taps on a coach card to see individual tickets.
 *
 * @param trainNumber - The train number
 * @param coachId - The coach ID (e.g., "G1")
 * @returns Array of tickets in that coach
 */
export async function getTicketsForCoach(
    trainNumber: string,
    coachId: string
): Promise<TicketRecord[]> {
    const allTickets = await getTicketsForTrain(trainNumber);

    const coachTickets = allTickets.filter(
        (t) => t.coach.toUpperCase().trim() === coachId.toUpperCase().trim()
    );

    console.log(
        `[Firebase RTDB] Coach ${coachId} in train ${trainNumber}: ${coachTickets.length} tickets`
    );

    return coachTickets;
}

/**
 * Get all unique train numbers that have tickets in the database.
 * Useful for showing which trains have booking data.
 */
export async function getTrainsWithTickets(): Promise<string[]> {
    try {
        const ticketsRef = ref(database, 'tickets');
        const snapshot = await get(ticketsRef);

        if (!snapshot.exists()) return [];

        const trainNumbers = new Set<string>();
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.trainNumber) {
                trainNumbers.add(data.trainNumber);
            }
        });

        const result = Array.from(trainNumbers);
        console.log(`[Firebase RTDB] Trains with tickets: ${result.join(', ')}`);
        return result;
    } catch (error: any) {
        console.error('[Firebase RTDB] Error fetching trains:', error.message);
        return [];
    }
}

/**
 * Get a summary of all tickets grouped by train and coach.
 * Returns: { "12626": { "G1": 5, "S1": 3 }, "12951": { "S2": 8 } }
 */
export async function getAllTicketsSummary(): Promise<Record<string, Record<string, number>>> {
    try {
        const ticketsRef = ref(database, 'tickets');
        const snapshot = await get(ticketsRef);

        if (!snapshot.exists()) return {};

        const summary: Record<string, Record<string, number>> = {};

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const trainNum = data.trainNumber;
            const coach = (data.coach || 'UNKNOWN').toUpperCase().trim();

            if (trainNum) {
                if (!summary[trainNum]) summary[trainNum] = {};
                summary[trainNum][coach] = (summary[trainNum][coach] || 0) + 1;
            }
        });

        console.log('[Firebase RTDB] Full tickets summary:', summary);
        return summary;
    } catch (error: any) {
        console.error('[Firebase RTDB] Error fetching summary:', error.message);
        return {};
    }
}

/**
 * Test Firebase RTDB connection.
 */
export async function testConnection(): Promise<{
    connected: boolean;
    ticketCount: number;
    trainCount: number;
}> {
    try {
        const ticketsRef = ref(database, 'tickets');
        const snapshot = await get(ticketsRef);

        if (!snapshot.exists()) {
            return { connected: true, ticketCount: 0, trainCount: 0 };
        }

        let ticketCount = 0;
        const trains = new Set<string>();

        snapshot.forEach((child) => {
            ticketCount++;
            const data = child.val();
            if (data.trainNumber) trains.add(data.trainNumber);
        });

        console.log(
            `[Firebase RTDB] ✅ Connected | ${ticketCount} tickets | ${trains.size} trains`
        );

        return {
            connected: true,
            ticketCount,
            trainCount: trains.size,
        };
    } catch (error: any) {
        console.error('[Firebase RTDB] ❌ Connection test failed:', error.message);
        return { connected: false, ticketCount: 0, trainCount: 0 };
    }
}
