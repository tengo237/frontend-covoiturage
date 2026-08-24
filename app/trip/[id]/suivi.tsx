import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { getTripById } from "../../../lib/trips";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Chemin fixe simulé (en attendant l'intégration d'une vraie carte + API
// de géolocalisation, qui remplacera ce tracé par la route réelle).
const PATH_D = "M 30 220 C 100 40, 220 260, 320 60";

type SosState = "idle" | "confirming" | "sent";

export default function Suivi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = getTripById(id);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const progress = useRef(new Animated.Value(0)).current;
  const [progressPct, setProgressPct] = useState(0);
  const [sosState, setSosState] = useState<SosState>("idle");

  useEffect(() => {
    const listener = progress.addListener(({ value }) => setProgressPct(Math.round(value * 100)));
    Animated.timing(progress, {
      toValue: 1,
      duration: 25000, // simulation : trajet complet en 25s pour la démo
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(listener);
  }, []);

  if (!trip) return null;

  const handleSos = () => {
    if (sosState === "idle") setSosState("confirming");
  };
  const confirmSos = () => setSosState("sent");
  const cancelSos = () => setSosState("idle");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">
        <View className={`w-full flex-1 ${isTablet ? "max-w-xl self-center" : ""}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </Pressable>
            <Text className="text-sm font-medium text-gray-900">
              {trip.from} → {trip.to}
            </Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Tracé simulé */}
          <View className="bg-primary-50 rounded-2xl items-center justify-center py-4 mb-4">
            <Svg width={350} height={280} viewBox="0 0 350 280">
              <Path d={PATH_D} stroke="#B5D4F4" strokeWidth={5} fill="none" strokeLinecap="round" />
              <Circle cx={30} cy={220} r={7} fill="#185FA5" />
              <Circle cx={320} cy={60} r={7} fill="#A32D2D" />
              <AnimatedCircle
                cx={progress.interpolate({ inputRange: [0, 1], outputRange: [30, 320] })}
                cy={progress.interpolate({ inputRange: [0, 1], outputRange: [220, 60] })}
                r={10}
                fill="#3B6D11"
              />
            </Svg>
          </View>

          {/* Progression */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-500">Progression du trajet</Text>
              <Text className="text-xs font-medium text-gray-900">{progressPct}%</Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <Animated.View
                style={{
                  height: 8,
                  backgroundColor: "#185FA5",
                  width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                }}
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between border border-gray-100 rounded-xl px-4 py-3 mb-8">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-2">{trip.driver.name}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="car-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-2">
                {trip.vehicle.brand} {trip.vehicle.model}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {/* Bouton SOS */}
          {sosState === "idle" && (
            <Pressable
              onPress={handleSos}
              className="bg-danger-600 rounded-xl py-4 items-center mb-8 active:opacity-80"
            >
              <Text className="text-white text-base font-medium">🆘  Envoyer une alerte SOS</Text>
            </Pressable>
          )}

          {sosState === "confirming" && (
            <View className="bg-danger-50 border border-danger-400 rounded-xl p-4 mb-8">
              <Text className="text-sm font-medium text-danger-600 mb-3 text-center">
                Confirmer l'envoi d'une alerte à vos contacts d'urgence ?
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                <Pressable onPress={cancelSos} className="flex-1 border border-gray-300 rounded-xl py-3 items-center">
                  <Text className="text-sm text-gray-700">Annuler</Text>
                </Pressable>
                <Pressable onPress={confirmSos} className="flex-1 bg-danger-600 rounded-xl py-3 items-center">
                  <Text className="text-sm text-white font-medium">Confirmer</Text>
                </Pressable>
              </View>
            </View>
          )}

          {sosState === "sent" && (
            <View className="bg-danger-50 border border-danger-400 rounded-xl p-4 mb-8">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning" size={18} color="#A32D2D" />
                <Text className="text-sm font-medium text-danger-600 ml-2">
                  Alerte envoyée avec votre position
                </Text>
              </View>
              <Pressable onPress={cancelSos} hitSlop={8}>
                <Text className="text-xs text-danger-600 underline">
                  Ce n'était pas une urgence ? Annuler la fausse alerte
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
