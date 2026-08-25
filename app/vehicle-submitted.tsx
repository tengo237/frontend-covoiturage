import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";

export default function VehicleSubmitted() {
  return (
    <SafeAreaView className="flex-1 bg-creme">
      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-6">
            <Ionicons name="hourglass-outline" size={36} color="#0F6E56" />
          </View>

          <Text className="font-display-bold text-brun text-2xl text-center mb-3">
            Dossier envoyé
          </Text>
          <Text className="font-body text-brun-muted text-sm text-center leading-6 mb-10">
            Votre profil conducteur est en cours de vérification par un
            administrateur. Vous recevrez une notification dès qu'il sera
            validé — généralement sous 24 à 48h. En attendant, vous pouvez
            déjà découvrir votre espace conducteur.
          </Text>

          <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-10 w-full">
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-success-50 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={14} color="#0F6E56" />
              </View>
              <Text className="font-body text-sm text-brun flex-1">
                Informations du véhicule reçues
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-success-50 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={14} color="#0F6E56" />
              </View>
              <Text className="font-body text-sm text-brun flex-1">
                Documents d'identité reçus
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-7 h-7 rounded-full bg-[#FDF3D9] items-center justify-center mr-3">
                <Ionicons name="time-outline" size={14} color="#B8860B" />
              </View>
              <Text className="font-body text-sm text-brun flex-1">
                En attente de validation admin
              </Text>
            </View>
          </View>

          <AnimatedPressable
            onPress={() => router.replace("/(driver)")}
            className="w-full bg-terre-600 rounded-2xl py-4 items-center"
          >
            <Text className="font-body-semibold text-creme text-base">
              Accéder à mon espace conducteur
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
