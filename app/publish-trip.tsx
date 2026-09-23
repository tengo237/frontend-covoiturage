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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

const API_BASE_URL = "http://12.0.3.9:8000";

function TextField(props) {
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

export default function PublishTrip() {
  const { user, token, vehicle } = useUser();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Créer un trajet
  const handlePublish = async () => {
    try {
      // Validation
      if (!from.trim()) {
        Alert.alert("Erreur", "Veuillez entrer le lieu de départ");
        return;
      }
      if (!to.trim()) {
        Alert.alert("Erreur", "Veuillez entrer la destination");
        return;
      }
      if (!date.trim()) {
        Alert.alert("Erreur", "Veuillez entrer la date");
        return;
      }
      if (!time.trim()) {
        Alert.alert("Erreur", "Veuillez entrer l'heure");
        return;
      }
      if (!seats.trim()) {
        Alert.alert("Erreur", "Veuillez entrer le nombre de places");
        return;
      }
      if (!price.trim()) {
        Alert.alert("Erreur", "Veuillez entrer le prix");
        return;
      }
      if (!vehicle) {
        Alert.alert("Erreur", "Veuillez enregistrer un véhicule d'abord");
        return;
      }

      setLoading(true);
      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        Alert.alert("Erreur", "Pas de token");
        return;
      }

      console.log("🔵 Publication du trajet...");

      // Convertir la date et l'heure en format ISO
      // Format attendu: "15/08" et "08h00" → "2026-08-15T08:00:00"
      const [day, month] = date.split("/");
      const [hours, minutes] = time.replace("h", ":").split(":");
      
      // ✅ Ajouter un 0 devant si < 10
      const hoursFormatted = hours.padStart(2, "0");
      const minutesFormatted = minutes.padStart(2, "0");
      
      const departureTime = `2026-${month}-${day}T${hoursFormatted}:${minutesFormatted}:00`;

      const tripData = {
        departure_location: from.trim(),
        arrival_location: to.trim(),
        departure_time: departureTime,
        available_seats: parseInt(seats),
        price_per_seat: parseFloat(price),
        description: description.trim() || null,
        vehicle_id: vehicle.id,
      };

      console.log("📤 Envoi des données:", tripData);

      const response = await fetch(`${API_BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      });

      console.log(`📩 Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Trajet créé:", data.trip?.id);
        Alert.alert("Succès", "Votre trajet a été publié!", [
          {
            text: "OK",
            onPress: () => router.replace("/(driver)"),
          },
        ]);
      } else {
        const errorData = await response.json();
        console.log("❌ Erreur:", errorData);
        Alert.alert("Erreur", errorData.detail || "Impossible de publier le trajet");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </Pressable>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
          Publier un trajet
        </Text>
        <Text style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
          Proposez vos places disponibles aux passagers
        </Text>

        {/* Champs */}
        <TextField
          label="Lieu de départ"
          placeholder="Ex: Douala, Akwa"
          value={from}
          onChangeText={setFrom}
          editable={!loading}
        />

        <TextField
          label="Destination"
          placeholder="Ex: Yaoundé, Mfoundi"
          value={to}
          onChangeText={setTo}
          editable={!loading}
        />

        {/* Date et Heure */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Date"
              placeholder="Ex: 15/08"
              value={date}
              onChangeText={setDate}
              editable={!loading}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Heure"
              placeholder="Ex: 08h00"
              value={time}
              onChangeText={setTime}
              editable={!loading}
            />
          </View>
        </View>

        {/* Places et Prix */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Places disponibles"
              placeholder="3"
              keyboardType="number-pad"
              value={seats}
              onChangeText={setSeats}
              editable={!loading}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Prix par place (FCFA)"
              placeholder="4000"
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
              editable={!loading}
            />
          </View>
        </View>

        {/* Description */}
        <TextField
          label="Description (optionnel)"
          placeholder="Ex: Climatisé, musique..."
          value={description}
          onChangeText={setDescription}
          editable={!loading}
        />

        {/* Véhicule */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#D4C5B9",
            backgroundColor: "#FFF",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 24,
          }}
        >
          <Ionicons name="car-outline" size={18} color="#10B981" />
          <Text style={{ fontSize: 14, color: "#1F2937", marginLeft: 12, flex: 1 }}>
            {vehicle ? `${vehicle.brand} ${vehicle.model} — ${vehicle.plate}` : "Aucun véhicule enregistré"}
          </Text>
        </View>

        {/* Bouton Publier */}
        <Pressable
          onPress={handlePublish}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#D4C5B9" : "#D85A30",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
              Publier le trajet
            </Text>
          )}
        </Pressable>

        {/* Bouton Annuler */}
        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 32,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#1F2937", fontWeight: "700", fontSize: 16 }}>
            Annuler
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
