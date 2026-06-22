import * as SQLite from "expo-sqlite";

export type MaintenanceRecord = {
  id: string;
  title: string;
  mileage: string;
  date: string;
};

const db = SQLite.openDatabaseSync("ranger.db");

/**
 * Initialize database + table
 */
export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      mileage TEXT,
      date TEXT NOT NULL
    );
  `);
}

/**
 * Insert a maintenance record
 */
export function addMaintenance(record: MaintenanceRecord) {
  db.runSync(
    `INSERT INTO maintenance (id, title, mileage, date)
     VALUES (?, ?, ?, ?);`,
    [record.id, record.title, record.mileage, record.date]
  );
}

/**
 * Fetch all records
 */
export function getMaintenance(): MaintenanceRecord[] {
  const result = db.getAllSync<MaintenanceRecord>(
    `SELECT * FROM maintenance ORDER BY date DESC;`
  );

  return result;
}

/**
 * Optional: delete a record (future use)
 */
export function deleteMaintenance(id: string) {
  db.runSync(
    `DELETE FROM maintenance WHERE id = ?;`,
    [id]
  );
}