import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

/**
 * Helper to create and write a CSV file
 */
async function createCsvFile(filename, content) {
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

/**
 * 🧾 Export current inventory as CSV
 */
export async function exportStocksToCSV(stocks) {
  if (!stocks || stocks.length === 0) {
    Alert.alert("No Data", "There are no stocks to export.");
    return;
  }

  try {
    const header =
      "ID,Name,Quantity,Low Threshold,Expiry Date,Date Added\n";
    const rows = stocks
      .map(
        (s) =>
          `${s.id},"${s.name}",${s.quantity},${s.low_threshold},"${s.expiry_date || ""}","${s.date_added || ""}"`
      )
      .join("\n");

    const csv = `${header}${rows}`;
    const fileUri = await createCsvFile(
      `medisync_inventory_${Date.now()}.csv`,
      csv
    );

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share Inventory CSV",
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      Alert.alert("Exported", `File saved at:\n${fileUri}`);
    }

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
    const fileUri = await createCsvFile(
      `medisync_dispensed_${Date.now()}.csv`,
      csv
    );

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: "Share Dispensed CSV",
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      Alert.alert("Exported", `File saved at:\n${fileUri}`);
    }

    return fileUri;
  } catch (error) {
    console.error("Error exporting dispensed CSV:", error);
    Alert.alert("Error", `Failed to export dispensed: ${error.message}`);
  }
}
