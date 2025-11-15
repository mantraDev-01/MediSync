import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from "react-native";
import { getAllStocks, deleteStock } from "../db";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard({ navigation }) {
  const [stocks, setStocks] = useState([]);
  const [lowItems, setLowItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (isFocused) refresh();
  }, [isFocused]);

  async function refresh() {
    try {
      const all = await getAllStocks();
      setStocks(all);
      setTotalItems(all.length);
      setTotalQuantity(
        all.reduce((sum, it) => sum + (parseInt(it.quantity || 0, 10)), 0)
      );

      const low = all.filter(
        (i) => parseInt(i.quantity || 0, 10) <= parseInt(i.low_threshold || 10, 10)
      );
      const expiring = all.filter((i) => {
        if (!i.expiry_date) return false;
        const daysLeft =
          (new Date(i.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 30;
      });
      const expired = all.filter(
        (i) => i.expiry_date && new Date(i.expiry_date) < new Date()
      );

      setLowItems(low);
      setExpiringItems(expiring);
      setExpiredItems(expired);
    } catch (e) {
      console.warn(e);
    }
  }

  async function handleDelete(id, name) {
    Alert.alert("Confirm Delete", `Remove "${name}" from inventory?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStock(id);
            await refresh();
            Alert.alert("Deleted", `"${name}" removed successfully.`);
          } catch (err) {
            Alert.alert("Error", String(err));
          }
        },
      },
    ]);
  }

  // Helper to compute item status
  const getStatus = (item) => {
    const qty = parseInt(item.quantity || 0, 10);
    const threshold = parseInt(item.low_threshold || 10, 10);
    const now = new Date();
    const expDate = item.expiry_date ? new Date(item.expiry_date) : null;

    if (expDate && expDate < now) return "⚫ Expired";
    if (expDate) {
      const daysLeft = (expDate - now) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 30 && daysLeft > 0) return "🔴 Expiring Soon";
    }
    if (qty <= threshold) return "🟠 Low Stock";
    return "🟢 OK";
  };

  return (
    <ScrollView style={styles.container}>
      {/* ===== Top Navigation Buttons ===== */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#007AFF" }]}
          onPress={() => navigation.navigate("StockEntry")}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.navButtonText}>Add Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#FF9500" }]}
          onPress={() => navigation.navigate("DispenseScreen")}
        >
          <Ionicons name="remove-circle-outline" size={18} color="#fff" />
          <Text style={styles.navButtonText}>Dispense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#34C759" }]}
          onPress={() => navigation.navigate("ExportScreen")}
        >
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.navButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      

      {/* ===== Summary Section ===== */}
      <View style={styles.summaryContainer}>
        <View
          style={[styles.summaryCard, { backgroundColor: "#E8F0FE", width: "100%" }]}
        >
          <Ionicons name="cube-outline" size={22} color="#007AFF" />
          <Text style={styles.cardTitle}>Total Stock Items</Text>
          <Text style={styles.cardValue}>{totalItems}</Text>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#EAF7EE", flex: 1, marginRight: 6 },
            ]}
          >
            <Ionicons name="layers-outline" size={22} color="#34C759" />
            <Text style={styles.cardTitle}>Total Quantity</Text>
            <Text style={styles.cardValue}>{totalQuantity}</Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#FFF8E1", flex: 1, marginLeft: 6 },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={22} color="#FF9500" />
            <Text style={styles.cardTitle}>Low Stock Alerts</Text>
            <Text style={styles.cardValue}>{lowItems.length}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#FFEAE6", flex: 1, marginRight: 6 },
            ]}
          >
            <Ionicons name="calendar-outline" size={22} color="#FF3B30" />
            <Text style={styles.cardTitle}>Expiring Soon (≤30 days)</Text>
            <Text style={styles.cardValue}>{expiringItems.length}</Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#FCE4EC", flex: 1, marginLeft: 6 },
            ]}
          >
            <Ionicons name="time-outline" size={22} color="#AF52DE" />
            <Text style={styles.cardTitle}>Expired</Text>
            <Text style={styles.cardValue}>{expiredItems.length}</Text>
          </View>
        </View>
      </View>

      {/* ===== Inventory Table ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💊 Inventory List</Text>
        {stocks.length === 0 ? (
          <Text style={styles.okText}>No medicines in inventory.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.colName]}>Name</Text>
                <Text style={[styles.tableCell, styles.colQty]}>Qty</Text>
                <Text style={[styles.tableCell, styles.colExp]}>Expiry</Text>
                <Text style={[styles.tableCell, styles.colDate]}>Date Added</Text>
                <Text style={[styles.tableCell, styles.colStatus]}>Status</Text>
                <Text style={[styles.tableCell, styles.colAction]}>Actions</Text>
              </View>

              {stocks.map((i) => (
                <View key={i.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colName]}>{i.name}</Text>
                  <Text style={[styles.tableCell, styles.colQty]}>{i.quantity}</Text>
                  <Text style={[styles.tableCell, styles.colExp]}>
                    {i.expiry_date || "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {i.date_added || "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.colStatus]}>
                    {getStatus(i)}
                  </Text>
                  <View style={[styles.tableCell, styles.colAction]}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("StockEntry", { item: i })}
                    >
                      <Ionicons name="create-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(i.id, i.name)}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <TouchableOpacity onPress={refresh} style={styles.refreshLink}>
        <Text style={styles.refreshText}>🔄 Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E1E1E",
    textAlign: "center",
  },
  summaryContainer: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: { fontSize: 13, color: "#555", marginTop: 6 },
  cardValue: { fontSize: 20, fontWeight: "700", marginTop: 2, color: "#111" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 650,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    paddingVertical: 8,
  },
  tableHeader: { backgroundColor: "#F2F3F7" },
  tableCell: { fontSize: 13, color: "#333", paddingHorizontal: 8 },
  colName: { width: 160 },
  colQty: { width: 60, textAlign: "center" },
  colExp: { width: 120, textAlign: "center" },
  colDate: { width: 120, textAlign: "center" },
  colStatus: { width: 120, textAlign: "center" },
  colAction: {
    width: 90,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshLink: { marginTop: 18, alignItems: "center" },
  refreshText: { color: "#007AFF", fontWeight: "500" },
});
