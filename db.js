import * as SQLite from "expo-sqlite";

let db;

// ✅ Initialize Database
export async function initDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("medisync.db");
  }

  // ✅ Create main stock table (no supplier, added date_added)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      low_threshold INTEGER DEFAULT 10,
      expiry_date TEXT,
      date_added TEXT,
      dispensed INTEGER DEFAULT 0,
      notif_low_id TEXT,
      notif_expiry_id TEXT
    );
  `);

  // ✅ Create dispensed medicine table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dispense (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT,
      age INTEGER,
      date_dispensed TEXT,
      med_name TEXT,
      quantity INTEGER,
      expiry_date TEXT,
      date_added TEXT
    );
  `);

  return db;
}

// ✅ Ensure DB initialized
async function ensureDB() {
  if (!db) await initDB();
  return db;
}

// ✅ Add stock
export async function addStock({
  name,
  quantity,
  low_threshold = 10,
  expiry_date = null,
}) {
  const database = await ensureDB();
  const date_added = new Date().toISOString().slice(0, 10);

  await database.runAsync(
    `INSERT INTO stocks (name, quantity, low_threshold, expiry_date, date_added)
     VALUES (?, ?, ?, ?, ?);`,
    [name, quantity, low_threshold, expiry_date, date_added]
  );

  const result = await database.getAllAsync(
    `SELECT last_insert_rowid() AS id;`
  );
  return result?.[0]?.id;
}

// ✅ Update stock
export async function updateStock(id, fields) {
  const database = await ensureDB();
  const keys = Object.keys(fields);
  const values = keys.map((k) => fields[k]);
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  await database.runAsync(`UPDATE stocks SET ${setClause} WHERE id = ?;`, [
    ...values,
    id,
  ]);
}

// ✅ Delete stock
export async function deleteStock(id) {
  const database = await ensureDB();
  await database.runAsync(`DELETE FROM stocks WHERE id = ?;`, [id]);
}

// ✅ Get all stocks
export async function getAllStocks() {
  const database = await ensureDB();
  return await database.getAllAsync(
    `SELECT * FROM stocks ORDER BY name COLLATE NOCASE;`
  );
}

// ✅ Low-stock items
export async function getLowStockItems() {
  const database = await ensureDB();
  return await database.getAllAsync(
    `SELECT * FROM stocks WHERE quantity <= low_threshold ORDER BY name;`
  );
}

// ✅ Expiring soon
export async function getExpiringSoonItems(days = 30) {
  const database = await ensureDB();
  const today = new Date();
  const cutoff = new Date(today.getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);

  return await database.getAllAsync(
    `SELECT * FROM stocks 
     WHERE expiry_date IS NOT NULL 
     AND expiry_date <= ? 
     ORDER BY expiry_date;`,
    [cutoff]
  );
}

// ✅ Expired items
export async function getExpiredItems() {
  const database = await ensureDB();
  const today = new Date().toISOString().slice(0, 10);

  return await database.getAllAsync(
    `SELECT * FROM stocks 
     WHERE expiry_date IS NOT NULL 
     AND expiry_date < ? 
     ORDER BY expiry_date;`,
    [today]
  );
}

// ✅ Clear table (optional for testing)
export async function clearAllStocks() {
  const database = await ensureDB();
  await database.execAsync(`DELETE FROM stocks;`);
}

//
// ==========================================
// ✅ DISPENSE FUNCTIONS
// ==========================================
//

// Add a dispensed record
export async function addDispensed({
  student_name,
  age,
  date_dispensed,
  med_name,
  quantity,
  expiry_date,
  date_added,
}) {
  const database = await ensureDB();

  await database.runAsync(
    `INSERT INTO dispense (student_name, age, date_dispensed, med_name, quantity, expiry_date, date_added)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [student_name, age, date_dispensed, med_name, quantity, expiry_date, date_added]
  );

  // Decrease stock quantity automatically
  await database.runAsync(
    `UPDATE stocks SET quantity = quantity - ? WHERE name = ?;`,
    [quantity, med_name]
  );
}

// Get all dispensed medicines
export async function getAllDispensed() {
  const database = await ensureDB();
  return await database.getAllAsync(
    `SELECT * FROM dispense ORDER BY date_dispensed DESC;`
  );
}

// Get dispensed medicines within current month
export async function getMonthlyDispensed() {
  const database = await ensureDB();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  return await database.getAllAsync(
    `SELECT * FROM dispense WHERE date_dispensed BETWEEN ? AND ? ORDER BY date_dispensed DESC;`,
    [firstDay, lastDay]
  );
}

// ✅ Get dispensed medicines by specific date
export async function getDispensedByDate(date) {
  const database = await ensureDB();
  return await database.getAllAsync(
    `SELECT * FROM dispense WHERE date_dispensed = ? ORDER BY id DESC;`,
    [date]
  );
}

// ✅ Get dispensed medicines for the current month
export async function getDispensedByMonth() {
  const database = await ensureDB(); // ✅ use ensureDB(), not openDatabaseAsync()
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const monthStr = `${year}-${month}`; // e.g., "2025-10"

  const result = await database.getAllAsync(
    `SELECT * FROM dispense 
     WHERE strftime('%Y-%m', date_dispensed) = ? 
     ORDER BY date_dispensed DESC;`,
    [monthStr]
  );

  return result;
}

export async function getStockByNameAndExpiry(name, expiry_date) {
  const database = await ensureDB();
  const result = await database.getAllAsync(
    `SELECT * FROM stocks WHERE name = ? AND (expiry_date = ? OR (expiry_date IS NULL AND ? IS NULL)) LIMIT 1;`,
    [name, expiry_date, expiry_date]
  );
  return result?.[0] || null; // Return the stock if found, else null
}

// ✅ Get dispensed medicines by date range
export async function getDispensedByDateRange(startDate, endDate) {
  const database = await ensureDB();
  return await database.getAllAsync(
    `SELECT * FROM dispense WHERE date_dispensed BETWEEN ? AND ? ORDER BY date_dispensed DESC;`,
    [startDate, endDate]
  );
}
