import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getAllStocks, addDispensed, getDispensedByDate } from "../db";

export default function DispenseScreen() {
  const [stocks, setStocks] = useState([]);
  const [dispensed, setDispensed] = useState([]);

  const [studentName, setStudentName] = useState("");
  const [age, setAge] = useState("");
  const [selectedMed, setSelectedMed] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [dateAdded, setDateAdded] = useState("");
  const [dateDispensed, setDateDispensed] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isFilterPickerVisible, setFilterPickerVisibility] = useState(false);

  useEffect(() => {
    loadStocks();
    loadDispensed(filterDate);
  }, [filterDate]);

  async function loadStocks() {
    const data = await getAllStocks();
    setStocks(data);
  }

  async function loadDispensed(date) {
    const data = await getDispensedByDate(date);
    setDispensed(data);
  }

  function showDatePicker() {
    setDatePickerVisibility(true);
  }
  function hideDatePicker() {
    setDatePickerVisibility(false);
  }
  function handleConfirm(date) {
    hideDatePicker();
    const formatted = date.toISOString().split("T")[0];
    setDateDispensed(formatted);
  }

  function showFilterPicker() {
    setFilterPickerVisibility(true);
  }
  function hideFilterPicker() {
    setFilterPickerVisibility(false);
  }
  function handleFilterConfirm(date) {
    hideFilterPicker();
    const formatted = date.toISOString().split("T")[0];
    setFilterDate(formatted);
  }

  useEffect(() => {
    if (selectedMed) {
      const med = stocks.find((s) => s.name === selectedMed);
      if (med) {
        setExpiry(med.expiry_date || "");
        setDateAdded(med.date_added || "");
      }
    } else {
      setExpiry("");
      setDateAdded("");
    }
  }, [selectedMed]);

  async function onSave() {
    if (!studentName.trim() || !selectedMed || !quantity) {
      Alert.alert("Validation", "Please complete all required fields.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Validation", "Enter a valid quantity.");
      return;
    }

    const med = stocks.find((s) => s.name === selectedMed);
    if (!med) {
      Alert.alert("Error", "Selected medicine not found.");
      return;
    }

    if (qty > med.quantity) {
      Alert.alert("Not enough stock", `Only ${med.quantity} available.`);
      return;
    }

    try {
      await addDispensed({
        student_name: studentName.trim(),
        age: parseInt(age) || null,
        date_dispensed: dateDispensed,
        med_name: selectedMed,
        quantity: qty,
        expiry_date: expiry,
        date_added: dateAdded,
      });

      Alert.alert("Success", "Medicine dispensed successfully.");
      setStudentName("");
      setAge("");
      setSelectedMed("");
      setQuantity("");
      await loadStocks();
      await loadDispensed(filterDate);
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to save record.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>💉 Dispense Medicine</Text>

      {/* === Form === */}
      <Text style={styles.label}>Student Name</Text>
      <TextInput
        value={studentName}
        onChangeText={setStudentName}
        style={styles.input}
        placeholder="Enter student name"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        style={styles.input}
        placeholder="Enter age"
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Select Medicine</Text>
      <View style={styles.dropdown}>
        {stocks.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center" }}>
            No medicines available
          </Text>
        ) : (
          <ScrollView
            style={{ maxHeight: stocks.length > 5 ? 200 : "auto" }}
            nestedScrollEnabled
          >
            {stocks.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.option,
                  selectedMed === s.name && styles.selectedOption,
                ]}
                onPress={() => setSelectedMed(s.name)}
              >
                <Text
                  style={{
                    color: selectedMed === s.name ? "#fff" : "#333",
                    fontWeight: selectedMed === s.name ? "700" : "500",
                  }}
                >
                  {s.name} ({s.quantity})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        placeholder="Enter quantity"
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Expiry Date</Text>
      <TextInput value={expiry} style={styles.input} editable={false} />

      <Text style={styles.label}>Date Added</Text>
      <TextInput value={dateAdded} style={styles.input} editable={false} />

      <Text style={styles.label}>Date Dispensed</Text>
      <View style={styles.dateRow}>
        <TextInput
          value={dateDispensed}
          editable={false}
          style={[styles.input, { flex: 1, borderWidth: 0, paddingVertical: 0 }]}
        />
        <TouchableOpacity onPress={showDatePicker}>
          <Ionicons name="calendar-outline" size={26} color="#0057b7" />
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "calendar"}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>💾 Dispense</Text>
      </TouchableOpacity>

      {/* === Dispensed Table === */}
      <View style={{ marginTop: 40, marginBottom: 100 }}>
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>📜 Dispensed Records</Text>
          <TouchableOpacity style={styles.filterButton} onPress={showFilterPicker}>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.filterButtonText}> {filterDate}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isFilterPickerVisible}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onConfirm={handleFilterConfirm}
          onCancel={hideFilterPicker}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.th, { width: 140 }]}>Student</Text>
              <Text style={[styles.th, { width: 60 }]}>Age</Text>
              <Text style={[styles.th, { width: 140 }]}>Medicine</Text>
              <Text style={[styles.th, { width: 70 }]}>Qty</Text>
              <Text style={[styles.th, { width: 120 }]}>Expiry</Text>
              <Text style={[styles.th, { width: 120 }]}>Date Added</Text>
              <Text style={[styles.th, { width: 120 }]}>Dispensed</Text>
            </View>

            {dispensed.length === 0 ? (
              <Text style={{ textAlign: "center", margin: 10, color: "#666" }}>
                No dispensed records found for this date.
              </Text>
            ) : (
              dispensed.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#FFF" },
                  ]}
                >
                  <Text style={[styles.td, { width: 140 }]}>{item.student_name}</Text>
                  <Text style={[styles.td, { width: 60 }]}>{item.age || "-"}</Text>
                  <Text style={[styles.td, { width: 140 }]}>{item.med_name}</Text>
                  <Text style={[styles.td, { width: 70 }]}>{item.quantity}</Text>
                  <Text style={[styles.td, { width: 120 }]}>{item.expiry_date}</Text>
                  <Text style={[styles.td, { width: 120 }]}>{item.date_added}</Text>
                  <Text style={[styles.td, { width: 120 }]}>{item.date_dispensed}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fb" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0057b7",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    color: "#000",
   
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 6,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginVertical: 2,
  },
  selectedOption: { backgroundColor: "#0057b7" },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0057b7",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0057b7",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0057b7",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterButtonText: { color: "#fff", fontWeight: "600" },
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    minWidth: 900,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#0057b7",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  th: {
    fontWeight: "700",
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
  },
  td: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    justifyContent: "center",
  },
});
