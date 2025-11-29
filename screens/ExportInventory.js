// screens/ExportInventory.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { exportStocksToCSV } from "../utils/exportCsv";
import { getAllStocks } from "../db";

export default function ExportInventory({ navigation }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllStocks();
        setStocks(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load stocks.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExport = async () => {
    try {
      await exportStocksToCSV(stocks);
      Alert.alert("Success", "Inventory exported successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#35A9FF" />
        <Text style={styles.loadingText}>Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Current Inventory</Text>

      <TouchableOpacity style={styles.button} onPress={handleExport}>
        <Text style={styles.buttonText}>📦 Export to CSV</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const MEDI_BG = "#E6F9F7";
const MEDI_TEXT = "#1A3C47";
const MEDI_PRIMARY = "#35A9FF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDI_BG,
    padding: 20,
    justifyContent: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MEDI_BG,
  },

  loadingText: {
    marginTop: 10,
    color: MEDI_TEXT,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: MEDI_TEXT,
    textAlign: "center",
    marginBottom: 30,
  },

  button: {
    backgroundColor: MEDI_PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  cancelButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3F0EA",
  },

  cancelText: {
    textAlign: "center",
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});
