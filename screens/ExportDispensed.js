// screens/ExportDispensed.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { exportDispensedToCSV } from "../utils/exportCsv";
import { getDispensedByMonth } from "../db";

export default function ExportDispensed({ navigation }) {
  const [dispensed, setDispensed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDispensedByMonth();
        setDispensed(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load dispensed records.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExport = async () => {
    try {
      await exportDispensedToCSV(dispensed);
      Alert.alert("Success", "Dispensed medicines exported successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#35A9FF" />
        <Text style={styles.loadingText}>Loading Dispensed Records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Dispensed Medicines</Text>

      <TouchableOpacity style={styles.button} onPress={handleExport}>
        <Text style={styles.buttonText}>💊 Export This Month's CSV</Text>
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
    backgroundColor: MEDI_BG,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
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
