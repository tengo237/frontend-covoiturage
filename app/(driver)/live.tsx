import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, Vibration, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AnimatedPressable from "../../components/AnimatedPressable";
import { MY_PUBLISHED_TRIPS } from "../../lib/driverTrips";

// Motif de vibration façon alarme : vibre 500ms, pause 200ms, en boucle.
const ALARM_PATTERN = [0, 500, 200];

type MonitorState = "off" | "watching" | "alarm";

export default function Live() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  // Trajet "en cours" pour la démo — à remplacer par le trajet réellement
  // actif une fois le backend branché (statut "en cours" côté serveur).
  const currentTrip = MY_PUBLISHED_TRIPS[0];

  const [state, setState] = useState<MonitorState>("off");
  const flash = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== "watching") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state]);

  useEffect(() => {
    if (state !== "alarm") return;
    Vibration.vibrate(ALARM_PATTERN, true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 350, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      Vibration.cancel();
    };
  }, [state]);

  const startMonitoring = () => setState("watching");
  const stopMonitoring = () => setState("off");
  const simulateEyesClosed = () => setState("alarm");
  const dismissAlarm = () => {
    Vibration.cancel();
    setState("watching");
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: state === "off" ? "#FBF6EF" : "#1B1035" }}>
      {state === "alarm" && (
        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#D8453C", opacity: flash, zIndex: 10 }}
        />
      )}

      <View className="flex-1 px-6 pt-4">
        <Text className={`font-display-bold text-2xl mb-1 ${state === "off" ? "text-brun" : "text-creme"}`}>
          Live
        </Text>
        <Text className={`font-body text-sm mb-6 ${state === "off" ? "text-brun-muted" : "text-white/60"}`}>
          {currentTrip ? `${currentTrip.from} → ${currentTrip.to}` : "Aucun trajet en cours"}
        </Text>

        <View className="flex-1 items-center justify-center">
          <View className={`items-center ${isTablet ? "max-w-md" : ""}`}>
            {state === "off" && (
              <>
                <View className="w-24 h-24 rounded-full bg-teal-50 items-center justify-center mb-6">
                  <Ionicons name="videocam-outline" size={44} color="#0F6E56" />
                </View>
                <Text className="font-display-bold text-brun text-xl text-center mb-2">
                  Enregistrement vidéo du trajet
                </Text>
                <Text className="font-body text-brun-muted text-sm text-center leading-6 mb-8 px-4">
                  Filme le conducteur pendant tout le trajet et détecte les
                  signes de somnolence (yeux fermés prolongés) pour
                  déclencher une alarme automatiquement.
                </Text>
                <AnimatedPressable onPress={startMonitoring} className="bg-terre-600 rounded-2xl py-4 px-10">
                  <Text className="font-body-semibold text-creme text-base">
                    Démarrer l'enregistrement
                  </Text>
                </AnimatedPressable>
              </>
            )}

            {state === "watching" && (
              <>
                <Animated.View
                  style={{ transform: [{ scale: pulse }] }}
                  className="w-28 h-28 rounded-full border-2 border-success-400 items-center justify-center mb-6"
                >
                  <Ionicons name="videocam" size={40} color="#3FC994" />
                </Animated.View>
                <View className="flex-row items-center bg-danger-50 px-3 py-1.5 rounded-full mb-2">
                  <View className="w-2 h-2 rounded-full bg-danger-600 mr-2" />
                  <Text className="font-body-medium text-xs text-danger-600">● En direct</Text>
                </View>
                <Text className="font-body text-white/60 text-xs mb-6">
                  Enregistrement local — rien n'est envoyé à un serveur
                </Text>
                <Text className="font-body text-white/60 text-sm text-center leading-6 mb-10 px-6">
                  Gardez le téléphone face à vous. L'alarme se déclenche
                  automatiquement en cas de somnolence détectée.
                </Text>

                <Pressable onPress={stopMonitoring} className="mb-4">
                  <Text className="font-body-medium text-white/50 text-sm underline">
                    Arrêter l'enregistrement
                  </Text>
                </Pressable>

                {/* Bouton de test — à retirer une fois la vraie détection ML branchée */}
                <Pressable onPress={simulateEyesClosed} className="border border-white/20 rounded-2xl py-3 px-6">
                  <Text className="font-body text-xs text-white/70">
                    🧪 Simuler yeux fermés (test)
                  </Text>
                </Pressable>
              </>
            )}

            {state === "alarm" && (
              <View style={{ zIndex: 20 }} className="items-center">
                <View className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6">
                  <Ionicons name="warning" size={52} color="#D8453C" />
                </View>
                <Text className="font-display-bold text-white text-2xl text-center mb-2">
                  Réveillez-vous !
                </Text>
                <Text className="font-body text-white text-sm text-center leading-6 mb-10 px-6">
                  Signe de somnolence détecté. Arrêtez-vous dès que possible
                  si vous êtes fatigué.
                </Text>
                <AnimatedPressable onPress={dismissAlarm} className="bg-white rounded-2xl py-4 px-10" scaleTo={0.94}>
                  <Text className="font-body-semibold text-danger-600 text-base">
                    J'ai repris le contrôle
                  </Text>
                </AnimatedPressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
