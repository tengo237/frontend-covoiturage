import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://12.0.3.9:8000";

interface Reservation {
  id: number;
  trip_id: number;
  passenger_id: number;
  seats_booked: number;
  total_price: number;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  passenger?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  trip?: {
    id: number;
    departure_location: string;
    arrival_location: string;
    departure_time: string;
    price_per_seat: number;
  };
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FDF3D9", text: "#8A6A00", label: "En attente" },
  accepted: { bg: "#DCFCE7", text: "#10B981", label: "Acceptée" },
  declined: { bg: "#FEE2E4", text: "#DC2626", label: "Refusée" },
};

export default function DriverReservations() {
  const { token } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  // ============================================
  // LOAD RESERVATIONS FROM BACKEND
  // ============================================

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        setError("Pas de token");
        return;
      }

      console.log("🔵 Chargement des réservations reçues...");

      const response = await fetch(
        `${API_BASE_URL}/api/reservations/received`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📩 Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors du chargement");
      }

      const data = await response.json();
      console.log(`✅ ${data.reservations?.length || 0} réservations trouvées`);

      // Trier: pending en premier
      const sorted = (data.reservations || []).sort((a: Reservation, b: Reservation) =>
        a.status === "pending" ? -1 : 1
      );

      setReservations(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      console.error("🔴 Erreur loadReservations:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE RESERVATION STATUS
  // ============================================

  const handleDecision = async (
    reservationId: number,
    newStatus: "accepted" | "declined"
  ) => {
    try {
      setUpdatingId(reservationId);

      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        Alert.alert("Erreur", "Pas de token");
        return;
      }

      console.log(`🔵 Mise à jour réservation ${reservationId} → ${newStatus}`);

      const response = await fetch(
        `${API_BASE_URL}/api/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      console.log(`📩 Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur");
      }

      const data = await response.json();
      console.log(`✅ Réservation mise à jour`);

      // Mettre à jour localement
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        )
      );

      Alert.alert(
        "Succès",
        newStatus === "accepted"
          ? "Réservation acceptée!"
          : "Réservation refusée"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      console.error("🔴 Erreur handleDecision:", message);
      Alert.alert("Erreur", message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D85A30" />
        <Text style={{ marginTop: 12, color: "#9CA3AF" }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
            Réservations
          </Text>
          <Text style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
            Toutes les demandes reçues sur vos trajets
          </Text>

          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="alert-circle" size={60} color="#D85A30" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#1F2937", marginTop: 16 }}>
              Erreur
            </Text>
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>
              {error}
            </Text>

            <Pressable
              onPress={loadReservations}
              style={{
                backgroundColor: "#D85A30",
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 10,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                Réessayer
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
          Réservations
        </Text>
        <Text style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
          Toutes les demandes reçues sur vos trajets
        </Text>

        {/* Empty State */}
        {reservations.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="document-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 16, textAlign: "center" }}>
              Aucune demande de réservation pour l'instant.
            </Text>
          </View>
        )}

        {/* Reservations List */}
        {reservations.map((reservation) => {
          const style = STATUS_STYLE[reservation.status] || STATUS_STYLE.pending;
          const isPending = reservation.status === "pending";
          const isUpdating = updatingId === reservation.id;

          return (
            <View
              key={reservation.id}
              style={{
                backgroundColor: "#FFF",
                borderWidth: 1,
                borderColor: "#E8D5C4",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              {/* Header: Passenger Info + Status */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {/* Avatar */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#DCFCE7",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color="#0F6E56" />
                  </View>

                  {/* Name + Trip Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 14, color: "#1F2937", marginBottom: 2 }}>
                      {reservation.passenger?.name || "Passager"}
                    </Text>
                    <Text style={{ fontWeight: "400", fontSize: 12, color: "#9CA3AF" }}>
                      {reservation.trip?.departure_location} → {reservation.trip?.arrival_location} •{" "}
                      {reservation.seats_booked} place{reservation.seats_booked > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={{
                    backgroundColor: style.bg,
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 11,
                      color: style.text,
                    }}
                  >
                    {style.label}
                  </Text>
                </View>
              </View>

              {/* Price Info */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Ionicons name="cash-outline" size={16} color="#D85A30" />
                <Text style={{ fontSize: 13, fontWeight: "500", color: "#1F2937", marginLeft: 8 }}>
                  {reservation.total_price.toLocaleString()} FCFA
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>
                  ({reservation.seats_booked} × {reservation.trip?.price_per_seat?.toLocaleString()} FCFA)
                </Text>
              </View>

              {/* Actions: Only show if pending */}
              {isPending && (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => handleDecision(reservation.id, "declined")}
                    disabled={isUpdating}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#E8D5C4",
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#9CA3AF" />
                    ) : (
                      <Text style={{ fontWeight: "600", fontSize: 14, color: "#9CA3AF" }}>
                        Refuser
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => handleDecision(reservation.id, "accepted")}
                    disabled={isUpdating}
                    style={{
                      flex: 1,
                      backgroundColor: "#10B981",
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: "center",
                      opacity: isUpdating ? 0.6 : 1,
                    }}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={{ fontWeight: "600", fontSize: 14, color: "#FFF" }}>
                        Accepter
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
