import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../../context/UserContext";

const API_BASE_URL = "http://12.0.3.9:8000";

interface Trip {
  id: number;
  driver_id: number;
  vehicle_id: number;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  arrival_time: string | null;
  available_seats: number;
  price_per_seat: number;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: number;
  trip_id: number;
  passenger_id: number;
  seats_booked: number;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function DriverTripsScreen() {
  const { user, token } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningTripId, setActioningTripId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [token])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        console.log("❌ Pas de token");
        return;
      }

      console.log("🔵 Chargement trajets du conducteur...");

      const tripsResponse = await fetch(`${API_BASE_URL}/api/trips/my-trips`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json();
        console.log("✅ Trajets chargés:", tripsData.trips?.length ?? 0);
        setTrips(tripsData.trips || []);
      } else {
        console.log("❌ Erreur chargement trajets");
        setTrips([]);
      }

      console.log("🔵 Chargement réservations...");
      const reservationsResponse = await fetch(
        `${API_BASE_URL}/api/reservations/my-reservations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        console.log("✅ Réservations chargées:", reservationsData.reservations?.length ?? 0);
        setReservations(reservationsData.reservations || []);
      } else {
        console.log("❌ Erreur chargement réservations");
        setReservations([]);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      setTrips([]);
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ✅ Calculer les stats
  const getStats = () => {
    const totalTrips = trips.length;
    const activeTrips = trips.filter(t => t.status === "active" || t.status === "scheduled").length;
    const totalReservations = reservations.filter(r => r.status !== "cancelled").length;
    const totalRevenue = reservations
      .filter(r => r.status !== "cancelled")
      .reduce((sum, r) => sum + r.total_price, 0);

    return { totalTrips, activeTrips, totalReservations, totalRevenue };
  };

  const getSeatsBooked = (tripId: number) => {
    return reservations
      .filter((r) => r.trip_id === tripId && r.status !== "cancelled")
      .reduce((sum, r) => sum + r.seats_booked, 0);
  };

  const getPendingCount = (tripId: number) => {
    return reservations.filter(
      (r) => r.trip_id === tripId && r.status === "pending"
    ).length;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("fr-CM", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-CM", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString("fr-CM");
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return { label: "En cours", color: "#10B981" };
    } else if (status === "scheduled") {
      return { label: "Programmé", color: "#3B82F6" };
    } else if (status === "completed") {
      return { label: "Terminé", color: "#6B7280" };
    } else if (status === "cancelled") {
      return { label: "Annulé", color: "#EF4444" };
    }
    return { label: "Inconnu", color: "#9CA3AF" };
  };

  const deleteTrip = async (tripId: number) => {
    try {
      setActioningTripId(tripId);
      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) return;

      console.log("🔵 Suppression du trajet...");

      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("✅ Trajet supprimé");
        Alert.alert("Succès", "Le trajet a été supprimé");
        loadData();
      } else {
        Alert.alert("Erreur", "Impossible de supprimer le trajet");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setActioningTripId(null);
    }
  };

  const cancelTrip = async (tripId: number) => {
    try {
      setActioningTripId(tripId);
      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) return;

      console.log("🔵 Annulation du trajet...");

      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      if (response.ok) {
        console.log("✅ Trajet annulé");
        Alert.alert("Succès", "Le trajet a été annulé");
        loadData();
      } else {
        Alert.alert("Erreur", "Impossible d'annuler le trajet");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setActioningTripId(null);
    }
  };

  const stats = getStats();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ paddingHorizontal: 0, paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D85A30"
          />
        }
      >
        {/* HERO SECTION */}
        <View
          style={{
            backgroundColor: "#D85A30",
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFF",
              marginBottom: 4,
            }}
          >
            Bienvenue, {user?.name?.split(" ")[0] || "Conducteur"}! 🚗
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 20,
            }}
          >
            Gérez vos trajets et maximisez vos revenus
          </Text>

          {/* STATS CARDS */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 8,
            }}
          >
            {/* Stat 1: Trajets */}
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#FFF",
                  marginBottom: 2,
                }}
              >
                {stats.totalTrips}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Trajets
              </Text>
            </View>

            {/* Stat 2: Actifs */}
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#FFF",
                  marginBottom: 2,
                }}
              >
                {stats.activeTrips}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Actifs
              </Text>
            </View>

            {/* Stat 3: Réservations */}
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#FFF",
                  marginBottom: 2,
                }}
              >
                {stats.totalReservations}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Réservations
              </Text>
            </View>
          </View>

          {/* Revenue Card */}
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 4,
              }}
            >
              💰 Revenus totaux
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#FFF",
              }}
            >
              {formatPrice(stats.totalRevenue)} FCFA
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: 12,
            }}
          >
            Actions rapides
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            {/* Publier trajet */}
            <TouchableOpacity
              onPress={() => router.push("/publish-trip")}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#D85A30",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="add" size={26} color="#D85A30" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#1F2937",
                  textAlign: "center",
                }}
              >
                Publier
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  marginTop: 2,
                }}
              >
                trajet
              </Text>
            </TouchableOpacity>

            {/* Messages */}
            <TouchableOpacity
              onPress={() => router.push("/(driver)/messages")}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E8D5C4",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="chatbubble" size={24} color="#3B82F6" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#1F2937",
                  textAlign: "center",
                }}
              >
                Messages
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  marginTop: 2,
                }}
              >
              </Text>
            </TouchableOpacity>

            {/* Réservations */}
            <TouchableOpacity
              onPress={() => router.push("/(driver)/reservations")}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E8D5C4",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#D1FAE5",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="checkmark-done" size={24} color="#10B981" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#1F2937",
                  textAlign: "center",
                }}
              >
                Réserva-
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                }}
              >
                tions
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MES TRAJETS */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: 12,
            }}
          >
            📍 Mes trajets actifs
          </Text>

          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color="#D85A30" />
            </View>
          ) : trips.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Ionicons name="car-outline" size={48} color="#D85A30" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1F2937",
                  marginTop: 12,
                }}
              >
                Aucun trajet publié
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/publish-trip")}
                style={{
                  marginTop: 16,
                  backgroundColor: "#D85A30",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>
                  Publier maintenant
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map((trip) => {
              const seatsBooked = getSeatsBooked(trip.id);
              const pendingCount = getPendingCount(trip.id);
              const { date, time } = formatDateTime(trip.departure_time);
              const status = getStatusBadge(trip.status);
              const isActioning = actioningTripId === trip.id;

              return (
                <View
                  key={trip.id}
                  style={{
                    backgroundColor: "#FFF",
                    borderWidth: 1,
                    borderColor: "#E8D5C4",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    opacity: isActioning ? 0.6 : 1,
                  }}
                >
                  {/* En-tête */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1F2937",
                        flex: 1,
                      }}
                    >
                      {trip.departure_location} → {trip.arrival_location}
                    </Text>

                    <View
                      style={{
                        backgroundColor: status.color + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "500",
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Date et heure */}
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      marginBottom: 12,
                    }}
                  >
                    {date}, {time}
                  </Text>

                  {/* Places et prix */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="people-outline" size={14} color="#8C7A6B" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginLeft: 8,
                        }}
                      >
                        {seatsBooked} / {trip.available_seats} places
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#D85A30",
                      }}
                    >
                      {formatPrice(trip.price_per_seat)} FCFA
                    </Text>
                  </View>

                  {/* Badge demandes */}
                  {pendingCount > 0 && (
                    <View
                      style={{
                        backgroundColor: "#FDF3D9",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name="alert-circle" size={14} color="#8A6A00" />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: "#8A6A00",
                          marginLeft: 8,
                        }}
                      >
                        {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
                      </Text>
                    </View>
                  )}

                  {/* BOUTONS */}
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#E8D5C4",
                      paddingTop: 12,
                      gap: 8,
                    }}
                  >
                    {/* Voir la map */}
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/reservation-map",
                          params: {
                            tripId: trip.id,
                            departure: trip.departure_location,
                            arrival: trip.arrival_location,
                          },
                        })
                      }
                      disabled={isActioning}
                      style={{
                        backgroundColor: "#3B82F6",
                        borderRadius: 12,
                        paddingVertical: 10,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="map" size={16} color="#FFF" />
                      <Text
                        style={{
                          color: "#FFF",
                          fontWeight: "600",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        Voir la map
                      </Text>
                    </TouchableOpacity>

                    {/* Modifier | Annuler */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/edit-trip",
                            params: { tripId: trip.id },
                          })
                        }
                        disabled={isActioning}
                        style={{
                          flex: 1,
                          backgroundColor: "#378ADD",
                          borderRadius: 12,
                          paddingVertical: 10,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="pencil" size={16} color="#FFF" />
                        <Text
                          style={{
                            color: "#FFF",
                            fontWeight: "600",
                            fontSize: 13,
                            marginLeft: 6,
                          }}
                        >
                          Modifier
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Annuler le trajet",
                            "Êtes-vous sûr?",
                            [
                              { text: "Non", onPress: () => {} },
                              {
                                text: "Oui",
                                onPress: () => cancelTrip(trip.id),
                                style: "destructive",
                              },
                            ]
                          );
                        }}
                        disabled={isActioning || trip.status === "cancelled"}
                        style={{
                          flex: 1,
                          backgroundColor: "#FCD34D",
                          borderRadius: 12,
                          paddingVertical: 10,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          opacity: trip.status === "cancelled" ? 0.5 : 1,
                        }}
                      >
                        <Ionicons name="close-circle" size={16} color="#92400E" />
                        <Text
                          style={{
                            color: "#92400E",
                            fontWeight: "600",
                            fontSize: 13,
                            marginLeft: 6,
                          }}
                        >
                          Annuler
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Supprimer */}
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Supprimer le trajet",
                          "Êtes-vous sûr? Irréversible.",
                          [
                            { text: "Non", onPress: () => {} },
                            {
                              text: "Oui, supprimer",
                              onPress: () => deleteTrip(trip.id),
                              style: "destructive",
                            },
                          ]
                        );
                      }}
                      disabled={isActioning}
                      style={{
                        backgroundColor: "#FEE2E2",
                        borderRadius: 12,
                        paddingVertical: 10,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="trash" size={16} color="#991B1B" />
                      <Text
                        style={{
                          color: "#991B1B",
                          fontWeight: "600",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isActioning && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.1)",
                        borderRadius: 16,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator size="small" color="#D85A30" />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Espacement bas */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
