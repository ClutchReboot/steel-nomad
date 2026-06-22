import * as SQLite from "expo-sqlite";

export type RideRecord = {
  id: string;
  startTime: string;
  endTime: string | null;
  durationMs: number | null;
  route: string; // JSON stringified GPS points
};

const db = SQLite.openDatabaseSync("ranger.db");

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
}

/**
 * Start a ride
 */
export function startRide(record: RideRecord) {
  db.runSync(
    `INSERT INTO rides (id, startTime, endTime, durationMs, route)
     VALUES (?, ?, ?, ?, ?);`,
    [
      record.id,
      record.startTime,
      null,
      null,
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
  db.runSync(
    `UPDATE rides SET route = ? WHERE id = ?;`,
    [JSON.stringify(route), id]
  );
}

/**
 * Get all rides
 */
export function getRides(): RideRecord[] {
  return db.getAllSync<RideRecord>(
    `SELECT * FROM rides ORDER BY startTime DESC;`
  );
}

/**
 * Get active ride (one without endTime)
 */
export function getActiveRide(): RideRecord | null {
  return (
    db.getFirstSync<RideRecord>(
      `SELECT * FROM rides WHERE endTime IS NULL LIMIT 1;`
    ) ?? null
  );
}