import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

function TextField(props) {
  const { label, ...rest } = props;
  return (
    <View className="mb-4">
      <Text className="font-body-medium text-xs text-brun-muted mb-1.5">{label}</Text>
      <TextInput
        className="font-body border border-brun/15 rounded-2xl px-4 py-3.5 text-sm text-brun bg-white"
        placeholderTextColor="#8C7A6B80"
        {...rest}
      />
    </View>
  );
}

export default function PublishTrip() {
  const { vehicle } = useUser();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");

  const handlePublish = () => {
    router.replace("/(driver)");
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <Pressable onPress={() => router.back()} className="mb-6" hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
        </Pressable>

        <Text className="font-display-bold text-brun text-2xl mb-1">Publier un trajet</Text>
        <Text className="font-body text-brun-muted text-sm mb-6">
          Proposez vos places disponibles aux passagers
        </Text>

        <TextField label="Départ" placeholder="Ex: Douala, Akwa" value={from} onChangeText={setFrom} />
        <TextField label="Destination" placeholder="Ex: Yaoundé, Mfoundi" value={to} onChangeText={setTo} />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <TextField label="Date" placeholder="Ex: 15/08" value={date} onChangeText={setDate} />
          </View>
          <View className="flex-1">
            <TextField label="Heure" placeholder="Ex: 08h00" value={time} onChangeText={setTime} />
          </View>
        </View>

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <TextField label="Places disponibles" placeholder="3" keyboardType="number-pad" value={seats} onChangeText={setSeats} />
          </View>
          <View className="flex-1">
            <TextField label="Prix par place (FCFA)" placeholder="4000" keyboardType="number-pad" value={price} onChangeText={setPrice} />
          </View>
        </View>

        <View className="flex-row items-center border border-brun/15 bg-white rounded-2xl px-4 py-3.5 mb-8">
          <Ionicons name="car-outline" size={18} color="#0F6E56" />
          <Text className="font-body text-sm text-brun ml-3">
            {vehicle ? `${vehicle.brand} ${vehicle.model} — ${vehicle.plate}` : "Aucun véhicule enregistré"}
          </Text>
        </View>

        <AnimatedPressable onPress={handlePublish} className="bg-terre-600 rounded-2xl py-4 items-center mb-6">
          <Text className="font-body-semibold text-creme text-base">Publier le trajet</Text>
        </AnimatedPressable>
      </ScrollView>
    </SafeAreaView>
  );
}
