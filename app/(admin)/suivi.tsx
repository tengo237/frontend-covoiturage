import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const GEOAPIFY_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

const MAP_URL = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=500&center=lonlat:10.56,4.46&zoom=7&apiKey=${GEOAPIFY_KEY}`;
const MAP_ASPECT = 600 / 500;

type ActiveTrip = {
  id: string;
  from: string;
  to: string;
  driver: string;
  progress: number;
  sos: boolean;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const INITIAL: ActiveTrip[] = [
  { id: "1", from: "Douala", to: "Yaoundé", driver: "Marc Ateba", progress: 35, sos: false,
    start: { x: 38.0, y: 57.5 }, end: { x: 64.3, y: 61.2 } },
  { id: "2", from: "Yaoundé", to: "Bafoussam", driver: "Chantal Mballa", progress: 68, sos: false,
    start: { x: 64.3, y: 61.2 }, end: { x: 47.8, y: 31.5 } },
  { id: "3", from: "Bafoussam", to: "Douala", driver: "Paul Nkomo", progress: 12, sos: true,
    start: { x: 47.8, y: 31.5 }, end: { x: 38.0, y: 57.5 } },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * (t / 100);
}

export default function AdminSuivi() {
  const [trips, setTrips] = useState(INITIAL);
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width - 48, 560);
  const mapHeight = mapWidth / MAP_ASPECT;

  useEffect(() => {
    const interval = setInterval(() => {
      setTrips((prev) => prev.map((t) => ({ ...t, progress: Math.min(100, t.progress + Math.random() * 3) })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-row items-center px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={10} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>
        <Text className="font-display-bold text-brun text-xl">Trajets en direct</Text>
      </View>

      {!GEOAPIFY_KEY && (
        <Text className="font-body text-xs text-danger-600 text-center mb-2 px-6">
          Clé Geoapify manquante — ajoutez EXPO_PUBLIC_GEOAPIFY_KEY dans .env
        </Text>
      )}

      <ScrollView className="px-6">
        <View
          style={{ width: mapWidth, height: mapHeight, alignSelf: "center" }}
          className="rounded-2xl overflow-hidden bg-brun/5 mb-6"
        >
          <Image source={{ uri: MAP_URL }} style={{ width: mapWidth, height: mapHeight }} resizeMode="cover" />
          {trips.map((t) => {
            const x = lerp(t.start.x, t.end.x, t.progress);
            const y = lerp(t.start.y, t.end.y, t.progress);
            return (
              <View key={t.id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, marginLeft: -14, marginTop: -14 }}>
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow ${
                    t.sos ? "bg-danger-600" : "bg-success-600"
                  }`}
                >
                  <Ionicons name={t.sos ? "warning" : "car-sport"} size={14} color="#FBF6EF" />
                </View>
              </View>
            );
          })}
        </View>

        {trips.map((item) => (
          <View
            key={item.id}
            className={`border rounded-2xl p-4 mb-3 ${item.sos ? "border-danger-400 bg-danger-50" : "bg-white border-brun/10"}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-body-semibold text-sm text-brun">
                {item.from} → {item.to}
              </Text>
              {item.sos && (
                <View className="flex-row items-center bg-danger-600 px-2 py-0.5 rounded-full">
                  <Ionicons name="warning" size={11} color="#FFFFFF" />
                  <Text className="font-body-medium text-xs text-white ml-1">SOS</Text>
                </View>
              )}
            </View>
            <Text className="font-body text-xs text-brun-muted mb-2">Conducteur : {item.driver}</Text>
            <View className="h-1.5 bg-brun/10 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${item.sos ? "bg-danger-600" : "bg-terre-600"}`}
                style={{ width: `${item.progress}%` }}
              />
            </View>
            <Text className="font-body text-xs text-brun-muted mt-1">{Math.round(item.progress)}% du trajet</Text>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
