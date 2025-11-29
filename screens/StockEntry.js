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
import { addStock, updateStock, getStockByNameAndExpiry } from "../db";

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
        setExpiry(date.toISOString().split("T")[0]);
      }, 200);
    },
    [hideDatePicker]
  );

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a medicine name.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      Alert.alert("Validation", "Quantity must be greater than 0.");
      return;
    }

    const low = parseInt(lowThreshold, 10);

    try {
      if (item) {
        await updateStock(item.id, {
          name: name.trim(),
          quantity: qty,
          low_threshold: low,
          expiry_date: expiry || null,
        });
      } else {
        const existing = await getStockByNameAndExpiry(
          name.trim(),
          expiry || null
        );

        if (existing) {
          await updateStock(existing.id, {
            quantity: existing.quantity + qty,
          });
        } else {
          await addStock({
            name: name.trim(),
            quantity: qty,
            low_threshold: low,
            expiry_date: expiry || null,
          });
        }
      }

      Alert.alert("Success", "Medicine saved.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", String(e));
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
              placeholderTextColor="#7AA3A1"
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
            <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
              <Text style={styles.dateText}>
                {expiry || "Select expiry date"}
              </Text>
              <Ionicons name="calendar-outline" size={28} color="#35A9FF" />
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          {/* Date Added */}
          <View style={styles.field}>
            <Text style={styles.label}>Date Added</Text>
            <TextInput
              value={dateAdded}
              editable={false}
              style={[styles.input, { color: "#777" }]}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveText}>{item ? "Update" : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const MEDI_PRIMARY = "#35A9FF";
const MEDI_BG = "#E6F9F7";
const MEDI_TEXT = "#1A3C47";
const INPUT_BG = "#F3FBFA";

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: MEDI_BG,
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D3F0EA",
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: MEDI_TEXT,
    marginBottom: 16,
    textAlign: "center",
  },

  field: {
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    color: MEDI_TEXT,
    marginBottom: 6,
  },

  input: {
    backgroundColor: INPUT_BG,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    color: MEDI_TEXT,
    borderWidth: 1,
    borderColor: "#CFEDEA",
  },

  row: {
    flexDirection: "row",
  },

  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CFEDEA",
  },

  dateText: {
    fontSize: 14,
    color: MEDI_TEXT,
  },

  saveBtn: {
    backgroundColor: MEDI_PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
