import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";

import {
  initRideDB,
  startRide,
  endRide,
  getRides,
  getActiveRide,
  updateRideRoute,
  RideRecord,
} from "../../../services/rideStorage";

import { useRideGPS } from "../../../hooks/useRideGPS";

type GPSPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export default function RidesScreen() {
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  const [route, setRoute] = useState<GPSPoint[]>([]);

  // Initialize DB once
  useEffect(() => {
    initRideDB();
    refresh();
  }, []);

  function refresh() {
    setRides(getRides());
    setActiveRide(getActiveRide());
  }

  /**
   * GPS tracking (only runs when activeRide exists)
   */
  useRideGPS(!!activeRide, (point) => {
    setRoute((prev) => [...prev, point]);
  });

  /**
   * Start ride
   */
  function handleStartRide() {
    const ride: RideRecord = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      endTime: null,
      durationMs: null,
      route: "[]",
    };

    startRide(ride);
    setRoute([]);
    refresh();
  }

  /**
   * End ride
   */
  function handleEndRide() {
    if (!activeRide) return;

    const endTime = new Date().toISOString();

    const duration =
      new Date(endTime).getTime() -
      new Date(activeRide.startTime).getTime();

    endRide(activeRide.id, endTime, duration);

    // Save GPS route safely via service layer
    updateRideRoute(activeRide.id, route);

    setRoute([]);
    refresh();
  }

  function formatDuration(ms: number | null) {
    if (!ms) return "In progress";
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏍 Rides</Text>

      {/* Controls */}
      <View style={styles.controls}>
        {!activeRide ? (
          <Pressable style={styles.button} onPress={handleStartRide}>
            <Text style={styles.buttonText}>Start Ride</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.buttonEnd} onPress={handleEndRide}>
            <Text style={styles.buttonText}>End Ride</Text>
          </Pressable>
        )}
      </View>

      {/* Active ride indicator */}
      {activeRide && (
        <Text style={styles.active}>
          🔴 Riding since{" "}
          {new Date(activeRide.startTime).toLocaleTimeString()}
        </Text>
      )}

      {/* Debug GPS counter */}
      {activeRide && (
        <Text style={styles.debug}>
          📍 GPS points: {route.length}
        </Text>
      )}

      {/* History */}
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>🏍 Ride</Text>

            <Text>
              🟢 Start: {new Date(item.startTime).toLocaleString()}
            </Text>

            {item.endTime && (
              <Text>
                🔵 End: {new Date(item.endTime).toLocaleString()}
              </Text>
            )}

            <Text>⏱ {formatDuration(item.durationMs)}</Text>

            <Text style={styles.routeInfo}>
              📡 Route points:{" "}
              {item.route ? JSON.parse(item.route).length : 0}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },

  controls: {
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonEnd: {
    backgroundColor: "#b00020",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  active: {
    marginBottom: 6,
    color: "#b00020",
    fontWeight: "600",
  },

  debug: {
    marginBottom: 10,
    color: "#555",
  },

  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  routeInfo: {
    marginTop: 4,
    color: "#555",
  },
});