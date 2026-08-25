import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

function TextField(props: React.ComponentProps<typeof TextInput> & { label: string }) {
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

export default function EditVehicle() {
  const { vehicle, updateVehicle } = useUser();
  const [brand, setBrand] = useState(vehicle?.brand ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [color, setColor] = useState(vehicle?.color ?? "");
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [seats, setSeats] = useState(vehicle?.seats ?? "");

  const isValid = brand.length > 0 && model.length > 0 && plate.length > 0;

  const handleSave = () => {
    updateVehicle({ brand, model, color, plate, seats });
    router.back();
  };

  if (!vehicle) return null;

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className="flex-row items-center justify-between mb-8">
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
          </Pressable>
          <Text className="font-display-bold text-brun text-lg">Modifier mon véhicule</Text>
          <View style={{ width: 22 }} />
        </View>

        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-2xl bg-teal-50 items-center justify-center">
            <Ionicons name="car-sport" size={30} color="#0F6E56" />
          </View>
        </View>

        <TextField label="Marque" placeholder="Ex: Toyota" value={brand} onChangeText={setBrand} />
        <TextField label="Modèle" placeholder="Ex: Corolla" value={model} onChangeText={setModel} />
        <TextField label="Couleur" placeholder="Ex: Gris" value={color} onChangeText={setColor} />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <TextField
              label="Plaque d'immatriculation"
              placeholder="LT 123 AB"
              autoCapitalize="characters"
              value={plate}
              onChangeText={setPlate}
            />
          </View>
          <View style={{ width: 110 }}>
            <TextField
              label="Places"
              placeholder="4"
              keyboardType="number-pad"
              value={seats}
              onChangeText={setSeats}
            />
          </View>
        </View>

        <View style={{ height: 16 }} />

        <AnimatedPressable
          onPress={handleSave}
          disabled={!isValid}
          className={`rounded-2xl py-4 items-center mb-6 ${isValid ? "bg-terre-600" : "bg-brun/10"}`}
        >
          <Text className={`font-body-semibold text-base ${isValid ? "text-creme" : "text-brun-muted"}`}>
            Enregistrer les modifications
          </Text>
        </AnimatedPressable>

        <Text className="font-body text-xs text-brun-muted text-center leading-5 mb-6">
          Un changement de véhicule (immatriculation, marque) peut nécessiter
          une nouvelle vérification par un administrateur.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
