import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import * as SQLite from "expo-sqlite";

/**
 * Helper to save a CSV file, with user selection on Android
 */
async function saveFileWithSelection(filename, content) {
  if (Platform.OS === 'android') {
    // On Android, prompt user to select a directory and save there
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const directoryUri = permissions.directoryUri;
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(directoryUri, filename, 'text/csv');
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        Alert.alert("Exported", `File saved to selected directory.`);
        return fileUri;
      } else {
        throw new Error("Permission to access directory denied.");
      }
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  } else {
    // On iOS, save to app directory and share
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share CSV",
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      Alert.alert("Exported", `File saved at:\n${fileUri}`);
    }
    return fileUri;
  }
}

/**
 * Ensure the SQLite database is open
 */
let db;
async function ensureDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("medisync.db");
  }
  return db;
}

/**
 * 🧾 Export current inventory as CSV
 * Columns: ID,Med Name,Used Quantity (This Month),Remaining Quantity,Date Replenish,Expiry Date
 */
export async function exportStocksToCSV(stocks) {
  if (!stocks || stocks.length === 0) {
    Alert.alert("No Data", "There are no stocks to export.");
    return;
  }

  try {
    const database = await ensureDB();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const header =
      "ID,Med Name,Used Quantity (This Month),Remaining Quantity,Date Replenish,Expiry Date\n";

    const rows = [];
    for (const s of stocks) {
      const usedRow = await database.getAllAsync(
        `SELECT IFNULL(SUM(quantity), 0) AS used
         FROM dispense
         WHERE med_name = ? AND date_dispensed BETWEEN ? AND ?;`,
        [s.name, firstDay, lastDay]
      );

      const usedQty = usedRow?.[0]?.used ?? 0;
      const medName = (s.name || "").replace(/"/g, '""');
      const remaining = s.quantity ?? "";
      const replenish = s.date_added || "";
      const expiry = s.expiry_date || "";

      rows.push(
        `${s.id},"${medName}",${usedQty},${remaining},"${replenish}","${expiry}"`
      );
    }

    const csv = `${header}${rows.join("\n")}`;
    const fileUri = await saveFileWithSelection(
      `medisync_inventory_${Date.now()}.csv`,
      csv
    );

    return fileUri;
  } catch (error) {
    console.error("Error exporting inventory CSV:", error);
    Alert.alert("Error", `Failed to export: ${error.message}`);
  }
}

/**
 * 💊 Export dispensed medicines as CSV
 */
export async function exportDispensedToCSV(dispensedList) {
  if (!dispensedList || dispensedList.length === 0) {
    Alert.alert("No Data", "There are no dispensed records to export.");
    return;
  }

  try {
    const header =
      "ID,Student Name,Age,Date Dispensed,Medicine Name,Quantity,Expiry Date,Date Added\n";
    const rows = dispensedList
      .map(
        (d) =>
          `${d.id},"${d.student_name || ""}",${d.age || ""},"${d.date_dispensed || ""}","${d.med_name || ""}",${d.quantity || ""},"${d.expiry_date || ""}","${d.date_added || ""}"`
      )
      .join("\n");

    const csv = `${header}${rows}`;
    const fileUri = await saveFileWithSelection(
      `medisync_dispensed_${Date.now()}.csv`,
      csv
    );

    return fileUri;
  } catch (error) {
    console.error("Error exporting dispensed CSV:", error);
    Alert.alert("Error", `Failed to export dispensed: ${error.message}`);
  }
}