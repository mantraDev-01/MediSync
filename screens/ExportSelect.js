// screens/ExportSelect.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ExportSelect({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select What to Export</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ExportInventory")}
      >
        <Text style={styles.buttonText}>📦 Current Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ExportDispensed")}
      >
        <Text style={styles.buttonText}>💊 Dispensed Medicines (This Month)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    marginBottom: 15,
  },
  buttonText: { color: "white", textAlign: "center", fontSize: 16 },
});
