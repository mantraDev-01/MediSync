// screens/ExportSelect.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ExportSelect({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select What to Export</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ExportInventory")}
      >
        <Text style={styles.cardText}>📦 Current Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ExportDispensed")}
      >
        <Text style={styles.cardText}>💊 Dispensed Medicines (This Month)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelCard}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const MEDI_PRIMARY = "#35A9FF";     // Aqua Blue
const MEDI_SECONDARY = "#30C9B0";   // Teal Green
const MEDI_BG = "#E6F9F7";          // Dashboard Mint BG
const MEDI_TEXT = "#1A3C47";        // Deep bluish text

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MEDI_BG,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: MEDI_TEXT,
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D3F0EA",
    elevation: 2,
  },

  cardText: {
    color: MEDI_TEXT,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },

  cancelCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D3F0EA",
  },

  cancelText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});
