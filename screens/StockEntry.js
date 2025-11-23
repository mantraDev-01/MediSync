import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { addStock, updateStock, getStockByNameAndExpiry } from "../db"; // Added getStockByNameAndExpiry
import {
  scheduleNotificationForExpiry,
  scheduleNotificationForLowStock,
} from "../notifications";

export default function StockEntry({ navigation, route }) {
  const item = route?.params?.item || null;

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [lowThreshold, setLowThreshold] = useState("10");
  const [expiry, setExpiry] = useState("");
  const [dateAdded, setDateAdded] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setQuantity(String(item.quantity || "0"));
      setLowThreshold(String(item.low_threshold || "10"));
      setExpiry(item.expiry_date || "");
      setDateAdded(item.date_added || new Date().toISOString().split("T")[0]);
    } else {
      setDateAdded(new Date().toISOString().split("T")[0]);
    }
  }, [item]);

  const showDatePicker = useCallback(() => setDatePickerVisibility(true), []);
  const hideDatePicker = useCallback(() => setDatePickerVisibility(false), []);

  const handleConfirm = useCallback(
    (date) => {
      hideDatePicker();
      setTimeout(() => {
        const formatted = date.toISOString().split("T")[0];
        setExpiry(formatted);
      }, 200);
    },
    [hideDatePicker]
  );

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a medicine name.");
      return;
    }

    const qty = parseInt(quantity || "0", 10);
    if (qty <= 0) {
      Alert.alert("Validation", "Quantity must be greater than 0.");
      return;
    }

    const low = parseInt(lowThreshold || "10", 10);

    try {
      if (item) {
        // Editing existing item - update as before
        await updateStock(item.id, {
          name: name.trim(),
          quantity: qty,
          low_threshold: low,
          expiry_date: expiry || null,
        });
        Alert.alert("Updated", "Stock details updated successfully.");
      } else {
        // Adding new item - check for existing stock
        const existingStock = await getStockByNameAndExpiry(name.trim(), expiry || null);

        if (existingStock) {
          // Same name and expiry exists - add quantity to existing stock
          const newQuantity = existingStock.quantity + qty;
          await updateStock(existingStock.id, { quantity: newQuantity });
          Alert.alert("Updated", `Quantity added to existing stock. New total: ${newQuantity}.`);
        } else {
          // No match - add new stock item
          const id = await addStock({
            name: name.trim(),
            quantity: qty,
            low_threshold: low,
            expiry_date: expiry || null,
          });

          // Schedule notifications for new item
          let notifLowId = null;
          let notifExpiryId = null;

          if (qty <= low) {
            notifLowId = await scheduleNotificationForLowStock(id, name.trim(), qty);
          }
          if (expiry) {
            notifExpiryId = await scheduleNotificationForExpiry(id, name.trim(), expiry, 30);
          }

          await updateStock(id, {
            notif_low_id: notifLowId,
            notif_expiry_id: notifExpiryId,
          });

          Alert.alert("Saved", "New stock added.");
        }
      }

      navigation.goBack();
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to save: " + String(err));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {item ? "✏️ Edit Medicine" : "💊 Add New Medicine"}
          </Text>

          {/* Medicine Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter medicine name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Quantity + Low Threshold */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                style={styles.input}
                placeholder="0"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Low Threshold</Text>
              <TextInput
                keyboardType="numeric"
                value={lowThreshold}
                onChangeText={setLowThreshold}
                style={styles.input}
                placeholder="10"
              />
            </View>
          </View>

          {/* Expiry Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.dateInput}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingVertical: 0 }]}
                value={expiry}
                placeholder="Select expiry date"
                placeholderTextColor="#999"
                editable={false}
              />
              <TouchableOpacity onPress={showDatePicker}>
                <Ionicons name="calendar-outline" size={26} color="#0057b7" />
              </TouchableOpacity>
            </View>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          {/* Date Added (read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>Date Added</Text>
            <TextInput
              value={dateAdded}
              editable={false}
              style={[styles.input, { color: "#666" }]}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.button} onPress={onSave}>
            <Text style={styles.buttonText}>
              {item ? "💾 Update Stock" : "💾 Save Stock"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f5f9",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 22,
    color: "#0057b7",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    fontSize: 15,
    color: "#000",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
  },
  field: { marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 16 },
  button: {
    backgroundColor: "#0057b7",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});