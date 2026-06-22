import * as SQLite from "expo-sqlite";

export type RidePracticeItem = {
    id: string;
    title: string;
    description: string;
    selectedAt: string;
};

export type RideRecord = {
    id: string;
    startTime: string;
    endTime: string | null;
    durationMs: number | null;
    route: string; // JSON stringified GPS points
    practiceItems: string; // JSON stringified practice selections
};

const db = SQLite.openDatabaseSync("ranger.db");
let rideDbInitialized = false;

function ensureRideDBInitialized() {
    if (rideDbInitialized) {
        return;
    }

    initRideDB();
    rideDbInitialized = true;
}

function parsePracticeItems(practiceItems: string | null | undefined) {
    if (!practiceItems) {
        return [] as RidePracticeItem[];
    }

    try {
        const parsed = JSON.parse(practiceItems);

        if (!Array.isArray(parsed)) {
            return [] as RidePracticeItem[];
        }

        return parsed as RidePracticeItem[];
    } catch {
        return [] as RidePracticeItem[];
    }
}

/**
 * Initialize database
 */
export function initRideDB() {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS rides (
      id TEXT PRIMARY KEY NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      durationMs INTEGER,
      route TEXT
    );
  `);

    try {
        db.execSync(`
      ALTER TABLE rides
      ADD COLUMN practiceItems TEXT NOT NULL DEFAULT '[]';
    `);
    } catch {
        // Column already exists on newer installs.
    }
}

/**
 * Start a ride
 */
export function startRide(record: RideRecord) {
    ensureRideDBInitialized();

    db.runSync(
        `INSERT INTO rides (id, startTime, endTime, durationMs, route, practiceItems)
     VALUES (?, ?, ?, ?, ?, ?);`,
        [
            record.id,
            record.startTime,
            null,
            null,
            JSON.stringify([]),
            JSON.stringify([]),
        ]
    );
}

/**
 * End a ride (time + duration only)
 */
export function endRide(
    id: string,
    endTime: string,
    durationMs: number
) {
    ensureRideDBInitialized();

    db.runSync(
        `UPDATE rides
     SET endTime = ?, durationMs = ?
     WHERE id = ?;`,
        [endTime, durationMs, id]
    );
}

/**
 * Update GPS route for a ride
 * (THIS is the function you were missing)
 */
export function updateRideRoute(id: string, route: any[]) {
    ensureRideDBInitialized();

    db.runSync(
        `UPDATE rides SET route = ? WHERE id = ?;`,
        [JSON.stringify(route), id]
    );
}

/**
 * Append a practice selection to an active ride
 */
export function appendRidePractice(
    id: string,
    practice: Omit<RidePracticeItem, "selectedAt">
) {
    ensureRideDBInitialized();

    const ride = db.getFirstSync<RideRecord>(
        `SELECT COALESCE(practiceItems, '[]') AS practiceItems
     FROM rides
     WHERE id = ?
     LIMIT 1;`,
        [id]
    );

    if (!ride) {
        return;
    }

    const currentPractices = parsePracticeItems(ride.practiceItems);

    if (currentPractices.some((item) => item.id === practice.id)) {
        return;
    }

    const nextPractices: RidePracticeItem[] = [
        ...currentPractices,
        {
            ...practice,
            selectedAt: new Date().toISOString(),
        },
    ];

    db.runSync(
        `UPDATE rides
     SET practiceItems = ?
     WHERE id = ?;`,
        [JSON.stringify(nextPractices), id]
    );
}

/**
 * Parse stored practice selections safely
 */
export function getRidePracticeItems(practiceItems: string | null | undefined) {
    return parsePracticeItems(practiceItems);
}

/**
 * Get all rides
 */
export function getRides(): RideRecord[] {
    ensureRideDBInitialized();

    return db.getAllSync<RideRecord>(
        `SELECT
       id,
       startTime,
       endTime,
       durationMs,
       COALESCE(route, '[]') AS route,
       COALESCE(practiceItems, '[]') AS practiceItems
     FROM rides
     ORDER BY startTime DESC;`
    );
}

/**
 * Get active ride (one without endTime)
 */
export function getActiveRide(): RideRecord | null {
    ensureRideDBInitialized();

    return (
        db.getFirstSync<RideRecord>(
            `SELECT
         id,
         startTime,
         endTime,
         durationMs,
         COALESCE(route, '[]') AS route,
         COALESCE(practiceItems, '[]') AS practiceItems
       FROM rides
       WHERE endTime IS NULL
       LIMIT 1;`
        ) ?? null
    );
}