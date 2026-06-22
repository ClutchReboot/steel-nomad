import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  initDB,
  addMaintenance,
  getMaintenance,
  MaintenanceRecord,
} from "../../../services/maintenanceStorage";

export default function MaintenanceScreen() {
  const [title, setTitle] = useState("");
  const [mileage, setMileage] = useState("");
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    initDB();
    loadRecords();
  }, []);

  function loadRecords() {
    getMaintenance();
  }

  function addRecord() {
    if (!title.trim()) return;

    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      title,
      mileage,
      date: new Date().toISOString(),
    };

    addMaintenance(newRecord);
    loadRecords();

    setTitle("");
    setMileage("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛠 Maintenance</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Service (Oil change, Chain lube...)"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Odometer (miles)"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={addRecord}>
          <Text style={styles.buttonText}>Add Record</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>📅 {new Date(item.date).toLocaleDateString()}</Text>
            <Text>📍 {item.mileage} miles</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: "600", marginBottom: 12 },
  form: { gap: 8, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "600" },
});