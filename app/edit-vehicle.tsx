import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../context/UserContext";

function TextField(
  props: React.ComponentProps<typeof TextInput> & { label: string }
) {
  const { label, ...rest } = props;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: "500", color: "#8C7A6B", marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#D4C5B9",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 14,
          color: "#1F2937",
          backgroundColor: "#FFF",
        }}
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
  const [loading, setLoading] = useState(false);

  const isValid = brand.trim().length > 0 && model.trim().length > 0 && plate.trim().length > 0;

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log("[EDIT-VEHICLE] Sauvegarde en cours...");

      await updateVehicle({
        brand: brand.trim(),
        model: model.trim(),
        color: color.trim(),
        plate: plate.trim(),
      });

      console.log("[EDIT-VEHICLE] ✅ Véhicule mis à jour");
      Alert.alert("Succès", "Votre véhicule a été mis à jour!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("[EDIT-VEHICLE] ❌ Erreur:", message);
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 14, color: "#9CA3AF" }}>Aucun véhicule à éditer</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#3D2B1F" />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
            Modifier mon véhicule
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Icon */}
        <View style={{
          alignItems: "center",
          marginBottom: 24,
        }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Ionicons name="car-sport" size={32} color="#0F6E56" />
          </View>
        </View>

        {/* Form Fields */}
        <TextField
          label="Marque"
          placeholder="Ex: Toyota"
          value={brand}
          onChangeText={setBrand}
          editable={!loading}
        />

        <TextField
          label="Modèle"
          placeholder="Ex: Corolla"
          value={model}
          onChangeText={setModel}
          editable={!loading}
        />

        <TextField
          label="Couleur"
          placeholder="Ex: Gris"
          value={color}
          onChangeText={setColor}
          editable={!loading}
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Plaque d'immatriculation"
              placeholder="LT 123 AB"
              autoCapitalize="characters"
              value={plate}
              onChangeText={setPlate}
              editable={!loading}
            />
          </View>
        </View>

        {/* Info Text */}
        <Text style={{
          fontSize: 12,
          color: "#9CA3AF",
          textAlign: "center",
          marginVertical: 16,
          lineHeight: 18,
        }}>
          Un changement de véhicule (immatriculation, marque) peut nécessiter une nouvelle vérification par un administrateur.
        </Text>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!isValid || loading}
          style={{
            backgroundColor: isValid && !loading ? "#D85A30" : "#D4C5B9",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={{
              color: "#FFF",
              fontWeight: "700",
              fontSize: 16,
            }}>
              Enregistrer les modifications
            </Text>
          )}
        </Pressable>

        {/* Cancel Button */}
        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{
            color: "#1F2937",
            fontWeight: "700",
            fontSize: 16,
          }}>
            Annuler
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
